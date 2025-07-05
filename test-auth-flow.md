# Authentication Flow Test

## Current Implementation
1. **Header Component**: Has a simple `<Link href="/account">` 
2. **Middleware**: Intercepts requests to `/account` and checks authentication
3. **Expected Behavior**:
   - Not logged in → Redirect to `/login?redirectTo=/account`
   - Logged in → Show account dashboard

## Test Steps
1. Make sure you're not logged in (clear cookies/use incognito)
2. Click the account icon in the header
3. You should be redirected to `/login?redirectTo=/account`

## How It Works
The middleware runs on every request and:
```typescript
// If user is not authenticated and trying to access protected routes
if (!session && isCustomerProtected) {
  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('redirectTo', pathname);
  return NextResponse.redirect(loginUrl);
}
```

This should already be working without any changes!