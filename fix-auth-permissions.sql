-- Fix permissions for profile and customer creation during signup
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on tables (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can insert as customer" ON customers;
DROP POLICY IF EXISTS "Users can view their own customer data" ON customers;
DROP POLICY IF EXISTS "Users can update their own customer data" ON customers;

-- 3. Create profiles policies
-- Allow authenticated users to create their own profile
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- 4. Create customers policies
-- Allow authenticated users to create customer record
CREATE POLICY "Users can insert as customer" ON customers
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'email' = email);

-- Allow users to view their own customer data
CREATE POLICY "Users can view their own customer data" ON customers
    FOR SELECT
    USING (auth.jwt() ->> 'email' = email);

-- Allow users to update their own customer data
CREATE POLICY "Users can update their own customer data" ON customers
    FOR UPDATE
    USING (auth.jwt() ->> 'email' = email);

-- 5. Create database trigger to automatically create profile after signup
-- This ensures profile is created even if the client-side code fails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Create profile entry
    INSERT INTO public.profiles (user_id, email, full_name, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(
            new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name',
            new.email
        ),
        'customer'
    );
    
    -- Create customer entry
    INSERT INTO public.customers (email, first_name, last_name, phone, marketing_consent)
    VALUES (
        new.email,
        COALESCE(new.raw_user_meta_data->>'first_name', ''),
        COALESCE(new.raw_user_meta_data->>'last_name', ''),
        new.raw_user_meta_data->>'phone',
        COALESCE((new.raw_user_meta_data->>'marketing_consent')::boolean, false)
    );
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger to run after user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 7. Test the permissions
-- This should return the current user's ID if logged in
SELECT auth.uid();

-- 8. Check if email confirmation is required
SELECT 
    CASE 
        WHEN current_setting('auth.settings.email_confirm', true) = 'true' THEN 'Email confirmation is ENABLED'
        ELSE 'Email confirmation is DISABLED'
    END as email_confirmation_status;