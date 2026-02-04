# 🎯 Guia de Implementação - Próximos Passos

## ✅ O QUE JÁ FOI IMPLEMENTADO

### 1. Infrastructure Backend (100%)
- ✅ **Database Schema**: 6 novas tabelas criadas
- ✅ **Market Data**: 50+ pontos de dados populados (países, múltiplos, benchmarks, ações)
- ✅ **TypeScript Types**: 350+ linhas com 15 novos tipos
- ✅ **Advanced Engine**: Cálculo multi-fator com 5 camadas de ajuste
- ✅ **Benchmarking System**: Comparação com empresas de referência
- ✅ **Recommendations Engine**: Geração automática de plano de melhoria

### 2. Core Services (100%)
#### `src/lib/supabase/market-data.ts`
- `determineSizeBracket()` - Determina bracket por receita
- `fetchCountryRiskData()` - Busca ERP + descontos por país
- `fetchSizePremium()` - Busca descontos/premiums por tamanho
- `fetchValuationMultiples()` - Busca múltiplos setoriais com fallbacks
- `fetchBenchmarkCompanies()` - Busca empresas comparáveis
- `fetchImprovementActions()` - Busca biblioteca de ações
- `calculateAdjustmentFactors()` - Calcula fatores combinados

#### `src/lib/valuation/engines/advancedEngine.ts`
- `calculateAdvancedValuation()` - Engine principal multi-fator
- `calculateRevenueQualityFactor()` - Ajuste por churn/NRR/LTV/CAC
- `calculateMoatFactor()` - Ajuste por moat competitivo
- `getValuationExplanation()` - Explicação detalhada do cálculo

#### `src/lib/valuation/benchmarking.ts`
- `getBenchmarkComparables()` - Busca empresas similares
- `calculateBenchmarkComparison()` - Calcula estatísticas e percentis
- `calculatePercentile()` - Posição vs mercado
- `generateBenchmarkInsights()` - Gera insights automáticos
- `formatBenchmarkForChart()` - Prepara dados para gráficos

#### `src/lib/valuation/recommendations.ts`
- `generateImprovementPlan()` - Gera plano completo de melhoria
- `prioritizeAction()` - Prioriza ações por relevância/impacto/viabilidade
- `createImplementationTimeline()` - Cria roadmap em fases
- `simulateImpact()` - Simula impacto de ações selecionadas

---

## 🔄 O QUE FALTA FAZER

### Task 4: Rodar Migrations (15 min)
**Objetivo**: Aplicar schema e popular banco de dados

**Passos**:
```bash
# 1. Rodar migration do schema
cd d:\dev\valuation-saas-app
supabase db push

# 2. Verificar se tabelas foram criadas
# Abrir Supabase Dashboard > SQL Editor > Executar:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'valuation_multiples',
  'country_risk_data', 
  'size_premiums',
  'benchmark_companies',
  'improvement_actions',
  'user_improvement_plans'
);

# 3. Popular dados (copiar conteúdo de 007_seed_market_data.sql)
# No Supabase Dashboard > SQL Editor:
# - Copiar todo conteúdo do arquivo
# - Colar no editor
# - Executar

# 4. Verificar dados populados
SELECT 
  (SELECT COUNT(*) FROM country_risk_data) as countries,
  (SELECT COUNT(*) FROM size_premiums) as size_premiums,
  (SELECT COUNT(*) FROM valuation_multiples) as multiples,
  (SELECT COUNT(*) FROM benchmark_companies) as benchmarks,
  (SELECT COUNT(*) FROM improvement_actions) as actions;
```

**Resultado esperado**:
```
countries: 6
size_premiums: 15
multiples: 20+
benchmarks: 12
actions: 15
```

---

### Task 5: Atualizar Wizard (2-3 horas)

**Objetivo**: Coletar novos campos no wizard de valuation

#### 5.1: Atualizar `StepIdentification.tsx`

