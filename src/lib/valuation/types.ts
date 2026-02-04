export type Currency = 'USD' | 'BRL' | 'EUR' | 'MXN' | 'ARS' | 'CLP' | 'COP';

export type Country = 'USA' | 'BRL' | 'MEX' | 'ARG' | 'CHL' | 'COL' | 'OTHER';

export type SizeBracket = 'micro' | 'small' | 'mid' | 'growth' | 'scale';

export type GeographicScope = 'local' | 'national' | 'regional' | 'global';

export type CustomerType = 'smb' | 'mid-market' | 'enterprise' | 'consumer';

export type IPType = 'none' | 'trade-secret' | 'patents-pending' | 'patents-granted';

export type NetworkEffectStrength = 'none' | 'weak' | 'moderate' | 'strong';

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
    | 'HealthTech'
    | 'PropTech'
    | 'FoodTech'
    | 'Other';

// Sub-sector mappings for detailed categorization
export const SUB_SECTORS: Record<Sector, string[]> = {
    'SaaS': [
        'AI/ML',
        'Vertical - Healthcare',
        'Vertical - Finance/Accounting',
        'Vertical - Real Estate',
        'Vertical - Legal',
        'Horizontal - CRM/Sales',
        'Horizontal - HR/Recruiting',
        'Horizontal - Marketing',
        'Horizontal - Productivity',
        'DevTools/Infrastructure',
        'Security/Compliance',
        'Legacy/On-Premise'
    ],
    'E-commerce': [
        'D2C - Beauty/Cosmetics',
        'D2C - Fashion/Apparel',
        'D2C - Electronics',
        'D2C - Home/Furniture',
        'D2C - Food/Beverage',
        'B2B - Wholesale',
        'Dropshipping',
        'Marketplace - Multi-vendor'
    ],
    'Fintech': [
        'Payments/PSP',
        'Lending/Credit',
        'Banking/Neobank',
        'Wealth Management/Investment',
        'Insurance/Insurtech',
        'Crypto/Blockchain Infrastructure',
        'Accounting/Tax Software'
    ],
    'Marketplace': [
        'Services - Freelance/Gig',
        'Services - Professional (lawyers, doctors)',
        'Goods - C2C (used items)',
        'Goods - B2C',
        'Real Estate',
        'Travel/Hospitality'
    ],
    'Agency': [
        'Marketing/Advertising',
        'Web Development',
        'Design/Creative',
        'SEO/Performance Marketing',
        'Consulting/Strategy',
        'Staffing/Recruiting'
    ],
    'Edtech': [
        'K-12 Education',
        'Higher Education',
        'Corporate Training',
        'Language Learning',
        'Skills/Bootcamps',
        'Test Prep'
    ],
    'HealthTech': [
        'Telemedicine',
        'Health Records/EHR',
        'Mental Health',
        'Fitness/Wellness',
        'Medical Devices',
        'Pharma/Biotech Software'
    ],
    'PropTech': [
        'Property Management',
        'Real Estate CRM',
        'Construction Tech',
        'Smart Buildings/IoT',
        'Rental/Leasing Platforms'
    ],
    'FoodTech': [
        'Food Delivery',
        'Restaurant Tech/POS',
        'Cloud Kitchen',
        'Food Production',
        'Agritech'
    ],
    'Other': ['General Business', 'Manufacturing', 'Retail', 'Services', 'Media/Entertainment']
};

export interface BusinessContext {
    // Geographic
    country: Country;
    geographicScope?: GeographicScope;
    
    // Classification
    sector: Sector;
    subSector: string;
    businessModel?: string;
    
    // Size
    revenue?: number;
    sizeBracket?: SizeBracket;
    
    // Revenue Quality (SaaS/Subscription specific)
    churnRate?: number;                    // Annual churn %
    nrr?: number;                          // Net Revenue Retention %
    ltv?: number;                          // Lifetime Value ($)
    cac?: number;                          // Customer Acquisition Cost ($)
    cacPaybackMonths?: number;
    contractType?: 'monthly' | 'annual' | 'multi-year';
    
    // Customer Profile
    customerType?: CustomerType;
    averageContractValue?: number;         // ACV for B2B
    
    // Moat/Defensibility
    ipType?: IPType;
    networkEffectStrength?: NetworkEffectStrength;
    switchingCostEstimate?: number;        // Estimated $ cost for customer to switch
    hasDataMoat?: boolean;
    hasDeepIntegration?: boolean;          // Deep integration with customer systems
    hasCertifications?: boolean;           // SOC2, HIPAA, ISO, etc
}

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
    method?: ValuationMethod;
    value?: number;
    range?: {
        min: number;
        max: number;
    };
    details?: Record<string, any>;
    partnerValuation?: {
        method: ValuationMethod;
        value: number;
        range: {
            min: number;
            max: number;
        };
        details?: Record<string, any>;
    };
}
// ================================================================
// BENCHMARKING & RECOMMENDATIONS
// ================================================================

export interface BenchmarkCompany {
    id: string;
    companyName: string;
    country: Country;
    sector: Sector;
    subSector: string;
    stage: string;
    sizeBracket: SizeBracket;
    
