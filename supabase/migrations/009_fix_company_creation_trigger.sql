-- ================================================================
-- MIGRATION: Fix Company Creation Trigger
-- Version: 009
-- Date: 2026-02-04
-- Description: Fix check_company_creation_limit to handle missing profiles
-- ================================================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS enforce_company_limit ON companies;
DROP FUNCTION IF EXISTS check_company_creation_limit();

-- Recreate function with better error handling
CREATE OR REPLACE FUNCTION check_company_creation_limit()
RETURNS TRIGGER AS $$
DECLARE
    v_user_type TEXT;
    v_company_count INTEGER;
BEGIN
    -- Get user type (default to business_owner if profile doesn't exist yet)
    SELECT COALESCE(user_type, 'business_owner') INTO v_user_type
    FROM user_profiles
    WHERE user_id = NEW.user_id;
    
    -- If no profile exists yet, default to business_owner with 1 company limit
    IF v_user_type IS NULL THEN
        v_user_type := 'business_owner';
        RAISE NOTICE 'No user profile found for user %, defaulting to business_owner', NEW.user_id;
    END IF;
    
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

-- Recreate trigger
CREATE TRIGGER enforce_company_limit
    BEFORE INSERT ON companies
    FOR EACH ROW
    EXECUTE FUNCTION check_company_creation_limit();

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Verify trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'enforce_company_limit';

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON FUNCTION check_company_creation_limit() 
  IS 'Enforces company creation limits based on user type. Business owners limited to 1 company, consultants unlimited. Handles missing user profiles gracefully.';
