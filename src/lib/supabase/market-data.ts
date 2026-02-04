/**
 * Market Data Services
 * 
 * Functions to fetch valuation data from database:
 * - Country risk premiums
 * - Size premiums
 * - Sector/sub-sector multiples
 * - Benchmark companies
 * - Improvement actions
 */

import { createClient } from './client';
import type {
  Country,
  SizeBracket,
  Sector,
  CountryRiskData,
  SizePremiumData,
  ValuationMultiples,
  BenchmarkCompany,
  ImprovementAction
} from '../valuation/types';

/**
 * Determine size bracket based on annual revenue
 */
export function determineSizeBracket(revenue: number): SizeBracket {
  if (revenue < 1_000_000) return 'micro';
  if (revenue < 10_000_000) return 'small';
  if (revenue < 50_000_000) return 'mid';
  if (revenue < 100_000_000) return 'growth';
  return 'scale';
}

/**
 * Fetch country risk data (ERP, discounts)
 */
export async function fetchCountryRiskData(
  country: Country
): Promise<CountryRiskData | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('country_risk_data')
    .select('*')
    .eq('country', country)
    .single();

  if (error) {
    console.error('Error fetching country risk data:', error);
    return null;
  }

  return {
    country: data.country as Country,
    countryName: data.country_name || data.country,
    equityRiskPremium: data.equity_risk_premium,
    countryRiskPremium: data.country_risk_premium || 0,
    liquidityDiscount: data.liquidity_discount,
    exitDiscount: data.exit_discount,
    riskFreeRate: data.risk_free_rate || 0.04,
    inflationRate: data.inflation_rate,
    gdpGrowthRate: data.gdp_growth_rate,
  };
}

/**
 * Fetch size premium data (WACC premium, multiple discount)
 */
export async function fetchSizePremium(
  country: Country,
  sizeBracket: SizeBracket
): Promise<SizePremiumData | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('size_premiums')
    .select('*')
    .eq('country', country)
    .eq('size_bracket', sizeBracket)
    .single();

  if (error) {
    console.error('Error fetching size premium:', error);
    // Fallback to USA if country not found
    if (country !== 'USA') {
      return fetchSizePremium('USA', sizeBracket);
    }
    return null;
  }

  return {
    country: data.country as Country,
    sizeBracket: data.size_bracket as SizeBracket,
    revenueMin: data.revenue_range_min,
    revenueMax: data.revenue_range_max,
    waccPremium: data.wacc_premium,
    multipleDiscount: data.multiple_discount,
  };
}

/**
 * Fetch valuation multiples for specific criteria
 */
export async function fetchValuationMultiples(
  country: Country,
  sector: Sector,
  subSector?: string,
  sizeBracket?: SizeBracket
): Promise<ValuationMultiples | null> {
  const supabase = createClient();
  
  let query = supabase
    .from('valuation_multiples')
    .select('*')
    .eq('country', country)
    .eq('sector', sector);

  if (subSector) {
    query = query.eq('sub_sector', subSector);
  }

  if (sizeBracket) {
    query = query.eq('size_bracket', sizeBracket);
  }

  // Order by specificity (sub_sector > sector, specific size > null)
  query = query.order('sub_sector', { ascending: true, nullsFirst: false })
               .order('size_bracket', { ascending: true, nullsFirst: false })
               .limit(1);

  const { data, error } = await supabase.from('valuation_multiples').select('*').single();

  if (error) {
    console.error('Error fetching valuation multiples:', error);
    
    // Fallback logic:
    // 1. Try without sub-sector
    if (subSector) {
      return fetchValuationMultiples(country, sector, undefined, sizeBracket);
    }
    
    // 2. Try without size bracket
    if (sizeBracket) {
      return fetchValuationMultiples(country, sector, subSector, undefined);
    }
    
    // 3. Try USA as fallback country
    if (country !== 'USA') {
      const usaData = await fetchValuationMultiples('USA', sector, subSector, sizeBracket);
      if (usaData) {
        // Apply generic emerging market discount (30%)
        return {
          ...usaData,
          country: country,
          revenueMultiple: {
            low: usaData.revenueMultiple.low * 0.70,
            median: usaData.revenueMultiple.median * 0.70,
            high: usaData.revenueMultiple.high * 0.70
          },
          ebitdaMultiple: {
            low: usaData.ebitdaMultiple.low * 0.70,
            median: usaData.ebitdaMultiple.median * 0.70,
            high: usaData.ebitdaMultiple.high * 0.70
          },
        };
      }
    }
    
    return null;
  }

  return {
    country: data.country as Country,
    sector: data.sector as Sector,
    subSector: data.sub_sector,
    sizeBracket: (data.size_bracket || 'small') as SizeBracket,
    revenueMultiple: {
      low: data.revenue_multiple_min || 2,
      median: data.revenue_multiple_median || 4,
      high: data.revenue_multiple_max || 8
    },
    ebitdaMultiple: {
      low: data.ebitda_multiple_min || 10,
      median: data.ebitda_multiple_median || 15,
      high: data.ebitda_multiple_max || 25
    },
    sampleSize: data.sample_size || 5,
    confidenceScore: data.sample_size >= 10 ? 0.9 : (data.sample_size >= 5 ? 0.7 : 0.5),
    source: data.data_source || 'Market Data',
    lastUpdated: data.last_updated
  };
}

