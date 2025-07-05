-- TEMPORARY FIX: Disable RLS to allow signup to work
-- WARNING: This is a temporary solution. Re-enable RLS after fixing the root cause.

-- Disable RLS on profiles and customers tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'customers');

-- To re-enable RLS later, run:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;