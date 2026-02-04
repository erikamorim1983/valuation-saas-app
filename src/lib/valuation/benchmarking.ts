/**
 * Benchmarking Service
 * 
 * Compare user's company against market benchmarks:
 * - Find similar companies (sector, size, geography)
 * - Calculate percentiles
 * - Identify gaps
 * - Generate insights
 */

import type {
  Sector,
  Country,
  SizeBracket,
  BenchmarkCompany,
  BenchmarkComparison,
  BusinessContext
} from './types';
import { fetchBenchmarkCompanies } from '@/lib/supabase/market-data';

export interface UserMetrics {
  revenue: number;
  growthRate?: number;
  ebitdaMargin?: number;
  valuationMultiple: number;
  churnRate?: number;
  nrr?: number;
  ltv?: number;
  cac?: number;
  qualityScore: number;
}

export interface Gap {
  metric: string;
  userValue: number;
  benchmarkValue: number;
  percentile: number;
  gap: number; // Negative means below benchmark
  gapPercent: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Fetch relevant benchmark companies
 */
export async function getBenchmarkComparables(
  sector: Sector,
  context?: BusinessContext,
  limit: number = 5
): Promise<BenchmarkCompany[]> {
  return fetchBenchmarkCompanies(
    sector,
    context?.subSector,
    context?.country,
    context?.sizeBracket,
    limit
  );
}

/**
 * Calculate comparison metrics
 */
export async function calculateBenchmarkComparison(
  userMetrics: UserMetrics,
  sector: Sector,
  context?: BusinessContext
): Promise<BenchmarkComparison> {
  // Fetch benchmark companies
  const benchmarks = await getBenchmarkComparables(sector, context, 10);

  if (benchmarks.length === 0) {
    throw new Error(`No benchmark companies found for ${sector}`);
  }

  // Calculate statistics for each metric
  const revenueStats = calculateStats(benchmarks.map(b => b.annualRevenue));
  const multipleStats = calculateStats(benchmarks.map(b => b.valuationMultiple));
  const growthStats = calculateStats(
    benchmarks.filter(b => b.revenueGrowthRate !== null).map(b => b.revenueGrowthRate!)
  );
  const marginStats = calculateStats(
    benchmarks.filter(b => b.ebitdaMargin !== null).map(b => b.ebitdaMargin!)
  );
  const churnStats = calculateStats(
    benchmarks.filter(b => b.churnRate !== null).map(b => b.churnRate!)
  );
  const nrrStats = calculateStats(
    benchmarks.filter(b => b.nrr !== null).map(b => b.nrr!)
  );

  // Calculate percentiles for user's metrics
  const revenuePercentile = calculatePercentile(userMetrics.revenue, benchmarks.map(b => b.annualRevenue));
  const multiplePercentile = calculatePercentile(userMetrics.valuationMultiple, benchmarks.map(b => b.valuationMultiple));
  const growthPercentile = userMetrics.growthRate
    ? calculatePercentile(
        userMetrics.growthRate,
        benchmarks.filter(b => b.revenueGrowthRate !== null).map(b => b.revenueGrowthRate!)
      )
    : null;
  const marginPercentile = userMetrics.ebitdaMargin
    ? calculatePercentile(
        userMetrics.ebitdaMargin,
        benchmarks.filter(b => b.ebitdaMargin !== null).map(b => b.ebitdaMargin!)
      )
    : null;
  const churnPercentile = userMetrics.churnRate
    ? calculatePercentile(
        userMetrics.churnRate,
        benchmarks.filter(b => b.churnRate !== null).map(b => b.churnRate!),
        true // Lower is better for churn
      )
    : null;
  const nrrPercentile = userMetrics.nrr
    ? calculatePercentile(
        userMetrics.nrr,
        benchmarks.filter(b => b.nrr !== null).map(b => b.nrr!)
      )
    : null;

  // Identify gaps
  const gaps: Gap[] = [];

  // Multiple gap
  gaps.push({
    metric: 'Valuation Multiple',
    userValue: userMetrics.valuationMultiple,
    benchmarkValue: multipleStats.median,
    percentile: multiplePercentile,
    gap: userMetrics.valuationMultiple - multipleStats.median,
    gapPercent: ((userMetrics.valuationMultiple / multipleStats.median) - 1) * 100,
    severity: calculateGapSeverity(multiplePercentile)
  });

  // Growth gap
  if (userMetrics.growthRate && growthStats.median) {
    gaps.push({
      metric: 'Revenue Growth Rate',
      userValue: userMetrics.growthRate,
      benchmarkValue: growthStats.median,
      percentile: growthPercentile || 50,
      gap: userMetrics.growthRate - growthStats.median,
      gapPercent: ((userMetrics.growthRate / growthStats.median) - 1) * 100,
      severity: calculateGapSeverity(growthPercentile || 50)
    });
  }

  // Margin gap
  if (userMetrics.ebitdaMargin && marginStats.median) {
    gaps.push({
      metric: 'EBITDA Margin',
      userValue: userMetrics.ebitdaMargin,
      benchmarkValue: marginStats.median,
      percentile: marginPercentile || 50,
      gap: userMetrics.ebitdaMargin - marginStats.median,
      gapPercent: ((userMetrics.ebitdaMargin / marginStats.median) - 1) * 100,
      severity: calculateGapSeverity(marginPercentile || 50)
    });
  }

  // Churn gap (lower is better)
  if (userMetrics.churnRate && churnStats.median) {
    gaps.push({
      metric: 'Churn Rate',
      userValue: userMetrics.churnRate,
      benchmarkValue: churnStats.median,
      percentile: churnPercentile || 50,
      gap: churnStats.median - userMetrics.churnRate, // Inverted (lower is better)
      gapPercent: ((churnStats.median - userMetrics.churnRate) / churnStats.median) * 100,
      severity: calculateGapSeverity(churnPercentile || 50)
    });
  }

  // NRR gap
  if (userMetrics.nrr && nrrStats.median) {
    gaps.push({
      metric: 'Net Revenue Retention',
      userValue: userMetrics.nrr,
      benchmarkValue: nrrStats.median,
      percentile: nrrPercentile || 50,
      gap: userMetrics.nrr - nrrStats.median,
      gapPercent: ((userMetrics.nrr / nrrStats.median) - 1) * 100,
      severity: calculateGapSeverity(nrrPercentile || 50)
    });
  }

  return {
    companies: benchmarks.slice(0, 5), // Top 5 for display
    statistics: {
      revenue: revenueStats,
      valuationMultiple: multipleStats,
      revenueGrowth: growthStats,
      ebitdaMargin: marginStats,
      churnRate: churnStats,
      nrr: nrrStats
    },
    userPercentiles: {
      revenue: revenuePercentile,
      valuationMultiple: multiplePercentile,
      revenueGrowth: growthPercentile,
      ebitdaMargin: marginPercentile,
      churnRate: churnPercentile,
      nrr: nrrPercentile
    },
    gaps,
    overallPosition: calculateOverallPosition(gaps),
    sampleSize: benchmarks.length
  };
}

/**
 * Calculate statistics (min, median, max, mean)
 */
function calculateStats(values: number[]): {
  min: number;
  median: number;
  max: number;
  mean: number;
  p25: number;
  p75: number;
} {
  if (values.length === 0) {
    return { min: 0, median: 0, max: 0, mean: 0, p25: 0, p75: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, val) => acc + val, 0);

  return {
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    max: sorted[sorted.length - 1],
    mean: sum / sorted.length,
    p25: sorted[Math.floor(sorted.length * 0.25)],
    p75: sorted[Math.floor(sorted.length * 0.75)]
  };
}

/**
 * Calculate percentile position
 */
function calculatePercentile(
  value: number,
  benchmarkValues: number[],
  lowerIsBetter: boolean = false
): number {
  if (benchmarkValues.length === 0) return 50;

  const sorted = [...benchmarkValues].sort((a, b) => a - b);
  const count = sorted.filter(v => lowerIsBetter ? v >= value : v <= value).length;
  return (count / sorted.length) * 100;
}

/**
 * Calculate gap severity based on percentile
 */
function calculateGapSeverity(percentile: number): 'critical' | 'high' | 'medium' | 'low' {
  if (percentile < 25) return 'critical';
  if (percentile < 40) return 'high';
  if (percentile < 60) return 'medium';
  return 'low';
}

/**
 * Calculate overall competitive position
 */
function calculateOverallPosition(gaps: Gap[]): 'excellent' | 'above-average' | 'average' | 'below-average' | 'poor' {
  const avgPercentile = gaps.reduce((sum, gap) => sum + gap.percentile, 0) / gaps.length;

  if (avgPercentile >= 75) return 'excellent';
  if (avgPercentile >= 60) return 'above-average';
  if (avgPercentile >= 40) return 'average';
  if (avgPercentile >= 25) return 'below-average';
  return 'poor';
}

/**
 * Generate insights from benchmark comparison
 */
export function generateBenchmarkInsights(comparison: BenchmarkComparison): string[] {
  const insights: string[] = [];

  // Overall position insight
  const positionEmoji: Record<string, string> = {
    'excellent': '🌟',
    'above-average': '📈',
    'average': '➡️',
    'below-average': '📉',
    'poor': '⚠️'
  };
  const emoji = positionEmoji[comparison.overallPosition] || '➡️';

  insights.push(
    `${positionEmoji} Your company is in the **${comparison.overallPosition}** position compared to ${comparison.sampleSize} similar companies.`
  );

  // Critical gaps
  const criticalGaps = comparison.gaps.filter((g: any) => g.severity === 'critical');
  if (criticalGaps.length > 0) {
    insights.push(
      `🚨 **Critical areas needing attention**: ${criticalGaps.map((g: any) => g.metric).join(', ')}`
    );
  }

  // Strengths
  const strengths = comparison.gaps.filter((g: any) => g.percentile >= 75);
  if (strengths.length > 0) {
    insights.push(
      `💪 **Your strengths**: ${strengths.map((g: any) => g.metric).join(', ')} (top 25%)`
    );
  }

  // Specific metric insights
  comparison.gaps.forEach(gap => {
    if (gap.severity === 'critical' || gap.severity === 'high') {
      const direction = gap.gap < 0 ? 'below' : 'above';
      const absGapPercent = Math.abs(gap.gapPercent).toFixed(0);
      
      insights.push(
        `📊 Your **${gap.metric}** is ${absGapPercent}% ${direction} the benchmark (${gap.userValue.toFixed(1)} vs ${gap.benchmarkValue.toFixed(1)})`
      );
    }
  });

  // Valuation opportunity
  const multipleGap = comparison.gaps.find((g: any) => g.metric === 'Valuation Multiple');
  if (multipleGap && multipleGap.gap < 0) {
    const potentialIncrease = Math.abs(multipleGap.gapPercent).toFixed(0);
    insights.push(
      `💰 **Valuation opportunity**: Closing gaps could increase your valuation by ~${potentialIncrease}%`
    );
  }

  return insights;
}

/**
 * Format benchmark data for visualization
 */
export function formatBenchmarkForChart(
  userMetrics: UserMetrics,
  comparison: BenchmarkComparison
): {
  metrics: string[];
  userValues: number[];
  benchmarkValues: number[];
  percentiles: number[];
} {
  const metrics: string[] = [];
  const userValues: number[] = [];
  const benchmarkValues: number[] = [];
  const percentiles: number[] = [];

  comparison.gaps.forEach(gap => {
    metrics.push(gap.metric);
    userValues.push(gap.userValue);
    benchmarkValues.push(gap.benchmarkValue);
    percentiles.push(gap.percentile);
  });

  return { metrics, userValues, benchmarkValues, percentiles };
}
