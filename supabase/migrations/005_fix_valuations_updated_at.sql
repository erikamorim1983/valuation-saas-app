-- Migration to fix valuations table updated_at column and trigger

-- 1. Ensure updated_at column exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'valuations' AND column_name = 'updated_at') THEN
        ALTER TABLE valuations ADD COLUMN updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- 2. Ensure handle_updated_at function exists (it should, but just in case)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = timezone('utc'::text, now());
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 3. Add trigger to valuations table
DROP TRIGGER IF EXISTS on_valuation_updated ON valuations;
CREATE TRIGGER on_valuation_updated
  BEFORE UPDATE ON valuations
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
