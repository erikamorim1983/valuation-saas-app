import { FinancialData, ValuationParams, ValuationResult } from '../types';

/**
 * Calculates valuation using Simplified Discounted Cash Flow (DCF).
 * Projects FCF for N years and calculates Terminal Value.
 */
export function calculateSimplifiedDCF(
    data: FinancialData,
    params: ValuationParams
): ValuationResult {
    const { revenue, growthRate, ebitda } = data;
    const { riskFreeRate, equityRiskPremium, companySpecificRisk, termYears, terminalGrowthRate, taxRate } = params;

    // 1. Calculate WACC (Cost of Equity as proxy for small biz usually)
    // CAPM: Re = Rf + Beta(Rm - Rf) + CompanyRisk
    // For simplicity in this specialized tool, we assume Beta based on sector averages or just sum premiums
    // Default Beta = 1.2 for slightly risky small private biz? Let's stick to a simpler build-up method.
    // Build-Up Method: Risk Free + Equity Premium + Size Premium + Specific Risk
    const costOfEquity = riskFreeRate + equityRiskPremium + companySpecificRisk + 0.05; // +5% Size Premium generic proxy
    const wacc = params.wacc ?? costOfEquity;

    const projections = [];
    let currentRevenue = revenue;
    // Simple assumption: EBITDA margin remains constant or FCF margin proxy
    // We'll use EBITDA * (1 - TaxRate) - Capex/WorkingCap proxy as FCF. 
    // For simplified engine: FCF = EBITDA * 0.7 (proxy for taxes and reinvestment)
    const fcfMargin = (ebitda / revenue) * (1 - taxRate);

    let sumPresentValue = 0;

    for (let i = 1; i <= termYears; i++) {
        currentRevenue = currentRevenue * (1 + growthRate);
        const projectedFCF = currentRevenue * fcfMargin;
        const discountFactor = 1 / Math.pow(1 + wacc, i);
        const presentValue = projectedFCF * discountFactor;

        sumPresentValue += presentValue;
        projections.push({ year: i, fcf: projectedFCF, pv: presentValue });
    }

    // 2. Terminal Value (Gordon Growth Model)
    // TV = (Final Year FCF * (1 + g)) / (WACC - g)
    const finalYearFCF = projections[termYears - 1].fcf;
    const terminalValue = (finalYearFCF * (1 + terminalGrowthRate)) / (wacc - terminalGrowthRate);
    const presentTerminalValue = terminalValue / Math.pow(1 + wacc, termYears);

    const totalValue = sumPresentValue + presentTerminalValue;

    return {
        method: 'DCF',
        value: Math.round(totalValue),
        range: {
            min: Math.round(totalValue * 0.85),
            max: Math.round(totalValue * 1.15)
        },
        details: {
            wacc,
            terminalValue: Math.round(terminalValue),
            sumPV: Math.round(sumPresentValue),
            presentTerminalValue: Math.round(presentTerminalValue)
        }
    };
}
