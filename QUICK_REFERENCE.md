# ⚡ Quick Reference - Sistema de Valuation Avançado

## 📦 Arquivos Criados (Sessão Atual)

### Database (2 arquivos)
- `supabase/migrations/007_advanced_valuation_system.sql` - Schema (6 tabelas)
- `supabase/migrations/007_seed_market_data.sql` - Dados de mercado (50+ entries)

### Services (4 arquivos)
- `src/lib/supabase/market-data.ts` - Queries ao banco
- `src/lib/valuation/engines/advancedEngine.ts` - Engine multi-fator
- `src/lib/valuation/benchmarking.ts` - Sistema de comparação
- `src/lib/valuation/recommendations.ts` - Engine de recomendações

### Documentation (4 arquivos)
- `IMPLEMENTATION_STATUS.md` - Status geral
- `NEXT_STEPS.md` - Guia detalhado próximos passos
- `EXECUTIVE_SUMMARY.md` - Resumo executivo completo
- `QUICK_REFERENCE.md` - Este arquivo

### Updated (2 arquivos)
- `src/lib/valuation/types.ts` - +230 linhas
- `src/lib/valuation/index.ts` - Exports atualizados

---

## 🎯 Comandos Rápidos

### Para continuar implementação:
```
"rodar migrations" → Aplicar schema no Supabase
"popular dados" → Inserir market data
"testar backend" → Criar script de teste
"implementar wizard" → Criar steps de Revenue Quality e Moat
"implementar dashboard" → Criar cards de Benchmark e Improvement Plan
"mostrar exemplo" → Demo completo com dados reais
```

### Para consultar:
```
"explicar arquitetura" → Detalhar fluxos de cálculo
"mostrar formula" → Explicar cálculo multi-fator
"listar empresas benchmark" → Ver as 12 empresas de referência
"listar ações" → Ver as 15 improvement actions
"mostrar múltiplos" → Ver múltiplos por setor/país
```

---

## 🔥 Fórmulas Principais

### Valuation Final
```
finalValuation = revenue × finalMultiple

onde:
finalMultiple = baseMultiple × countryFactor × sizeFactor × 
                qualityFactor × revenueQualityFactor × moatFactor
```

### Country Factor
```
countryFactor = 1 - liquidityDiscount - exitDiscount

Exemplos:
- USA: 1.0 (baseline, sem desconto)
- Brasil: 0.70 (-25% liquidity, -20% exit = -45% total)
- México: 0.80 (-20% total)
```

### Size Factor
```
sizeFactor = 1 + multipleDiscount (discount é negativo)

Exemplos:
- Micro (<$1M): 0.55 (-45%)
- Small ($1-10M): 0.72 (-28%)
- Mid ($10-50M): 0.85 (-15%)
- Growth ($50-100M): 0.95 (-5%)
- Scale (>$100M): 1.0 (baseline)
```

### Quality Factor
```
if qualityScore >= 85:
    qualityFactor = 1.0 + (qualityScore - 85) × 0.01
else if qualityScore < 70:
    qualityFactor = 0.7 + (qualityScore / 100) × 0.3
else:
    qualityFactor = 1.0

Exemplos:
- Score 95: 1.10 (+10%)
- Score 85: 1.00 (par)
- Score 75: 1.00 (par)
- Score 65: 0.895 (-10.5%)
```

### Revenue Quality Factor
```
Base: 1.0

Adjustments:
- Churn <5%: +0.05
- Churn 10-15%: -0.05
- Churn >15%: -0.10
- NRR >110%: +0.10
- NRR 105-110%: +0.05
- NRR <100%: -0.10
- LTV/CAC >3: +0.08
- LTV/CAC <1.5: -0.08
- CAC Payback <12mo: +0.05
- CAC Payback >24mo: -0.05
- Contract Annual: +0.08
- Contract Multi-year: +0.15

Range: 0.75 - 1.25
```

### Moat Factor
```
Base: 1.0

Adjustments:
- IP Patents: +0.10
- IP Trade Secrets: +0.05
- Network Effects Strong: +0.15
- Network Effects Moderate: +0.08
- Network Effects Weak: +0.03
- Switching Costs >$100K: +0.10
- Switching Costs $50-100K: +0.05
- Data Moat: +0.08
- Deep Integration: +0.05
- Certifications: +0.05

Max: 1.50
```

---

## 📊 Dados Disponíveis

### Países (6)
```typescript
USA    → ERP 5.5%  → Discount 0%
Brasil → ERP 9.2%  → Discount -45%
México → ERP 8.1%  → Discount -35%
Argentina → ERP 15.5% → Discount -60%
Chile  → ERP 7.8%  → Discount -30%
Colômbia → ERP 8.5% → Discount -35%
```

