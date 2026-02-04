# 🚀 Deploy no Vercel - Guia Completo

## ✅ Pré-requisitos Concluídos
- ✅ Código enviado para GitHub: `erikamorim1983/valuation-saas-app`
- ✅ Branch principal: `main`
- ✅ Commit mais recente: Correção do cadastro de empresas

## 📋 Passos para Deploy no Vercel

### 1. Acesse o Vercel
1. Vá para: https://vercel.com
2. Clique em **"Sign In"** ou **"Sign Up"**
3. Escolha **"Continue with GitHub"**
4. Autorize o Vercel a acessar seus repositórios

### 2. Importe o Projeto
1. No Dashboard do Vercel, clique em **"Add New..."** → **"Project"**
2. Na lista de repositórios, encontre: `erikamorim1983/valuation-saas-app`
3. Clique em **"Import"**

### 3. Configure o Projeto

#### Configurações Básicas
- **Project Name**: `valuation-saas-app` (ou outro nome de sua preferência)
- **Framework Preset**: `Next.js` (deve detectar automaticamente)
- **Root Directory**: `./` (deixe como está)

#### Build & Development Settings
Deixe as configurações padrão:
- **Build Command**: `npm run build` ou `next build`
- **Output Directory**: `.next` (automático)
- **Install Command**: `npm install`

### 4. Configurar Variáveis de Ambiente

⚠️ **IMPORTANTE**: Você precisa configurar as variáveis de ambiente do Supabase

Clique em **"Environment Variables"** e adicione:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

**Como obter as credenciais do Supabase:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Deploy

1. Após configurar as variáveis de ambiente, clique em **"Deploy"**
2. Aguarde o build completar (cerca de 2-5 minutos)
3. ✅ Deploy concluído! Você receberá uma URL como: `https://valuation-saas-app.vercel.app`

---

## 🔧 Pós-Deploy: Configurar Supabase

Após o deploy, você precisa autorizar o domínio do Vercel no Supabase:

### 1. Configure URLs Autorizadas
1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** → **URL Configuration**
3. Adicione sua URL do Vercel em **Redirect URLs**:
   ```
   https://seu-app.vercel.app/**
   https://seu-app.vercel.app/auth/callback
   ```
4. Adicione em **Site URL**:
   ```
   https://seu-app.vercel.app
   ```

### 2. Execute as Migrações
Se ainda não executou as migrações no Supabase:

1. Vá em **SQL Editor** no Supabase
2. Execute na ordem:
   - `001_create_companies_table_fixed.sql`
   - `002_create_user_profiles.sql`
   - `003_fix_rls_insert_policy.sql`
   - `007_advanced_valuation_system.sql`
   - `007_seed_market_data.sql`
   - `008_add_rls_to_market_data.sql`
   - `009_fix_company_creation_trigger.sql` ⭐ **NOVO - ESSENCIAL**

---

## 🔄 Atualizações Futuras

Para fazer deploy de novas alterações:

```powershell
# 1. Faça suas alterações no código
# 2. Commit
git add .
git commit -m "Descrição das alterações"

# 3. Push para GitHub
git push origin main

# 4. O Vercel vai automaticamente fazer deploy! 🎉
```

---

## ⚙️ Configurações Adicionais (Opcional)

### Domínio Personalizado
1. No Dashboard do Vercel, vá no seu projeto
2. Clique em **Settings** → **Domains**
3. Adicione seu domínio personalizado
4. Configure o DNS conforme instruções do Vercel

### Preview Deployments
- Toda vez que você abrir um Pull Request, o Vercel cria um deploy de preview
- Útil para testar antes de fazer merge

### Logs e Monitoramento
- Acesse **Deployments** no Vercel para ver logs
- Vá em **Analytics** para métricas de uso
- **Logs** mostra erros em tempo real

---

## 🐛 Troubleshooting

### Erro: Build Failed
**Solução**: Verifique os logs do build no Vercel
- Pode ser erro de TypeScript → corrija localmente primeiro
- Dependências faltando → verifique `package.json`

### Erro: Environment Variables
**Solução**: 
- Verifique se todas as variáveis estão configuradas
- Certifique-se que começam com `NEXT_PUBLIC_` para serem acessíveis no frontend

### Erro 500 ao acessar
**Solução**:
- Verifique os logs em **Deployments** → **Functions**
- Pode ser problema com Supabase → verifique as URLs autorizadas
- Verifique se as migrações foram executadas

### Erro de Autenticação
**Solução**:
- Configure corretamente as Redirect URLs no Supabase
- Formato correto: `https://seu-app.vercel.app/auth/callback`

---

## 📊 Status Atual

### ✅ Repositório GitHub
- **URL**: https://github.com/erikamorim1983/valuation-saas-app
- **Branch**: main
- **Último Commit**: Fix cadastro de empresas

### 📝 Próximos Passos
1. ⏳ Acesse Vercel e importe o projeto
2. ⏳ Configure variáveis de ambiente
3. ⏳ Faça o deploy
4. ⏳ Configure URLs no Supabase
5. ⏳ Execute as migrações no Supabase
6. ✅ Teste a aplicação

---

## 📞 Links Úteis

- 🌐 **Vercel Dashboard**: https://vercel.com/dashboard
- 🗄️ **Supabase Dashboard**: https://supabase.com/dashboard
- 📚 **Docs Vercel**: https://vercel.com/docs
- 📚 **Docs Next.js**: https://nextjs.org/docs
- 📚 **Docs Supabase**: https://supabase.com/docs

---

## 🎉 Resultado Final

Após seguir todos os passos, você terá:
- ✅ Aplicação rodando em produção no Vercel
- ✅ Deploy automático a cada push no GitHub
- ✅ HTTPS configurado automaticamente
- ✅ CDN global para performance otimizada
- ✅ Supabase configurado e funcionando

**URL da aplicação**: `https://seu-app.vercel.app`
