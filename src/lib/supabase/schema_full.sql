-- 1. Create Valuations Table
CREATE TABLE IF NOT EXISTS valuations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    company_name TEXT NOT NULL,
    sector TEXT NOT NULL,
    currency TEXT NOT NULL,
    financial_data JSONB NOT NULL,
    valuation_result JSONB NOT NULL,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;

-- 3. Create Policies
DROP POLICY IF EXISTS "Users can view own valuations" ON valuations;
CREATE POLICY "Users can view own valuations" 
ON valuations FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own valuations" ON valuations;
CREATE POLICY "Users can insert own valuations" 
ON valuations FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own valuations" ON valuations;
CREATE POLICY "Users can update own valuations" 
ON valuations FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own valuations" ON valuations;
CREATE POLICY "Users can delete own valuations" 
ON valuations FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
