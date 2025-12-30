import { FinancialData, ValuationParams, ValuationResult } from '../types';

/**
 * Seller's Discretionary Earnings (SDE) Capitalization.
 * Used for stable, smaller businesses. Value = SDE / Capitalization Rate.
 * Cap Rate = Risk Free + Risk Premium.
 */
export function calculateEarningsCapitalization(
    data: FinancialData,
    params: ValuationParams
): ValuationResult {
    const { netIncome, operatingExpenses } = data; // Simplification: Need specific "add-backs" for real SDE
    // Proxy SDE = Net Income + (Assumption: 10% of OPEX are owner perks/one-offs)
    // In a real flow, we'd ask for explicit add-backs.
    const estimatedSDE = netIncome + (operatingExpenses * 0.05);

    // Capitalization Rate = Rfr + RiskPremium (20-25% typically for small biz buying)
    // Cap Rate is inverse of the multiple. Small biz usually trade 2x-4x SDE => 25% - 50% Cap Rate.
    // We calc a base rate.
    const baseCapRate = 0.20; // 5x
    const riskAdjustment = params.companySpecificRisk; // Add risk to denom => Lower value
    const capRate = baseCapRate + riskAdjustment;

    const value = estimatedSDE / capRate;

    return {
        method: 'EarningsCap',
        value: Math.round(value),
        range: {
            min: Math.round(value * 0.9),
            max: Math.round(value * 1.1)
        },
        details: {
            estimatedSDE,
            capRate
        }
    };
}
