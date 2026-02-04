/**
 * Recommendations Engine
 * 
 * Generate personalized improvement recommendations based on:
 * - Benchmark gaps
 * - Current business context
 * - Industry best practices
 * - ROI/Impact analysis
 */

import type {
  Sector,
  SizeBracket,
  ImprovementAction,
  ImprovementPlan,
  BusinessContext
} from './types';
import { fetchImprovementActions } from '@/lib/supabase/market-data';
import type { Gap } from './benchmarking';

export interface PrioritizedAction extends ImprovementAction {
  calculatedPriority: number;
  relevanceScore: number;
  impactScore: number;
  feasibilityScore: number;
  roiEstimate: number;
  estimatedValuationIncrease: number;
  reasoning: string[];
}

/**
 * Generate comprehensive improvement plan
 */
export async function generateImprovementPlan(
  gaps: Gap[],
  currentValuation: number,
  sector: Sector,
  context?: BusinessContext
): Promise<ImprovementPlan> {
  // Fetch all available actions
  const allActions = await fetchImprovementActions();

  // Filter actions applicable to this company
  const applicableActions = allActions.filter(action => {
    // Note: applicableSectors and applicableSizes fields don't exist in ImprovementAction type
    // All actions are considered applicable
    return true;
  });

  // Prioritize actions based on gaps and context
  const prioritizedActions = applicableActions
    .map(action => prioritizeAction(action, gaps, currentValuation, context))
    .sort((a, b) => b.calculatedPriority - a.calculatedPriority);

  // Categorize actions
  const quickWins = prioritizedActions.filter(
    (a: any) => a.difficulty === 'easy' && parseTimeframe(a.timeToImplement) <= 2
  );

  const strategicInitiatives = prioritizedActions.filter(
    (a: any) => a.difficulty === 'hard' || parseTimeframe(a.timeToImplement) > 6
  );

  const midTermActions = prioritizedActions.filter(
    a => !quickWins.includes(a) && !strategicInitiatives.includes(a)
  );

  // Calculate total potential impact
  const topActions = prioritizedActions.slice(0, 10);
  const totalPotentialIncrease = topActions.reduce(
    (sum, action) => sum + action.estimatedValuationIncrease,
    0
  );

  // Create timeline
  const timeline = createImplementationTimeline(prioritizedActions.slice(0, 15));

  return {
    currentValuation,
    targetValuation: currentValuation + totalPotentialIncrease,
    potentialIncrease: totalPotentialIncrease,
    potentialIncreasePercent: (totalPotentialIncrease / currentValuation) * 100,
    topActions: prioritizedActions.slice(0, 10),
    quickWins: quickWins.slice(0, 5),
    strategicInitiatives: strategicInitiatives.slice(0, 5),
    timeline,
    estimatedTimeToTarget: Math.max(
      ...topActions.map((a: any) => parseTimeframe(a.timeToImplement))
    ),
    totalEstimatedCost: topActions.reduce(
      (sum, action: any) => sum + (action.estimatedCostUSD || 0),
      0
    )
  };
}

// Helper to parse timeframe string like "3 months" to number
function parseTimeframe(timeStr: string): number {
  const match = timeStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 3;
}

/**
 * Prioritize individual action
 */
function prioritizeAction(
  action: ImprovementAction,
  gaps: Gap[],
  currentValuation: number,
  context?: BusinessContext
): PrioritizedAction {
  // Calculate relevance score (0-100)
  const relevanceScore = calculateRelevanceScore(action, gaps);

  // Calculate impact score (0-100)
  const impactScore = action.valuationImpactPercent * 5; // Scale to 0-100

  // Calculate feasibility score (0-100)
  const feasibilityScore = calculateFeasibilityScore(action, context);

  // Combined priority (weighted average)
  const calculatedPriority =
    relevanceScore * 0.4 + // 40% relevance
    impactScore * 0.35 +    // 35% impact
    feasibilityScore * 0.25; // 25% feasibility

  // Calculate ROI
  const estimatedValuationIncrease = 
    currentValuation * (action.valuationImpactPercent / 100);
  const roiEstimate = action.estimatedCost
    ? estimatedValuationIncrease / action.estimatedCost
    : Infinity;

  // Generate reasoning
  const reasoning = generateActionReasoning(action, gaps, relevanceScore, impactScore);

  return {
    ...action,
    calculatedPriority,
    relevanceScore,
    impactScore,
    feasibilityScore,
    roiEstimate,
    estimatedValuationIncrease,
    reasoning
  };
}

/**
 * Calculate relevance score based on gaps
 */
function calculateRelevanceScore(action: ImprovementAction, gaps: Gap[]): number {
  // Find gaps that this action addresses
  const pillarMapping: Record<string, string[]> = {
    'operations': ['EBITDA Margin', 'Quality Score'],
    'recurrence': ['Churn Rate', 'Net Revenue Retention'],
    'concentration': ['Revenue Growth Rate'],
    'growth': ['Revenue Growth Rate', 'Valuation Multiple'],
    'risk': ['Quality Score', 'EBITDA Margin']
  };

  const relatedMetrics = pillarMapping[action.pillarImpact] || [];
  const relatedGaps = gaps.filter(gap =>
    relatedMetrics.some(metric => gap.metric.includes(metric))
  );

  if (relatedGaps.length === 0) return 50; // Neutral if no direct gaps

  // Score based on gap severity
  const severityScores = relatedGaps.map(gap => {
    if (gap.severity === 'critical') return 100;
    if (gap.severity === 'high') return 80;
    if (gap.severity === 'medium') return 60;
    return 40;
  });

  return Math.max(...severityScores);
}

/**
 * Calculate feasibility score
 */
