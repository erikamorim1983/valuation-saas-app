'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FinancialData } from '@/lib/valuation/types';

export type WizardStep = 'identification' | 'financials' | 'qualitative' | 'review';

export type CompanyStage = 'idea' | 'startup' | 'operational' | 'scaling';

export interface WizardData {
    companyName: string;
    url: string; // Added URL for better identification
    description: string; // Added Description for better context
    role: CompanyStage; // Stage
    startingYear: number;
    sector: string;
    subSector: string; // Added subSector
    currency: string;
    financials: Partial<FinancialData>;
    qualitative: {
        // Ops
        hasSOPs: 'full' | 'partial' | 'none';
        ownerAutonomyScore: number;
        teamScore: number;

        // Recurrency
        recurringRevenuePercent: number;

        // Concentration
        biggestClientPercent: number;

        // Risk
        hasAuditedDocs: boolean;
        hasInsurance: boolean;
        hasLegalIssues: boolean;

        hasERP: boolean;
        hasIntegratedPayments: boolean;
        hasPaymentWorkflow: boolean;
        hasAutoReconciliation: boolean;
        hasFinancialPlan: boolean;
    };
}

interface WizardContextType {
    step: WizardStep;
    setStep: (step: WizardStep) => void;
    data: WizardData;
    updateData: (newData: Partial<WizardData>) => void;
    resetWizard: () => void;
    saveDraft: () => Promise<void>;
    isSaving: boolean;
    valuationId: string | null;
}

const defaultData: WizardData = {
    companyName: '',
    url: '',
    description: '',
    role: 'operational',
    startingYear: new Date().getFullYear(),
    sector: 'SaaS',
    subSector: 'B2B', // Default subSector
    currency: 'USD',
    financials: {},
    qualitative: {
        hasSOPs: 'none',
        ownerAutonomyScore: 0,
        teamScore: 5,
        recurringRevenuePercent: 0,
        biggestClientPercent: 0,
        hasAuditedDocs: false,
        hasInsurance: false,
        hasLegalIssues: false,
        hasERP: false,
        hasIntegratedPayments: false,
        hasPaymentWorkflow: false,
        hasAutoReconciliation: false,
        hasFinancialPlan: false
    }
};

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export function WizardProvider({ children, initialData, initialValuationId }: { children: ReactNode; initialData?: WizardData; initialValuationId?: string | null }) {
    const [step, setStep] = useState<WizardStep>('identification');
    const [data, setData] = useState<WizardData>(initialData || defaultData);

    // Valuation Persistence State
    const [valuationId, setValuationId] = useState<string | null>(initialValuationId || null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [companyProfile, setCompanyProfile] = useState<any | null>(null);

    // Load Company Profile from Supabase on Mount
    React.useEffect(() => {
        const loadProfile = async () => {
            try {
                // Dynamically import to avoid server-side issues if any
                const { getUserCompany } = await import('@/lib/supabase/company');
                const company = await getUserCompany();

                if (company) {
                    setCompanyProfile(company);
                    // Pre-fill wizard data ONLY if we are starting fresh (no valuationId)
                    // If we are editing, we load that data elsewhere (TODO: Implement loadValuation)
                    if (!valuationId) {
                        setData(prev => ({
                            ...prev,
                            companyName: company.name,
                            url: company.website || '',
                            description: company.description || '',
                            startingYear: company.founding_year,
                            sector: company.industry,
                            subSector: company.sub_industry || ''
                        }));
                    }
                }
            } catch (err) {
                console.error("Failed to load company profile:", err);
            } finally {
                setIsLoading(false);
            }
        };
        loadProfile();
    }, [valuationId]);

    const updateData = (newData: Partial<WizardData>) => {
        setData(prev => ({ ...prev, ...newData }));
    };

    const resetWizard = () => {
        setValuationId(null);
        setData(prev => ({
            ...defaultData,
            // Keep company info if we have it
            companyName: companyProfile?.name || '',
            url: companyProfile?.website || '',
            description: companyProfile?.description || '',
            startingYear: companyProfile?.founding_year || new Date().getFullYear(),
            sector: companyProfile?.industry || 'SaaS',
            subSector: companyProfile?.sub_industry || ''
        }));
        setStep('identification');
    }

    const saveDraft = async () => {
        setIsSaving(true);
        try {
            const { createValuation, updateValuation } = await import('@/lib/supabase/valuation');

            // Map WizardData to DB structure
            const payload = {
                company_name: data.companyName,
                sector: data.sector,
                currency: data.currency,
                status: 'draft' as const,
                financial_data: {
                    currency: data.currency,
                    history: data.financials?.history || [],
                    isStartup: data.role === 'idea' || data.role === 'startup',
                    projectedRevenueYear1: data.financials?.projectedRevenueYear1,
                    projectedEbitdaYear1: data.financials?.projectedEbitdaYear1,
                    cash: data.financials?.cash || 0,
                    debt: data.financials?.debt || 0,
                    revenue: data.financials?.revenue || 0,
                    ebitda: data.financials?.ebitda || 0,
                    netIncome: data.financials?.netIncome || 0,
                    cogs: data.financials?.cogs || 0,
                    operatingExpenses: data.financials?.operatingExpenses || 0,
                    growthRate: data.financials?.growthRate || 0
                } as any,
                valuation_result: null // Drafts usually don't have results yet, or we could calc it?
            };

            // Store Qualitative data inside financial_data or params? 
            // Currently DB schema has 'financial_data' and 'valuation_result'.
            // Advanced Method needs qualitative data. Let's assume we store it in a specific 'qualitative' key inside financial_data for now 
            // OR checks if we need to migrate/update DB schema.
            // *CRITICAL*: The DB insert in StepReview puts financials in `financial_data`. 
            // We should ensure `qualitative` inputs are stored somewhere if we want to resume.
            // For now, we'll append qualitative params to `financial_data` object in the payload as a workaround 
            // since `FinancialData` type is flexible or we cast it.
            // Better approach: `FinancialData` already has specific fields? No.
            // Let's mix it in payload.financial_data for draft storage purposes using `any`.
            (payload.financial_data as any).qualitative = data.qualitative;
            (payload.financial_data as any).role = data.role; // Store stage too
            (payload.financial_data as any).subSector = data.subSector;

            if (valuationId) {
                await updateValuation(valuationId, payload);
                // alert('Draft updated!');
            } else {
                const newVal = await createValuation(payload);
                setValuationId(newVal.id);
                // alert('Draft saved!');
            }
        } catch (err) {
            console.error('Error saving draft:', err);
            alert('Failed to save draft.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <WizardContext.Provider value={{ step, setStep, data, updateData, resetWizard, saveDraft, isSaving, valuationId }}>
            {children}
        </WizardContext.Provider>
    );
}

export function useWizard() {
    const context = useContext(WizardContext);
    if (context === undefined) {
        throw new Error('useWizard must be used within a WizardProvider');
    }
    return context;
}
