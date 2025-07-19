# Supabase Email Template Setup for Password Reset

## Important: Email Template Configuration

For the password reset flow to work correctly, you need to update the email template in your Supabase dashboard.

### Steps to Configure:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to Authentication → Email Templates

2. **Update the "Reset Password" Template**
   
   Replace the default template with this:

   ```html
   <h2>Reset Password</h2>

   <p>Follow this link to reset the password for your user:</p>
   <p>
     <a href="{{ .SiteURL }}/reset-password?token_hash={{ .TokenHash }}&type=recovery">Reset Password</a>
   </p>
   ```

   **Key Points:**
   - Uses `{{ .TokenHash }}` instead of `{{ .Token }}`
   - Links directly to `/reset-password` (not `/auth/confirm`)
   - Includes `token_hash` parameter (not `token`)
   - Includes `type=recovery` parameter

3. **Update the Redirect URL** (if needed)
   - Go to Authentication → URL Configuration
   - Ensure `http://localhost:3000` is in the allowed redirects
   - In production, add your production URL

### Why This Matters:

- `{{ .Token }}` sends a 6-digit OTP code (like "123456")
- `{{ .TokenHash }}` sends a hash that can be verified with `verifyOtp`
- Our implementation expects `token_hash` for the PKCE flow

### Testing:

1. Request a password reset
2. Check the email - the link should look like:
   ```
   http://localhost:3000/reset-password?token_hash=7d5b7b1964cf5d388340a7f04f1dbb5eeb6c7b52ef8270e1737a58d0&type=recovery
   ```

3. The token_hash should be a long alphanumeric string, not a 6-digit code

### Alternative: Using OTP Code

If you prefer to use the 6-digit OTP code instead:

1. Keep the email template with `{{ .Token }}`
2. Update the reset-password page to accept the OTP code
3. Use `verifyOtp` with `token` instead of `token_hash`

But the token_hash approach is more secure and recommended for web applications.