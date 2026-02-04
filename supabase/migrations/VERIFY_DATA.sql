-- ================================================================
-- QUERIES DE VERIFICAÇÃO - Execute no Supabase Dashboard
-- ================================================================

-- 1. Verificar países inseridos (esperado: 6)
SELECT 
  country, 
  country_name, 
  equity_risk_premium as erp,
  liquidity_discount,
  exit_discount,
  risk_free_rate,
  inflation_rate
FROM country_risk_data
ORDER BY country;

-- 2. Verificar size premiums (esperado: 15 - 3 países × 5 brackets)
SELECT 
  country,
  size_bracket,
  revenue_min,
  revenue_max,
  wacc_premium,
  multiple_discount
FROM size_premiums
ORDER BY country, 
  CASE size_bracket
    WHEN 'micro' THEN 1
    WHEN 'small' THEN 2
    WHEN 'mid' THEN 3
    WHEN 'growth' THEN 4
    WHEN 'scale' THEN 5
  END;

-- 3. Verificar valuation multiples (esperado: 15+)
SELECT 
  country,
  sector,
  sub_sector,
  size_bracket,
  revenue_multiple_median,
  ebitda_multiple_median,
  sample_size,
  confidence_score
FROM valuation_multiples
ORDER BY country, sector, sub_sector;

-- 4. Verificar benchmark companies (esperado: 12)
SELECT 
  company_name,
  country,
  sector,
  sub_sector,
  size_bracket,
  annual_revenue / 1000000 as revenue_millions,
  valuation_multiple,
  nrr,
  churn_rate
FROM benchmark_companies
ORDER BY annual_revenue DESC;

-- 5. Verificar improvement actions (esperado: 15+)
SELECT 
  action_category,
  action_title,
  pillar_impact,
  expected_score_increase,
  valuation_impact_percent,
  difficulty,
  time_to_implement
FROM improvement_actions
ORDER BY default_priority DESC;

-- ================================================================
-- RESUMO GERAL
-- ================================================================
SELECT 
  'country_risk_data' as table_name, 
  COUNT(*) as row_count,
  '6 expected' as expected
FROM country_risk_data
UNION ALL
SELECT 
  'size_premiums', 
  COUNT(*),
  '15 expected'
FROM size_premiums
UNION ALL
SELECT 
  'valuation_multiples', 
  COUNT(*),
  '15+ expected'
FROM valuation_multiples
UNION ALL
SELECT 
  'benchmark_companies', 
  COUNT(*),
  '12 expected'
FROM benchmark_companies
UNION ALL
SELECT 
  'improvement_actions', 
  COUNT(*),
  '15+ expected'
FROM improvement_actions;

-- ================================================================
-- TESTE DE FUNÇÃO
-- ================================================================
-- Teste a função get_benchmark_companies
SELECT * FROM get_benchmark_companies(
  'SaaS',
  'Vertical - Healthcare',
  'USA',
  10000000
) LIMIT 5;