**Novos campos**:
```tsx
// País
<Select name="country" label="País de Operação">
  <option value="USA">🇺🇸 Estados Unidos</option>
  <option value="BRL">🇧🇷 Brasil</option>
  <option value="MEX">🇲🇽 México</option>
  <option value="ARG">🇦🇷 Argentina</option>
  <option value="CHL">🇨🇱 Chile</option>
  <option value="COL">🇨🇴 Colômbia</option>
  <option value="OTHER">🌎 Outro</option>
</Select>

// Sub-setor (dropdown dependente do setor)
<Select name="subSector" label="Sub-setor">
  {SUB_SECTORS[selectedSector].map(sub => (
    <option key={sub} value={sub}>{sub}</option>
  ))}
</Select>

// Alcance geográfico
<Select name="geographicScope">
  <option value="local">Local (uma cidade)</option>
  <option value="regional">Regional (um estado/região)</option>
  <option value="national">Nacional</option>
  <option value="latam">América Latina</option>
  <option value="global">Global</option>
</Select>

// Tipo de cliente
<Select name="customerType">
  <option value="smb">SMB (Pequenas empresas)</option>
  <option value="mid-market">Mid-Market</option>
  <option value="enterprise">Enterprise</option>
  <option value="mixed">Misto</option>
</Select>
```

#### 5.2: Criar `StepRevenueQuality.tsx` (NOVO)

**Template**:
```tsx
'use client';

import { useState } from 'react';
import { CurrencyInput } from '@/components/ui/CurrencyInput';

export default function StepRevenueQuality({ 
  data, 
  onUpdate 
}: { 
  data: any; 
  onUpdate: (data: any) => void 
}) {
  const [churnRate, setChurnRate] = useState(data.churnRate || '');
  const [nrr, setNrr] = useState(data.nrr || '');
  const [ltv, setLtv] = useState(data.ltv || '');
  const [cac, setCac] = useState(data.cac || '');

  // Auto-calculate CAC Payback
  const cacPayback = ltv && cac && cac > 0 
    ? ((ltv / cac) * 12).toFixed(1)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...data,
      churnRate: parseFloat(churnRate),
      nrr: parseFloat(nrr),
      ltv: parseFloat(ltv),
      cac: parseFloat(cac),
      cacPaybackMonths: cacPayback ? parseFloat(cacPayback) : null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Qualidade da Receita</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Churn Rate */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Churn Rate Mensal (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={churnRate}
            onChange={(e) => setChurnRate(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="ex: 2.5"
          />
          <p className="text-xs text-gray-500 mt-1">
            Benchmark: &lt;5% excelente, &lt;10% bom
          </p>
        </div>

        {/* NRR */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Net Revenue Retention (%)
          </label>
          <input
            type="number"
            step="1"
            value={nrr}
            onChange={(e) => setNrr(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="ex: 110"
          />
          <p className="text-xs text-gray-500 mt-1">
            Benchmark: &gt;110% excelente, &gt;100% bom
          </p>
        </div>

        {/* LTV */}
        <div>
          <label className="block text-sm font-medium mb-2">
            LTV - Lifetime Value ($)
          </label>
          <CurrencyInput
            value={ltv}
            onChange={setLtv}
            placeholder="ex: 50,000"
          />
        </div>

        {/* CAC */}
        <div>
          <label className="block text-sm font-medium mb-2">
            CAC - Customer Acquisition Cost ($)
          </label>
          <CurrencyInput
            value={cac}
            onChange={setCac}
            placeholder="ex: 15,000"
          />
        </div>
      </div>

      {/* CAC Payback (auto-calculated) */}
      {cacPayback && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm font-medium">
            CAC Payback: <span className="text-xl">{cacPayback} meses</span>
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Benchmark: &lt;12 meses excelente
          </p>
        </div>
      )}

      {/* Contract Type */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Tipo de Contrato Predominante
        </label>
        <select 
          value={data.contractType || 'monthly'}
          onChange={(e) => onUpdate({ ...data, contractType: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="monthly">Mensal</option>
          <option value="annual">Anual</option>
          <option value="multi-year">Multi-year (2-3 anos)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Contratos anuais/multi-year aumentam valuation em 8-15%
        </p>
      </div>

      <button type="submit" className="btn-primary w-full">
        Próximo
      </button>
    </form>
  );
}
```

#### 5.3: Criar `StepMoat.tsx` (NOVO)

