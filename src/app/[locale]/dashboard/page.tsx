'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { NumericFormat } from 'react-number-format';
import { ValuationResult } from '@/lib/valuation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ReportView } from '@/components/valuation/ReportView';
import { ScoreBar } from '@/components/dashboard/ScoreBar';
import { BenchmarkingCard } from '@/components/dashboard/BenchmarkingCard';
import { ImprovementPlanCard, ImprovementAction } from '@/components/dashboard/ImprovementPlanCard';
import { getBenchmarkComparables } from '@/lib/valuation/benchmarking';
import { generateImprovementPlan } from '@/lib/valuation/recommendations';
import type { BusinessContext } from '@/lib/valuation/types';

interface ValuationRecord {
    id: string;
    company_name: string;
    sector: string;
    currency: string;
    valuation_result: {
        partnerValuation: ValuationResult;
    } | null;
    status?: 'draft' | 'completed';
    created_at: string;
    financial_data?: {
        revenue?: number;
    };
}

export default function DashboardPage() {
    const t = useTranslations('Dashboard');
    const locale = useLocale();
    const [valuations, setValuations] = useState<ValuationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();
    const [generatingPDF, setGeneratingPDF] = useState(false);

    const completedValuations = valuations.filter(v => v.status === 'completed' || !v.status); // Fallback for old records
    const draftValuations = valuations.filter(v => v.status === 'draft');
    const latestValuation = completedValuations[0];

    // FETCH BENCHMARKS AND IMPROVEMENTS
    const [benchData, setBenchData] = useState<any>(null);
    const [improvementActions, setImprovementActions] = useState<ImprovementAction[]>([]);

    const downloadPDF = async () => {
        if (!latestValuation) return;
        setGeneratingPDF(true);

        const reportId = 'valuation-report-template';
        const reportElement = document.getElementById(reportId);

        if (!reportElement) {
            alert('Template do relatório não encontrado.');
            setGeneratingPDF(false);
            return;
        }

        try {
            // Ensure element is visible and has layout for capture
            // We use fixed and a large negative left to keep it off-screen but "in the flow"
            const originalStyles = {
                position: reportElement.style.position,
                left: reportElement.style.left,
                top: reportElement.style.top,
                display: reportElement.style.display,
                visibility: reportElement.style.visibility,
                opacity: reportElement.style.opacity,
            };

            reportElement.style.position = 'fixed';
            reportElement.style.left = '-10000px';
            reportElement.style.top = '0';
            reportElement.style.display = 'block';
            reportElement.style.visibility = 'visible';
            reportElement.style.opacity = '1';

            const canvas = await html2canvas(reportElement, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById(reportId);
                    if (clonedElement) {
                        clonedElement.style.display = 'block';
                        clonedElement.style.visibility = 'visible';
                        clonedElement.style.opacity = '1';
                        clonedElement.style.position = 'relative';
                        clonedElement.style.left = '0';
                    }
                }
            });

            // Restore original styles immediately
            Object.assign(reportElement.style, originalStyles);

            const imgData = canvas.toDataURL('image/png');

            if (!imgData || imgData === 'data:,') {
                throw new Error('Falha ao capturar imagem do relatório.');
            }

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Auto-detect format from data URL
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Valuation_${latestValuation.company_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error: any) {
            console.error('PDF Generation Error:', error);
            alert(`Erro ao gerar PDF: ${error.message || 'Erro desconhecido'}`);
        } finally {
            setGeneratingPDF(false);
        }
    };

    useEffect(() => {
        async function fetchValuations() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('valuations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (data) {
                setValuations(data as any[]); // Type cast for now
            }
            setLoading(false);
        }

        fetchValuations();
    }, [supabase, router]);

    useEffect(() => {
        async function fetchBenchmarksAndImprovements() {
            if (!latestValuation) return;

            try {
                const financialData = latestValuation.financial_data as any;
                const businessContext: BusinessContext = {
                    country: financialData?.businessContext?.country || financialData?.country || 'USA',
                    sector: latestValuation.sector as any,
                    subSector: financialData?.subSector || financialData?.businessContext?.subSector || '',
                    churnRate: financialData?.revenueQuality?.churnRate,
                    nrr: financialData?.revenueQuality?.nrr,
                    contractType: financialData?.revenueQuality?.contractType,
                    ipType: financialData?.moat?.hasPatents ? 'patents-granted' : 
                            financialData?.moat?.hasTradeSecrets ? 'trade-secret' : 'none',
                    networkEffectStrength: financialData?.moat?.networkEffects || 'none',
                    hasDataMoat: financialData?.moat?.hasProprietaryTech || false,
                    hasCertifications: !!(
                        financialData?.moat?.certifications?.soc2 ||
                        financialData?.moat?.certifications?.iso27001 ||
                        financialData?.moat?.certifications?.hipaa ||
                        financialData?.moat?.certifications?.pciDss
                    )
                };

                // Fetch Benchmark Comparables
                const comparables = await getBenchmarkComparables(
                    businessContext.sector,
                    businessContext,
                    5
                );

                const userRevenue = financialData?.revenue || 1;
                const userVal = latestValuation.valuation_result?.partnerValuation?.value || 
                               (latestValuation.valuation_result as any)?.value || 0;
                const userMultiple = userRevenue > 0 ? userVal / userRevenue : 0;

                // Calculate market average from comparables
                const marketAvg = comparables.length > 0
                    ? comparables.reduce((sum, c) => sum + c.valuationMultiple, 0) / comparables.length
                    : 4.5;

                setBenchData({
                    sector: latestValuation.sector,
                    marketAvg,
                    userValue: userMultiple,
                    comparables: comparables.map(c => ({
                        name: c.name,
                        sector: c.sector,
                        revenue: c.revenue,
                        multiple: c.valuationMultiple,
                        similarity: c.similarityScore
                    }))
                });

                // Generate Improvement Plan
                const valuationResult = latestValuation.valuation_result?.advancedValuation || 
                                       latestValuation.valuation_result?.partnerValuation;
                
                if (valuationResult) {
                    const improvementPlan = await generateImprovementPlan(
                        businessContext,
                        {
                            revenue: financialData?.revenue || 0,
                            ebitda: financialData?.ebitda || 0,
                            growthRate: financialData?.growthRate || 0,
                            cash: financialData?.cash || 0,
                            debt: financialData?.debt || 0
                        },
                        valuationResult.details?.score || 0.5
                    );

                    // Map improvement plan to UI format
                    const actions: ImprovementAction[] = improvementPlan.recommendations.map((rec, idx) => ({
                        id: `action-${idx}`,
                        title: rec.title,
                        description: rec.description,
                        category: rec.category as any,
                        impact: rec.impact as any,
                        effort: rec.effort as any,
                        estimatedROI: rec.estimatedROI,
                        timeframe: rec.timeframe,
                        priority: rec.priority,
                        completed: false
                    }));

                    setImprovementActions(actions);
                }

            } catch (e) {
                console.error("Error fetching benchmarks and improvements", e);
            }
        }
        
        if (latestValuation) {
            fetchBenchmarksAndImprovements();
        }
    }, [latestValuation, supabase]);

    const Card = ({ title, value, subtitle, prefix = '$' }: { title: string, value: number, subtitle?: string, prefix?: string }) => (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
            <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                <NumericFormat
                    value={value}
                    displayType="text"
                    thousandSeparator=","
                    decimalSeparator="."
                    prefix={prefix}
                    decimalScale={value < 100 ? 2 : 0} // Decimals for multiples/scores, none for currency
                />
            </div>
            {subtitle && <p className="mt-1 text-sm text-green-600 dark:text-green-400">{subtitle}</p>}
        </div>
    );

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!latestValuation && draftValuations.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-12 rounded-2xl border border-blue-100 dark:border-blue-800">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {t('empty.title')}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                        {t('empty.subtitle')}
                    </p>
                    <Button onClick={() => router.push(`/${locale}/valuation/new`)} size="lg">
                        {t('empty.button')}
                    </Button>
                </div>
            </div>
        );
    }

    // Use the latest completed valuation for the main view, or null logic
    const result = latestValuation?.valuation_result?.partnerValuation;
    const details = result?.details as any;
    const pillars = details?.pillarScores || {};
    const currencyPrefix = latestValuation?.currency === 'BRL' ? 'R$ ' : '$ ';

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* DRAFTS SECTION */}
            {draftValuations.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rascunhos em Andamento</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {draftValuations.map(draft => (
                            <div key={draft.id} onClick={() => router.push(`/${locale}/valuation/new?edit=${draft.id}`)} className="cursor-pointer bg-white dark:bg-zinc-900 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900 border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{draft.company_name}</h3>
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Rascunho</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{draft.sector} • {new Date(draft.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!latestValuation ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl">
                    <p>Você tem rascunhos, mas nenhum valuation concluído.</p>
                    <Button className="mt-4" onClick={() => router.push(`/${locale}/valuation/new`)}>Iniciar Novo</Button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {latestValuation.company_name}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400">
                                {latestValuation.sector} • {new Date(latestValuation.created_at).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={downloadPDF}
                                disabled={generatingPDF}
                            >
                                {generatingPDF ? '⌛ Gerando...' : '📥 Relatório PDF'}
                            </Button>
                            <Button
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                                onClick={() => router.push(`/${locale}/dashboard/valuation/${latestValuation.id}/simulate`)}
                            >
                                ⚡ Simulador
                            </Button>
                            <Button variant="outline" onClick={() => router.push(`/${locale}/valuation/new?edit=${latestValuation.id}`)}>
                                {t('actions.editInputs')}
                            </Button>
                            <Button variant="outline" onClick={() => router.push(`/${locale}/valuation/new`)}>
                                {t('actions.newValuation')}
                            </Button>
                        </div>
                    </div>

                    {/* ERROR MESSAGE IF STARTUP MODE FAILED */}
                    {details.error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-800 p-4 rounded-lg mb-6">
                            <p className="text-red-700 dark:text-red-300">
                                <strong>Aviso:</strong> {details.error}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card
                            title="Valuation Final (Equity)"
                            value={result?.value || 0}
                            prefix={currencyPrefix}
                            subtitle="Valor Estimado de Mercado"
                        />
                        <Card
                            title="EBITDA Ponderado (3 anos)"
                            value={details.weightedEbitda || 0}
                            prefix={currencyPrefix}
                        />
                        <Card
                            title="Múltiplo Aplicado"
                            value={details.chosenMultiple || 0}
                            prefix="x"
                        />
                        <Card
                            title="Score de Qualidade"
                            value={(details.score || 0) * 100}
                            prefix=""
                            subtitle="/ 100 Pontos"
                        />
                    </div>

                    {/* Benchmarking and Improvement Plan Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Benchmarking Card */}
                        {benchData && (
                            <BenchmarkingCard data={benchData} />
                        )}

                        {/* Improvement Plan Card */}
                        {improvementActions.length > 0 && (
                            <ImprovementPlanCard 
                                actions={improvementActions}
                                currentValuation={result?.value || 0}
                                currency={latestValuation.currency}
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Scorecard Breakdown */}
                        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                Composição do Score (Múltiplos)
                            </h3>
                            <div className="space-y-6">
                                {/* Manual breakdown based on pillarScores structure */}
                                <ScoreBar label="Operações & Autonomia (30%)" value={pillars.ops} max={100} color="bg-blue-600" />
                                <ScoreBar label="Receita Recorrente (20%)" value={pillars.rec} max={100} color="bg-indigo-600" />
                                <ScoreBar label="Baixa Concentração (15%)" value={pillars.conc} max={100} color="bg-green-600" />
                                <ScoreBar label="Crescimento Histórico (15%)" value={pillars.grow} max={100} color="bg-orange-600" />
                                <ScoreBar label="Risco & Compliance (20%)" value={pillars.risk} max={100} color="bg-red-600" />
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
                                <h4 className="text-sm font-medium text-gray-500 mb-2">Resumo da Metodologia</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    O valuation foi calculado aplicando um múltiplo de <strong>{details.chosenMultiple}x</strong> sobre o EBITDA Ponderado. O múltiplo base do setor foi ajustado conforme o Score de Qualidade acima.
                                </p>
                            </div>
                        </div>

                        {/* Range Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                                Intervalo de Valor
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase">Mínimo</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        <NumericFormat value={result?.range?.min || 0} displayType="text" thousandSeparator="," prefix={currencyPrefix} />
                                    </p>
                                </div>
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                    <p className="text-xs text-blue-600 uppercase font-bold">Base (Provável)</p>
                                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                        <NumericFormat value={result?.value || 0} displayType="text" thousandSeparator="," prefix={currencyPrefix} />
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                    <p className="text-xs text-gray-500 uppercase">Máximo</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        <NumericFormat value={result?.range?.max || 0} displayType="text" thousandSeparator="," prefix={currencyPrefix} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Hidden Report Template for PDF Generation */}
            {latestValuation && latestValuation.valuation_result?.partnerValuation && (
                <div style={{
                    position: 'absolute',
                    left: '-10000px',
                    top: '0',
                    opacity: '0',
                    pointerEvents: 'none'
                }}>
                    <ReportView
                        companyName={latestValuation.company_name}
                        sector={latestValuation.sector}
                        currency={latestValuation.currency}
                        result={latestValuation.valuation_result.partnerValuation}
                        date={latestValuation.created_at}
                    />
                </div>
            )}
        </div>
    );
}

