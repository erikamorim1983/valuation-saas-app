# 🚀 Como Rodar as Migrations

## Opção 1: Supabase Dashboard (RECOMENDADO)

### Passo 1: Aplicar Schema (007_advanced_valuation_system.sql)

1. Acesse seu projeto no Supabase Dashboard: https://supabase.com/dashboard
2. Navegue para **SQL Editor** (ícone </> no menu lateral)
3. Clique em **New Query**
4. Copie TODO o conteúdo do arquivo: `supabase/migrations/007_advanced_valuation_system.sql`
5. Cole no editor
6. Clique em **Run** (ou pressione Ctrl+Enter)

**Resultado esperado**: 
```
Success. Rows returned: 0
Time: XXXms
```

**Verificar tabelas criadas**:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'valuation_multiples',
  'country_risk_data', 
  'size_premiums',
  'benchmark_companies',
  'improvement_actions',
  'user_improvement_plans'
)
ORDER BY table_name;
```

Deve retornar 6 linhas (6 tabelas).

---

### Passo 2: Popular Dados (007_seed_market_data.sql)

1. No SQL Editor, clique em **New Query**
2. Copie TODO o conteúdo do arquivo: `supabase/migrations/007_seed_market_data.sql`
3. Cole no editor
4. Clique em **Run**

**Resultado esperado**: 
```
Success. Rows returned: X
Time: XXXms
```

**Verificar dados inseridos**:
```sql
SELECT 
  (SELECT COUNT(*) FROM country_risk_data) as countries,
  (SELECT COUNT(*) FROM size_premiums) as size_premiums,
  (SELECT COUNT(*) FROM valuation_multiples) as multiples,
  (SELECT COUNT(*) FROM benchmark_companies) as benchmarks,
  (SELECT COUNT(*) FROM improvement_actions) as actions;
```

Deve retornar:
```
countries: 6
size_premiums: 15
multiples: 20+
benchmarks: 12
actions: 15
```

---

## Opção 2: Supabase CLI (se tiver Docker rodando)

```bash
# 1. Iniciar Supabase local
supabase start

# 2. Aplicar migrations
supabase db push

# 3. Verificar status
supabase db diff

# 4. Popular dados (via psql)
psql postgresql://postgres:postgres@localhost:54322/postgres < supabase/migrations/007_seed_market_data.sql
```

---

## Opção 3: Script SQL Direto

Se preferir, pode executar os dois arquivos em sequência no SQL Editor:

### Arquivo Consolidado (schema + dados)

```sql
-- PASSO 1: SCHEMA
-- Copiar conteúdo de: supabase/migrations/007_advanced_valuation_system.sql

-- PASSO 2: DADOS
-- Copiar conteúdo de: supabase/migrations/007_seed_market_data.sql
```

---

## ✅ Checklist de Verificação

Após rodar as migrations, execute estas queries para confirmar:

### 1. Tabelas criadas
```sql
\dt
-- Deve mostrar as 6 novas tabelas
```

### 2. Colunas na tabela valuations
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'valuations'
AND column_name IN (
  'country', 'sub_sector', 'size_bracket', 
  'churn_rate', 'nrr', 'ltv', 'cac'
)
ORDER BY column_name;
```

Deve retornar 7+ colunas novas.

### 3. Países disponíveis
```sql
SELECT country, equity_risk_premium, liquidity_discount, exit_discount
FROM country_risk_data
ORDER BY equity_risk_premium;
```

Deve retornar:
```
USA       | 5.5  | 0    | 0
Chile     | 7.8  | 0.15 | 0.12
México    | 8.1  | 0.20 | 0.15
Colômbia  | 8.5  | 0.22 | 0.15
Brasil    | 9.2  | 0.25 | 0.20
Argentina | 15.5 | 0.35 | 0.25
```

### 4. Múltiplos SaaS
```sql
SELECT 
  country,
  sub_sector,
  size_bracket,
  revenue_multiple_median,
  sample_size
FROM valuation_multiples
WHERE sector = 'SaaS'
ORDER BY country, sub_sector, size_bracket;
```

Deve retornar 15+ linhas.

### 5. Empresas Benchmark
```sql
SELECT 
  company_name,
  sector,
  sub_sector,
  annual_revenue / 1000000 as revenue_millions,
  valuation_multiple
FROM benchmark_companies
WHERE is_active = true
ORDER BY sector, annual_revenue DESC;
```

Deve retornar 12 empresas.

### 6. Ações de Melhoria
```sql
SELECT 
  action_title,
  pillar_impact,
  valuation_impact_percent,
  difficulty,
  estimated_time_months
FROM improvement_actions
WHERE is_active = true
ORDER BY default_priority DESC
LIMIT 10;
```

Deve retornar top 10 ações.

---

## 🐛 Troubleshooting

### Erro: "relation already exists"
**Solução**: As tabelas já foram criadas. Pule para o Passo 2 (popular dados).

### Erro: "column already exists"
**Solução**: As colunas já foram adicionadas à tabela valuations. Continue normalmente.

### Erro: "duplicate key value violates unique constraint"
**Solução**: Os dados já foram inseridos. Verifique com as queries de checklist.

### Erro: "permission denied"
**Solução**: Verifique se está usando o usuário correto no Supabase Dashboard (deve ser owner/admin do projeto).

### Erro: "invalid input syntax"
**Solução**: Certifique-se de copiar TODO o conteúdo do arquivo SQL (incluindo BEGIN e COMMIT se houver).

---

## 📊 Próximo Passo Após Migrations

Após confirmar que as migrations foram aplicadas com sucesso, você pode:

1. **Testar Backend**: Diga "testar backend" para criar script de teste
2. **Implementar Wizard**: Diga "task 5" para criar novos steps do wizard
3. **Ver Exemplo**: Diga "mostrar exemplo" para ver o sistema funcionando

---

## 💡 Dica

Se você tem acesso ao projeto Supabase, a forma mais fácil é:

1. Dashboard > SQL Editor > New Query
2. Copiar/colar `007_advanced_valuation_system.sql` → Run
3. Copiar/colar `007_seed_market_data.sql` → Run
4. Verificar com queries do checklist

Leva ~5 minutos no total!

---

**Concluiu as migrations?** Diga **"migrations concluídas"** para eu marcar a task como completa e partir para Task 5 (Wizard)!