**Template**:
```tsx
'use client';

import { useState } from 'react';

export default function StepMoat({ 
  data, 
  onUpdate 
}: { 
  data: any; 
  onUpdate: (data: any) => void 
}) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to next step
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold">Vantagens Competitivas (Moat)</h2>

      {/* IP Type */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Propriedade Intelectual
        </label>
        <div className="space-y-2">
          {['none', 'trade-secrets', 'patents', 'trademarks'].map(type => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="ipType"
                value={type}
                checked={data.ipType === type}
                onChange={(e) => onUpdate({ ...data, ipType: e.target.value })}
                className="mr-2"
              />
              <span className="capitalize">{type.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Network Effects */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Efeitos de Rede
        </label>
        <select
          value={data.networkEffectStrength || 'none'}
          onChange={(e) => onUpdate({ ...data, networkEffectStrength: e.target.value })}
          className="w-full px-4 py-2 border rounded-lg"
        >
          <option value="none">Nenhum</option>
          <option value="weak">Fraco (ex: marketplace pequeno)</option>
          <option value="moderate">Moderado (ex: plataforma B2B)</option>
          <option value="strong">Forte (ex: rede social, marketplace líquido)</option>
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Efeitos de rede fortes podem adicionar 15% ao valuation
        </p>
      </div>

      {/* Switching Costs */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Custo Estimado de Troca (para o cliente mudar de solução)
        </label>
        <CurrencyInput
          value={data.switchingCostEstimate || ''}
          onChange={(val) => onUpdate({ ...data, switchingCostEstimate: val })}
          placeholder="ex: 50,000"
        />
        <p className="text-xs text-gray-500 mt-1">
          Considere: migração de dados, re-treinamento, integrações
        </p>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.hasDataMoat || false}
            onChange={(e) => onUpdate({ ...data, hasDataMoat: e.target.checked })}
            className="mr-2"
          />
          <span>Data Moat (dados proprietários que melhoram com uso)</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.hasDeepIntegration || false}
            onChange={(e) => onUpdate({ ...data, hasDeepIntegration: e.target.checked })}
            className="mr-2"
          />
          <span>Integração profunda com sistemas do cliente</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={data.hasCertifications || false}
            onChange={(e) => onUpdate({ ...data, hasCertifications: e.target.checked })}
            className="mr-2"
          />
          <span>Certificações (SOC 2, HIPAA, ISO, etc)</span>
        </label>
      </div>

      <button type="submit" className="btn-primary w-full">
        Concluir
      </button>
    </form>
  );
}
```

#### 5.4: Atualizar `WizardLayout.tsx`

Adicionar novos steps:
```tsx
const steps = [
  { id: 1, name: 'Identificação', component: StepIdentification },
  { id: 2, name: 'Financeiros', component: StepFinancials },
  { id: 3, name: 'Qualitativo', component: StepQualitative },
  { id: 4, name: 'Qualidade Receita', component: StepRevenueQuality }, // NOVO
  { id: 5, name: 'Vantagens Competitivas', component: StepMoat }, // NOVO
  { id: 6, name: 'Revisão', component: StepReview }
];
```

---

### Task 6: Criar Dashboard de Benchmarking (4-5 horas)

**Objetivo**: Visualizar comparação com mercado e recomendações

#### 6.1: `BenchmarkComparisonCard.tsx`

**Funcionalidades**:
- Tabela com top 5 empresas comparáveis
- Colunas: Nome, Receita, Múltiplo, Crescimento, Margem, NRR, Churn
- Highlight da linha quando usuário está acima/abaixo

**Template básico**:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { calculateBenchmarkComparison, generateBenchmarkInsights } from '@/lib/valuation';
import type { BenchmarkComparison } from '@/lib/valuation/types';

