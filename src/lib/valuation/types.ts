export type Currency = 'USD' | 'BRL' | 'EUR';

export interface YearlyFinancials {
    year: number;
    revenue: number;
    ebitda: number;
    netIncome: number;
    cogs: number;
    operatingExpenses: number;

    // Normalization Adjustments
    addbacks: number; // Personal expenses, excess owner perks
    ownerAdj: number; // Market salary adjustment (Salary paid - Market Rate)
    oneTime: number; // Extraordinary items (lawsuits, disasters)
}

export interface FinancialData {
    currency: Currency;

    // Primary Data Source: History (0 to 3 years)
    history: YearlyFinancials[];

    // Startup Mode
    isStartup: boolean;
    projectedRevenueYear1?: number; // Required if history is empty
    projectedEbitdaYear1?: number; // Calculated from Revenue - Costs

    // Balance Sheet (for Equity Value)
    cash: number; // Cash & Equivalents
    debt: number; // Total Debt

    // Legacy support / Computed fields (LTM) -> can be derived from history[last]
    revenue: number;
    ebitda: number;
    netIncome: number;
    cogs: number;
    operatingExpenses: number;
    growthRate: number;

    // Legacy optional fields
    cashFlow?: number;
    assets?: number;
    liabilities?: number;
}

export type Sector =
    | 'SaaS'
    | 'E-commerce'
    | 'Agency'
    | 'Marketplace'
    | 'Fintech'
    | 'Edtech'
    | 'Other';

export interface ValuationParams {
    sector: Sector;
    riskFreeRate: number; // e.g., 0.04 for 4% (US Treasury 10y)
    equityRiskPremium: number; // e.g., 0.05 for 5%
    companySpecificRisk: number; // Legado, substituído por QualitativeData no novo motor
    wacc?: number;
    taxRate: number;
    termYears: number;
    terminalGrowthRate: number;

    // New Qualitative Inputs (5 Pillars)
    qualitative?: {
        // Ops
        hasSOPs: 'full' | 'partial' | 'none';
        ownerAutonomyScore: number; // 0-100% (How much runs without owner)
        teamScore: number; // 0-10 (Legacy team score reused)

        // Recurrency
        recurringRevenuePercent: number; // 0-100%

        // Concentration
        biggestClientPercent: number; // 0-100%

        // Risk
        hasAuditedDocs: boolean;
        hasInsurance: boolean;
        hasLegalIssues: boolean;

        // Advanced Risk Flags
        hasERP: boolean; // Uses specialized ERP
        hasIntegratedPayments: boolean; // Bank integrated payments
        hasPaymentWorkflow: boolean; // Approval workflow
        hasAutoReconciliation: boolean; // Auto bank reconciliation
        hasFinancialPlan: boolean; // Organized cost center/financial plan
    }
}

export type ValuationMethod = 'DCF' | 'Multiples' | 'EarningsCap' | 'Qualitative' | 'Advanced' | 'Advanced (Startup)';

export interface ValuationResult {
    method: ValuationMethod;
    value: number;
    range: {
        min: number;
        max: number;
    };
    details?: Record<string, any>; // Relaxed typing for now to accommodate various engines
}
