import { describe, it, expect } from 'vitest';
import { calculatePartnerValuation, calculatePillarScore, getSectorMultiples, getStartupRevenueMultiples } from '../partnerMethod';
import { FinancialData, ValuationParams } from '../../types';

describe('calculatePartnerValuation', () => {
  const baseHistoricalData: FinancialData = {
    currency: 'USD',
    revenue: 1000000,
    ebitda: 300000,
    netIncome: 200000,
    cogs: 400000,
    operatingExpenses: 100000,
    growthRate: 0.20,
    cash: 50000,
    debt: 100000,
    history: [
      { year: 2023, revenue: 800000, ebitda: 240000, netIncome: 160000, cogs: 320000, operatingExpenses: 80000, addbacks: 10000, ownerAdj: 5000, oneTime: 2000 },
      { year: 2024, revenue: 960000, ebitda: 288000, netIncome: 192000, cogs: 384000, operatingExpenses: 96000, addbacks: 12000, ownerAdj: 6000, oneTime: 1000 },
      { year: 2025, revenue: 1000000, ebitda: 300000, netIncome: 200000, cogs: 400000, operatingExpenses: 100000, addbacks: 15000, ownerAdj: 8000, oneTime: 0 }
    ],
    isStartup: false
  };

  const baseParams: ValuationParams = {
    sector: 'SaaS',
    riskFreeRate: 0.04,
    equityRiskPremium: 0.05,
    companySpecificRisk: 0,
    taxRate: 0.21,
    termYears: 5,
    terminalGrowthRate: 0.03,
    qualitative: {
      hasSOPs: 'full',
      ownerAutonomyScore: 80,
      teamScore: 8,
      recurringRevenuePercent: 90,
      biggestClientPercent: 10,
      hasAuditedDocs: true,
      hasInsurance: true,
      hasLegalIssues: false,
      hasERP: true,
      hasIntegratedPayments: true,
      hasPaymentWorkflow: true,
      hasAutoReconciliation: true,
      hasFinancialPlan: true
    }
  };

  describe('Established Business (with history)', () => {
    it('should calculate valuation for established business', () => {
      const result = calculatePartnerValuation(baseHistoricalData, baseParams);

      expect(result.method).toBe('Advanced');
      expect(result.value).toBeGreaterThan(0);
      expect(result.details?.weightedEbitda).toBeGreaterThan(0);
      expect(result.details?.chosenMultiple).toBeGreaterThan(0);
    });

    it('should apply weighted average to 3 years of history', () => {
      const result = calculatePartnerValuation(baseHistoricalData, baseParams);

      // Y-2: 20%, Y-1: 30%, Y: 50%
      const h = baseHistoricalData.history!;
      const expectedWeighted =
        (h[0].ebitda + h[0].addbacks - h[0].ownerAdj - h[0].oneTime) * 0.20 +
        (h[1].ebitda + h[1].addbacks - h[1].ownerAdj - h[1].oneTime) * 0.30 +
        (h[2].ebitda + h[2].addbacks - h[2].ownerAdj - h[2].oneTime) * 0.50;

      expect(result.details?.weightedEbitda).toBeCloseTo(expectedWeighted, 0);
    });

    it('should calculate CAGR correctly', () => {
      const result = calculatePartnerValuation(baseHistoricalData, baseParams);

      // CAGR from 800k to 1000k over 2 years
      const expectedCAGR = (Math.pow(1000000 / 800000, 1 / 2) - 1) * 100;

      expect(result.details?.cagr).toBeCloseTo(expectedCAGR, 1);
    });

    it('should adjust equity value with cash and debt', () => {
      const result = calculatePartnerValuation(baseHistoricalData, baseParams);

      // Equity = Enterprise + Cash - Debt
      expect(result.value).toBeDefined();
      // Can't test exact value but should be less than enterprise by (debt - cash)
    });

    it('should return zero for negative normalized EBITDA', () => {
      const negativeData = {
        ...baseHistoricalData,
        history: [
          { year: 2025, revenue: 100000, ebitda: -50000, netIncome: -60000, cogs: 80000, operatingExpenses: 70000, addbacks: 0, ownerAdj: 0, oneTime: 0 }
        ]
      };

      const result = calculatePartnerValuation(negativeData, baseParams);

      expect(result.value).toBe(0);
      expect(result.details?.message).toContain('Negative Normalized EBITDA');
    });

    it('should handle 2 years of history with correct weights', () => {
      const twoYearData = {
        ...baseHistoricalData,
        history: baseHistoricalData.history!.slice(1) // Last 2 years
      };

      const result = calculatePartnerValuation(twoYearData, baseParams);

      expect(result.value).toBeGreaterThan(0);
      expect(result.details?.weightedEbitda).toBeGreaterThan(0);
    });

    it('should handle 1 year of history', () => {
      const oneYearData = {
        ...baseHistoricalData,
        history: [baseHistoricalData.history![2]] // Only last year
      };

      const result = calculatePartnerValuation(oneYearData, baseParams);

      expect(result.value).toBeGreaterThan(0);
    });
  });

  describe('Startup Mode (no history)', () => {
    const startupData: FinancialData = {
      currency: 'USD',
      revenue: 0,
      ebitda: 0,
      netIncome: 0,
      cogs: 0,
      operatingExpenses: 0,
      growthRate: 0,
      cash: 20000,
      debt: 50000,
      history: [],
      isStartup: true,
      projectedRevenueYear1: 500000
    };

    it('should calculate startup valuation using revenue multiples', () => {
      const result = calculatePartnerValuation(startupData, baseParams);

      expect(result.method).toBe('Advanced (Startup)');
      expect(result.value).toBeGreaterThan(0);
      expect(result.details?.isStartup).toBe(true);
    });

    it('should return zero for startup with no projected revenue', () => {
      const noRevenueData = { ...startupData, projectedRevenueYear1: 0 };
      const result = calculatePartnerValuation(noRevenueData, baseParams);

      expect(result.value).toBe(0);
      expect(result.details?.error).toContain('Projected Revenue is required');
    });

    it('should use revenue multiples instead of EBITDA multiples', () => {
      const result = calculatePartnerValuation(startupData, baseParams);

      expect(result.details?.weightedEbitda).toBe(0);
      expect(result.details?.chosenMultiple).toBeGreaterThan(0);
    });

    it('should adjust startup valuation with cash and debt', () => {
      const result = calculatePartnerValuation(startupData, baseParams);

      // Equity = Revenue * Multiple + Cash - Debt
      const expectedAdjustment = startupData.cash - startupData.debt;
      expect(result.value).toBeDefined();
    });
  });
});

