-- Quick fix for RLS INSERT policy on user_profiles
-- Run this in Supabase SQL Editor if the INSERT is being blocked

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- Create proper INSERT policy
CREATE POLICY "Users can insert their own profile" ON user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Verify RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Check existing policies (for debugging)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'user_profiles';
