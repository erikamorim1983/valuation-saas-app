-- ================================================================
-- MIGRATION: Advanced Valuation System with Benchmarking
-- Version: 007
-- Date: 2026-01-29
-- Description: Country/Size/Sub-sector multiples + Benchmark companies
-- ================================================================

-- ================================================================
-- 1. VALUATION MULTIPLES BY COUNTRY/SECTOR/SIZE
-- ================================================================

CREATE TABLE IF NOT EXISTS valuation_multiples (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Geographic & Classification
  country VARCHAR(3) NOT NULL,              -- ISO: USA, BRL, MEX, etc
  sector VARCHAR(50) NOT NULL,              -- SaaS, E-commerce, Fintech, etc
  sub_sector VARCHAR(100) NOT NULL,         -- Vertical-Healthcare, D2C-Beauty, etc
  size_bracket VARCHAR(20) NOT NULL,        -- micro, small, mid, growth, scale
  
  -- Revenue Multiples (ARR for SaaS, GMV for marketplace, etc)
  revenue_multiple_low DECIMAL(6,2),
  revenue_multiple_high DECIMAL(6,2),
  revenue_multiple_median DECIMAL(6,2),
  
  -- EBITDA Multiples
  ebitda_multiple_low DECIMAL(6,2),
  ebitda_multiple_high DECIMAL(6,2),
  ebitda_multiple_median DECIMAL(6,2),
  
  -- Quality Metrics
  sample_size INT DEFAULT 0,                -- Number of deals this data is based on
  confidence_score DECIMAL(3,2) DEFAULT 0.50, -- 0.0 to 1.0 (data quality/recency)
  
  -- Metadata
  source VARCHAR(200),                      -- "Damodaran 2026", "PitchBook Q4 2025", etc
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  
  -- Unique constraint
  UNIQUE(country, sub_sector, size_bracket)
);

CREATE INDEX idx_multiples_lookup ON valuation_multiples(country, sector, sub_sector, size_bracket);
CREATE INDEX idx_multiples_sector ON valuation_multiples(sector, sub_sector);

-- ================================================================
-- 2. COUNTRY RISK DATA (Damodaran methodology)
-- ================================================================

CREATE TABLE IF NOT EXISTS country_risk_data (
  country VARCHAR(3) PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL,
  
  -- Risk Premiums
  equity_risk_premium DECIMAL(4,2) NOT NULL, -- % (ex: 9.20 for Brazil = 9.2%)
  country_risk_premium DECIMAL(4,2),         -- % vs baseline (USA)
  default_spread DECIMAL(4,2),               -- Sovereign CDS spread basis points
  
  -- Risk Scores
  political_risk_score INT CHECK (political_risk_score BETWEEN 0 AND 100),
  economic_stability_score INT CHECK (economic_stability_score BETWEEN 0 AND 100),
  
  -- Valuation Adjustments
  liquidity_discount DECIMAL(4,3) DEFAULT 0, -- % discount (ex: 0.250 = -25%)
  exit_discount DECIMAL(4,3) DEFAULT 0,      -- % discount for fewer exit opps
  
  -- Macro Data
  risk_free_rate DECIMAL(6,2),               -- 10Y government bond (supports up to 9999.99)
  inflation_rate DECIMAL(6,2),               -- Inflation rate (supports high inflation countries)
  gdp_growth_rate DECIMAL(5,2),              -- GDP growth rate
  
  -- Metadata
  source VARCHAR(200) DEFAULT 'Damodaran Country Risk Premium',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Currency
  primary_currency VARCHAR(3)                -- USD, BRL, EUR, etc
);

CREATE INDEX idx_country_name ON country_risk_data(country_name);

-- ================================================================
-- 3. SIZE PREMIUMS (Ibbotson SBBI methodology)
-- ================================================================

