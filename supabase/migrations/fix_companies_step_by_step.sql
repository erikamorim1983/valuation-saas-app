-- PASSO 1: Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own company" ON companies;
DROP POLICY IF EXISTS "Users can insert own company" ON companies;
DROP POLICY IF EXISTS "Users can update own company" ON companies;
DROP POLICY IF EXISTS "Users can delete own company" ON companies;

-- PASSO 2: Criar tabela
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    website TEXT,
    industry TEXT NOT NULL,
    sub_industry TEXT NOT NULL,
    founding_year INTEGER NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- PASSO 3: Adicionar constraint única
ALTER TABLE companies DROP CONSTRAINT IF EXISTS one_company_per_user;
ALTER TABLE companies ADD CONSTRAINT one_company_per_user UNIQUE (user_id);

-- PASSO 4: Ativar RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Criar políticas SELECT
CREATE POLICY "Users can view own company" 
ON companies FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- PASSO 6: Criar política INSERT
CREATE POLICY "Users can insert own company" 
ON companies FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- PASSO 7: Criar política UPDATE
CREATE POLICY "Users can update own company" 
ON companies FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- PASSO 8: Criar política DELETE
CREATE POLICY "Users can delete own company" 
ON companies FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- PASSO 9: Criar função de update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- PASSO 10: Criar trigger
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at 
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- PASSO 11: Criar índice
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
