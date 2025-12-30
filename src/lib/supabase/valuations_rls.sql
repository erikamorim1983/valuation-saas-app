-- Enable RLS logic for the valuations table
ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Users can view their own valuations
CREATE POLICY "Users can view own valuations" 
ON valuations FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- 2. Policy: Users can insert their own valuations
CREATE POLICY "Users can insert own valuations" 
ON valuations FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 3. Policy: Users can update their own valuations
CREATE POLICY "Users can update own valuations" 
ON valuations FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- 4. Policy: Users can delete their own valuations
CREATE POLICY "Users can delete own valuations" 
ON valuations FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);
