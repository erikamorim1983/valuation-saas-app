-- ================================================================
-- SEED DATA: Market Data for Valuation System
-- Version: 007_seed
-- Date: 2026-01-29
-- Sources: Damodaran 2026, PitchBook 2025, Market Research
-- ================================================================

-- ================================================================
-- 1. COUNTRY RISK DATA (Damodaran 2026 + Market Data)
-- ================================================================

INSERT INTO country_risk_data (
  country, country_name, equity_risk_premium, country_risk_premium, 
  default_spread, political_risk_score, economic_stability_score,
  liquidity_discount, exit_discount, risk_free_rate, inflation_rate, 
  gdp_growth_rate, primary_currency, source
) VALUES
  -- North America
  ('USA', 'United States', 5.50, 0.00, 0.50, 92, 95, 0.000, 0.000, 4.20, 2.80, 2.10, 'USD', 'Damodaran 2026 + Federal Reserve'),
  ('MEX', 'Mexico', 8.10, 2.60, 2.80, 72, 74, 0.200, 0.150, 9.50, 4.50, 2.50, 'MXN', 'Damodaran 2026'),
  
  -- South America
  ('BRL', 'Brazil', 9.20, 3.70, 3.70, 68, 70, 0.250, 0.200, 11.75, 4.20, 2.30, 'BRL', 'Damodaran 2026 + Banco Central'),
  ('ARG', 'Argentina', 15.50, 10.00, 12.50, 45, 52, 0.400, 0.350, 75.00, 120.00, -1.50, 'ARS', 'Damodaran 2026'),
  ('CHL', 'Chile', 7.80, 2.30, 2.50, 78, 80, 0.180, 0.120, 6.20, 3.80, 2.80, 'CLP', 'Damodaran 2026'),
  ('COL', 'Colombia', 8.50, 3.00, 3.20, 70, 72, 0.220, 0.160, 11.50, 5.20, 2.00, 'COP', 'Damodaran 2026')
ON CONFLICT (country) DO UPDATE SET
  equity_risk_premium = EXCLUDED.equity_risk_premium,
  country_risk_premium = EXCLUDED.country_risk_premium,
  last_updated = NOW();

-- ================================================================
-- 2. SIZE PREMIUMS (Ibbotson SBBI 2025 + Adjusted for Latam)
-- ================================================================

INSERT INTO size_premiums (
  country, size_bracket, revenue_min, revenue_max, wacc_premium, multiple_discount, source
) VALUES
  -- USA Size Premiums
  ('USA', 'micro', 0, 1000000, 8.50, 0.450, 'Ibbotson SBBI 2025'),
  ('USA', 'small', 1000001, 10000000, 6.00, 0.280, 'Ibbotson SBBI 2025'),
  ('USA', 'mid', 10000001, 50000000, 4.00, 0.120, 'Ibbotson SBBI 2025'),
  ('USA', 'growth', 50000001, 100000000, 2.50, 0.060, 'Ibbotson SBBI 2025'),
  ('USA', 'scale', 100000001, 9223372036854775807, 0.00, 0.000, 'Baseline'),
  
  -- Brazil (Higher premiums due to less liquid market)
  ('BRL', 'micro', 0, 1000000, 13.00, 0.550, 'Ibbotson + Brazil Market Adjustment'),
  ('BRL', 'small', 1000001, 10000000, 9.00, 0.350, 'Ibbotson + Brazil Market Adjustment'),
  ('BRL', 'mid', 10000001, 50000000, 6.00, 0.180, 'Ibbotson + Brazil Market Adjustment'),
  ('BRL', 'growth', 50000001, 100000000, 3.50, 0.090, 'Ibbotson + Brazil Market Adjustment'),
  ('BRL', 'scale', 100000001, 9223372036854775807, 0.00, 0.000, 'Baseline'),
  
  -- Mexico
  ('MEX', 'micro', 0, 1000000, 11.00, 0.500, 'Latam Adjusted'),
  ('MEX', 'small', 1000001, 10000000, 7.50, 0.320, 'Latam Adjusted'),
  ('MEX', 'mid', 10000001, 50000000, 5.00, 0.150, 'Latam Adjusted'),
  ('MEX', 'growth', 50000001, 100000000, 3.00, 0.075, 'Latam Adjusted'),
  ('MEX', 'scale', 100000001, 9223372036854775807, 0.00, 0.000, 'Baseline')