/**
 * Fetch benchmark companies for comparison
 */
export async function fetchBenchmarkCompanies(
  sector: Sector,
  subSector?: string,
  country?: Country,
  sizeBracket?: SizeBracket,
  limit: number = 5
): Promise<BenchmarkCompany[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('benchmark_companies')
    .select('*')
    .eq('sector', sector)
    .eq('is_active', true);

  if (subSector) {
    query = query.eq('sub_sector', subSector);
  }

  if (country) {
    query = query.eq('primary_country', country);
  }

  if (sizeBracket) {
    query = query.eq('size_bracket', sizeBracket);
  }

  query = query
    .order('annual_revenue', { ascending: false })
    .limit(limit);

  const { data, error } = await supabase.from('benchmark_companies').select('*');

  if (error) {
    console.error('Error fetching benchmark companies:', error);
    
    // Fallback: Try without country/size filters
    if (country || sizeBracket) {
      return fetchBenchmarkCompanies(sector, subSector, undefined, undefined, limit);
    }
    
    return [];
  }

  return data.map(item => ({
    id: item.id,
    companyName: item.company_name,
    website: item.website || '',
    country: item.primary_country as Country,
    sector: item.sector as Sector,
    subSector: item.sub_sector || '',
    stage: item.valuation_type || 'growth',
    sizeBracket: item.size_bracket as SizeBracket,
    annualRevenue: item.annual_revenue,
    ebitda: item.ebitda_margin ? (item.annual_revenue * item.ebitda_margin / 100) : undefined,
    ebitdaMargin: item.ebitda_margin,
    growthRate: item.revenue_growth_rate,
    arr: item.arr,
    nrr: item.nrr,
    churnRate: item.churn_rate,
    ltvcacRatio: item.ltv && item.cac ? item.ltv / item.cac : undefined,
    cacPaybackMonths: item.cac_payback_months,
    lastValuation: item.last_valuation,
    valuationDate: item.valuation_date,
    valuationMultiple: item.valuation_multiple,
    valuationType: item.valuation_type,
    description: item.description,
    whyReference: item.why_reference,
  }));
}

/**
 * Fetch improvement actions library
 */
export async function fetchImprovementActions(
  pillar?: string,
  difficulty?: 'easy' | 'moderate' | 'hard',
  limit: number = 20
): Promise<ImprovementAction[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('improvement_actions')
    .select('*')
    .eq('is_active', true);

  if (pillar) {
    query = query.eq('pillar_impact', pillar);
  }

  if (difficulty) {
    query = query.eq('difficulty', difficulty);
  }

  query = query
    .order('default_priority', { ascending: false })
    .limit(limit);

  const { data, error } = await supabase.from('improvement_actions').select('*');

  if (error) {
    console.error('Error fetching improvement actions:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    category: (item.pillar_impact || 'operations') as 'operations' | 'revenue_quality' | 'moat' | 'team' | 'financial' | 'growth',
    title: item.action_title,
    description: item.description,
    pillarImpact: item.pillar_impact,
    expectedScoreIncrease: item.score_increase,
    valuationImpactPercent: item.valuation_impact_percent,
    difficulty: (item.difficulty || 'moderate') as 'easy' | 'moderate' | 'hard' | 'very_hard',
    timeToImplement: `${item.estimated_time_months || 3} months`,
    estimatedCostUSD: item.estimated_cost,
  }));
}

/**
 * Calculate combined adjustment factor
 * 
 * Formula: baseMultiple × countryFactor × sizeFactor × qualityFactor
 */
export async function calculateAdjustmentFactors(
  country: Country,
  sizeBracket: SizeBracket,
  qualityScore: number
): Promise<{
  countryFactor: number;
  sizeFactor: number;
  qualityFactor: number;
  combinedFactor: number;
}> {
  // Country factor (based on liquidity + exit discounts)
  const countryData = await fetchCountryRiskData(country);
  const countryFactor = countryData
    ? 1 - countryData.liquidityDiscount - countryData.exitDiscount
    : 1.0;

  // Size factor (based on multiple discount)
  const sizeData = await fetchSizePremium(country, sizeBracket);
  const sizeFactor = sizeData
    ? 1 + sizeData.multipleDiscount // multipleDiscount is negative, so this reduces
    : 1.0;

  // Quality factor (85+ is premium, 70-84 is par, <70 is discount)
  let qualityFactor = 1.0;
  if (qualityScore >= 85) {
    qualityFactor = 1.0 + (qualityScore - 85) * 0.01; // +1% per point above 85
  } else if (qualityScore < 70) {
    qualityFactor = 0.7 + (qualityScore / 100) * 0.3; // Scale from 0.7 to 1.0
  }

  const combinedFactor = countryFactor * sizeFactor * qualityFactor;

  return {
    countryFactor,
    sizeFactor,
    qualityFactor,
    combinedFactor
  };
}
