import { useWizard } from './WizardContext';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { NumericFormat } from 'react-number-format';
import {
    calculatePartnerValuation,
    FinancialData,
    ValuationParams,
    Sector
} from '@/lib/valuation';
import { calculatePartnerValuation as engine } from '@/lib/valuation/engines/partnerMethod'; // Direct import used for now if index not updated

export default function StepReview() {
    const { data, setStep, valuationId } = useWizard();
    const t = useTranslations('Wizard');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleFinish = async () => {
        setLoading(true);
        try {
            // 1. Calculate Results Locally
            // 1. Calculate Results Locally
            // Map WizardData to FinancialData
            const financials: FinancialData = {
                currency: data.currency as any,
                history: data.financials.history || [],
                isStartup: data.role === 'idea' || data.role === 'startup',
                projectedRevenueYear1: data.financials.projectedRevenueYear1,
                cash: data.financials.cash || 0,
                debt: data.financials.debt || 0,

                // Legacy / Computed (using last year if available)
                revenue: data.financials.revenue || 0,
                ebitda: data.financials.ebitda || 0,
                netIncome: data.financials.netIncome || 0,
                cogs: data.financials.cogs || 0,
                operatingExpenses: data.financials.operatingExpenses || 0,
                growthRate: data.financials.growthRate || 0
            };

            const params: ValuationParams = {
                sector: data.sector as Sector,
                riskFreeRate: 0.04,
                equityRiskPremium: 0.05,
                companySpecificRisk: 0, // Not used in new engine
                taxRate: 0.21,
                termYears: 5,
                terminalGrowthRate: 0.03,

                // New Qualitative Inputs
                qualitative: {
                    hasSOPs: data.qualitative.hasSOPs,
                    ownerAutonomyScore: data.qualitative.ownerAutonomyScore,
                    teamScore: data.qualitative.teamScore,
                    recurringRevenuePercent: data.qualitative.recurringRevenuePercent,
                    biggestClientPercent: data.qualitative.biggestClientPercent,
                    hasAuditedDocs: data.qualitative.hasAuditedDocs,
                    hasInsurance: data.qualitative.hasInsurance,
                    hasLegalIssues: data.qualitative.hasLegalIssues,
                    hasERP: data.qualitative.hasERP,
                    hasIntegratedPayments: data.qualitative.hasIntegratedPayments,
                    hasPaymentWorkflow: data.qualitative.hasPaymentWorkflow,
                    hasAutoReconciliation: data.qualitative.hasAutoReconciliation,
                    hasFinancialPlan: data.qualitative.hasFinancialPlan,
                }
            };

            // Call the Advanced Engine
            const partnerValuation = engine(financials, params);

            const finalResult = {
                partnerValuation
            };

            // 2. Save to Supabase (Create or Update)
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.warn("DEV MODE: No authenticated user. Skipping save.");
                router.push('/dashboard');
                return;
            }

            const { createValuation, updateValuation } = await import('@/lib/supabase/valuation');

            // Prepare Payload
            const payload = {
                company_name: data.companyName,
                sector: data.sector,
                currency: data.currency,
                financial_data: financials as any, // Cast for flexibility
                valuation_result: finalResult as any,
                status: 'completed' as const
            };

            if (valuationId) {
                await updateValuation(valuationId, payload);
            } else {
                await createValuation(payload);
                // We don't necessarily need to set the ID here as we are redirecting away
            }

            // 3. Redirect to Dashboard/Report
            router.push('/dashboard');

        } catch (err: any) {
            console.error("Valuation Error:", err);
            alert(`Error saving valuation: ${err.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };
    const isStartup = data.role === 'idea' || data.role === 'startup'; // Consistency with logic above
    const revenueToDisplay = isStartup && data.financials.projectedRevenueYear1
        ? data.financials.projectedRevenueYear1
        : (data.financials.history && data.financials.history.length > 0 ? data.financials.history[data.financials.history.length - 1].revenue : 0);

    // For startups, use projectedEbitdaYear1, or fallback to history, or 0
    const ebitdaToDisplay = isStartup && data.financials.projectedEbitdaYear1 !== undefined
        ? data.financials.projectedEbitdaYear1
        : (data.financials.history && data.financials.history.length > 0 ? data.financials.history[data.financials.history.length - 1].ebitda : 0);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('review.title')}
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('review.subtitle')}
                </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-gray-200 dark:border-zinc-800 p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Company</h3>
                        <p className="text-gray-600 dark:text-gray-400">{data.companyName}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Sector</h3>
                        <p className="text-gray-600 dark:text-gray-400">{data.sector}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {isStartup ? 'Projected Revenue (Yr 1)' : 'Last Year Revenue'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(revenueToDisplay)}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                            {isStartup ? 'Projected EBITDA (Yr 1)' : 'Last Year EBITDA'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(ebitdaToDisplay)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-8">
                <Button type="button" variant="outline" onClick={() => setStep('qualitative')}>
                    {t('buttons.back')}
                </Button>
                <Button onClick={handleFinish} disabled={loading}>
                    {loading ? t('buttons.processing') : t('buttons.finish')}
                </Button>
            </div>
        </div>
    );
}