export function BenchmarkComparisonCard({ 
  valuationId, 
  userMetrics 
}: { 
  valuationId: string;
  userMetrics: any;
}) {
  const [comparison, setComparison] = useState<BenchmarkComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBenchmarks() {
      const result = await calculateBenchmarkComparison(
        userMetrics,
        userMetrics.sector,
        userMetrics.context
      );
      setComparison(result);
      setLoading(false);
    }
    loadBenchmarks();
  }, [valuationId]);

  if (loading) return <div>Carregando benchmarks...</div>;
  if (!comparison) return <div>Sem dados de benchmark</div>;

  const insights = generateBenchmarkInsights(comparison);

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">
        📊 Comparação com Mercado
      </h3>

      {/* Insights */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6 space-y-2">
        {insights.map((insight, i) => (
          <p key={i} className="text-sm">{insight}</p>
        ))}
      </div>

      {/* Benchmark Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Empresa</th>
              <th className="text-right">Receita</th>
              <th className="text-right">Múltiplo</th>
              <th className="text-right">Crescimento</th>
              <th className="text-right">Margem</th>
              <th className="text-right">NRR</th>
              <th className="text-right">Churn</th>
            </tr>
          </thead>
          <tbody>
            {comparison.companies.map((company) => (
              <tr key={company.id} className="border-b hover:bg-gray-50">
                <td className="py-3">
                  <a 
                    href={company.website} 
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    {company.companyName}
                  </a>
                  {company.isPublic && (
                    <span className="ml-2 text-xs bg-green-100 px-2 py-1 rounded">
                      PUBLIC
                    </span>
                  )}
                </td>
                <td className="text-right">
                  ${(company.annualRevenue / 1_000_000).toFixed(1)}M
                </td>
                <td className="text-right font-medium">
                  {company.valuationMultiple.toFixed(2)}x
                </td>
                <td className="text-right">
                  {company.revenueGrowthRate?.toFixed(0)}%
                </td>
                <td className="text-right">
                  {company.ebitdaMargin?.toFixed(0)}%
                </td>
                <td className="text-right">
                  {company.nrr?.toFixed(0)}%
                </td>
                <td className="text-right">
                  {company.churnRate?.toFixed(1)}%
                </td>
              </tr>
            ))}
            
            {/* User row */}
            <tr className="bg-yellow-50 font-bold">
              <td className="py-3">Sua Empresa</td>
              <td className="text-right">
                ${(userMetrics.revenue / 1_000_000).toFixed(1)}M
              </td>
              <td className="text-right">
                {userMetrics.valuationMultiple.toFixed(2)}x
              </td>
              <td className="text-right">
                {userMetrics.growthRate?.toFixed(0)}%
              </td>
              <td className="text-right">
                {userMetrics.ebitdaMargin?.toFixed(0)}%
              </td>
              <td className="text-right">
                {userMetrics.nrr?.toFixed(0)}%
              </td>
              <td className="text-right">
                {userMetrics.churnRate?.toFixed(1)}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Percentiles */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {comparison.userPercentiles && Object.entries(comparison.userPercentiles).map(([key, percentile]) => {
          if (percentile === null) return null;
          const color = percentile >= 75 ? 'green' : percentile >= 50 ? 'yellow' : percentile >= 25 ? 'orange' : 'red';
          return (
            <div key={key} className={`p-3 rounded-lg bg-${color}-50 border border-${color}-200`}>
              <p className="text-xs text-gray-600 capitalize">{key}</p>
              <p className="text-2xl font-bold">{percentile.toFixed(0)}th</p>
              <p className="text-xs">percentil</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

#### 6.2: `ImprovementPlanCard.tsx`

**Funcionalidades**:
- Lista de top 10 ações recomendadas
- Ordenadas por priority score
- Tabs: "Quick Wins" / "Médio Prazo" / "Estratégico"
- Botão "Simular Impacto" por ação

**Template**:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { generateImprovementPlan } from '@/lib/valuation';
import type { ImprovementPlan } from '@/lib/valuation/types';

export function ImprovementPlanCard({ 
  valuationId, 
  currentValuation,
  gaps,
  sector,
  context
}: { 
  valuationId: string;
  currentValuation: number;
  gaps: any[];
  sector: string;
  context: any;
}) {
  const [plan, setPlan] = useState<ImprovementPlan | null>(null);
  const [tab, setTab] = useState<'quick' | 'mid' | 'strategic'>('quick');

  useEffect(() => {
    async function loadPlan() {
      const result = await generateImprovementPlan(
        gaps,
        currentValuation,
        sector,
        context
      );
      setPlan(result);
    }
    loadPlan();
  }, [valuationId]);

  if (!plan) return <div>Carregando plano...</div>;

  const actions = tab === 'quick' 
    ? plan.quickWins 
    : tab === 'mid' 
    ? plan.topActions.filter(a => a.estimatedTimeMonths > 2 && a.estimatedTimeMonths <= 6)
    : plan.strategicInitiatives;

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">
        💡 Plano de Melhoria
      </h3>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Valuation Atual</p>
          <p className="text-2xl font-bold">
            ${(currentValuation / 1_000_000).toFixed(2)}M
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Valuation Target</p>
          <p className="text-2xl font-bold">
            ${(plan.targetValuation / 1_000_000).toFixed(2)}M
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600">Aumento Potencial</p>
          <p className="text-2xl font-bold text-green-600">
            +{plan.potentialIncreasePercent.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          onClick={() => setTab('quick')}
          className={`px-4 py-2 ${tab === 'quick' ? 'border-b-2 border-blue-600 font-medium' : ''}`}
        >
          Quick Wins ({plan.quickWins.length})
        </button>
        <button
          onClick={() => setTab('mid')}
          className={`px-4 py-2 ${tab === 'mid' ? 'border-b-2 border-blue-600 font-medium' : ''}`}
        >
          Médio Prazo
        </button>
        <button
          onClick={() => setTab('strategic')}
          className={`px-4 py-2 ${tab === 'strategic' ? 'border-b-2 border-blue-600 font-medium' : ''}`}
        >
          Estratégico ({plan.strategicInitiatives.length})
        </button>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {actions.map((action) => (
          <div key={action.id} className="border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-lg">{action.actionTitle}</h4>
              <span className={`px-3 py-1 rounded text-sm ${
                action.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                action.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {action.difficulty}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">{action.description}</p>

            <div className="grid grid-cols-4 gap-4 text-sm mb-3">
              <div>
                <p className="text-gray-500">Impacto</p>
                <p className="font-bold text-green-600">
                  +${(action.estimatedValuationIncrease / 1_000_000).toFixed(2)}M
                </p>
              </div>
              <div>
                <p className="text-gray-500">Tempo</p>
                <p className="font-medium">{action.estimatedTimeMonths}mo</p>
              </div>
              <div>
                <p className="text-gray-500">Custo</p>
                <p className="font-medium">
                  ${action.estimatedCost ? (action.estimatedCost / 1000).toFixed(0) + 'K' : 'Baixo'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">ROI</p>
                <p className="font-bold text-purple-600">
                  {action.roiEstimate !== Infinity ? action.roiEstimate.toFixed(1) + 'x' : '∞'}
                </p>
              </div>
            </div>

            {/* Reasoning */}
            <div className="text-xs text-gray-600 space-y-1">
              {action.reasoning.map((reason, i) => (
                <p key={i}>• {reason}</p>
              ))}
            </div>

            <button className="mt-3 btn-secondary w-full">
              Ver Detalhes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 6.3: Atualizar `dashboard/page.tsx`

Adicionar novos componentes:
```tsx
import { BenchmarkComparisonCard } from '@/components/dashboard/BenchmarkComparison';
import { ImprovementPlanCard } from '@/components/dashboard/ImprovementPlan';

// Na página:
<div className="grid grid-cols-1 gap-6">
  {/* Existing cards */}
  
  {/* NEW: Benchmark Comparison */}
  <BenchmarkComparisonCard 
    valuationId={valuationId}
    userMetrics={userMetrics}
  />
  
  {/* NEW: Improvement Plan */}
  <ImprovementPlanCard
    valuationId={valuationId}
    currentValuation={valuationData.value}
    gaps={benchmarkComparison?.gaps || []}
    sector={valuationData.params.sector}
    context={valuationData.context}
  />
</div>
```

---

## 📊 Timeline Estimado

| Task | Tempo | Acumulado | Prioridade |
|------|-------|-----------|------------|
| **Task 4**: Migrations | 15 min | 15 min | 🔴 CRÍTICO |
| **Task 5**: Wizard | 3 horas | 3h 15min | 🔴 CRÍTICO |
| **Task 6**: Dashboard | 5 horas | 8h 15min | 🟡 ALTO |
| **Testes E2E** | 2 horas | 10h 15min | 🟡 ALTO |
| **Ajustes finais** | 2 horas | 12h 15min | 🟢 MÉDIO |

**Total**: ~12-14 horas de desenvolvimento

---

## 🧪 Checklist de Testes

### Backend (Tasks 1-3)
- [x] Database schema compila sem erros
- [x] TypeScript types sem erros
- [x] Seed data sintaxe correta
- [ ] **Migrations aplicadas com sucesso**
- [ ] **Dados populados corretamente**

### Services (Task 4)
- [ ] `determineSizeBracket()` retorna brackets corretos
- [ ] `fetchCountryRiskData()` busca dados do banco
- [ ] `fetchValuationMultiples()` retorna múltiplos com fallbacks
- [ ] `calculateAdvancedValuation()` calcula corretamente
- [ ] Valuation Brasil < Valuation USA (mesmo input)
- [ ] Small company multiple < Large company multiple

### Benchmarking (Task 5)
- [ ] `getBenchmarkComparables()` busca empresas similares
- [ ] `calculateBenchmarkComparison()` calcula percentis
- [ ] Percentis coerentes (empresa boa = >50th)
- [ ] Gaps identificados corretamente

### Recommendations (Task 6)
- [ ] `generateImprovementPlan()` gera ações relevantes
- [ ] Priority score coerente com gaps
- [ ] Impacto estimado razoável (não absurdo)
- [ ] Timeline organizado em fases

### Frontend (Tasks 5-6)
- [ ] Wizard coleta todos os novos campos
- [ ] Dropdown de sub-setor dinâmico
- [ ] NRR/Churn/LTV/CAC salvos corretamente
- [ ] Dashboard exibe benchmarks
- [ ] Dashboard exibe recomendações
- [ ] Gráficos renderizam sem erro

---

## 🚀 Como Executar

### 1. Rodar Migrations
```bash
cd d:\dev\valuation-saas-app
supabase db push
```

### 2. Popular Dados
Abrir Supabase Dashboard > SQL Editor > Copiar `007_seed_market_data.sql` > Executar

### 3. Testar Backend
```bash
# Criar arquivo de teste
echo "import { calculateAdvancedValuation } from '@/lib/valuation';

const testData = {
  revenue: 5000000,
  ebitda: 1000000
};

const testParams = {
  qualityScore: 85,
  sector: 'SaaS'
};

const testContext = {
  country: 'BRL',
  subSector: 'Vertical - Healthcare',
  churnRate: 8,
  nrr: 105
};

calculateAdvancedValuation(testData, testParams, testContext)
  .then(result => console.log('Result:', result))
  .catch(err => console.error('Error:', err));
" > test-valuation.ts

npx tsx test-valuation.ts
```

### 4. Desenvolver Wizard
```bash
# Criar novos steps
code src/components/wizard/StepRevenueQuality.tsx
code src/components/wizard/StepMoat.tsx

# Atualizar existentes
code src/components/wizard/StepIdentification.tsx
code src/components/wizard/WizardLayout.tsx
```

### 5. Desenvolver Dashboard
```bash
# Criar cards
code src/components/dashboard/BenchmarkComparison.tsx
code src/components/dashboard/ImprovementPlan.tsx

# Atualizar página
code src/app/[locale]/dashboard/page.tsx
```

### 6. Testar Completo
```bash
npm run dev

# Navegador:
# 1. /valuation/new → Preencher wizard completo
# 2. /dashboard → Verificar cards de benchmark e recomendações
# 3. Verificar se dados corretos aparecem
```

---

## 💡 Dicas de Implementação

### 1. Migrations
- ⚠️ **SEMPRE fazer backup** antes de rodar migrations
- Testar em ambiente de dev primeiro
- Verificar RLS policies (permissões) após aplicar

### 2. TypeScript
- Usar `as` type assertion com cuidado
- Preferir type guards quando possível
- Validar inputs antes de chamar funções

### 3. Performance
- Adicionar indexes nas tabelas (já incluído no schema)
- Fazer cache de benchmark companies (mudam raramente)
- Limitar queries com `limit` adequado

### 4. UX
- Mostrar loading states em todas as queries
- Explicar benchmarks de forma clara (tooltips)
- Usar cores consistentes (verde = bom, vermelho = ruim)

### 5. Dados
- Atualizar Damodaran ERP anualmente (January release)
- Verificar múltiplos trimestralmente (PitchBook)
- Adicionar novos benchmark companies mensalmente

---

## 🎯 Resultado Esperado

Após completar todas as tasks, o usuário poderá:

1. ✅ **Criar valuation** com todos os novos campos (país, sub-setor, revenue quality, moat)
2. ✅ **Ver valuation preciso** com múltiplos ajustados por geografia, tamanho e qualidade
3. ✅ **Comparar com mercado** vendo 5 empresas de referência e seu percentil
4. ✅ **Receber roadmap claro** de ações para aumentar valuation em X%
5. ✅ **Simular impacto** de implementar ações específicas

**Exemplo de fluxo**:
- Empresa: SaaS Healthcare, Brasil, $5M revenue, 85 quality score, 8% churn, 105% NRR
- **Valuation**: $21.25M (4.25x múltiplo)
- **Benchmark**: P40 (abaixo de 60% das empresas)
- **Gap**: Churn 8% vs 6% benchmark, NRR 105% vs 115% benchmark
- **Top Ação**: Customer Success Program → +$3.8M valuation (+18%)
- **Timeline**: 3-4 meses, custo $120K, ROI 31.6x

---

## 📞 Próximo Passo

**Diga "implementar task 4"** para eu começar a rodar as migrations e testar o backend, ou **"mostrar exemplo de uso"** para eu criar um script de teste completo!