    // Metrics
    annualRevenue: number;
    ebitda?: number;
    ebitdaMargin?: number;
    growthRate?: number;
    
    // SaaS specific
    arr?: number;
    nrr?: number;
    churnRate?: number;
    ltvcacRatio?: number;
    cacPaybackMonths?: number;
    
    // Valuation
    lastValuation?: number;
    valuationDate?: string;
    valuationMultiple?: number;
    valuationType?: string;
    
    // Context
    description?: string;
    whyReference?: string;
    website?: string;
}

export interface BenchmarkComparison {
    userCompany: {
        name: string;
        multiple: number;
        growthRate: number;
        ebitdaMargin: number;
        qualityScore: number;
        // SaaS metrics
        churnRate?: number;
        nrr?: number;
        ltvcacRatio?: number;
    };
    
    benchmarks: BenchmarkCompany[];
    
    // Calculated comparisons
    multiplePercentile: number;           // Where user sits (0-100)
    growthPercentile: number;
    qualityPercentile: number;
    
    // Gaps
    multipleGap: number;                  // Difference to median benchmark
    growthGap: number;
    qualityGap: number;

    // Detailed Gaps Analysis
    gaps: {
        metric: string;
        userValue: number;
        benchmarkValue: number;
        percentile: number;
        gap: number;
        gapPercent: number;
        severity: 'critical' | 'high' | 'medium' | 'low';
    }[];

    // Overall Standing
    overallPosition: 'excellent' | 'above-average' | 'average' | 'below-average' | 'poor';
    sampleSize?: number;
    
    // Detailed Statistics (for charts)
    statistics?: {
        revenue: { min: number; max: number; median: number; p25: number; p75: number };
        valuationMultiple: { min: number; max: number; median: number; p25: number; p75: number };
        revenueGrowth: { min: number; max: number; median: number; p25: number; p75: number };
        ebitdaMargin: { min: number; max: number; median: number; p25: number; p75: number };
        churnRate: { min: number; max: number; median: number; p25: number; p75: number };
        nrr: { min: number; max: number; median: number; p25: number; p75: number };
    };

    userPercentiles?: {
        revenue: number;
        valuationMultiple: number;
        revenueGrowth: number | null;
        ebitdaMargin: number | null;
        churnRate: number | null;
        nrr: number | null;
    };
}

export interface ImprovementAction {
    id: string;
    category: 'operations' | 'revenue_quality' | 'moat' | 'team' | 'financial' | 'growth';
    title: string;
    description: string;
    actionTitle?: string; // For compatibility
    
    // Impact
    pillarImpact?: string;                // Which pillar: ops, rec, conc, grow, risk
    expectedScoreIncrease: number;        // Points increase (0-100 scale)
    valuationImpactPercent: number;       // % impact on valuation
    
    // Implementation
    difficulty: 'easy' | 'moderate' | 'hard' | 'very_hard';
    timeToImplement: string;              // "1-2 weeks", "1-3 months", etc
    estimatedTimeMonths?: number;         // Numeric estimate
    estimatedCostUSD?: number;
    estimatedCost?: number;               // Alias for compatibility
    
    // Calculated for user
    calculatedPriority?: number;          // 0-100 based on user gaps
    potentialValuationIncrease?: number;  // $ amount for this user
}

export interface ImprovementPlan {
    valuationId: string;
    currentValuation: number;
    targetValuation: number;
    
    // Prioritized actions
    actions?: ImprovementAction[];
    topActions?: ImprovementAction[];
    
    // Summary
    totalPotentialIncrease: number;
    potentialIncrease?: number;           // Alias for totalPotentialIncrease
    potentialIncreasePercent?: number;    // Percentage increase
    quickWins?: ImprovementAction[];       // Easy + high impact
    strategicActions?: ImprovementAction[]; // Hard but very high impact
    strategicInitiatives?: ImprovementAction[]; // Alias
    
    // Timeline
    timeline?: any[];
    estimatedTimeToTarget?: string;        // "3-6 months", "6-12 months"
    totalEstimatedCost?: number;
}

// ================================================================
// COUNTRY & SIZE DATA
// ================================================================

export interface CountryRiskData {
    country: Country;
    countryName: string;
    equityRiskPremium: number;            // %
    countryRiskPremium: number;           // % vs USA
    liquidityDiscount: number;            // % discount
    exitDiscount: number;                 // % discount
    riskFreeRate: number;                 // 10Y bond
    inflationRate?: number;
    gdpGrowthRate?: number;
}

export interface SizePremiumData {
    country: Country;
    sizeBracket: SizeBracket;
    revenueMin: number;
    revenueMax: number;
    waccPremium: number;                  // % added to WACC
    multipleDiscount: number;             // % discount on multiple
}

export interface ValuationMultiples {
    country: Country;
    sector: Sector;
    subSector: string;
    sizeBracket: SizeBracket;
    
    // Multiples
    revenueMultiple: { low: number; median: number; high: number };
    ebitdaMultiple: { low: number; median: number; high: number };
    
    // Quality metrics
    sampleSize: number;
    confidenceScore: number;              // 0-1
    source: string;
    lastUpdated: string;
}