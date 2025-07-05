-- Debug authentication - Check what data exists
-- Run this in Supabase SQL Editor to see what happened

-- Check if any users were created in auth.users
SELECT id, email, created_at, email_confirmed_at, confirmed_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- Check profiles table
SELECT * FROM profiles ORDER BY created_at DESC LIMIT 10;

-- Check customers table  
SELECT * FROM customers ORDER BY created_at DESC LIMIT 10;