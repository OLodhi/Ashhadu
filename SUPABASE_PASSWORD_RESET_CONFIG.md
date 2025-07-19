# Supabase Password Reset Configuration Guide

## Issue Description
The password reset functionality was failing with "Invalid Reset Link" error. This was caused by incorrect redirect URL configuration in Supabase.

## Root Cause
The main issues were:
1. **Redirect URL Configuration**: The redirect URL `http://localhost:3000/reset-password` needs to be configured in Supabase Dashboard
2. **Token Format Handling**: Different Supabase configurations can send tokens in different formats
3. **URL Consistency**: Mismatched URLs between environment config and actual usage

## Solution Applied

### 1. Code Fixes

#### AuthContext.tsx
- **Fixed redirect URL**: Now uses `NEXT_PUBLIC_SITE_URL` environment variable for consistency
- **Added debug logging**: Better error tracking and debugging information
- **Removed captcha requirement**: Ensures password reset doesn't require captcha

#### Reset Password Page
- **Enhanced session handling**: Now properly handles Supabase auth state changes
- **Added loading states**: Shows validation progress to users
- **Improved error detection**: Checks for URL errors and invalid tokens
- **Auth redirect listener**: Listens for PASSWORD_RECOVERY events from Supabase
- **Comprehensive token extraction**: Handles hash and search parameter formats

### 2. Required Supabase Dashboard Configuration

#### Step 1: Configure Redirect URLs
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to **Authentication** → **URL Configuration**
4. Add the following URLs to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

#### Step 2: Configure Email Templates (Optional)
1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password** template
3. Ensure the reset link format is correct:
   ```
   {{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
   ```

#### Step 3: Verify Site URL
1. Go to **Settings** → **General**
2. Ensure **Site URL** matches your `NEXT_PUBLIC_SITE_URL` environment variable
3. For development: `http://localhost:3000`
4. For production: `https://yourdomain.com`

### 3. Environment Configuration

Ensure your `.env.local` file has the correct site URL:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For production, this should be:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## Token Format Handling

The reset password page now handles multiple token formats:

### Format 1: Direct Session Tokens (Hash)
```
http://localhost:3000/reset-password#access_token=...&refresh_token=...
```

### Format 2: Recovery Tokens (Query Params)
```
http://localhost:3000/reset-password?token=...&type=recovery
```

### Format 3: Search Parameters
```
http://localhost:3000/reset-password?access_token=...&refresh_token=...
```

## Testing the Fix

### 1. Test Password Reset Flow
1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/forgot-password`
3. Enter a valid email address
4. Check the browser console for debug logs
5. Check your email for the reset link
6. Click the reset link and verify it works

### 2. Debug Information
The reset password page now logs extensive debug information:
- Current URL and parameters
- Token extraction attempts
- Session verification results
- Error details

### 3. Error Scenarios
The page now handles these scenarios gracefully:
- Expired tokens
- Invalid tokens
- Missing tokens
- Network errors
- Various token formats

## Additional Improvements

### User Experience
- **Better error messages**: Users now get helpful troubleshooting tips
- **Loading states**: Clear indication when processing tokens
- **Fallback handling**: Multiple methods to extract and verify tokens

### Security
- **Token validation**: Comprehensive token verification
- **Session management**: Proper session handling with Supabase
- **Error logging**: Detailed logging for debugging without exposing sensitive data

## Common Issues and Solutions

### Issue: "AuthApiError: Email link is invalid or has expired"
**Root Cause**: This error occurs when the token in the reset link cannot be verified by Supabase.

**Solutions**:
1. **Check redirect URL configuration**: Ensure `http://localhost:3000/auth/callback` is in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs
2. **Verify site URL**: Ensure Site URL in Supabase matches `NEXT_PUBLIC_SITE_URL` environment variable
3. **Check token expiration**: Reset tokens expire after 1 hour - request a new one if expired
4. **Clear browser cache**: Sometimes cached auth state can interfere
5. **Try incognito mode**: Test in private browsing to rule out browser issues
6. **Check auth callback route**: Ensure the `/auth/callback` route is properly configured and accessible

### Issue: "Invalid Reset Link" Error
**Solution**: Ensure the redirect URL is configured in Supabase Dashboard

### Issue: Tokens Not Found
**Solution**: Check that the email template includes proper token parameters

### Issue: Expired Tokens
**Solution**: Tokens expire after 1 hour - user needs to request a new reset

### Issue: URL Mismatch
**Solution**: Ensure `NEXT_PUBLIC_SITE_URL` matches Supabase Site URL configuration

### Issue: Reset Link Opens But Shows Error Immediately
**Solutions**:
1. Check browser console for detailed error messages
2. Verify the reset link wasn't already used (links are single-use)
3. Ensure you're using the latest reset email (older ones become invalid)
4. Check that the domain in the reset link matches your configured redirect URLs

## Production Deployment

Before deploying to production:

1. **Update Environment Variables**:
   ```env
   NEXT_PUBLIC_SITE_URL=https://yourdomain.com
   ```

2. **Configure Supabase URLs**:
   - Add production domain to redirect URLs
   - Update site URL in Supabase settings

3. **Test Email Delivery**:
   - Verify email templates work with production domain
   - Test complete password reset flow

4. **Monitor Logs**:
   - Check browser console for any errors
   - Monitor Supabase logs for authentication issues

## Support and Troubleshooting

If issues persist:
1. Check browser console for debug logs
2. Verify Supabase dashboard configuration
3. Confirm environment variables are correct
4. Test with a fresh email request
5. Check email spam folder

For additional support, refer to:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Password Reset Guide](https://supabase.com/docs/guides/auth/auth-password-reset)