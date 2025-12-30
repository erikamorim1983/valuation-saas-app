'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { NumericFormat } from 'react-number-format';
import { ValuationResult } from '@/lib/valuation';

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
}

export default function DashboardPage() {
    const t = useTranslations('Dashboard');
    const locale = useLocale();
    const [valuations, setValuations] = useState<ValuationRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

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

    const completedValuations = valuations.filter(v => v.status === 'completed' || !v.status); // Fallback for old records
    const draftValuations = valuations.filter(v => v.status === 'draft');
    const latestValuation = completedValuations[0];

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
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg mb-6">
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
        </div>
    );
}

function ScoreBar({ label, value, max = 100, color }: { label: string, value: number, max?: number, color: string }) {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <span className="font-medium text-gray-900 dark:text-white">{Math.round(value)}/{max}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                    className={`${color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}
