import { FinancialData, ValuationParams, ValuationResult, YearlyFinancials } from '../types';

/**
 * Advanced Valuation Engine based on "Small Business" methodology.
 * 1. Financial Normalization (Addbacks, Owner Adj)
 * 2. Weighted Average EBITDA (3 Years)
 * 3. 5-Pillar Qualitative Scorecard
 * 4. Sector Multiple Adjustment
 * 5. Equity Value calculation (Cash/Debt)
 */
export function calculatePartnerValuation(
    data: FinancialData,
    params: ValuationParams
): ValuationResult {
    // 0. Startup Check (Revenue Multiple Method)
    if (data.isStartup || !data.history || data.history.length === 0) {
        // Use Projected Revenue
        const projectedRevenue = data.projectedRevenueYear1 || 0;

        // Sanity Check for zero revenue
        if (projectedRevenue <= 0) {
            return {
                method: 'Advanced (Startup)',
                value: 0,
                range: { min: 0, max: 0 },
                details: {
                    error: 'Projected Revenue is required for Startup Valuation.',
                    isStartup: true
                }
            };
        }

        // Calculate Qualitative Score for Startup (Reuse the same logic)
        // For Growth, we assume high growth (Startup) -> Max Score default for "Growth" pillar if undefined?
        // Actually, let's use the standard calculation but assuming CAGR is high (e.g., 50%+) since it's a startup?
        // Better: Pass a "Startup Proxy CAGR" of 50% to the score calculator.
        const score = calculatePillarScore(params, 0.50); // Assumed 50% CAGR for scoring purpose

        // Get REVENUE Multiples (Different from EBITDA Multiples)
        // Proxy: EBITDA Multiple / Margin (assuming 20-30% future margin) roughly equals Revenue Multiple
        // Let's define specific Revenue Multiples for Startups (SaaS usually 2x - 8x ARR)
        const revenueMultiples = getStartupRevenueMultiples(params.sector);

        // Interpolate Revenue Multiple based on Quality Score
        const chosenRevMultiple = revenueMultiples.low + (revenueMultiples.high - revenueMultiples.low) * score.totalScore;

        const enterpriseValue = projectedRevenue * chosenRevMultiple;
        const equityValue = enterpriseValue + data.cash - data.debt;

        const valLow = (projectedRevenue * revenueMultiples.low) + data.cash - data.debt;
        const valHigh = (projectedRevenue * revenueMultiples.high) + data.cash - data.debt;

        return {
            method: 'Advanced (Startup)',
            value: Math.round(equityValue),
            range: {
                min: Math.round(Math.max(0, valLow)),
                max: Math.round(valHigh)
            },
            details: {
                weightedEbitda: 0, // Not applicable
                chosenMultiple: Number(chosenRevMultiple.toFixed(2)),
                score: Number(score.totalScore.toFixed(2)),
                pillarScores: score.pillars,
                cagr: 100, // Placeholder
                normalization: [],
                isStartup: true
            }
        };
    }

    // 1. Normalization & Weighted Average EBITDA
    const { history } = data;
    // Sort by year ascending just in case
    const sortedHistory = [...history].sort((a, b) => a.year - b.year);

    // Calculate Normalized EBITDA for each year
    const normalizedEbitdas = sortedHistory.map(h => {
        return h.ebitda + h.addbacks - h.ownerAdj - h.oneTime;
    });

    let weightedEbitda = 0;
    const count = normalizedEbitdas.length;

    if (count === 3) {
        // Y-2 (20%), Y-1 (30%), Y (50%)
        weightedEbitda = (normalizedEbitdas[0] * 0.20) + (normalizedEbitdas[1] * 0.30) + (normalizedEbitdas[2] * 0.50);
    } else if (count === 2) {
        // Y-1 (40%), Y (60%)
        weightedEbitda = (normalizedEbitdas[0] * 0.40) + (normalizedEbitdas[1] * 0.60);
    } else if (count === 1) {
        weightedEbitda = normalizedEbitdas[0];
    }

    // Sanity Floor
    if (weightedEbitda <= 0) {
        return {
            method: 'Advanced',
            value: 0,
            range: { min: 0, max: 0 },
            details: {
                message: 'Negative Normalized EBITDA. Asset-based valuation recommended.',
                weightedEbitda
            }
        };
    }

    // 2. Calculate CAGR (Growth Pillar)
    let cagr = 0;
    if (count >= 2) {
        const startRev = sortedHistory[0].revenue;
        const endRev = sortedHistory[count - 1].revenue;
        const years = count - 1;
        if (startRev > 0) {
            cagr = Math.pow(endRev / startRev, 1 / years) - 1;
        }
    }

    // 3. Score Calculation (5 Pillars)
    const score = calculatePillarScore(params, cagr);

    // 4. Sector Multiple Range
    // TODO: Connect to DB. For now, using mock based on Tom West ranges
    const multiples = getSectorMultiples(params.sector);

    // Interpolate Multiple based on Score
    // M = Low + (High - Low) * Score
    const chosenMultiple = multiples.low + (multiples.high - multiples.low) * score.totalScore;

    // 5. Enterprise Value
    const enterpriseValue = weightedEbitda * chosenMultiple;

    // 6. Equity Value (Adjust for Cash/Debt)
    const equityValue = enterpriseValue + data.cash - data.debt;

    // Range: +/- 10% based on multiple range tightness?
    // Actually, let's use the Low/High multiples directly for the range
    const valLow = (weightedEbitda * multiples.low) + data.cash - data.debt;
    const valHigh = (weightedEbitda * multiples.high) + data.cash - data.debt;

    return {
        method: 'Advanced',
        value: Math.round(equityValue),
        range: {
            min: Math.round(Math.max(0, valLow)), // No negative valuation
            max: Math.round(valHigh)
        },
        details: {
            weightedEbitda: Math.round(weightedEbitda),
            chosenMultiple: Number(chosenMultiple.toFixed(2)),
            score: Number(score.totalScore.toFixed(2)),
            pillarScores: score.pillars,
            cagr: Number((cagr * 100).toFixed(1)),
            normalization: normalizedEbitdas
        }
    };
}

