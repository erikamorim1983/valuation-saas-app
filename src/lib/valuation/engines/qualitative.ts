import { ValuationResult } from '../types';

export interface ScorecardAnswers {
    team: number; // 0-10
    product: number; // 0-10
    market: number; // 0-10
    competition: number; // 0-10
}

/**
 * Adjusts a base average valuation based on qualitative factors.
 * This is a "modifier" engine, often used to adjust the Multiples result.
 */
export function calculateQualitativeScore(
    baseValue: number,
    scores: ScorecardAnswers
): ValuationResult {
    const { team, product, market, competition } = scores;

    // Weights suitable for seed/series A or acquisition
    const weights = {
        team: 0.30,
        product: 0.25,
        market: 0.25,
        competition: 0.20
    };

    const weightedScore = (team * weights.team) + (product * weights.product) + (market * weights.market) + (competition * weights.competition);
    // weightedScore is 0-10.
    // 5 is neutral. < 5 discount, > 5 premium.
    // Max adjustment: +/- 30%?

    const adjustmentFactor = ((weightedScore - 5) / 5) * 0.30;
    // If score 10 => (5/5)*0.3 = +30%
    // If score 0 => (-5/5)*0.3 = -30%

    const adjustedValue = baseValue * (1 + adjustmentFactor);

    return {
        method: 'Qualitative',
        value: Math.round(adjustedValue),
        range: {
            min: Math.round(adjustedValue * 0.95),
            max: Math.round(adjustedValue * 1.05)
        },
        details: {
            weightedScore,
            adjustmentFactor
        }
    };
}
