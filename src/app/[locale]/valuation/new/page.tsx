'use client';

import { WizardLayout } from '@/components/wizard/WizardLayout';
import { WizardProvider, useWizard } from '@/components/wizard/WizardContext';
import StepIdentification from '@/components/wizard/StepIdentification';
import StepFinancials from '@/components/wizard/StepFinancials';
import StepRevenueQuality from '@/components/wizard/StepRevenueQuality';
import StepQualitative from '@/components/wizard/StepQualitative';
import StepMoat from '@/components/wizard/StepMoat';
import StepReview from '@/components/wizard/StepReview';

function WizardContent() {
    const { step } = useWizard();

    switch (step) {
        case 'identification':
            return <StepIdentification />;
        case 'financials':
            return <StepFinancials />;
        case 'revenueQuality':
            return <StepRevenueQuality />;
        case 'qualitative':
            return <StepQualitative />;
        case 'moat':
            return <StepMoat />;
        case 'review':
            return <StepReview />;
        default:
            return null;
    }
}

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { WizardData } from '@/components/wizard/WizardContext';

function WizardWrapper() {
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const [initialData, setInitialData] = useState<WizardData | undefined>(undefined);
    const [loading, setLoading] = useState(!!editId);
    const supabase = createClient();

    useEffect(() => {
        if (!editId) return;

        async function fetchValuation() {
            const { data, error } = await supabase
                .from('valuations')
                .select('*')
                .eq('id', editId)
                .single();

            if (data) {
                // Map DB record to WizardData
                // Handle qualitative data: check financial_data first (drafts), then try legacy/result
                const finData = data.financial_data as any;
                const qualData = finData.qualitative || data.valuation_result?.details?.pillarScores || {};
                // Note: pillarScores are scores, not inputs. Inputs might be lost for old completed valuations if not saved explicitly.
                // But for new drafts, it's in finData.qualitative.

                const mappedData: WizardData = {
                    companyName: data.company_name,
                    url: '',
                    description: '',
                    role: finData.role || 'operational',
                    startingYear: new Date().getFullYear(),
                    sector: data.sector,
                    subSector: finData.subSector || 'B2B',
                    currency: data.currency,
                    financials: finData,
                    qualitative: {
                        // Default fallbacks if keys missing
                        hasSOPs: qualData.hasSOPs || 'none',
                        ownerAutonomyScore: qualData.ownerAutonomyScore || 0,
                        teamScore: qualData.teamScore || 5,
                        recurringRevenuePercent: qualData.recurringRevenuePercent || 0,
                        biggestClientPercent: qualData.biggestClientPercent || 0,
                        hasAuditedDocs: qualData.hasAuditedDocs || false,
                        hasInsurance: qualData.hasInsurance || false,
                        hasLegalIssues: qualData.hasLegalIssues || false,
                        hasERP: qualData.hasERP || false,
                        hasIntegratedPayments: qualData.hasIntegratedPayments || false,
                        hasPaymentWorkflow: qualData.hasPaymentWorkflow || false,
                        hasAutoReconciliation: qualData.hasAutoReconciliation || false,
                        hasFinancialPlan: qualData.hasFinancialPlan || false
                    }
                };
                setInitialData(mappedData);
            }
            setLoading(false);
        }

        fetchValuation();
    }, [editId, supabase]);

    if (loading) {
        return <div className="text-center py-20">Loading valuation data...</div>;
    }

    return (
        <WizardProvider initialData={initialData} initialValuationId={editId}>
            <WizardLayout>
                <WizardContent />
            </WizardLayout>
        </WizardProvider>
    );
}

export default function NewValuationPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-12">
            <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
                <WizardWrapper />
            </Suspense>
        </div>
    );
}
