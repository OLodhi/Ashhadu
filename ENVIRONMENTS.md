# Environment Configuration Guide

## Overview

This project uses three distinct environments to ensure safe development and deployment:

- **Production**: Live site with real payments and data
- **Preview**: Branch deployments with test keys for safe testing
- **Development**: Local development with test keys

## Environment URLs

| Environment | URL | Database | Payment Keys |
|-------------|-----|----------|--------------|
| Production | https://ashhadu-islamic-art.vercel.app | Production Supabase | Live Stripe/PayPal |
| Preview | https://[branch-name]-ashhadu-islamic-art.vercel.app | Production Supabase | Test Stripe/PayPal |
| Development | http://localhost:3000 | Production Supabase | Test Stripe/PayPal |

## Environment Variables Configuration

### Production Only
```
STRIPE_SECRET_KEY=sk_live_*
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_*
NEXT_PUBLIC_PAYPAL_CLIENT_ID=[live-paypal-id]
PAYPAL_CLIENT_SECRET=[live-paypal-secret]
PAYPAL_ENVIRONMENT=production
NEXT_PUBLIC_SITE_URL=https://ashhadu-islamic-art.vercel.app
```

### Preview + Development
```
STRIPE_SECRET_KEY=sk_test_*
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_*
NEXT_PUBLIC_PAYPAL_CLIENT_ID=[sandbox-paypal-id]
PAYPAL_CLIENT_SECRET=[sandbox-paypal-secret]
PAYPAL_ENVIRONMENT=sandbox
NEXT_PUBLIC_SITE_URL= (empty for preview - auto-detected)
```

### All Environments
```
NEXT_PUBLIC_SUPABASE_URL=https://wqdcwlizdhttortnxhzw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[shared-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[shared-service-key]
RESEND_API_KEY=[resend-api-key]
```

## Development Workflow

### 1. Local Development
```bash
# Start local development server
npm run dev

# Access: http://localhost:3000
# Uses: Test payment keys, production database
```

### 2. Preview Deployment
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# Vercel automatically creates preview deployment
# Access: https://feature-new-feature-ashhadu-islamic-art.vercel.app
# Uses: Test payment keys, production database
```

### 3. Production Deployment
```bash
# Merge to main branch
git checkout main
git merge feature/new-feature
git push origin main

# Deploys to production
# Access: https://ashhadu-islamic-art.vercel.app
# Uses: Live payment keys, production database
```

## Testing Strategy

### Payment Testing
- **Development/Preview**: Use Stripe test cards (4242 4242 4242 4242)
- **Production**: Real payment processing

### Database Testing
- All environments currently share the same Supabase database
- Use different product statuses (draft vs published) to test safely

### Feature Testing
1. Develop locally with `npm run dev`
2. Test in preview deployment with real URL
3. Deploy to production when ready

## Security Notes

- Production uses live payment keys - handle with care
- Preview deployments are publicly accessible but use test keys
- All environments require proper authentication for admin features
- Database access is controlled by Row Level Security (RLS) policies

## Troubleshooting

### Check Environment Configuration
Visit these URLs to verify configuration:
- Production: `https://ashhadu-islamic-art.vercel.app/api/health`
- Preview: `https://[branch-name]-ashhadu-islamic-art.vercel.app/api/health`
- Development: `http://localhost:3000/api/health`

### Common Issues
1. **Wrong payment keys**: Check environment in Vercel dashboard
2. **Database connection**: Verify Supabase keys match your project
3. **Preview not working**: Ensure branch is pushed to GitHub

## Environment Variable Management

### In Vercel Dashboard:
1. Go to Project → Settings → Environment Variables
2. Set appropriate environment targets:
   - Production only: Live payment keys
   - Preview + Development: Test payment keys
   - All environments: Database and other shared config

### In Local Development:
- Use `.env.local` for local configuration
- Never commit real API keys to git
- Use `.env.local.example` for sharing configuration templates