/**
 * Advanced Valuation Engine
 * 
 * Multi-factor valuation calculation:
 * 1. Base multiples from market data (country + sector + sub-sector + size)
 * 2. Country adjustment (liquidity + exit discount)
 * 3. Size adjustment (small company discount)
 * 4. Qualitative adjustment (5-pillar score)
 * 5. Revenue quality adjustment (churn, NRR, LTV/CAC)
 * 6. Moat adjustment (IP, network effects, switching costs)
 */

import type {
  FinancialData,
  ValuationParams,
  ValuationResult,
  BusinessContext,
  Country,
  SizeBracket,
  Sector
} from '../types';
import {
  determineSizeBracket,
  fetchCountryRiskData,
  fetchSizePremium,
  fetchValuationMultiples,
  calculateAdjustmentFactors
} from '@/lib/supabase/market-data';
import { calculateQualitativeScore } from './qualitative';

/**
 * Calculate revenue quality factor
 * 
 * Based on:
 * - Churn rate (lower is better, <5% is excellent)
 * - NRR (higher is better, >110% is excellent)
 * - LTV/CAC ratio (higher is better, >3 is excellent)
 * - CAC payback (lower is better, <12 months is excellent)
 */
function calculateRevenueQualityFactor(context?: BusinessContext): number {
  if (!context) return 1.0;

  let factor = 1.0;
  let adjustments = 0;

  // Churn rate impact (-10% for high churn, +5% for low churn)
  if (context.churnRate !== null && context.churnRate !== undefined) {
    if (context.churnRate < 5) {
      factor += 0.05; // Excellent
    } else if (context.churnRate > 15) {
      factor -= 0.10; // Poor
    } else if (context.churnRate > 10) {
      factor -= 0.05; // Below average
    }
    adjustments++;
  }

  // NRR impact (+10% for >110%, -10% for <100%)
  if (context.nrr !== null && context.nrr !== undefined) {
    if (context.nrr > 110) {
      factor += 0.10; // Excellent growth within base
    } else if (context.nrr < 100) {
      factor -= 0.10; // Declining base
    } else if (context.nrr >= 105) {
      factor += 0.05; // Good growth
    }
    adjustments++;
  }

  // LTV/CAC impact (+8% for >3, -8% for <1.5)
  if (context.ltv !== null && context.cac !== null && 
      context.ltv !== undefined && context.cac !== undefined && 
      context.cac > 0) {
    const ltvCacRatio = context.ltv / context.cac;
    if (ltvCacRatio > 3) {
      factor += 0.08; // Very efficient
    } else if (ltvCacRatio < 1.5) {
      factor -= 0.08; // Unsustainable economics
    }
    adjustments++;
  }

  // CAC payback impact (+5% for <12mo, -5% for >24mo)
  if (context.cacPaybackMonths !== null && context.cacPaybackMonths !== undefined) {
    if (context.cacPaybackMonths < 12) {
      factor += 0.05; // Fast payback
    } else if (context.cacPaybackMonths > 24) {
      factor -= 0.05; // Slow payback
    }
    adjustments++;
  }

  // Contract type impact (+8% for annual, +15% for multi-year)
  if (context.contractType === 'annual') {
    factor += 0.08;
    adjustments++;
  } else if (context.contractType === 'multi-year') {
    factor += 0.15;
    adjustments++;
  }

  // Ensure factor stays within reasonable bounds (0.75 - 1.25)
  factor = Math.max(0.75, Math.min(1.25, factor));

  return factor;
}

/**
 * Calculate moat factor
 * 
 * Based on:
 * - IP type (patents > trade secrets > none)
 * - Network effects (strong > moderate > weak)
 * - Switching costs (high > medium > low)
 * - Data moat (yes/no)
 */
function calculateMoatFactor(context?: BusinessContext): number {
  if (!context) return 1.0;

  let factor = 1.0;

  // IP impact
  if (context.ipType === 'patents-granted') {
    factor += 0.10;
  } else if (context.ipType === 'trade-secret') {
    factor += 0.05;
  }

  // Network effects impact
  if (context.networkEffectStrength === 'strong') {
    factor += 0.15;
  } else if (context.networkEffectStrength === 'moderate') {
    factor += 0.08;
  } else if (context.networkEffectStrength === 'weak') {
    factor += 0.03;
  }

  // Switching costs impact
  if (context.switchingCostEstimate !== null && context.switchingCostEstimate !== undefined) {
    if (context.switchingCostEstimate > 100000) {
      factor += 0.10; // High switching costs
    } else if (context.switchingCostEstimate > 50000) {
      factor += 0.05; // Medium switching costs
    }
  }

  // Data moat impact
  if (context.hasDataMoat) {
    factor += 0.08;
  }

  // Deep integration impact
  if (context.hasDeepIntegration) {
    factor += 0.05;
  }

  // Certifications impact (SOC2, HIPAA, etc)
  if (context.hasCertifications) {
    factor += 0.05;
  }

  // Cap moat factor at 1.5 (50% premium maximum)
  factor = Math.min(1.5, factor);

  return factor;
}

