# Password Reset Fix Documentation

## Problem Description
Users were experiencing "Invalid Reset Link" errors when clicking password reset links from emails. The issue occurred because:

1. **Incorrect Redirect URL Flow**: The password reset was trying to redirect directly to `/auth/reset-password` without going through the proper OAuth callback flow
2. **Missing Token Exchange**: Supabase sends a code in the email link that needs to be exchanged for session tokens via the callback route
3. **URL Mismatch**: The redirect URLs weren't properly configured in Supabase Dashboard

## Root Cause Analysis

### How Supabase Password Reset Works:
1. User requests password reset
2. Supabase sends email with a link containing a `code` parameter
3. The link should point to `/auth/callback` (not directly to reset page)
4. The callback route exchanges the code for session tokens
5. Only then can the user access the password reset form

### What Was Happening:
- Links were trying to go directly to `/auth/reset-password`
- No code exchange was happening
- Supabase rejected the request as invalid

## Solution Implemented

### 1. Updated Password Reset Flow
Changed all password reset emails to use the callback route:
```typescript
// Before: ${siteUrl}/auth/reset-password
// After: ${siteUrl}/auth/callback?next=/auth/reset-password
```

### 2. Enhanced Callback Route (`/auth/callback/route.ts`)
- Added error handling for auth errors
- Added special handling for password reset flows
- Passes session tokens to the reset password page

### 3. Updated Reset Password Page (`/auth/reset-password/page.tsx`)
- Added support for both hash and query parameter token formats
- Enhanced logging for debugging
- Handles multiple token format variations

### 4. Fixed API Routes
- Updated `/api/auth/reset-password/route.ts` to use callback URL
- Updated `AuthContext.tsx` to use callback URL

## Required Supabase Configuration

### CRITICAL: Add these URLs to Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to your project
3. Go to **Authentication** → **URL Configuration**
4. Add these to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

### Email Template (Optional)
The default Supabase email template should work, but if customizing:
1. Go to **Authentication** → **Email Templates**
2. Select **Reset Password**
3. Ensure the link uses: `{{ .SiteURL }}/auth/callback?code={{ .Token }}&next=/auth/reset-password`

## Testing Instructions

### 1. Test Password Reset Flow
```bash
# Start dev server
npm run dev

# Visit http://localhost:3000/forgot-password
# Enter email and submit
# Check email and click link
# Should redirect to password reset form
```

### 2. Debug Endpoints
Created debug endpoint for testing:
```bash
# Check configuration
curl http://localhost:3000/api/debug/check-reset-email

# Test sending reset email
curl -X POST http://localhost:3000/api/debug/check-reset-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. Check Browser Console
The reset password page now logs:
- Full URL received
- Token extraction attempts
- Session establishment status
- Any errors encountered

## Common Issues and Solutions

### Issue: Still getting "Invalid Reset Link"
**Solution**: Ensure `http://localhost:3000/auth/callback` is added to Supabase Redirect URLs

### Issue: Email link opens but shows error
**Causes**:
1. Link already used (they're single-use)
2. Link expired (1 hour timeout)
3. Redirect URL not configured in Supabase

### Issue: Tokens not found
**Solution**: Check browser console for token format - the page now handles multiple formats

## Code Flow Diagram

```
1. User enters email on /forgot-password
   ↓
2. AuthContext.resetPassword() called
   ↓
3. Supabase sends email with link:
   /auth/callback?code=XXX&next=/auth/reset-password
   ↓
4. User clicks link
   ↓
5. /auth/callback exchanges code for session
   ↓
6. Redirects to /auth/reset-password with tokens
   ↓
7. Reset page validates tokens and shows form
   ↓
8. User submits new password
   ↓
9. Password updated via authenticated session
```

## Environment Variables
Ensure these are set correctly:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Development
NEXT_PUBLIC_SITE_URL=https://yourdomain.com # Production
```

## Production Deployment Checklist

- [ ] Update `NEXT_PUBLIC_SITE_URL` to production domain
- [ ] Add production callback URL to Supabase Redirect URLs
- [ ] Test password reset flow in production
- [ ] Monitor error logs for any issues
- [ ] Ensure email delivery is working

## Monitoring

Check these logs for issues:
1. Browser console on reset password page
2. Server logs for callback route
3. Supabase Dashboard → Logs → Auth logs

## Support

If issues persist after following this guide:
1. Check Supabase Dashboard auth logs
2. Verify redirect URLs are exactly as specified
3. Clear browser cache and try incognito mode
4. Check email spam folder
5. Ensure using latest reset email (old ones expire)