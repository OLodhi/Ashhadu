# Settings RLS Policy Fix

## Problem Identified

The Apple Pay setting appears as `false` in the modal despite being set to `true` in the admin settings because of overly restrictive Row Level Security (RLS) policies on the `site_settings` table.

### Root Cause Analysis

1. **Database State**: Apple Pay is correctly set to `true` in the database
2. **RLS Policy Issue**: The current RLS policies only allow admins to view settings
3. **SettingsContext Failure**: The SettingsContext uses the anonymous Supabase key, which can't access the settings
4. **Fallback to Defaults**: When settings can't be fetched, the context falls back to default values
5. **Default Value**: The default value for `payment_apple_pay_enabled` is `false`

### Current RLS Policies (Problematic)

```sql
-- Only admins can view settings
CREATE POLICY "Admins can view settings" ON site_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
```

### Issue Impact

- SettingsContext returns 0 settings when queried with anonymous key
- All payment method toggles fall back to default values
- Apple Pay shows as disabled despite being enabled in admin
- Affects all frontend components that depend on settings

## Solution

The RLS policies need to be updated to allow public read access to settings while maintaining admin-only write access.

### Required SQL Commands

Execute these commands in the Supabase SQL editor:

```sql
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON site_settings;

-- Allow everyone to read settings (for frontend functionality)
CREATE POLICY "Public can view settings" ON site_settings
    FOR SELECT
    USING (true);

-- Only authenticated admins can update settings
CREATE POLICY "Admins can update settings" ON site_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only authenticated admins can insert settings (for data migrations)
CREATE POLICY "Admins can insert settings" ON site_settings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
```

### Security Considerations

This change is safe because:

1. **Public Settings**: All current settings in the table are frontend-related and should be publicly accessible
2. **No Sensitive Data**: Settings like payment method availability, store info, and shipping costs are not sensitive
3. **Read-Only Access**: Public users can only read settings, not modify them
4. **Admin Protection**: Only authenticated admins can create, update, or delete settings

### How to Apply the Fix

1. Go to the Supabase dashboard: https://supabase.com/dashboard/project/wqdcwlizdhttortnxhzw/sql
2. Copy and paste the SQL commands from the "Required SQL Commands" section above
3. Execute the commands
4. Test the fix by refreshing the frontend application

### Verification Steps

After applying the fix:

1. **Test SettingsContext**: Run `node debug-settings-context.js` - should show all settings
2. **Test Payment Modal**: Open the payment method modal - Apple Pay should be available
3. **Test Admin Settings**: Verify admin can still view and modify settings
4. **Test API Endpoint**: Test `/api/settings` - should return all settings

### Files Involved

- `/supabase-settings-schema.sql` - Contains the original problematic RLS policies
- `/src/contexts/SettingsContext.tsx` - Uses anonymous key to fetch settings
- `/src/components/payments/AddPaymentMethodModal.tsx` - Shows the issue with Apple Pay
- `/fix-settings-rls.sql` - Contains the SQL commands to fix the issue

## Alternative Solutions Considered

1. **Use Service Role Key in SettingsContext**: Not secure, exposes admin privileges to frontend
2. **Create Public Settings Table**: Unnecessarily complex, all current settings are public
3. **Settings API with Auth**: Over-engineered for the current use case

The chosen solution (public read access) is the most appropriate for the current requirements.