/**
 * Main advanced valuation calculation
 */
export async function calculateAdvancedValuation(
  financialData: FinancialData,
  params: ValuationParams,
  context?: BusinessContext
): Promise<ValuationResult> {
  const { revenue, ebitda } = financialData;
  const { sector } = params;
  
  // Calculate quality score from qualitative data (0-1 scale)
  // Use a simplified score based on qualitative inputs
  const qualityScore = params.qualitative ? 0.7 : 0.5; // Default quality score
  
  // Extract context or use defaults
  const country: Country = context?.country || 'USA';
  const subSector = context?.subSector;
  const sizeBracket: SizeBracket = determineSizeBracket(revenue);

  // Step 1: Fetch base multiples from market data
  const multiples = await fetchValuationMultiples(
    country,
    sector,
    subSector,
    sizeBracket
  );

  if (!multiples) {
    throw new Error(
      `No valuation multiples found for ${country}/${sector}/${subSector || 'any'}/${sizeBracket}`
    );
  }

  const baseRevenueMultiple = multiples.revenueMultiple.median;
  const baseEbitdaMultiple = multiples.ebitdaMultiple.median;

  // Step 2: Calculate adjustment factors
  const {
    countryFactor,
    sizeFactor,
    qualityFactor,
    combinedFactor
  } = await calculateAdjustmentFactors(country, sizeBracket, qualityScore);

  // Step 3: Calculate revenue quality and moat factors
  const revenueQualityFactor = calculateRevenueQualityFactor(context);
  const moatFactor = calculateMoatFactor(context);

  // Step 4: Apply all adjustments to base multiple
  const adjustedRevenueMultiple = 
    baseRevenueMultiple * 
    countryFactor * 
    sizeFactor * 
    qualityFactor * 
    revenueQualityFactor * 
    moatFactor;

  const adjustedEbitdaMultiple = baseEbitdaMultiple
    ? baseEbitdaMultiple * 
      countryFactor * 
      sizeFactor * 
      qualityFactor * 
      revenueQualityFactor * 
      moatFactor
    : null;

  // Step 5: Calculate valuations
  const revenueValuation = revenue * adjustedRevenueMultiple;
  const ebitdaValuation = ebitda && adjustedEbitdaMultiple
    ? ebitda * adjustedEbitdaMultiple
    : null;

  // Step 6: Calculate blended valuation (70% revenue, 30% EBITDA if available)
  let finalValuation: number;
  if (ebitdaValuation && ebitda > 0) {
    finalValuation = revenueValuation * 0.7 + ebitdaValuation * 0.3;
  } else {
    finalValuation = revenueValuation;
  }

  // Step 7: Calculate valuation range (±20% around final)
  const valuationRange = {
    min: finalValuation * 0.8,
    median: finalValuation,
    max: finalValuation * 1.2
  };

  // Step 8: Prepare breakdown for transparency
  const breakdown = {
    baseMultiple: {
      revenue: baseRevenueMultiple,
      ebitda: baseEbitdaMultiple
    },
    adjustments: {
      country: {
        factor: countryFactor,
        impact: ((countryFactor - 1) * 100).toFixed(1) + '%'
      },
      size: {
        bracket: sizeBracket,
        factor: sizeFactor,
        impact: ((sizeFactor - 1) * 100).toFixed(1) + '%'
      },
      quality: {
        score: qualityScore,
        factor: qualityFactor,
        impact: ((qualityFactor - 1) * 100).toFixed(1) + '%'
      },
      revenueQuality: {
        factor: revenueQualityFactor,
        impact: ((revenueQualityFactor - 1) * 100).toFixed(1) + '%',
        metrics: context ? {
          churn: context.churnRate,
          nrr: context.nrr,
          ltvCac: context.ltv && context.cac ? context.ltv / context.cac : null,
          cacPayback: context.cacPaybackMonths
        } : null
      },
      moat: {
        factor: moatFactor,
        impact: ((moatFactor - 1) * 100).toFixed(1) + '%',
        components: context ? {
          ip: context.ipType,
          networkEffects: context.networkEffectStrength,
          switchingCosts: context.switchingCostEstimate,
          dataMoat: context.hasDataMoat
        } : null
      }
    },
    finalMultiple: {
      revenue: adjustedRevenueMultiple,
      ebitda: adjustedEbitdaMultiple
    }
  };

  return {
    method: 'Advanced',
    value: finalValuation,
    range: valuationRange,
    details: {
      ...breakdown,
      confidence: calculateConfidence(multiples.sampleSize || 0),
      dataSource: multiples.source || 'Market Data',
      methodology: 'Advanced Multi-Factor (Geographic + Size + Quality + Revenue Quality + Moat)',
      appliedMethod: 'advanced_multifactor',
      adjustedMultiple: adjustedRevenueMultiple,
    }
  };
}