CREATE TABLE IF NOT EXISTS size_premiums (
  id UUID DEFAULT gen_random_uuid() UNIQUE,
  
  country VARCHAR(3) NOT NULL,
  size_bracket VARCHAR(20) NOT NULL,
  
  -- Revenue Thresholds (in local currency)
  revenue_min BIGINT,
  revenue_max BIGINT,
  
  -- Premiums
  wacc_premium DECIMAL(5,2) NOT NULL,        -- % added to WACC (ex: 8.50 = +8.5%)
  multiple_discount DECIMAL(5,3) NOT NULL,   -- % discount on multiple (ex: 0.350 = -35%)
  
  -- Metadata
  source VARCHAR(200) DEFAULT 'Ibbotson SBBI 2025',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY(country, size_bracket),
  FOREIGN KEY (country) REFERENCES country_risk_data(country) ON DELETE CASCADE
);

-- ================================================================
-- 4. BENCHMARK COMPANIES (Reference companies by sector)
-- ================================================================

CREATE TABLE IF NOT EXISTS benchmark_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Company Info
  company_name VARCHAR(200) NOT NULL,
  country VARCHAR(3) NOT NULL,
  sector VARCHAR(50) NOT NULL,
  sub_sector VARCHAR(100) NOT NULL,
  
  -- Stage & Size
  stage VARCHAR(50),                         -- early, growth, scale, mature, public
  size_bracket VARCHAR(20),
  
  -- Key Metrics
  annual_revenue BIGINT,
  ebitda BIGINT,
  ebitda_margin DECIMAL(5,2),                -- %
  growth_rate DECIMAL(5,2),                  -- YoY %
  
  -- SaaS Specific
  arr BIGINT,                                -- Annual Recurring Revenue
  nrr DECIMAL(5,2),                          -- Net Revenue Retention %
  churn_rate DECIMAL(4,2),                   -- Annual churn %
  ltv_cac_ratio DECIMAL(4,2),
  cac_payback_months INT,
  
  -- Valuation
  last_valuation BIGINT,
  valuation_date DATE,
  valuation_multiple DECIMAL(6,2),           -- Implied multiple
  valuation_type VARCHAR(50),                -- funding_round, acquisition, ipo, estimated
  
  -- Description
  description TEXT,
  why_reference TEXT,                        -- Why this is a good benchmark
  website VARCHAR(500),
  
  -- Visibility
  is_public_data BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  source VARCHAR(200),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_benchmark_sector ON benchmark_companies(sector, sub_sector);
CREATE INDEX idx_benchmark_country ON benchmark_companies(country);
CREATE INDEX idx_benchmark_size ON benchmark_companies(size_bracket);
CREATE INDEX idx_benchmark_active ON benchmark_companies(is_active) WHERE is_active = true;

-- ================================================================
-- 5. IMPROVEMENT RECOMMENDATIONS FRAMEWORK
-- ================================================================

CREATE TABLE IF NOT EXISTS improvement_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Action Details
  action_category VARCHAR(50) NOT NULL,      -- operations, revenue_quality, moat, team, financial
  action_title VARCHAR(200) NOT NULL,
  action_description TEXT NOT NULL,
  
  -- Applicability
  applicable_sectors TEXT[],                 -- ['SaaS', 'Fintech'] or ['*'] for all
  applicable_sizes TEXT[],                   -- ['micro', 'small'] or ['*']
  
  -- Impact
  pillar_impact VARCHAR(50),                 -- Which pillar this improves (ops, rec, conc, grow, risk)
  expected_score_increase INT,               -- Expected points increase (0-100 scale)
  valuation_impact_percent DECIMAL(4,2),     -- Direct % impact on valuation
  
  -- Implementation
  difficulty VARCHAR(20),                    -- easy, moderate, hard, very_hard
  time_to_implement VARCHAR(50),             -- "1-2 weeks", "1-3 months", "6+ months"
  estimated_cost_usd INT,                    -- Rough cost estimate
  
  -- Priority (system calculated, but can have default)
  default_priority INT DEFAULT 50,           -- 0-100, higher = more important
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_actions_category ON improvement_actions(action_category);
CREATE INDEX idx_actions_pillar ON improvement_actions(pillar_impact);

-- ================================================================
-- 6. USER IMPROVEMENT PLAN (Personalized recommendations)
-- ================================================================

