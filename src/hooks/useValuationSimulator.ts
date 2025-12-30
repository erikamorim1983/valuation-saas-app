import { useState, useMemo } from 'react';
import { ValuationRecord } from '@/lib/supabase/valuation';
import { calculatePillarScore, getSectorMultiples, getStartupRevenueMultiples } from '@/lib/valuation/engines/partnerMethod';
import { ValuationParams, Sector } from '@/lib/valuation/types';

export interface SimulationState {
    growthRate: number; // Percentage (e.g. 10 for +10%)
    marginImprovement: number; // Percentage points (e.g. 5 for +5%)
    riskReduction: number; // 0-100 scale (improves Ops/Risk scores)
}

export function useValuationSimulator(initialValuation: ValuationRecord) {
    const [simulatedParams, setSimulatedParams] = useState<SimulationState>({
        growthRate: 0,
        marginImprovement: 0,
        riskReduction: 0
    });

    const baseResult = initialValuation.valuation_result;
    const isStartup = baseResult?.method === 'Advanced (Startup)';
    const financials = initialValuation.financial_data;

    // Calculate Base Baseline Metrics
    const baseline = useMemo(() => {
        let driverValue = 0; // Revenue (Startup) or EBITDA (Established)
        let multiple = 0;
        let cagr = 0;

        if (baseResult?.details) {
            if (isStartup) {
                driverValue = financials.projectedRevenueYear1 || 0;
                // Reverse engineer base multiple if needed, or use stored
                multiple = baseResult.details.chosenMultiple;
                cagr = 50; // Startup proxy
            } else {
                driverValue = baseResult.details.weightedEbitda || 0;
                multiple = baseResult.details.chosenMultiple;
                cagr = baseResult.details.cagr || 0;
            }
        }
        return { driverValue, multiple, cagr };
    }, [baseResult, isStartup, financials]);


    // Real-time Simulation
    const simulation = useMemo(() => {
        if (!baseResult) return null;

        // 1. Simulate Driver (Revenue/EBITDA)
        let newDriverValue = baseline.driverValue;

        // Growth Impact:
        // For Startup: Revenue increases by growthRate%
        // For Established: We assume EBITDA grows with revenue (simplified) OR efficiency.
        // Let's treat growthRate as top-line growth.
        const growthMultiplier = 1 + (simulatedParams.growthRate / 100);

        if (isStartup) {
            newDriverValue = newDriverValue * growthMultiplier;
        } else {
            // For EBITDA, Margin Improvement adds directly.
            // Assumption: Current Revenue * New Margin = New EBITDA
            // We need Current Revenue.
            const currentRevenue = financials.revenue || baseline.driverValue * 2; // Fallback if missing?
            const currentMargin = currentRevenue > 0 ? (baseline.driverValue / currentRevenue) : 0;
            const newMargin = currentMargin + (simulatedParams.marginImprovement / 100);

            // New EBITDA = (Revenue * Growth) * New Margin
            // If we don't have revenue, we approximate: EBITDA * Growth * (1 + MarginImprovement%)
            // Let's use the safer approximation:
            // NewEBITDA = BaseEBITDA * GrowthMultiplier * (1 + (MarginImp / CurrentMargin))?? No too complex.
            // Simple: NewEBITDA = BaseEBITDA * GrowthMultiplier * (1 + MarginImprovement/20) - just a rough heuristic?
            // BETTER: Use implied revenue.
            const impliedRevenue = baseline.driverValue / (currentMargin || 0.15); // Assume 15% if 0
            const newRevenue = impliedRevenue * growthMultiplier;
            const finalMargin = Math.min(0.9, Math.max(0.01, currentMargin + (simulatedParams.marginImprovement / 100)));
            newDriverValue = newRevenue * finalMargin;
        }

        // 2. Simulate Multiple (via Risk/Qualitative Score)
        // We boost the Qualitative Parameters based on "riskReduction" slider (0-100)
        // 0 = No change, 100 = Perfect Score in Ops/Risk

        // Reconstruct base params
        // We probably stored qualitative data in financial_data as 'any' in draft, but for completed valuation, 
        // we need to see where it is stored. 
        // In StepReview we passed `financials` and `params`. `params` had `qualitative`.
        // The DB `financial_data` column usually stores the `FinancialData` object.
        // `ValuationParams` (with qualitative) might be missing from DB if we only saved `financial_data`.
        // CHECK: In StepReview, we updated `financial_data` to include `qualitative` as a hack!
        // So we can access it there.
        const storedQualitative = (financials as any).qualitative || {};

        const boost = simulatedParams.riskReduction / 100; // 0 to 1

        const simulatedQualitative = {
            ...storedQualitative,
            // Boost Governance/Ops
            ownerAutonomyScore: Math.min(100, (storedQualitative.ownerAutonomyScore || 0) + (100 * boost)),
            hasSOPs: boost > 0.5 ? 'full' : (boost > 0.2 ? 'partial' : storedQualitative.hasSOPs),
            teamScore: Math.min(10, (storedQualitative.teamScore || 5) + (5 * boost)),

            // Boost Risk Compliance
            hasAuditedDocs: boost > 0.6 ? true : storedQualitative.hasAuditedDocs,
            hasFinancialPlan: boost > 0.4 ? true : storedQualitative.hasFinancialPlan,
            hasLegalIssues: boost > 0.8 ? false : storedQualitative.hasLegalIssues, // Remove issues if high boost

            // Keep others same
            recurringRevenuePercent: storedQualitative.recurringRevenuePercent || 0,
            biggestClientPercent: storedQualitative.biggestClientPercent || 0,
            hasInsurance: storedQualitative.hasInsurance || false,
            hasERP: storedQualitative.hasERP || false,
            hasIntegratedPayments: storedQualitative.hasIntegratedPayments || false,
            hasPaymentWorkflow: storedQualitative.hasPaymentWorkflow || false,
            hasAutoReconciliation: storedQualitative.hasAutoReconciliation || false,
        };

        const simulatedParamsObj: ValuationParams = {
            sector: initialValuation.sector as Sector,
            riskFreeRate: 0.04,
            equityRiskPremium: 0.05,
            companySpecificRisk: 0,
            taxRate: 0.21,
            termYears: 5,
            terminalGrowthRate: 0.03,
            qualitative: simulatedQualitative as any
        };

        // Recalculate Score
        // CAGR also improves with Growth Slider!
        const simulatedCagr = (baseline.cagr / 100) + (simulatedParams.growthRate / 100);
        const newScore = calculatePillarScore(simulatedParamsObj, simulatedCagr);

        // Recalculate Multiple
        const sectorMultiples = isStartup
            ? getStartupRevenueMultiples(initialValuation.sector)
            : getSectorMultiples(initialValuation.sector);

        const newMultiple = sectorMultiples.low + (sectorMultiples.high - sectorMultiples.low) * newScore.totalScore;

        // Final Value
        const newEnterpriseValue = newDriverValue * newMultiple;
        const newEquityValue = newEnterpriseValue + (financials.cash || 0) - (financials.debt || 0);

        return {
            value: Math.round(newEquityValue),
            multiple: Number(newMultiple.toFixed(2)),
            driver: Math.round(newDriverValue),
            score: newScore
        };

    }, [baseline, simulatedParams, isStartup, financials, initialValuation.sector, baseResult]);

    return {
        baseline,
        simulation,
        params: simulatedParams,
        setParam: (key: keyof SimulationState, value: number) =>
            setSimulatedParams(prev => ({ ...prev, [key]: value }))
    };
}