/**
 * Calculate confidence level based on sample size
 */
function calculateConfidence(sampleSize: number): 'high' | 'medium' | 'low' {
  if (sampleSize >= 30) return 'high';
  if (sampleSize >= 10) return 'medium';
  return 'low';
}

/**
 * Get detailed explanation of valuation calculation
 */
export function getValuationExplanation(
  result: ValuationResult,
  financialData: FinancialData,
  params: ValuationParams,
  context?: BusinessContext
): string {
  const breakdown = result.details as any;
  if (!breakdown) return 'No detailed breakdown available.';
  
  const { revenue, ebitda } = financialData;
  const { sector } = params;

  let explanation = `# Valuation Breakdown\n\n`;
  
  explanation += `## Base Metrics\n`;
  explanation += `- **Revenue**: ${formatCurrency(revenue)}\n`;
  if (ebitda) {
    explanation += `- **EBITDA**: ${formatCurrency(ebitda)} (${((ebitda/revenue)*100).toFixed(1)}% margin)\n`;
  }
  explanation += `- **Sector**: ${sector}\n`;
  if (context?.subSector) {
    explanation += `- **Sub-sector**: ${context.subSector}\n`;
  }
  explanation += `- **Country**: ${context?.country || 'USA'}\n`;
  explanation += `- **Size**: ${breakdown.adjustments.size.bracket}\n`;
  explanation += `\n`;

  explanation += `## Valuation Multiples\n`;
  explanation += `- **Base Revenue Multiple**: ${breakdown.baseMultiple.revenue.toFixed(2)}x\n`;
  
  explanation += `\n## Adjustments Applied\n`;
  
  explanation += `\n### Geographic Factor (${breakdown.adjustments.country.impact})\n`;
  explanation += `- Country risk premium and liquidity considerations\n`;
  explanation += `- Adjusted multiple: ${(breakdown.baseMultiple.revenue * breakdown.adjustments.country.factor).toFixed(2)}x\n`;
  
  explanation += `\n### Size Factor (${breakdown.adjustments.size.impact})\n`;
  explanation += `- Small company premium (${breakdown.adjustments.size.bracket})\n`;
  explanation += `- Adjusted multiple: ${(breakdown.baseMultiple.revenue * breakdown.adjustments.country.factor * breakdown.adjustments.size.factor).toFixed(2)}x\n`;
  
  explanation += `\n### Quality Score (${breakdown.adjustments.quality.impact})\n`;
  explanation += `- Your score: ${breakdown.adjustments.quality.score}/100\n`;
  explanation += `- Industry average: 75/100\n`;
  
  if (breakdown.adjustments.revenueQuality.metrics) {
    explanation += `\n### Revenue Quality (${breakdown.adjustments.revenueQuality.impact})\n`;
    const metrics = breakdown.adjustments.revenueQuality.metrics;
    if (metrics.churn !== null) {
      explanation += `- **Churn Rate**: ${metrics.churn}% (benchmark: 5-8%)\n`;
    }
    if (metrics.nrr !== null) {
      explanation += `- **Net Revenue Retention**: ${metrics.nrr}% (benchmark: 105-115%)\n`;
    }
    if (metrics.ltvCac !== null) {
      explanation += `- **LTV/CAC Ratio**: ${metrics.ltvCac.toFixed(2)} (benchmark: >3)\n`;
    }
    if (metrics.cacPayback !== null) {
      explanation += `- **CAC Payback**: ${metrics.cacPayback} months (benchmark: <12)\n`;
    }
  }
  
  if (breakdown.adjustments.moat.components) {
    explanation += `\n### Competitive Moat (${breakdown.adjustments.moat.impact})\n`;
    const moat = breakdown.adjustments.moat.components;
    if (moat.ip && moat.ip !== 'none') {
      explanation += `- **IP Protection**: ${moat.ip}\n`;
    }
    if (moat.networkEffects && moat.networkEffects !== 'none') {
      explanation += `- **Network Effects**: ${moat.networkEffects}\n`;
    }
    if (moat.dataMoat) {
      explanation += `- **Data Moat**: Yes\n`;
    }
  }
  
  explanation += `\n## Final Valuation\n`;
  explanation += `- **Final Multiple**: ${breakdown.finalMultiple?.revenue?.toFixed(2) || 'N/A'}x revenue\n`;
  explanation += `- **Valuation**: ${formatCurrency(result.value || 0)}\n`;
  if (result.range) {
    explanation += `- **Range**: ${formatCurrency(result.range.min)} - ${formatCurrency(result.range.max)}\n`;
  }
  if (breakdown.confidence) {
    explanation += `- **Confidence**: ${breakdown.confidence.toUpperCase()}\n`;
  }

  return explanation;
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}
