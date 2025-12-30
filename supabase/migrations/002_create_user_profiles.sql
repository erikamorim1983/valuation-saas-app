-- Create user_profiles table for dual profile system
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- User type: consultant or business_owner
    user_type TEXT NOT NULL CHECK (user_type IN ('consultant', 'business_owner')),
    
    -- Personal data
    full_name TEXT NOT NULL,
    phone TEXT,
    
    -- For consultants
    company_name TEXT, -- Consultancy/Agency name
    specialization TEXT, -- e.g., "M&A", "Valuation", "Business Strategy"
    professional_id TEXT, -- CNPJ, CRC, or other professional ID
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    onboarding_completed BOOLEAN DEFAULT false,
    
    -- Constraints
    CONSTRAINT full_name_length CHECK (char_length(full_name) >= 2)
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" 
ON user_profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON user_profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON user_profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" 
ON user_profiles FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_profiles_timestamp ON user_profiles;
CREATE TRIGGER update_user_profiles_timestamp 
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);

-- Remove the one_company_per_user constraint to allow consultants multiple companies
ALTER TABLE companies DROP CONSTRAINT IF EXISTS one_company_per_user;

-- Add a new column to track which user created/owns the company
-- This helps consultants manage multiple client companies
ALTER TABLE companies ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update existing records to set created_by = user_id
UPDATE companies SET created_by = user_id WHERE created_by IS NULL;

-- Create index for consultant company management
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON companies(created_by);

-- Add a function to check company creation limits based on user type
CREATE OR REPLACE FUNCTION check_company_creation_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_user_type TEXT;
    v_company_count INTEGER;
BEGIN
    -- Get user type
    SELECT user_type INTO v_user_type
    FROM user_profiles
    WHERE user_id = NEW.user_id;
    
    -- If user is a business owner, enforce 1 company limit
    IF v_user_type = 'business_owner' THEN
        SELECT COUNT(*) INTO v_company_count
        FROM companies
        WHERE user_id = NEW.user_id;
        
        IF v_company_count >= 1 THEN
            RAISE EXCEPTION 'Business owners are limited to 1 company. Upgrade to consultant plan for unlimited companies.';
        END IF;
    END IF;
    
    -- Consultants have no limit
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to enforce company creation limits
DROP TRIGGER IF EXISTS enforce_company_limit ON companies;
CREATE TRIGGER enforce_company_limit
    BEFORE INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION check_company_creation_limit();
