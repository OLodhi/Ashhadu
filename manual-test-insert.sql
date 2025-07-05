-- Manual test to verify database is working
-- Run this in Supabase SQL Editor

-- Check if auth.users has any users
SELECT COUNT(*) as auth_users_count FROM auth.users;

-- Check profiles table
SELECT COUNT(*) as profiles_count FROM profiles;

-- Check customers table  
SELECT COUNT(*) as customers_count FROM customers;

-- Try a manual insert into profiles (replace with a real user_id if you have one)
-- First, let's see if there are any users we can use
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- If you see users above, take one ID and run this (replace the UUID):
-- INSERT INTO profiles (user_id, email, full_name, role)
-- VALUES ('your-user-id-here', 'user-email@example.com', 'Test User', 'customer')
-- ON CONFLICT (user_id) DO NOTHING;