ON CONFLICT (country, size_bracket) DO UPDATE SET
  wacc_premium = EXCLUDED.wacc_premium,
  multiple_discount = EXCLUDED.multiple_discount,
  last_updated = NOW();

-- ================================================================
-- 3. VALUATION MULTIPLES (By Country, Sector, Sub-Sector, Size)
-- ================================================================

-- USA - SaaS Multiples
INSERT INTO valuation_multiples (
  country, sector, sub_sector, size_bracket,
  revenue_multiple_low, revenue_multiple_median, revenue_multiple_high,
  ebitda_multiple_low, ebitda_multiple_median, ebitda_multiple_high,
  sample_size, confidence_score, source, notes
) VALUES
  -- AI/ML SaaS (Premium tier)
  ('USA', 'SaaS', 'AI/ML', 'mid', 10.0, 15.0, 20.0, 35.0, 55.0, 80.0, 45, 0.88, 'PitchBook Q4 2025', 'High growth, AI premium'),
  ('USA', 'SaaS', 'AI/ML', 'small', 7.0, 11.0, 16.0, 25.0, 40.0, 60.0, 28, 0.82, 'PitchBook Q4 2025', NULL),
  
  -- Vertical SaaS - Healthcare
  ('USA', 'SaaS', 'Vertical - Healthcare', 'mid', 7.0, 10.5, 14.0, 22.0, 32.0, 42.0, 62, 0.92, 'PitchBook Q4 2025', 'Sticky, regulatory moat'),
  ('USA', 'SaaS', 'Vertical - Healthcare', 'small', 5.0, 7.5, 10.5, 16.0, 24.0, 32.0, 38, 0.85, 'PitchBook Q4 2025', NULL),
  
  -- Horizontal SaaS - CRM
  ('USA', 'SaaS', 'Horizontal - CRM/Sales', 'mid', 5.0, 7.5, 10.0, 18.0, 26.0, 35.0, 88, 0.95, 'PitchBook Q4 2025', 'Competitive market'),
  ('USA', 'SaaS', 'Horizontal - CRM/Sales', 'small', 3.5, 5.5, 8.0, 12.0, 18.0, 25.0, 52, 0.88, 'PitchBook Q4 2025', NULL),
  
  -- Legacy SaaS
  ('USA', 'SaaS', 'Legacy/On-Premise', 'mid', 2.0, 3.5, 5.0, 8.0, 12.0, 16.0, 35, 0.75, 'Market Research 2025', 'Low growth'),
  ('USA', 'SaaS', 'Legacy/On-Premise', 'small', 1.5, 2.5, 4.0, 6.0, 9.0, 12.0, 22, 0.68, 'Market Research 2025', NULL),
  
  -- Fintech - Payments
  ('USA', 'Fintech', 'Payments/PSP', 'mid', 5.0, 8.0, 11.0, 18.0, 28.0, 38.0, 42, 0.85, 'Crunchbase 2025', 'Volume-based, high compliance'),
  ('USA', 'Fintech', 'Payments/PSP', 'small', 3.5, 6.0, 9.0, 12.0, 20.0, 28.0, 25, 0.78, 'Crunchbase 2025', NULL),
  
  -- E-commerce - D2C Beauty
  ('USA', 'E-commerce', 'D2C - Beauty/Cosmetics', 'mid', 1.3, 2.0, 2.8, 6.0, 9.0, 13.0, 55, 0.88, 'PitchBook 2025', 'High margin, brand value'),
  ('USA', 'E-commerce', 'D2C - Beauty/Cosmetics', 'small', 0.9, 1.5, 2.2, 4.0, 6.5, 10.0, 32, 0.80, 'PitchBook 2025', NULL),
  
  -- E-commerce - Dropshipping
  ('USA', 'E-commerce', 'Dropshipping', 'small', 0.4, 0.7, 1.0, 2.0, 3.5, 5.5, 28, 0.65, 'BizBuySell 2025', 'Low moat, easy to replicate')
