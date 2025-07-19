# Password Reset Implementation

## Overview
The password reset flow has been updated to handle the recovery token format that Supabase sends in the email template (`?token=...&type=recovery`).

## Flow

1. **User requests password reset**
   - User goes to `/forgot-password`
   - Enters their email address
   - System sends reset email via Supabase

2. **Email is sent**
   - Supabase sends email with link to `/reset-password?token=TOKEN&type=recovery`
   - The link goes directly to the reset password page (no callback needed)

3. **User clicks the link**
   - Browser opens `/reset-password?token=TOKEN&type=recovery`
   - The page detects the recovery token in the URL parameters
   - Page attempts to verify the token using:
     - `supabase.auth.verifyOtp()` first
     - Falls back to `supabase.auth.exchangeCodeForSession()` if needed
   - Once verified, a session is established

4. **User resets password**
   - With the session established, user can enter new password
   - Password is updated using `supabase.auth.updateUser()`
   - User is signed out after successful update
   - Redirected to `/login` with success message

## Key Files

- `/src/app/reset-password/page.tsx` - Main reset password page that handles the token
- `/src/app/forgot-password/page.tsx` - Request reset page
- `/src/contexts/AuthContext.tsx` - Updated redirect URL to `/reset-password`
- `/src/app/api/auth/reset-password/route.ts` - API endpoint for sending reset emails

## Important Notes

- The old `/auth/reset-password` page has been removed
- All redirect URLs now point directly to `/reset-password`
- The implementation handles both `token` and `token_hash` parameters
- Tokens are cleaned from the URL after verification for security
- The flow is simpler and more direct than the previous callback-based approach

## Supabase Configuration

Make sure your Supabase email template uses:
```
{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery
```

This matches the implementation and ensures the flow works correctly.