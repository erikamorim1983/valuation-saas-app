-- Fix: Make full_name nullable since it's filled during onboarding
-- Run this in Supabase SQL Editor

ALTER TABLE user_profiles 
ALTER COLUMN full_name DROP NOT NULL;

-- Also drop the length constraint since it will be empty initially
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS full_name_length;

-- Add new constraint: if full_name is provided, must be at least 2 chars
ALTER TABLE user_profiles
ADD CONSTRAINT full_name_length CHECK (
    full_name IS NULL OR char_length(full_name) >= 2
);
