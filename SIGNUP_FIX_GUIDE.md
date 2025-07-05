# Signup Issue Fix Guide

## Problem Summary
When users sign up, the auth.users record is created successfully, but the profiles and customers tables remain empty.

## Root Causes
1. **Row Level Security (RLS) policies** are blocking inserts
2. **Missing permissions** for authenticated users to create their own profiles
3. **Email confirmation** might be enabled, preventing immediate profile creation

## Solutions Implemented

### 1. Enhanced Error Logging
Updated `AuthContext.tsx` to provide detailed error logging during signup and profile creation.

### 2. API Route Fallback
Created `/api/auth/create-profile` that uses the service role key to bypass RLS when creating profiles.

### 3. SQL Scripts
Created three SQL scripts to fix the issue:

#### A. `fix-auth-permissions.sql` (Recommended)
- Sets up proper RLS policies
- Creates a database trigger to automatically create profiles on signup
- Grants necessary permissions

#### B. `temporary-disable-rls.sql` (Quick Fix)
- Temporarily disables RLS on profiles and customers tables
- Use this for immediate testing, but re-enable RLS afterward

#### C. `debug-auth.sql`
- Helps diagnose what data exists in the database

## Testing Steps

### 1. Apply Database Fixes
Run ONE of these in Supabase SQL Editor:

```sql
-- Option A: Fix permissions properly (recommended)
-- Copy contents of fix-auth-permissions.sql

-- Option B: Quick temporary fix
-- Copy contents of temporary-disable-rls.sql
```

### 2. Test Signup Flow
1. Open browser console (F12)
2. Go to /signup
3. Create a new account
4. Watch console for detailed logs
5. Check Supabase dashboard for created records

### 3. Verify Data Creation
Run in Supabase SQL Editor:
```sql
-- Check recent signups
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check profiles
SELECT * FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Check customers
SELECT * FROM customers 
ORDER BY created_at DESC 
LIMIT 5;
```

## Environment Variables Required
Make sure `.env.local` contains:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Debugging Checklist
- [ ] Check browser console for errors
- [ ] Verify environment variables are set
- [ ] Check Supabase dashboard logs
- [ ] Ensure email confirmation is configured correctly
- [ ] Verify RLS policies or disable temporarily
- [ ] Check if service role key is set for API route

## Common Error Codes
- `42501`: Permission denied (RLS blocking)
- `23505`: Unique constraint violation (record already exists)
- `PGRST116`: No rows found
- `PGRST301`: Unauthorized access

## Next Steps After Fix
1. Re-enable RLS if disabled: `ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;`
2. Test with multiple user accounts
3. Monitor for any new errors
4. Consider implementing email verification flow properly