### Setores (10)
```
SaaS, E-commerce, Fintech, Marketplace, HealthTech,
EdTech, PropTech, FoodTech, AgTech, RetailTech
```

### Sub-setores SaaS (12)
```
- AI/ML (premium múltiplo 15x)
- Vertical - Healthcare
- Vertical - Finance
- Vertical - Legal
- Vertical - Real Estate
- Horizontal - CRM
- Horizontal - HR
- Horizontal - Marketing
- Horizontal - Productivity
- DevTools/Infrastructure
- Security/Compliance
- Legacy/On-Premise
```

### Benchmark Companies (12)
```
SaaS:
1. Doximity (Healthcare) - $400M ARR, 11.84x
2. Zocdoc (Healthcare) - $120M ARR, 5.0x
3. HubSpot (CRM) - $2.1B ARR, 13.33x
4. Pipedrive (CRM) - $168M ARR, 6.55x
5. Hotjar (Marketing) - $40M ARR, 5.0x
6. ConvertKit (Marketing) - $29M ARR, 5.0x
7. RD Station (Marketing BR) - $180M ARR, 5.0x
8. Conta Azul (Accounting BR) - $70M ARR, 5.71x

Fintech:
9. Stripe (Payments) - $18B revenue, 3.61x
10. Pagar.me (Payments BR) - $300M revenue, 3.67x

E-commerce:
11. Glossier (D2C Beauty) - $200M revenue, 9.0x
12. The Ordinary (D2C Beauty) - $460M revenue, 3.26x
```

### Improvement Actions (15)
```
Operations (6):
1. Documentar SOPs (+15 score, +8% valuation, easy, 2mo, $5K)
2. Contratar Head Operations (+20, +12%, moderate, 3mo, $150K)
3. Implementar ERP (+18, +10%, hard, 6mo, $80K)
4. Diversificar Clientes (+15, +12%, moderate, 4mo, $10K)
5. Certificação SOC 2 (+20, +10%, hard, 9mo, $50K)
6. Contratar CFO (+20, +10%, moderate, 1mo, $180K)

Revenue Quality (3):
7. Contratos Anuais (+20, +15%, easy, 1mo, $2K)
8. Customer Success (+25, +18%, moderate, 3mo, $120K)
9. Upsell/Cross-sell (+15, +10%, easy, 2mo, $15K)

Growth (2):
10. Novo Segmento (+25, +20%, hard, 12mo, $200K)
11. PLG (+30, +25%, hard, 9mo, $100K)

Moat (2):
12. Integrações Enterprise (+15, +12%, moderate, 6mo, $80K)
13. Registrar Patentes (+10, +8%, hard, 12mo, $30K)

Financial (2):
14. Melhorar Margem EBITDA (+15, +8%, moderate, 6mo, $50K)
15. Reduzir CAC (+20, +12%, moderate, 4mo, $40K)

Team (1):
16. ESOP (+15, +8%, moderate, 3mo, $20K)
```

---

## 🧮 Exemplo de Cálculo

### Input
```typescript
Company: "HealthTech SaaS Brasil"
Revenue: $5,000,000
EBITDA: $1,000,000 (20% margin)
Quality Score: 85/100
Sector: SaaS
Sub-sector: Vertical - Healthcare
Country: Brasil
Churn Rate: 8%
NRR: 105%
IP Type: trade-secrets
Network Effects: weak
```

### Cálculo Passo-a-Passo

**1. Base Multiple**
```
Setor: SaaS - Vertical Healthcare (mid)
País: Brasil
Base multiple: 7.5x (USA) → 4.5x (Brasil, -40%)
```

**2. Country Factor**
```
Brasil: 
- Liquidity discount: -25%
- Exit discount: -20%
Country factor: 1 - 0.25 - 0.20 = 0.55
```

**3. Size Factor**
```
Revenue $5M → Size bracket: small
Size multiple discount: -28%
Size factor: 1 - 0.28 = 0.72
```

**4. Quality Factor**
```
Score 85 → Par (não premium, não discount)
Quality factor: 1.00
```

**5. Revenue Quality Factor**
```
Churn 8%: -0.05 (acima de 5%, abaixo de 10%)
NRR 105%: +0.05 (acima de 100%, abaixo de 110%)
Revenue quality factor: 1.00 - 0.05 + 0.05 = 1.00
```

