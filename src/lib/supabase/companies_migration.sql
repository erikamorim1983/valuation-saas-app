-- 1. Create the Companies table (The 'Lock')
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    
    -- Identity Fields (Immutable-ish)
    name TEXT NOT NULL,
    industry TEXT, -- SaaS, E-commerce, etc.
    sub_industry TEXT,
    founding_year INTEGER,
    website TEXT,
    description TEXT,
    
    -- Constraints
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add RLS to Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own company
CREATE POLICY "Users can view own company" ON companies
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own company (LIMIT 1 enforced by app logic initially, unique constraint later if strictly 1)
-- For strict 1-per-user enforcement at DB level:
-- CREATE UNIQUE INDEX unique_company_per_user ON companies(user_id);

CREATE POLICY "Users can insert own company" ON companies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company" ON companies
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. Update Valuations table to link to Company
-- We will keep the old table but add the FK key. Ideally we migrate data, but for now we make it nullable to not break existing.
ALTER TABLE valuations 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- Optional: If we want to strictly enforce the new model, we would eventually make company_id NOT NULL
-- and drop the loose columns (company_name, sector, etc) from valuations table.
