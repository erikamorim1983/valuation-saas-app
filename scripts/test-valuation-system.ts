/**
 * Script de Teste - Advanced Valuation System
 * 
 * Execute após aplicar as migrations para testar se tudo está funcionando.
 * 
 * Como executar:
 * 1. Certifique-se que as migrations foram aplicadas (RUN_MIGRATIONS.md)
 * 2. Execute: npx tsx scripts/test-valuation-system.ts
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('\n🧪 Testando Sistema Avançado de Valuation\n');
console.log('==========================================\n');

async function testDatabaseStructure() {
  console.log('📊 Teste 1: Estrutura do Banco de Dados\n');
  
  const tables = [
    'valuation_multiples',
    'country_risk_data',
    'size_premiums',
    'benchmark_companies',
    'improvement_actions',
    'user_improvement_plans'
  ];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);

    if (error) {
      console.log(`❌ Tabela "${table}": NÃO ENCONTRADA`);
      console.log(`   Erro: ${error.message}\n`);
    } else {
      console.log(`✅ Tabela "${table}": OK`);
    }
  }
  console.log('');
}

async function testMarketData() {
  console.log('📈 Teste 2: Dados de Mercado Populados\n');

  // Test countries
  const { data: countries } = await supabase
    .from('country_risk_data')
    .select('country, equity_risk_premium')
    .order('equity_risk_premium');

  console.log(`✅ Países: ${countries?.length || 0} encontrados`);
  if (countries && countries.length > 0) {
    countries.forEach(c => {
      console.log(`   - ${c.country}: ERP ${c.equity_risk_premium}%`);
    });
  }
  console.log('');

  // Test size premiums
  const { data: sizePremiums } = await supabase
    .from('size_premiums')
    .select('country, size_bracket, multiple_discount')
    .eq('country', 'USA');

  console.log(`✅ Size Premiums (USA): ${sizePremiums?.length || 0} encontrados`);
  if (sizePremiums && sizePremiums.length > 0) {
    sizePremiums.forEach(s => {
      console.log(`   - ${s.size_bracket}: ${(s.multiple_discount * 100).toFixed(0)}% discount`);
    });
  }
  console.log('');

  // Test valuation multiples
  const { data: multiples } = await supabase
    .from('valuation_multiples')
    .select('country, sector, sub_sector, revenue_multiple_median')
    .eq('sector', 'SaaS')
    .limit(5);

  console.log(`✅ Múltiplos SaaS: ${multiples?.length || 0} encontrados`);
  if (multiples && multiples.length > 0) {
    multiples.forEach(m => {
      console.log(`   - ${m.country} ${m.sub_sector || 'General'}: ${m.revenue_multiple_median}x`);
    });
  }
  console.log('');

  // Test benchmark companies
  const { data: benchmarks } = await supabase
    .from('benchmark_companies')
    .select('company_name, sector, annual_revenue, valuation_multiple')
    .eq('is_active', true)
    .limit(5);

  console.log(`✅ Empresas Benchmark: ${benchmarks?.length || 0} encontradas`);
  if (benchmarks && benchmarks.length > 0) {
    benchmarks.forEach(b => {
      const revenue = (b.annual_revenue / 1_000_000).toFixed(1);
      console.log(`   - ${b.company_name} (${b.sector}): $${revenue}M, ${b.valuation_multiple}x`);
    });
  }
  console.log('');

  // Test improvement actions
  const { data: actions } = await supabase
    .from('improvement_actions')
    .select('action_title, valuation_impact_percent, difficulty')
    .eq('is_active', true)
    .order('default_priority', { ascending: false })
    .limit(5);

  console.log(`✅ Ações de Melhoria: ${actions?.length || 0} encontradas`);
  if (actions && actions.length > 0) {
    actions.forEach(a => {
      console.log(`   - ${a.action_title}: +${a.valuation_impact_percent}% (${a.difficulty})`);
    });
  }
  console.log('');
}

async function testValuationCalculation() {
  console.log('🧮 Teste 3: Cálculo de Valuation (Simulado)\n');

  // Simular busca de múltiplos
  const { data: multiple } = await supabase
    .from('valuation_multiples')
    .select('*')
    .eq('country', 'USA')
    .eq('sector', 'SaaS')
    .eq('sub_sector', 'Vertical - Healthcare')
    .eq('size_bracket', 'small')
    .single();

  if (multiple) {
    console.log('✅ Múltiplo encontrado:');
    console.log(`   País: ${multiple.country}`);
    console.log(`   Setor: ${multiple.sector} - ${multiple.sub_sector}`);
    console.log(`   Size: ${multiple.size_bracket}`);
    console.log(`   Multiple: ${multiple.revenue_multiple_median}x (${multiple.revenue_multiple_min}-${multiple.revenue_multiple_max}x)`);
    console.log(`   Sample: ${multiple.sample_size} deals`);
    console.log('');

    // Simular cálculo
    const revenue = 5_000_000;
    const baseValuation = revenue * multiple.revenue_multiple_median;
    
    console.log('📊 Simulação de Valuation:');
    console.log(`   Revenue: $${(revenue / 1_000_000).toFixed(1)}M`);
    console.log(`   Multiple: ${multiple.revenue_multiple_median}x`);
    console.log(`   Base Valuation: $${(baseValuation / 1_000_000).toFixed(2)}M`);
  } else {
    console.log('❌ Múltiplo não encontrado. Verifique se os dados foram inseridos.');
  }
  console.log('');
}

async function testBenchmarkComparison() {
  console.log('📊 Teste 4: Sistema de Benchmarking\n');

  const { data: benchmarks } = await supabase
    .from('benchmark_companies')
    .select('*')
    .eq('sector', 'SaaS')
    .eq('is_active', true)
    .order('annual_revenue', { ascending: false })
    .limit(3);

  if (benchmarks && benchmarks.length > 0) {
    console.log(`✅ Encontradas ${benchmarks.length} empresas SaaS para benchmark:`);
    console.log('');

    benchmarks.forEach((b, i) => {
      console.log(`${i + 1}. ${b.company_name}`);
      console.log(`   Revenue: $${(b.annual_revenue / 1_000_000).toFixed(1)}M`);
      console.log(`   Multiple: ${b.valuation_multiple}x`);
      console.log(`   Growth: ${b.revenue_growth_rate || 'N/A'}%`);
      console.log(`   Margin: ${b.ebitda_margin || 'N/A'}%`);
      if (b.churn_rate) console.log(`   Churn: ${b.churn_rate}%`);
      if (b.nrr) console.log(`   NRR: ${b.nrr}%`);
      console.log('');
    });

    // Calcular estatísticas
    const multiples = benchmarks.map(b => b.valuation_multiple);
    const avgMultiple = multiples.reduce((a, b) => a + b, 0) / multiples.length;
    const sortedMultiples = [...multiples].sort((a, b) => a - b);
    const medianMultiple = sortedMultiples[Math.floor(sortedMultiples.length / 2)];

    console.log('📈 Estatísticas:');
    console.log(`   Média múltiplo: ${avgMultiple.toFixed(2)}x`);
    console.log(`   Mediana múltiplo: ${medianMultiple.toFixed(2)}x`);
    console.log(`   Range: ${Math.min(...multiples).toFixed(2)}x - ${Math.max(...multiples).toFixed(2)}x`);
  } else {
    console.log('❌ Nenhuma empresa benchmark encontrada. Verifique os dados.');
  }
  console.log('');
}

async function testRecommendations() {
  console.log('💡 Teste 5: Sistema de Recomendações\n');

  const { data: actions } = await supabase
    .from('improvement_actions')
    .select('*')
    .eq('is_active', true)
    .order('default_priority', { ascending: false })
    .limit(5);

  if (actions && actions.length > 0) {
    console.log(`✅ Top 5 Ações de Melhoria:\n`);

    actions.forEach((action, i) => {
      console.log(`${i + 1}. ${action.action_title}`);
      console.log(`   Impact: +${action.valuation_impact_percent}% valuation`);
      console.log(`   Score: +${action.score_increase} points`);
      console.log(`   Difficulty: ${action.difficulty}`);
      console.log(`   Time: ${action.estimated_time_months} months`);
      console.log(`   Cost: $${action.estimated_cost?.toLocaleString() || 'Low'}`);
      
      // Simular impacto
      const currentValuation = 20_000_000;
      const increase = currentValuation * (action.valuation_impact_percent / 100);
      const roi = action.estimated_cost ? increase / action.estimated_cost : Infinity;
      
      console.log(`   💰 Impacto simulado: +$${(increase / 1_000_000).toFixed(2)}M`);
      console.log(`   📊 ROI: ${roi === Infinity ? '∞' : roi.toFixed(1) + 'x'}`);
      console.log('');
    });
  } else {
    console.log('❌ Nenhuma ação de melhoria encontrada. Verifique os dados.');
  }
  console.log('');
}

async function testEndToEnd() {
  console.log('🚀 Teste 6: Fluxo End-to-End\n');
  console.log('Simulando valuation de SaaS Healthcare Brasil, $5M revenue\n');

  // 1. Buscar dados do país
  const { data: countryData } = await supabase
    .from('country_risk_data')
    .select('*')
    .eq('country', 'BRL')
    .single();

  if (countryData) {
    console.log('✅ País (Brasil):');
    console.log(`   ERP: ${countryData.equity_risk_premium}%`);
    console.log(`   Liquidity discount: ${(countryData.liquidity_discount * 100).toFixed(0)}%`);
    console.log(`   Exit discount: ${(countryData.exit_discount * 100).toFixed(0)}%`);
    const countryFactor = 1 - countryData.liquidity_discount - countryData.exit_discount;
    console.log(`   Country factor: ${countryFactor.toFixed(2)}`);
    console.log('');
  }

  // 2. Buscar size premium
  const { data: sizeData } = await supabase
    .from('size_premiums')
    .select('*')
    .eq('country', 'BRL')
    .eq('size_bracket', 'small')
    .single();

  if (sizeData) {
    console.log('✅ Size (small, $1-10M):');
    console.log(`   Multiple discount: ${(sizeData.multiple_discount * 100).toFixed(0)}%`);
    const sizeFactor = 1 + sizeData.multiple_discount;
    console.log(`   Size factor: ${sizeFactor.toFixed(2)}`);
    console.log('');
  }

  // 3. Buscar múltiplo
  const { data: multipleData } = await supabase
    .from('valuation_multiples')
    .select('*')
    .eq('country', 'BRL')
    .eq('sector', 'SaaS')
    .eq('sub_sector', 'Vertical - Healthcare')
    .eq('size_bracket', 'small')
    .single();

  if (multipleData) {
    console.log('✅ Múltiplo (SaaS Healthcare Brasil):');
    console.log(`   Base multiple: ${multipleData.revenue_multiple_median}x`);
    console.log('');

    // Cálculo final
    const revenue = 5_000_000;
    const qualityScore = 85;
    const qualityFactor = 1.0; // Score 85 = par

    const countryFactor = countryData ? 1 - countryData.liquidity_discount - countryData.exit_discount : 1.0;
    const sizeFactor = sizeData ? 1 + sizeData.multiple_discount : 1.0;

    const finalMultiple = multipleData.revenue_multiple_median * countryFactor * sizeFactor * qualityFactor;
    const finalValuation = revenue * finalMultiple;

    console.log('🎯 RESULTADO FINAL:');
    console.log(`   Revenue: $${(revenue / 1_000_000).toFixed(1)}M`);
    console.log(`   Quality Score: ${qualityScore}/100`);
    console.log(`   Base Multiple: ${multipleData.revenue_multiple_median}x`);
    console.log(`   Country Adjustment: ${(countryFactor * 100).toFixed(0)}%`);
    console.log(`   Size Adjustment: ${(sizeFactor * 100).toFixed(0)}%`);
    console.log(`   Quality Adjustment: ${(qualityFactor * 100).toFixed(0)}%`);
    console.log(`   Final Multiple: ${finalMultiple.toFixed(2)}x`);
    console.log(`   VALUATION: $${(finalValuation / 1_000_000).toFixed(2)}M`);
    console.log('');
  }

  // 4. Buscar benchmarks
  const { data: benchmarks } = await supabase
    .from('benchmark_companies')
    .select('company_name, valuation_multiple')
    .eq('sector', 'SaaS')
    .eq('sub_sector', 'Vertical - Healthcare')
    .eq('is_active', true)
    .limit(3);

  if (benchmarks && benchmarks.length > 0) {
    console.log('📊 Comparação com Benchmarks:');
    benchmarks.forEach(b => {
      console.log(`   - ${b.company_name}: ${b.valuation_multiple}x`);
    });
    console.log('');
  }

  // 5. Sugerir top 3 ações
  const { data: topActions } = await supabase
    .from('improvement_actions')
    .select('action_title, valuation_impact_percent, difficulty')
    .eq('is_active', true)
    .order('default_priority', { ascending: false })
    .limit(3);

  if (topActions && topActions.length > 0) {
    console.log('💡 Top 3 Recomendações:');
    topActions.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a.action_title}`);
      console.log(`      Impact: +${a.valuation_impact_percent}% (${a.difficulty})`);
    });
    console.log('');
  }
}

async function runTests() {
  try {
    await testDatabaseStructure();
    await testMarketData();
    await testValuationCalculation();
    await testBenchmarkComparison();
    await testRecommendations();
    await testEndToEnd();

    console.log('==========================================\n');
    console.log('✅ Todos os testes concluídos!\n');
    console.log('Se todos os testes passaram, o sistema está pronto para uso.\n');
    console.log('Próximo passo: Implementar wizard (Task 5)\n');
    console.log('Diga "task 5" para continuar!\n');

  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error);
    console.log('\nVerifique se:');
    console.log('1. As migrations foram aplicadas corretamente');
    console.log('2. As variáveis SUPABASE_URL e SUPABASE_KEY estão corretas');
    console.log('3. Você tem permissão para acessar as tabelas\n');
  }
}

runTests();
