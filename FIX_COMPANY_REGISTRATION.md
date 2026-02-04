# Correção do Erro de Cadastro de Empresa

## Problema
Ao tentar cadastrar uma empresa, o sistema apresentava erro: "Error creating company. Please try again."

## Causa Raiz
O trigger `check_company_creation_limit()` na tabela `companies` estava falhando quando:
1. O usuário não tinha um perfil em `user_profiles` criado antes de tentar criar a empresa
2. A função tentava buscar o `user_type` mas recebia NULL, causando falhas no trigger

## Solução Implementada

### 1. Código da Aplicação
✅ Atualizado o fluxo de onboarding em [business-owner/page.tsx](src/app/[locale]/onboarding/business-owner/page.tsx):
- Agora verifica se o perfil existe antes de criar a empresa
- Se não existe, cria um novo perfil com `user_type: 'business_owner'`
- Se existe, apenas atualiza os dados

✅ Melhorado o tratamento de erros em [company.ts](src/lib/supabase/company.ts):
- Mensagens de erro mais específicas por código de erro
- Logs detalhados para debug
- Mensagens em português quando apropriado

✅ Atualizado [userProfile.ts](src/lib/supabase/userProfile.ts):
- `onboarding_completed` agora é opcional no `CreateUserProfileData`

### 2. Migração do Banco de Dados
✅ Criada nova migração `009_fix_company_creation_trigger.sql`:
- Corrigido o trigger `check_company_creation_limit()`
- Agora usa `COALESCE` para tratar perfis NULL
- Default para `business_owner` se perfil não existir
- Melhor tratamento de erros com mensagens claras

## Como Aplicar a Correção

### Opção 1: Supabase Cloud (Recomendado)
1. Acesse o Dashboard do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor**
4. Copie o conteúdo de `supabase/migrations/009_fix_company_creation_trigger.sql`
5. Cole no editor e clique em **Run**
6. Verifique se a mensagem de sucesso aparece

### Opção 2: Supabase CLI (Local)
```powershell
# Se estiver rodando Supabase localmente
npx supabase migration up

# Ou aplicar apenas esta migração
npx supabase db push
```

### Opção 3: Executar SQL Diretamente
Se você tem acesso direto ao PostgreSQL:
```sql
-- Copie e execute o arquivo 009_fix_company_creation_trigger.sql
```

## Testando a Correção

1. **Limpe os dados de teste (opcional)**:
```sql
-- No SQL Editor do Supabase
DELETE FROM companies WHERE user_id = 'SEU_USER_ID_AQUI';
DELETE FROM user_profiles WHERE user_id = 'SEU_USER_ID_AQUI';
```

2. **Teste o fluxo completo**:
   - Faça login
   - Vá para o onboarding: `/onboarding/business-owner`
   - Preencha o formulário de perfil
   - Preencha o formulário de empresa
   - Clique em "Concluir Cadastro"

3. **Verifique os logs do console**:
   - Abra DevTools (F12)
   - Console deve mostrar:
     ```
     [Onboarding] Step 1: Profile setup completed successfully
     [Onboarding] Step 2: Company created successfully
     [Onboarding] Redirecting to dashboard...
     ```

## Logs para Debug

### Console do Navegador
- `[Onboarding]` - Logs do fluxo de onboarding
- `[createUserCompany]` - Logs da criação da empresa
- `[createUserProfile]` - Logs da criação do perfil

### Erros Comuns e Soluções

**Erro: "You already have a registered company"**
- Solução: Você já tem uma empresa. Delete-a no banco ou faça upgrade para consultant

**Erro de política (42501)**
- Solução: Faça logout e login novamente para renovar a sessão

**Erro de constraint (23505)**
- Solução: Já existe uma empresa para este user_id. Delete a empresa antiga primeiro

## Estrutura das Tabelas

### user_profiles
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    user_type TEXT, -- 'business_owner' | 'consultant'
    full_name TEXT,
    phone TEXT,
    onboarding_completed BOOLEAN DEFAULT false,
    ...
);
```

### companies
```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    sub_industry TEXT NOT NULL,
    founding_year INTEGER NOT NULL,
    description TEXT NOT NULL,
    ...
    CONSTRAINT one_company_per_user UNIQUE (user_id)
);
```

## Próximos Passos

Após aplicar esta correção:
1. ✅ Teste o cadastro de empresa
2. ✅ Verifique se o dashboard carrega corretamente
3. ✅ Teste criar uma valuation com a empresa cadastrada
4. 📝 Considere adicionar testes automatizados para este fluxo

## Arquivos Modificados

- ✅ `src/app/[locale]/onboarding/business-owner/page.tsx`
- ✅ `src/lib/supabase/company.ts`
- ✅ `src/lib/supabase/userProfile.ts`
- ✅ `supabase/migrations/009_fix_company_creation_trigger.sql` (novo)