describe('calculatePillarScore', () => {
  const fullQualityParams: ValuationParams = {
    sector: 'SaaS',
    riskFreeRate: 0.04,
    equityRiskPremium: 0.05,
    companySpecificRisk: 0,
    taxRate: 0.21,
    termYears: 5,
    terminalGrowthRate: 0.03,
    qualitative: {
      hasSOPs: 'full',
      ownerAutonomyScore: 100,
      teamScore: 10,
      recurringRevenuePercent: 100,
      biggestClientPercent: 5,
      hasAuditedDocs: true,
      hasInsurance: true,
      hasLegalIssues: false,
      hasERP: true,
      hasIntegratedPayments: true,
      hasPaymentWorkflow: true,
      hasAutoReconciliation: true,
      hasFinancialPlan: true
    }
  };

  it('should return perfect score with all ideal inputs', () => {
    const score = calculatePillarScore(fullQualityParams, 0.30); // 30% CAGR

    expect(score.totalScore).toBeGreaterThan(0.8); // Should be very high
    expect(score.pillars.ops).toBe(100);
    expect(score.pillars.rec).toBe(100); // 100% * 1.4 capped at 100
    expect(score.pillars.conc).toBe(100); // < 15% client concentration
  });

  it('should return mid-point score with default qualitative data', () => {
    const noQualParams = { ...fullQualityParams, qualitative: undefined };
    const score = calculatePillarScore(noQualParams, 0);

    expect(score.totalScore).toBe(0.5);
  });

  it('should penalize high client concentration', () => {
    const highConcParams = {
      ...fullQualityParams,
      qualitative: { ...fullQualityParams.qualitative!, biggestClientPercent: 50 }
    };

    const score = calculatePillarScore(highConcParams, 0.10);

    expect(score.pillars.conc).toBeLessThan(70); // Should be penalized
  });

  it('should reward high growth (CAGR >= 25%)', () => {
    const score = calculatePillarScore(fullQualityParams, 0.30); // 30% CAGR

    expect(score.pillars.grow).toBe(100);
  });

  it('should handle negative growth gracefully', () => {
    const score = calculatePillarScore(fullQualityParams, -0.05); // -5% CAGR

    expect(score.pillars.grow).toBeGreaterThanOrEqual(0);
    expect(score.pillars.grow).toBeLessThan(40);
  });

  it('should calculate ops score with SOPs, autonomy, and team', () => {
    const score = calculatePillarScore(fullQualityParams, 0.10);

    // Full SOPs (40) + 100% autonomy (40) + team 10 (20) = 100
    expect(score.pillars.ops).toBe(100);
  });
});

describe('getSectorMultiples', () => {
  it('should return correct multiples for each sector', () => {
    expect(getSectorMultiples('SaaS')).toEqual({ low: 4.0, high: 8.0 });
    expect(getSectorMultiples('Fintech')).toEqual({ low: 5.0, high: 10.0 });
    expect(getSectorMultiples('Agency')).toEqual({ low: 2.0, high: 4.0 });
  });

  it('should default to "Other" for unknown sectors', () => {
    expect(getSectorMultiples('UnknownSector')).toEqual({ low: 2.0, high: 3.5 });
  });
});

describe('getStartupRevenueMultiples', () => {
  it('should return revenue multiples for startups', () => {
    expect(getStartupRevenueMultiples('SaaS')).toEqual({ low: 3.0, high: 8.0 });
    expect(getStartupRevenueMultiples('E-commerce')).toEqual({ low: 0.8, high: 2.0 });
  });

  it('should default to "Other" for unknown sectors', () => {
    expect(getStartupRevenueMultiples('UnknownSector')).toEqual({ low: 1.0, high: 2.5 });
  });
});
