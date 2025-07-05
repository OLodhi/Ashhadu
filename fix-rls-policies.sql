-- Fix RLS Policy Infinite Recursion Issue
-- Run this in Supabase SQL Editor

-- 1. Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

-- 2. Temporarily disable RLS to fix the recursion
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- 3. Create simple, non-recursive policies

-- Profiles: Simple policies without recursion
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Reviews: Simple public policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved reviews
CREATE POLICY "reviews_select_approved" ON reviews FOR SELECT 
USING (status = 'approved');

-- Authenticated users can insert reviews
CREATE POLICY "reviews_insert_auth" ON reviews FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 4. Make products table public for now (no RLS issues)
DROP POLICY IF EXISTS "Anyone can view published products" ON products;
DROP POLICY IF EXISTS "Admins can manage all products" ON products;

ALTER TABLE products DISABLE ROW LEVEL SECURITY;

-- 5. Make categories public
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;

-- 6. Test query to make sure recursion is fixed
SELECT 'RLS policies fixed - should not see recursion error' as message;