-- ================================================================
-- MIGRATION: Add RLS to Market Data Tables
-- Version: 008
-- Date: 2026-01-30
-- Description: Enable Row Level Security on advanced valuation tables
-- ================================================================

-- ================================================================
-- 1. ENABLE RLS ON ALL MARKET DATA TABLES
-- ================================================================

-- Public read-only tables (market data)
ALTER TABLE valuation_multiples ENABLE ROW LEVEL SECURITY;
ALTER TABLE country_risk_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE size_premiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE benchmark_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_actions ENABLE ROW LEVEL SECURITY;

-- Private user data table
ALTER TABLE user_improvement_plans ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 2. PUBLIC READ-ONLY POLICIES (Market Data Tables)
-- ================================================================

-- valuation_multiples: Everyone can read
CREATE POLICY "Anyone can view valuation multiples"
  ON valuation_multiples
  FOR SELECT
  TO authenticated
  USING (true);

-- country_risk_data: Everyone can read
CREATE POLICY "Anyone can view country risk data"
  ON country_risk_data
  FOR SELECT
  TO authenticated
  USING (true);

-- size_premiums: Everyone can read
CREATE POLICY "Anyone can view size premiums"
  ON size_premiums
  FOR SELECT
  TO authenticated
  USING (true);

-- benchmark_companies: Everyone can read
CREATE POLICY "Anyone can view benchmark companies"
  ON benchmark_companies
  FOR SELECT
  TO authenticated
  USING (true);

-- improvement_actions: Everyone can read
CREATE POLICY "Anyone can view improvement actions"
  ON improvement_actions
  FOR SELECT
  TO authenticated
  USING (true);

-- ================================================================
-- 3. USER-SCOPED POLICIES (user_improvement_plans)
-- ================================================================

-- SELECT: Users can view their own improvement plans (via valuation ownership)
CREATE POLICY "Users can view own improvement plans"
  ON user_improvement_plans
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM valuations v
      WHERE v.id = user_improvement_plans.valuation_id
        AND v.user_id = auth.uid()
    )
  );

-- INSERT: Users can create their own improvement plans (via valuation ownership)
CREATE POLICY "Users can insert own improvement plans"
  ON user_improvement_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM valuations v
      WHERE v.id = user_improvement_plans.valuation_id
        AND v.user_id = auth.uid()
    )
  );

-- UPDATE: Users can update their own improvement plans (via valuation ownership)
CREATE POLICY "Users can update own improvement plans"
  ON user_improvement_plans
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM valuations v
      WHERE v.id = user_improvement_plans.valuation_id
        AND v.user_id = auth.uid()
    )
  );

-- DELETE: Users can delete their own improvement plans (via valuation ownership)
CREATE POLICY "Users can delete own improvement plans"
  ON user_improvement_plans
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM valuations v
      WHERE v.id = user_improvement_plans.valuation_id
        AND v.user_id = auth.uid()
    )
  );

-- ================================================================
-- 4. VERIFICATION
-- ================================================================

-- Verify RLS is enabled on all tables
DO $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM pg_tables t
  JOIN pg_class c ON c.relname = t.tablename
  WHERE t.schemaname = 'public'
    AND t.tablename IN (
      'valuation_multiples',
      'country_risk_data',
      'size_premiums',
      'benchmark_companies',
      'improvement_actions',
      'user_improvement_plans'
    )
    AND c.relrowsecurity = true;
  
  IF v_count = 6 THEN
    RAISE NOTICE '✅ RLS enabled on all 6 market data tables';
  ELSE
    RAISE WARNING '⚠️ RLS enabled on % out of 6 tables', v_count;
  END IF;
END $$;

-- List all policies created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'valuation_multiples',
    'country_risk_data',
    'size_premiums',
    'benchmark_companies',
    'improvement_actions',
    'user_improvement_plans'
  )
ORDER BY tablename, cmd;

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON POLICY "Anyone can view valuation multiples" ON valuation_multiples 
  IS 'Public market data - all authenticated users can read';

COMMENT ON POLICY "Anyone can view country risk data" ON country_risk_data 
  IS 'Public market data - all authenticated users can read';

COMMENT ON POLICY "Anyone can view size premiums" ON size_premiums 
  IS 'Public market data - all authenticated users can read';

COMMENT ON POLICY "Anyone can view benchmark companies" ON benchmark_companies 
  IS 'Public market data - all authenticated users can read';

COMMENT ON POLICY "Anyone can view improvement actions" ON improvement_actions 
  IS 'Public library - all authenticated users can read';

COMMENT ON POLICY "Users can view own improvement plans" ON user_improvement_plans 
  IS 'Private user data - users can only access their own improvement plans';