export function calculatePillarScore(params: ValuationParams, cagr: number) {
    const q = params.qualitative;
    if (!q) return { totalScore: 0.5, pillars: {} }; // Default mid-point if no data

    // 1. Ops (30%)
    let opsScore = 0; // 0-100
    // SOPs (40 max)
    if (q.hasSOPs === 'full') opsScore += 40;
    else if (q.hasSOPs === 'partial') opsScore += 20;
    // Autonomy (40 max) -> 0.4 * %
    opsScore += Math.min(40, q.ownerAutonomyScore * 0.4);
    // Team (20 max) -> 2 * score(0-10)
    opsScore += Math.min(20, q.teamScore * 2);

    // 2. Recurrency (20%)
    // 1.4 * %Recurring (Max 100)
    const recScore = Math.min(100, q.recurringRevenuePercent * 1.4);

    // 3. Concentration (15%)
    // x <= 15 -> 100
    // x > 15 -> 100 - 2.5(x-15)
    let concScore = 100;
    if (q.biggestClientPercent > 15) {
        concScore = 100 - 2.5 * (q.biggestClientPercent - 15);
    }
    concScore = Math.max(37, concScore); // Floor at 37

    // 4. Growth (15%) via CAGR
    let growScore = 0;
    const cagrPercent = cagr * 100;
    if (cagrPercent >= 25) growScore = 100;
    else if (cagrPercent >= 10) growScore = 60 + ((cagrPercent - 10) / 15) * 40; // Linear 60->100
    else if (cagrPercent >= 0) growScore = 40 + (cagrPercent / 10) * 20; // Linear 40->60
    else growScore = Math.max(0, 40 + (cagrPercent / 10) * 40); // 0->40 for neg growth (down to -10%)

    // 5. Risk (20%)
    let riskScore = 0;
    if (q.hasAuditedDocs) riskScore += 20; // Docs
    if (q.hasInsurance) riskScore += 20; // Insurance
    if (!q.hasLegalIssues) riskScore += 30; // No Issues (positive)
    // Assuming low volatility/reg risk for generic small biz unless specified? 
    // Let's give remaining 30 pts by default or add another input. 
    // For now, let's assume partial credit 15pts base.
    riskScore += 15;

    // Final Weighted Score (0-1)
    // Weights: Ops(30), Rec(20), Conc(15), Grow(15), Risk(20)
    const totalPoints = (opsScore * 0.30) + (recScore * 0.20) + (concScore * 0.15) + (growScore * 0.15) + (riskScore * 0.20);

    return {
        totalScore: totalPoints / 100, // Normalize to 0-1
        pillars: {
            ops: opsScore,
            rec: recScore,
            conc: concScore,
            grow: growScore,
            risk: riskScore
        }
    };
}

// Mock Sector Multiples (Tom West style ranges)
// Real implementation should fetch from DB
export function getSectorMultiples(sector: string) {
    const map: Record<string, { low: number, high: number }> = {
        'SaaS': { low: 4.0, high: 8.0 }, // EBITDA multiples
        'E-commerce': { low: 2.5, high: 4.5 },
        'Agency': { low: 2.0, high: 4.0 },
        'Marketplace': { low: 3.0, high: 6.0 },
        'Fintech': { low: 5.0, high: 10.0 },
        'Other': { low: 2.0, high: 3.5 }
    };
    return map[sector] || map['Other'];
}

export function getStartupRevenueMultiples(sector: string) {
    // Revenue Multiples (ARR) for Early Stage
    const map: Record<string, { low: number, high: number }> = {
        'SaaS': { low: 3.0, high: 8.0 },
        'E-commerce': { low: 0.8, high: 2.0 },
        'Agency': { low: 0.5, high: 1.2 },
        'Marketplace': { low: 2.0, high: 5.0 },
        'Fintech': { low: 4.0, high: 9.0 },
        'Other': { low: 1.0, high: 2.5 }
    };
    return map[sector] || map['Other'];
}
