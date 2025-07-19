# Password Reset Troubleshooting Guide

## Current Issue

The password reset is failing with "verification_failed: Unable to verify the confirmation link" error.

## Root Cause

The issue is likely due to a mismatch between:
1. What the Supabase email template is sending
2. What our code is expecting to receive

## Solution

### Option 1: Update Email Template (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to Authentication → Email Templates
   - Select "Reset Password" template

2. **Replace the template with:**
   ```html
   <h2>Reset Password</h2>
   <p>Follow this link to reset the password for your user:</p>
   <p>
     <a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a>
   </p>
   ```

3. **Key Changes:**
   - Uses `{{ .TokenHash }}` instead of `{{ .Token }}`
   - Parameter is `token_hash` not `token`
   - Links directly to `/reset-password`

### Option 2: If You Can't Change the Email Template

If the email template is sending `token` instead of `token_hash`, you have limited options:

1. **Check what's being sent:**
   - Use the test page at `/test-reset` to see the exact parameters
   - Copy the reset link from email and change `/reset-password` to `/test-reset`

2. **Current Limitation:**
   - If the email sends a 6-digit OTP code (like "123456"), our current implementation won't work
   - The 6-digit OTP requires the user's email address for verification
   - The token_hash approach is more secure and doesn't require additional user input

## How to Verify the Issue

1. **Check Console Logs:**
   - Open browser developer tools
   - Look for logs starting with "🔍 URL parameters:"
   - Check if you see `token` or `token_hash`

2. **Check Token Format:**
   - A valid `token_hash` is a long string (40+ characters)
   - A 6-digit OTP is just numbers like "123456"

## Testing the Fix

1. Update the email template as shown above
2. Request a new password reset
3. Check the email - the link should contain `token_hash` parameter
4. Click the link and check console logs for successful verification

## Alternative Approaches

If you must use the 6-digit OTP:

1. Create a different flow where users enter their email AND the 6-digit code
2. Use a two-step process:
   - Step 1: Enter email
   - Step 2: Enter 6-digit code from email

But this is less user-friendly than the direct link approach.

## Common Errors and Solutions

### "verification_failed"
- **Cause:** Wrong token format or expired token
- **Solution:** Update email template to use `{{ .TokenHash }}`

### "Token has expired"
- **Cause:** Link is older than 1 hour
- **Solution:** Request a new password reset

### "Invalid refresh token"
- **Cause:** Session expired during the process
- **Solution:** Start the process again

## Need More Help?

1. Check Supabase Dashboard logs for detailed error messages
2. Ensure your Supabase URL and anon key are correct
3. Verify redirect URLs are configured in Supabase dashboard