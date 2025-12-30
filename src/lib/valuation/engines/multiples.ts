import { FinancialData, Sector, ValuationResult } from '../types';

const SECTOR_MULTIPLES: Record<Sector, { revenue: [number, number], ebitda: [number, number] }> = {
    'SaaS': { revenue: [4.0, 10.0], ebitda: [15.0, 30.0] },
    'E-commerce': { revenue: [1.0, 2.5], ebitda: [8.0, 15.0] },
    'Agency': { revenue: [0.8, 1.5], ebitda: [4.0, 8.0] },
    'Marketplace': { revenue: [2.0, 5.0], ebitda: [12.0, 25.0] },
    'Fintech': { revenue: [4.0, 12.0], ebitda: [20.0, 40.0] },
    'Edtech': { revenue: [2.0, 6.0], ebitda: [10.0, 20.0] },
    'Other': { revenue: [1.0, 2.0], ebitda: [5.0, 10.0] }
};

export function calculateMarketMultiples(
    data: FinancialData,
    sector: Sector
): ValuationResult {
    const multiples = SECTOR_MULTIPLES[sector];

    // Revenue Valuation
    const valRevenueMin = data.revenue * multiples.revenue[0];
    const valRevenueMax = data.revenue * multiples.revenue[1];
    const valRevenueAvg = (valRevenueMin + valRevenueMax) / 2;

    // EBITDA Valuation
    const valEbitdaMin = data.ebitda * multiples.ebitda[0];
    const valEbitdaMax = data.ebitda * multiples.ebitda[1];
    const valEbitdaAvg = (valEbitdaMin + valEbitdaMax) / 2;

    // Weighted Average (SaaS favors Revenue, others typically EBITDA/profit)
    let finalValue = 0;
    if (sector === 'SaaS' || sector === 'Fintech') {
        finalValue = (valRevenueAvg * 0.7) + (valEbitdaAvg * 0.3); // High growth favors revenue multiples
    } else {
        finalValue = (valRevenueAvg * 0.3) + (valEbitdaAvg * 0.7); // Traditional biz favors profit multiples
    }

    // Ensure positive value
    finalValue = Math.max(0, finalValue);

    return {
        method: 'Multiples',
        value: Math.round(finalValue),
        range: {
            min: Math.round(Math.min(valRevenueMin, valEbitdaMin)),
            max: Math.round(Math.max(valRevenueMax, valEbitdaMax))
        },
        details: {
            sector,
            revenueMultipleMin: multiples.revenue[0],
            revenueMultipleMax: multiples.revenue[1],
            ebitdaMultipleMin: multiples.ebitda[0],
            ebitdaMultipleMax: multiples.ebitda[1]
        }
    };
}