ON CONFLICT (country, sub_sector, size_bracket) DO NOTHING;

-- BRAZIL - SaaS Multiples (Lower than USA)
INSERT INTO valuation_multiples (
  country, sector, sub_sector, size_bracket,
  revenue_multiple_low, revenue_multiple_median, revenue_multiple_high,
  ebitda_multiple_low, ebitda_multiple_median, ebitda_multiple_high,
  sample_size, confidence_score, source, notes
) VALUES
  ('BRL', 'SaaS', 'Vertical - Healthcare', 'mid', 4.5, 7.0, 10.0, 15.0, 22.0, 30.0, 18, 0.68, 'Brazil Market Data 2025', 'Adjusted for Brazil market'),
  ('BRL', 'SaaS', 'Vertical - Healthcare', 'small', 3.0, 5.0, 7.5, 10.0, 16.0, 22.0, 12, 0.60, 'Brazil Market Data 2025', NULL),
  
  ('BRL', 'SaaS', 'Horizontal - CRM/Sales', 'small', 2.5, 4.0, 6.0, 8.0, 13.0, 18.0, 15, 0.62, 'Brazil Market Data 2025', NULL),
  
  ('BRL', 'Fintech', 'Payments/PSP', 'small', 2.5, 4.5, 7.0, 8.0, 14.0, 20.0, 22, 0.70, 'Crunchbase Latam 2025', 'Growing market'),
  
  ('BRL', 'E-commerce', 'D2C - Beauty/Cosmetics', 'small', 0.6, 1.0, 1.5, 3.0, 5.0, 8.0, 20, 0.65, 'Brazil Market Data 2025', NULL)
ON CONFLICT (country, sub_sector, size_bracket) DO NOTHING;

-- ================================================================
-- 4. BENCHMARK COMPANIES (Reference companies by sector)
-- ================================================================

