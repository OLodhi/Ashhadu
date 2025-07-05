-- Check what's causing the database error
-- Run this in Supabase SQL Editor

-- 1. Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- 2. Check if the trigger function exists
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name LIKE '%profile%';

-- 3. Check current user count to see if ANY users exist
SELECT COUNT(*) as total_users FROM auth.users;

-- 4. Try to manually create a test user to see the exact error
-- This will help us see what's failing
DO $$
BEGIN
    -- Try to insert a test profile
    INSERT INTO profiles (user_id, email, full_name, role)
    VALUES ('00000000-0000-0000-0000-000000000000', 'test@example.com', 'Test User', 'customer');
    
    RAISE NOTICE 'Profile insert succeeded';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Profile insert failed: %', SQLERRM;
END $$;

-- 5. Check if email is already in use
SELECT email, created_at FROM auth.users WHERE email = 'o.lodhi@me.com';