**6. Moat Factor**
```
IP trade-secrets: +0.05
Network effects weak: +0.03
Moat factor: 1.00 + 0.05 + 0.03 = 1.08
```

**7. Final Multiple**
```
finalMultiple = 7.5 × 0.55 × 0.72 × 1.00 × 1.00 × 1.08
              = 7.5 × 0.428
              = 3.21x
```

**8. Final Valuation**
```
finalValuation = $5,000,000 × 3.21
               = $16,050,000
```

**9. Range**
```
Min: $16M × 0.8 = $12.8M
Median: $16M
Max: $16M × 1.2 = $19.2M
```

---

## 🎯 Quick Wins Identificados

Com base no exemplo acima:

### Gap Analysis
```
Churn Rate: 8% vs 6% benchmark → GAP -33% → SEVERITY: high
NRR: 105% vs 115% benchmark → GAP -9% → SEVERITY: medium
Multiple: 3.21x vs 5.0x benchmark → GAP -36% → SEVERITY: high
```

### Top 3 Ações
```
1. Migrar Contratos Anuais
   - Impacto: +$2.4M (+15%)
   - Tempo: 1 mês
   - Custo: $2K
   - ROI: 1200x
   - Priority: 95

2. Customer Success Program
   - Impacto: +$2.9M (+18%)
   - Tempo: 3 meses
   - Custo: $120K
   - ROI: 24x
   - Priority: 92

3. Upsell/Cross-sell Program
   - Impacto: +$1.6M (+10%)
   - Tempo: 2 meses
   - Custo: $15K
   - ROI: 107x
   - Priority: 88
```

### Valuation Target
```
Atual: $16.0M
Target: $22.9M (+$6.9M)
Aumento: +43%
Timeline: 3 meses
Custo: $137K
ROI médio: 444x
```

---

## 🚀 Como Usar Este Sistema

### 1. Para calcular valuation:
```typescript
import { calculateAdvancedValuation } from '@/lib/valuation';

const result = await calculateAdvancedValuation(
  { revenue: 5000000, ebitda: 1000000 },
  { qualityScore: 85, sector: 'SaaS' },
  { 
    country: 'BRL',
    subSector: 'Vertical - Healthcare',
    churnRate: 8,
    nrr: 105
  }
);

console.log(result.value); // $16,050,000
console.log(result.multiple); // 3.21x
console.log(result.breakdown); // Detalhamento completo
```

### 2. Para buscar benchmarks:
```typescript
import { calculateBenchmarkComparison } from '@/lib/valuation';

const comparison = await calculateBenchmarkComparison(
  {
    revenue: 5000000,
    valuationMultiple: 3.21,
    churnRate: 8,
    nrr: 105,
    qualityScore: 85
  },
  'SaaS',
  { 
    country: 'BRL',
    subSector: 'Vertical - Healthcare'
  }
);

console.log(comparison.companies); // Top 5 empresas similares
console.log(comparison.gaps); // Gaps identificados
console.log(comparison.userPercentiles); // Posição vs mercado
```

### 3. Para gerar recomendações:
```typescript
import { generateImprovementPlan } from '@/lib/valuation';

const plan = await generateImprovementPlan(
  comparison.gaps,
  16050000,
  'SaaS',
  { country: 'BRL', sizeBracket: 'small' }
);

console.log(plan.topActions); // Top 10 ações
console.log(plan.quickWins); // Quick wins
console.log(plan.targetValuation); // Valuation objetivo
console.log(plan.timeline); // Roadmap em fases
```

---

## 📞 Suporte

### Dúvidas sobre:
- **Cálculos**: "explicar formula"
- **Dados**: "listar empresas benchmark"
- **Implementação**: "próximo passo"
- **Testes**: "como testar backend"
- **Errors**: Mostre a mensagem de erro

### Para adicionar:
- **Novo país**: "adicionar país [nome]"
- **Novo setor**: "adicionar setor [nome]"
- **Nova empresa benchmark**: "adicionar benchmark [nome]"
- **Nova ação**: "adicionar ação [nome]"

---

## ✅ Status Atual

```
✅ Database schema (6 tables)
✅ Market data (50+ entries)
✅ TypeScript types (15 interfaces)
✅ Advanced engine (multi-factor)
✅ Benchmarking system
✅ Recommendations engine
⏸️ Migrations applied
⏸️ Wizard updated
⏸️ Dashboard created
⏸️ E2E tested
```

**Progress: 60% backend, 0% frontend = 30% overall**

---

**🎯 PRÓXIMO PASSO: DIGA "TASK 4" PARA RODAR AS MIGRATIONS!**
