-- Complete Fix for Addresses RLS Policy Issues
-- This fixes the "new row violates row-level security policy for table addresses" error
-- Run this SQL in your Supabase SQL Editor

-- ISSUE ANALYSIS:
-- The main problem is that the customers table is missing an INSERT policy,
-- which breaks the policy chain: auth.uid() → customers → addresses
-- The addresses table policies depend on customer records existing, but users can't create them.

-- 1. First, let's clean up existing conflicting policies
DROP POLICY IF EXISTS "Users can view own customer data" ON customers;
DROP POLICY IF EXISTS "Users can update own customer data" ON customers;
DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;

-- Drop policies that might conflict from previous fixes
DROP POLICY IF EXISTS "Users can insert as customer" ON customers;
DROP POLICY IF EXISTS "Users can view their own customer data" ON customers;
DROP POLICY IF EXISTS "Users can update their own customer data" ON customers;

-- 2. CRITICAL FIX: Create INSERT policy for customers table
-- This is the missing piece that's causing the addresses insert to fail

CREATE POLICY "Users can insert customer record" ON customers
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Allow users to view their own customer data
CREATE POLICY "Users can view own customer data" ON customers
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Allow users to update their own customer data
CREATE POLICY "Users can update own customer data" ON customers
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL 
        AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- 3. Create comprehensive policies for addresses table
-- These use the corrected policy chain: auth.uid() → auth.users.email → customers → addresses

-- Allow users to view their own addresses
CREATE POLICY "Users can view own addresses" ON addresses
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL 
        AND customer_id IN (
            SELECT id FROM customers 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Allow users to insert addresses for their customer record
CREATE POLICY "Users can insert own addresses" ON addresses
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL 
        AND customer_id IN (
            SELECT id FROM customers 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Allow users to update their own addresses
CREATE POLICY "Users can update own addresses" ON addresses
    FOR UPDATE
    USING (
        auth.uid() IS NOT NULL 
        AND customer_id IN (
            SELECT id FROM customers 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- Allow users to delete their own addresses
CREATE POLICY "Users can delete own addresses" ON addresses
    FOR DELETE
    USING (
        auth.uid() IS NOT NULL 
        AND customer_id IN (
            SELECT id FROM customers 
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

-- 4. Ensure admin policies still work
CREATE POLICY "Admins can manage all customers" ON customers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage all addresses" ON addresses FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON auth.users TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.customers TO authenticated;
GRANT ALL ON public.addresses TO authenticated;

-- 6. Fix the database trigger for new users
-- Ensure it has proper security context
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

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. DEBUGGING QUERIES FOR YOUR SPECIFIC USER
-- Run these to check if the policy chain is working correctly

-- Check user exists
SELECT 
    'User Check' as test,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed
FROM auth.users 
WHERE id = '5daf7865-fd18-4360-b3f2-81c76ead5316';

-- Check profile exists
SELECT 
    'Profile Check' as test,
    id,
    user_id,
    email,
    role
FROM profiles 
WHERE user_id = '5daf7865-fd18-4360-b3f2-81c76ead5316';

-- Check customer exists
SELECT 
    'Customer Check' as test,
    id,
    email,
    first_name,
    last_name,
    created_at
FROM customers 
WHERE email = (
    SELECT email FROM auth.users WHERE id = '5daf7865-fd18-4360-b3f2-81c76ead5316'
);

-- Verify the expected customer ID matches
SELECT 
    'Customer ID Verification' as test,
    c.id as actual_customer_id,
    'f4961d08-7eba-438f-a703-c148f88da070' as expected_customer_id,
    c.id = 'f4961d08-7eba-438f-a703-c148f88da070' as ids_match
FROM customers c
WHERE email = (
    SELECT email FROM auth.users WHERE id = '5daf7865-fd18-4360-b3f2-81c76ead5316'
);

-- Test the policy chain - this should return true if policies will work
SELECT 
    'Policy Chain Test' as test,
    'f4961d08-7eba-438f-a703-c148f88da070' IN (
        SELECT id FROM customers 
        WHERE email = (SELECT email FROM auth.users WHERE id = '5daf7865-fd18-4360-b3f2-81c76ead5316')
    ) as address_insert_should_work;

-- 8. MANUAL CUSTOMER RECORD CREATION (if needed)
-- If the trigger didn't create the customer record, create it manually
INSERT INTO customers (id, email, first_name, last_name, created_at, updated_at)
SELECT 
    'f4961d08-7eba-438f-a703-c148f88da070'::uuid,
    email,
    COALESCE(raw_user_meta_data->>'first_name', ''),
    COALESCE(raw_user_meta_data->>'last_name', ''),
    NOW(),
    NOW()
FROM auth.users 
WHERE id = '5daf7865-fd18-4360-b3f2-81c76ead5316'
ON CONFLICT (email) DO NOTHING;

-- 9. Test address insertion (simulated)
-- This tests if the policy would allow the address insert
SELECT 
    'Address Insert Test' as test,
    CASE 
        WHEN 'f4961d08-7eba-438f-a703-c148f88da070' IN (
            SELECT id FROM customers 
            WHERE email = (SELECT email FROM auth.users WHERE id = '5daf7865-fd18-4360-b3f2-81c76ead5316')
        ) THEN 'SUCCESS: Address insertion should work'
        ELSE 'FAILED: Address insertion will still fail - customer record issue'
    END as result;

-- 10. Summary message
SELECT 
    'RLS Policy Fix Complete' as status,
    'Run the debugging queries above to verify the fix worked' as next_steps;

COMMIT;