CREATE TABLE IF NOT EXISTS user_improvement_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  valuation_id UUID NOT NULL,
  action_id UUID NOT NULL,
  
  -- Calculated for this specific user
  calculated_priority INT,                   -- 0-100, based on user's gaps
  potential_score_increase INT,              -- Expected points for THIS user
  potential_valuation_increase BIGINT,       -- Expected $ increase
  
  -- Status
  status VARCHAR(50) DEFAULT 'suggested',    -- suggested, in_progress, completed, dismissed
  user_notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (valuation_id) REFERENCES valuations(id) ON DELETE CASCADE,
  FOREIGN KEY (action_id) REFERENCES improvement_actions(id) ON DELETE CASCADE,
  
  UNIQUE(valuation_id, action_id)
);

CREATE INDEX idx_user_plans_valuation ON user_improvement_plans(valuation_id);
CREATE INDEX idx_user_plans_status ON user_improvement_plans(status);

-- ================================================================
-- 7. UPDATE EXISTING TABLES
-- ================================================================

-- Add new fields to valuations table
ALTER TABLE valuations 
  ADD COLUMN IF NOT EXISTS country VARCHAR(3) DEFAULT 'USA',
  ADD COLUMN IF NOT EXISTS sub_sector VARCHAR(100),
  ADD COLUMN IF NOT EXISTS size_bracket VARCHAR(20),
  ADD COLUMN IF NOT EXISTS business_model VARCHAR(100),
  ADD COLUMN IF NOT EXISTS geographic_scope VARCHAR(50);

-- Add revenue quality metrics to valuations
ALTER TABLE valuations
  ADD COLUMN IF NOT EXISTS churn_rate DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS nrr DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS ltv BIGINT,
  ADD COLUMN IF NOT EXISTS cac BIGINT,
  ADD COLUMN IF NOT EXISTS cac_payback_months INT,
  ADD COLUMN IF NOT EXISTS contract_type VARCHAR(50);

-- Add moat/defensibility metrics
ALTER TABLE valuations
  ADD COLUMN IF NOT EXISTS ip_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS network_effect_strength VARCHAR(50),
  ADD COLUMN IF NOT EXISTS switching_cost_estimate BIGINT,
  ADD COLUMN IF NOT EXISTS has_data_moat BOOLEAN DEFAULT false;

-- ================================================================
-- 8. FUNCTIONS FOR BENCHMARKING
-- ================================================================

-- Function: Get benchmark companies for a sector/sub-sector
CREATE OR REPLACE FUNCTION get_benchmark_companies(
  p_sector TEXT,
  p_sub_sector TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_size_bracket TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  company_name VARCHAR,
  country VARCHAR,
  sub_sector VARCHAR,
  annual_revenue BIGINT,
  growth_rate DECIMAL,
  ebitda_margin DECIMAL,
  valuation_multiple DECIMAL,
  nrr DECIMAL,
  churn_rate DECIMAL,
  why_reference TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bc.company_name,
    bc.country,
    bc.sub_sector,
    bc.annual_revenue,
    bc.growth_rate,
    bc.ebitda_margin,
    bc.valuation_multiple,
    bc.nrr,
    bc.churn_rate,
    bc.why_reference
  FROM benchmark_companies bc
  WHERE bc.sector = p_sector
    AND bc.is_active = true
    AND (p_sub_sector IS NULL OR bc.sub_sector = p_sub_sector)
    AND (p_country IS NULL OR bc.country = p_country)
    AND (p_size_bracket IS NULL OR bc.size_bracket = p_size_bracket)
  ORDER BY 
    -- Prioritize exact sub-sector match
    CASE WHEN bc.sub_sector = p_sub_sector THEN 0 ELSE 1 END,
    -- Then by data recency
    bc.last_updated DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- COMMIT
-- ================================================================

COMMENT ON TABLE valuation_multiples IS 'Multiples by country, sector, sub-sector, and company size';
COMMENT ON TABLE country_risk_data IS 'Country risk premiums and adjustments (Damodaran methodology)';
COMMENT ON TABLE size_premiums IS 'Size premiums by country and revenue bracket (Ibbotson SBBI)';
COMMENT ON TABLE benchmark_companies IS 'Reference companies for sector benchmarking';
COMMENT ON TABLE improvement_actions IS 'Library of actions to improve valuation';
COMMENT ON TABLE user_improvement_plans IS 'Personalized improvement plans per valuation';
