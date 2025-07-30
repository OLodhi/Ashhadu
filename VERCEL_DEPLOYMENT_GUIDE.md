# Vercel Deployment Guide - Ashhadu Islamic Art

## 🚀 Step-by-Step Deployment Instructions

### Pre-deployment Checklist ✅
- [x] Updated Next.js configuration for production
- [x] Created vercel.json deployment configuration
- [x] Prepared production environment variables
- [x] Optimized assets (7.4MB video file is acceptable)

### Phase 1: Repository Setup

1. **Ensure Latest Code is Pushed**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

### Phase 2: Vercel Project Setup

1. **Connect GitHub Repository**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import from GitHub: `OLodhi/Ashhadu`
   - Framework: Next.js (should auto-detect)

2. **Project Configuration**
   - Project Name: `ashhadu-islamic-art`
   - Framework: Next.js
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-configured)
   - Output Directory: `.next` (auto-configured)
   - Install Command: `npm install` (auto-configured)

### Phase 3: Environment Variables Configuration

**CRITICAL: Copy these exact environment variables to Vercel Dashboard:**

#### Production Environment Variables
Navigate to Project Settings → Environment Variables and add:

```env
# Supabase (Use your current working values)
NEXT_PUBLIC_SUPABASE_URL=https://wqdcwlizdhttortnxhzw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your_current_anon_key]
SUPABASE_SERVICE_ROLE_KEY=[your_current_service_role_key]

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://ashhadu.co.uk
NEXT_PUBLIC_SITE_NAME=Ashhadu Islamic Art
NEXT_PUBLIC_SITE_DESCRIPTION=Premium 3D Printed Islamic Calligraphy & Art

# Stripe (IMPORTANT: Use LIVE keys for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your_stripe_live_publishable_key]
STRIPE_SECRET_KEY=[your_stripe_live_secret_key]
STRIPE_WEBHOOK_SECRET=[your_stripe_webhook_secret]

# PayPal (Use LIVE credentials)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=[your_paypal_live_client_id]
PAYPAL_CLIENT_SECRET=[your_paypal_live_client_secret]

# Email (Resend - Use your current key)
RESEND_API_KEY=[your_current_resend_api_key]

# Admin Configuration
ADMIN_EMAIL=admin@ashhadu.co.uk
ADMIN_PASSWORD=[secure_production_password]

# Business Configuration
VAT_RATE=0.20
FREE_SHIPPING_THRESHOLD=100
STANDARD_SHIPPING_COST=5.99
EXPRESS_SHIPPING_COST=12.99

# Security
JWT_SECRET=[generate_strong_jwt_secret]
NEXTAUTH_SECRET=[generate_strong_nextauth_secret]
NEXTAUTH_URL=https://ashhadu.co.uk
NODE_ENV=production
BYPASS_ADMIN_AUTH=false
```

### Phase 4: Domain Configuration

1. **Custom Domain Setup**
   - In Vercel Dashboard → Project → Settings → Domains
   - Add domain: `ashhadu.co.uk`
   - Add domain: `www.ashhadu.co.uk` (redirect to main)

2. **DNS Configuration** (Update with your domain provider)
   ```
   Type: A
   Name: @
   Value: 76.76.19.61

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### Phase 5: Deployment Process

1. **Initial Deployment**
   - Deploy → Should auto-trigger after environment variables are set
   - Monitor build logs for any errors
   - Build time: ~2-4 minutes expected

2. **Common Build Issues & Solutions**

   **If Build Fails with TypeScript Errors:**
   ```bash
   # In Vercel Settings → General → Build & Development Settings
   # Override Build Command with:
   npm install && npm run build
   ```

   **If Memory Issues:**
   ```bash
   # Override Install Command with:
   npm install --legacy-peer-deps
   ```

   **If 3D Model Loading Issues:**
   - Ensure Three.js dependencies are in production dependencies
   - Check that all model files are in public/ directory

### Phase 6: Post-Deployment Testing

1. **Critical Functionality Tests**
   - [ ] Homepage loads with video background
   - [ ] Search functionality works
   - [ ] About page loads with video
   - [ ] All legal pages accessible
   - [ ] Authentication system (login/signup)
   - [ ] Admin dashboard (o.lodhi@me.com login)
   - [ ] Product pages with 3D models
   - [ ] Shopping cart functionality
   - [ ] Contact form submission
   - [ ] FAQ page search

2. **Payment System Tests**
   - [ ] Stripe test transactions
   - [ ] PayPal test transactions
   - [ ] Apple Pay/Google Pay (if configured)
   - [ ] Order confirmation emails

3. **Email System Tests**
   - [ ] Contact form emails
   - [ ] Newsletter subscriptions
   - [ ] Order confirmations
   - [ ] Password reset emails

### Phase 7: Performance Optimization

1. **Monitor Core Web Vitals**
   - Vercel Analytics will show performance metrics
   - Optimize any slow-loading pages

2. **CDN & Caching**
   - Static assets automatically cached
   - API routes cached appropriately
   - Database queries optimized

### Troubleshooting Common Issues

#### Build Errors
- **Module not found**: Ensure all dependencies in package.json
- **TypeScript errors**: Check all imports and types
- **Environment variables**: Verify all required vars are set

#### Runtime Errors
- **Database connection**: Check Supabase URLs and keys
- **Payment issues**: Verify Stripe/PayPal credentials
- **Email issues**: Confirm Resend API key

#### Performance Issues
- **Large bundle size**: Check for unused dependencies
- **Slow loading**: Optimize images and 3D models
- **API timeouts**: Review database queries

### Success Metrics
- Build time: < 5 minutes
- Page load time: < 3 seconds
- Lighthouse score: > 90
- All functionality working in production

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase with Vercel](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)

---

## 🎉 Go Live Checklist

When everything is tested and working:

1. **Final Domain Switch**
   - Update DNS to point to Vercel
   - SSL certificate will auto-provision
   - Test with `https://ashhadu.co.uk`

2. **SEO & Analytics**
   - Submit sitemap to Google Search Console
   - Set up Google Analytics (if desired)
   - Configure social media meta tags

3. **Monitoring**
   - Set up Vercel Analytics
   - Monitor error logs
   - Set up uptime monitoring

**Your luxury Islamic art e-commerce platform will be live! 🕌✨**