function calculateFeasibilityScore(
  action: ImprovementAction,
  context?: BusinessContext
): number {
  let score = 60; // Base score

  // Difficulty adjustment
  if (action.difficulty === 'easy') {
    score += 30;
  } else if (action.difficulty === 'moderate') {
    score += 10;
  } else {
    score -= 10;
  }

  // Time adjustment
  if (action.estimatedTimeMonths <= 2) {
    score += 10;
  } else if (action.estimatedTimeMonths > 6) {
    score -= 10;
  }

  // Cost adjustment (relative to company size)
  if (context && context.revenue) {
    const costAsPercentOfRevenue = (action.estimatedCost || 0) / context.revenue;
    if (costAsPercentOfRevenue < 0.01) {
      score += 10; // Less than 1% of revenue
    } else if (costAsPercentOfRevenue > 0.05) {
      score -= 10; // More than 5% of revenue
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate reasoning for action recommendation
 */
function generateActionReasoning(
  action: ImprovementAction,
  gaps: Gap[],
  relevanceScore: number,
  impactScore: number
): string[] {
  const reasoning: string[] = [];

  // Impact reasoning
  reasoning.push(
    `Expected to increase valuation by ${action.valuationImpactPercent}% (~$${(action.valuationImpactPercent * 10000).toLocaleString()})`
  );

  // Gap reasoning
  if (relevanceScore >= 80) {
    const criticalGaps = gaps.filter(g => g.severity === 'critical' || g.severity === 'high');
    if (criticalGaps.length > 0) {
      reasoning.push(
        `Addresses critical gap in ${criticalGaps[0].metric} (currently at ${criticalGaps[0].percentile.toFixed(0)}th percentile)`
      );
    }
  }

  // Time reasoning
  if (action.estimatedTimeMonths <= 2) {
    reasoning.push(`Quick win - can be implemented in ${action.estimatedTimeMonths} month${action.estimatedTimeMonths > 1 ? 's' : ''}`);
  } else if (action.estimatedTimeMonths > 6) {
    reasoning.push(`Strategic initiative - ${action.estimatedTimeMonths} month timeline`);
  }

  // Cost-benefit reasoning
  if (action.estimatedCost && action.estimatedCost < 10000) {
    reasoning.push(`Low investment required ($${action.estimatedCost.toLocaleString()})`);
  } else if (action.estimatedCost && action.estimatedCost > 50000) {
    reasoning.push(`Significant investment ($${action.estimatedCost.toLocaleString()}) but high ROI`);
  }

  // Pillar reasoning
  const pillarDescriptions: Record<string, string> = {
    'operations': 'Improves operational efficiency and scalability',
    'recurrence': 'Strengthens revenue predictability and retention',
    'concentration': 'Reduces risk through diversification',
    'growth': 'Accelerates revenue growth and market expansion',
    'risk': 'Reduces business risk and improves governance'
  };

  if (pillarDescriptions[action.pillarImpact]) {
    reasoning.push(pillarDescriptions[action.pillarImpact]);
  }

  return reasoning;
}

/**
 * Create implementation timeline
 */
function createImplementationTimeline(actions: PrioritizedAction[]): {
  phase: string;
  months: string;
  actions: PrioritizedAction[];
  expectedIncrease: number;
}[] {
  const phases: {
    phase: string;
    months: string;
    actions: PrioritizedAction[];
    expectedIncrease: number;
  }[] = [];

  // Phase 1: Quick wins (0-3 months)
  const phase1 = actions.filter((a: any) => parseTimeframe(a.timeToImplement) <= 3);
  if (phase1.length > 0) {
    phases.push({
      phase: 'Phase 1: Quick Wins',
      months: '0-3 months',
      actions: phase1,
      expectedIncrease: phase1.reduce((sum, a) => sum + a.estimatedValuationIncrease, 0)
    });
  }

  // Phase 2: Mid-term improvements (3-6 months)
  const phase2 = actions.filter((a: any) => {
    const months = parseTimeframe(a.timeToImplement);
    return months > 3 && months <= 6;
  });
  if (phase2.length > 0) {
    phases.push({
      phase: 'Phase 2: Mid-term Improvements',
      months: '3-6 months',
      actions: phase2,
      expectedIncrease: phase2.reduce((sum, a) => sum + a.estimatedValuationIncrease, 0)
    });
  }

  // Phase 3: Strategic initiatives (6-12 months)
  const phase3 = actions.filter((a: any) => parseTimeframe(a.timeToImplement) > 6);
  if (phase3.length > 0) {
    phases.push({
      phase: 'Phase 3: Strategic Initiatives',
      months: '6-12 months',
      actions: phase3,
      expectedIncrease: phase3.reduce((sum, a) => sum + a.estimatedValuationIncrease, 0)
    });
  }

  return phases;
}

/**
 * Get action details with prerequisites expanded
 */
export async function getActionDetails(actionId: string): Promise<ImprovementAction | null> {
  const actions = await fetchImprovementActions();
  return actions.find(a => a.id === actionId) || null;
}

/**
 * Simulate impact of implementing specific actions
 */
export function simulateImpact(
  currentValuation: number,
  selectedActions: ImprovementAction[]
): {
  newValuation: number;
  totalIncrease: number;
  totalIncreasePercent: number;
  breakdown: { actionTitle: string; increase: number }[];
} {
  const breakdown = selectedActions.map(action => ({
    actionTitle: action.actionTitle,
    increase: currentValuation * (action.valuationImpactPercent / 100)
  }));

  const totalIncrease = breakdown.reduce((sum, item) => sum + item.increase, 0);

  return {
    newValuation: currentValuation + totalIncrease,
    totalIncrease,
    totalIncreasePercent: (totalIncrease / currentValuation) * 100,
    breakdown
  };
}