INSERT INTO benchmark_companies (
  company_name, country, sector, sub_sector, stage, size_bracket,
  annual_revenue, ebitda, ebitda_margin, growth_rate,
  arr, nrr, churn_rate, ltv_cac_ratio, cac_payback_months,
  last_valuation, valuation_date, valuation_multiple, valuation_type,
  description, why_reference, website, is_public_data, is_active, source
) VALUES
  -- SaaS - Vertical Healthcare
  ('Doximity', 'USA', 'SaaS', 'Vertical - Healthcare', 'public', 'scale', 
   400000000, 180000000, 45.00, 25.00, 
   380000000, 118.00, 4.50, 6.20, 11, 
   4500000000, '2025-12-01', 11.84, 'public_market',
   'Professional network for physicians with integrated telehealth', 
   'Best-in-class vertical SaaS for healthcare with exceptional margins and NRR',
   'https://www.doximity.com', true, true, 'Public filings 2025'),
   
  ('Zocdoc', 'USA', 'SaaS', 'Vertical - Healthcare', 'growth', 'mid',
   120000000, 24000000, 20.00, 30.00,
   115000000, 105.00, 12.00, 3.80, 16,
   600000000, '2024-06-15', 5.00, 'funding_round',
   'Healthcare appointment booking platform',
   'Strong growth in competitive market, good reference for scaling challenges',
   'https://www.zocdoc.com', true, true, 'Crunchbase 2024'),
   
  -- SaaS - Horizontal CRM  
  ('HubSpot', 'USA', 'SaaS', 'Horizontal - CRM/Sales', 'public', 'scale',
   2100000000, 315000000, 15.00, 24.00,
   2050000000, 109.00, 6.80, 4.50, 14,
   28000000000, '2025-12-01', 13.33, 'public_market',
   'All-in-one CRM, marketing, and sales platform',
   'Industry leader in SMB-focused CRM with strong product-led growth',
   'https://www.hubspot.com', true, true, 'Public filings 2025'),
   
  ('Pipedrive', 'USA', 'SaaS', 'Horizontal - CRM/Sales', 'growth', 'mid',
   150000000, 30000000, 20.00, 35.00,
   145000000, 102.00, 15.00, 3.20, 18,
   1500000000, '2023-09-20', 10.00, 'acquisition',
   'Simple CRM for small sales teams',
   'SMB focus, high growth, acquired by Vista Equity - strong comparable',
   'https://www.pipedrive.com', true, true, 'Vista Equity 2023'),
   
  -- Fintech - Payments
  ('Stripe', 'USA', 'Fintech', 'Payments/PSP', 'scale', 'scale',
   18000000000, 3600000000, 20.00, 28.00,
   NULL, NULL, NULL, NULL, NULL,
   65000000000, '2024-03-15', 3.61, 'funding_round',
   'Payment processing infrastructure for internet businesses',
   'Gold standard for payment infrastructure, high growth even at scale',
   'https://www.stripe.com', true, true, 'Crunchbase 2024'),
   
  ('Pagar.me (Stone)', 'BRL', 'Fintech', 'Payments/PSP', 'growth', 'mid',
   80000000, 16000000, 20.00, 45.00,
   NULL, NULL, NULL, NULL, NULL,
   400000000, '2022-08-10', 5.00, 'acquisition',
   'Brazilian payment gateway and merchant services',
   'Strong local player, acquired by Stone - shows Brazil payment multiples',
   'https://pagar.me', true, true, 'Stone Acquisition 2022'),
   
  -- E-commerce D2C Beauty
  ('Glossier', 'USA', 'E-commerce', 'D2C - Beauty/Cosmetics', 'growth', 'mid',
   200000000, 30000000, 15.00, 22.00,
   NULL, NULL, NULL, NULL, NULL,
   1800000000, '2024-02-20', 9.00, 'funding_round',
   'Digital-first beauty brand with cult following',
   'Premium D2C beauty brand, strong community and brand value',
   'https://www.glossier.com', true, true, 'Crunchbase 2024'),
   
  ('The Ordinary (Deciem)', 'USA', 'E-commerce', 'D2C - Beauty/Cosmetics', 'scale', 'mid',
   460000000, 92000000, 20.00, 18.00,
   NULL, NULL, NULL, NULL, NULL,
   2200000000, '2021-01-15', 4.78, 'acquisition',
   'Science-backed affordable skincare',
   'Acquired by Estée Lauder - shows premium for strong brand + margins',
   'https://theordinary.com', true, true, 'Estée Lauder 2021'),
   
  -- SaaS Small Companies (for micro/small benchmarks)
  ('Hotjar', 'USA', 'SaaS', 'Horizontal - Marketing', 'growth', 'small',
   42000000, 12600000, 30.00, 40.00,
   40000000, 110.00, 8.00, 4.80, 12,
   NULL, NULL, NULL, NULL,
   'Website analytics and behavior tracking',
   'Bootstrapped success story, excellent margins, strong reference for small SaaS',
   'https://www.hotjar.com', true, true, 'Estimated 2024'),
   
  ('ConvertKit', 'USA', 'SaaS', 'Horizontal - Marketing', 'growth', 'small',
   30000000, 9000000, 30.00, 35.00,
   29000000, 105.00, 10.00, 4.20, 14,
   NULL, NULL, NULL, NULL,
   'Email marketing for creators',
   'Profitable, creator-focused, excellent unit economics',
   'https://convertkit.com', true, true, 'Estimated 2024'),
   
  -- Brazil SaaS Examples
  ('RD Station', 'BRL', 'SaaS', 'Horizontal - Marketing', 'growth', 'mid',
   180000000, 36000000, 20.00, 38.00,
   175000000, 108.00, 11.00, 3.50, 15,
   900000000, '2023-05-20', 5.00, 'funding_round',
   'Marketing automation platform for SMBs in Brazil',
   'Leading Brazilian marketing SaaS, strong local market reference',
   'https://www.rdstation.com', true, true, 'Crunchbase 2023'),
   
  ('Conta Azul', 'BRL', 'SaaS', 'Vertical - Finance/Accounting', 'growth', 'small',
   50000000, 10000000, 20.00, 32.00,
   48000000, 102.00, 14.00, 2.80, 18,
   250000000, '2020-11-15', 5.00, 'acquisition',
   'Accounting and ERP software for Brazilian SMEs',
   'Acquired by Totvs - shows valuation for Brazilian vertical SaaS',
   'https://contaazul.com', true, true, 'Totvs Acquisition 2020')
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- 5. IMPROVEMENT ACTIONS LIBRARY
-- ================================================================

