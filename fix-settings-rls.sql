-- Fix RLS policies for site_settings table
-- The current policies are too restrictive and prevent frontend components from accessing settings

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON site_settings;

-- Create new policies that allow public read access but admin-only write access
-- This allows the SettingsContext to work for all users while maintaining security

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

-- No one can delete settings (prevent accidental deletion)
-- DELETE operations are not allowed by default when no policy exists

-- Refresh the policies
SELECT 'RLS policies updated successfully for site_settings table' as result;