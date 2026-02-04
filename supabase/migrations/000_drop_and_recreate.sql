-- ================================================================
-- DROP AND RECREATE - Execute este arquivo PRIMEIRO
-- ================================================================
-- Este arquivo deleta as tabelas antigas e permite recriar com schema correto
-- ================================================================

-- 1. DROP das tabelas na ordem correta (dependências)
DROP TABLE IF EXISTS user_improvement_plans CASCADE;
DROP TABLE IF EXISTS improvement_actions CASCADE;
DROP TABLE IF EXISTS benchmark_companies CASCADE;
DROP TABLE IF EXISTS size_premiums CASCADE;
DROP TABLE IF EXISTS valuation_multiples CASCADE;
DROP TABLE IF EXISTS country_risk_data CASCADE;

-- 2. DROP da função se existir
DROP FUNCTION IF EXISTS get_benchmark_companies(TEXT, TEXT, TEXT, TEXT, INT);

-- Mensagem de confirmação
DO $$ 
BEGIN 
  RAISE NOTICE 'Tabelas deletadas com sucesso! Agora execute: 007_advanced_valuation_system.sql'; 
END $$;