INSERT INTO improvement_actions (
  action_category, action_title, action_description,
  applicable_sectors, applicable_sizes,
  pillar_impact, expected_score_increase, valuation_impact_percent,
  difficulty, time_to_implement, estimated_cost_usd, default_priority
) VALUES
  -- Operations & Autonomy
  ('operations', 'Documentar Processos Operacionais (SOPs)', 
   'Criar documentação completa de todos os processos-chave: vendas, onboarding, suporte, product. Use ferramentas como Notion, Confluence ou Process Street. Objetivo: empresa funcionar sem dependência do fundador.',
   ARRAY['*'], ARRAY['micro', 'small'],
   'ops', 25, 8.00,
   'moderate', '2-3 meses', 5000, 85),
   
  ('operations', 'Contratar Head of Operations', 
   'Trazer líder experiente para assumir operações do dia-a-dia. Permite fundador focar em estratégia. Reduz Owner Dependency Score drasticamente.',
   ARRAY['*'], ARRAY['small', 'mid'],
   'ops', 30, 12.00,
   'hard', '3-6 meses', 150000, 90),
   
  ('operations', 'Implementar ERP Integrado',
   'Migrar para ERP moderno (NetSuite, SAP Business One, Odoo) integrando financeiro, operações e CRM. Melhora visibilidade e controle.',
   ARRAY['*'], ARRAY['mid', 'growth'],
   'risk', 15, 5.00,
   'hard', '6-12 meses', 80000, 70),
   
  -- Revenue Quality
  ('revenue_quality', 'Migrar para Contratos Anuais',
   'Oferecer desconto (10-15%) para clientes migrarem de mensal para anual. Reduz churn, melhora previsibilidade, aumenta LTV.',
   ARRAY['SaaS', 'Fintech'], ARRAY['*'],
   'rec', 20, 15.00,
   'easy', '1-2 meses', 2000, 95),
   
  ('revenue_quality', 'Implementar Customer Success Program',
   'Criar time dedicado de CS para reduzir churn via onboarding proativo, health scores, e expansion plays. Target: reduzir churn em 30-50%.',
   ARRAY['SaaS', 'Fintech'], ARRAY['small', 'mid'],
   'rec', 25, 18.00,
   'moderate', '3-4 meses', 120000, 90),
   
  ('revenue_quality', 'Criar Programa de Upsell/Cross-sell',
   'Desenvolver playbook de expansão de contas: features premium, add-ons, seats adicionais. Target: aumentar NRR para >110%.',
   ARRAY['SaaS'], ARRAY['*'],
   'rec', 30, 20.00,
   'moderate', '2-3 meses', 15000, 88),
   
  -- Concentration Risk
  ('operations', 'Diversificar Base de Clientes',
   'Campanha focada em adquirir 50+ novos clientes pequenos/médios para reduzir concentração. Target: maior cliente <15% da receita.',
   ARRAY['*'], ARRAY['micro', 'small'],
   'conc', 20, 10.00,
   'moderate', '4-6 meses', 50000, 82),
   
  -- Growth
  ('growth', 'Expandir para Novo Segmento de Mercado',
   'Validar e expandir para segmento adjacente (ex: SMB → Mid-market, ou novo vertical). Acelera crescimento sem canibalizar base atual.',
   ARRAY['*'], ARRAY['small', 'mid'],
   'grow', 25, 12.00,
   'hard', '6-12 meses', 200000, 75),
   
  ('growth', 'Implementar Product-Led Growth (PLG)',
   'Criar freemium ou free trial self-service. Reduz CAC, acelera adoção. Requer investimento em produto e automação.',
   ARRAY['SaaS'], ARRAY['small', 'mid', 'growth'],
   'grow', 30, 18.00,
   'very_hard', '9-12 meses', 300000, 80),
   
  -- Risk & Compliance
  ('operations', 'Obter Certificação SOC 2 Type II',
   'Contratar auditor e implementar controles de segurança. Essencial para vender enterprise. Diferencial competitivo forte.',
   ARRAY['SaaS', 'Fintech'], ARRAY['small', 'mid'],
   'risk', 20, 10.00,
   'hard', '6-9 meses', 50000, 85),
   
  ('operations', 'Contratar CFO/Controller',
   'Profissionalizar financeiro com líder experiente. Auditar demonstrações, implementar controles, preparar due diligence.',
   ARRAY['*'], ARRAY['mid', 'growth'],
   'risk', 25, 8.00,
   'moderate', '2-3 meses', 150000, 78),
   
  -- Team
  ('operations', 'Estruturar Plano de Equity/Stock Options',
   'Criar ESOP (Employee Stock Option Plan) para atrair e reter talentos-chave. Alinha incentivos, reduz dependência de salários altos.',
   ARRAY['*'], ARRAY['small', 'mid'],
   'ops', 15, 5.00,
   'moderate', '2-3 meses', 25000, 70),
   
  -- Moat Building
  ('moat', 'Desenvolver Integrações com Sistemas Enterprise',
   'Criar integrações nativas com Salesforce, SAP, Oracle, Workday. Aumenta switching cost drasticamente.',
   ARRAY['SaaS'], ARRAY['mid', 'growth'],
   'risk', 25, 15.00,
   'hard', '6-9 meses', 200000, 82),
   
  ('moat', 'Registrar Patentes de Tecnologia Proprietária',
   'Identificar IP patenteável (algoritmos, processos) e registrar. Cria moat legal e aumenta valuation.',
   ARRAY['SaaS', 'Fintech'], ARRAY['*'],
   'risk', 20, 12.00,
   'hard', '12-18 meses', 75000, 65),
   
  -- Financial
  ('financial', 'Melhorar Margem EBITDA em 10pts',
   'Revisar custos: renegociar contratos, automatizar processos manuais, otimizar cloud costs. Target: +10pts margem EBITDA.',
   ARRAY['*'], ARRAY['*'],
   'risk', 20, 25.00,
   'moderate', '3-6 meses', 30000, 88),
   
  ('financial', 'Reduzir CAC em 30%',
   'Otimizar funil de marketing: melhorar conversão, focar canais high-ROI, implementar referral program. Target: CAC Payback <12 meses.',
   ARRAY['SaaS', 'E-commerce'], ARRAY['*'],
   'grow', 25, 15.00,
   'moderate', '3-5 meses', 40000, 85)
ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- COMMIT & SUMMARY
-- ================================================================

-- Check counts
DO $$
DECLARE
  country_count INT;
  size_count INT;
  multiple_count INT;
  benchmark_count INT;
  action_count INT;
BEGIN
  SELECT COUNT(*) INTO country_count FROM country_risk_data;
  SELECT COUNT(*) INTO size_count FROM size_premiums;
  SELECT COUNT(*) INTO multiple_count FROM valuation_multiples;
  SELECT COUNT(*) INTO benchmark_count FROM benchmark_companies;
  SELECT COUNT(*) INTO action_count FROM improvement_actions;
  
  RAISE NOTICE '✅ Data Seeding Complete!';
  RAISE NOTICE '   Countries: %', country_count;
  RAISE NOTICE '   Size Premiums: %', size_count;
  RAISE NOTICE '   Valuation Multiples: %', multiple_count;
  RAISE NOTICE '   Benchmark Companies: %', benchmark_count;
  RAISE NOTICE '   Improvement Actions: %', action_count;
END $$;
