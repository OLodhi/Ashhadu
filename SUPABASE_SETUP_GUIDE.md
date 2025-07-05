# Supabase Setup Guide for Islamic Art E-commerce

This guide will walk you through setting up Supabase for your Islamic art e-commerce platform.

## Step 1: Create Supabase Account & Project

1. **Visit Supabase**: Go to https://supabase.com
2. **Sign Up**: Create a free account (no credit card required)
3. **Create New Project**:
   - Click "New Project"
   - Choose your organization (or create one)
   - Name: `ashhadu-islamic-art`
   - Database Password: Choose a strong password (save this!)
   - Region: Choose closest to your users (UK: `eu-west-1`)
   - Pricing Plan: Start with "Free" (perfect for development)

4. **Wait for Setup**: Project creation takes 1-2 minutes

## Step 2: Get Your Project Credentials

Once your project is ready:

1. **Go to Settings** → **API**
2. **Copy these values**:
   - Project URL (starts with `https://`)
   - Project API Keys:
     - `anon` `public` (for client-side usage)
     - `service_role` (for server-side admin operations)

## Step 3: Configure Environment Variables

1. **Create `.env.local`** file in your project root:
```bash
cp .env.local.example .env.local
```

2. **Update `.env.local`** with your Supabase credentials:
```env
# Replace with your actual Supabase values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Keep other existing values as-is
NEXT_PUBLIC_SITE_URL=http://localhost:8080
# ... etc
```

## Step 4: Create Database Schema

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Create New Query**
3. **Copy and paste** the entire content from `supabase-schema.sql`
4. **Run the query** - this will create all tables and security policies

**Expected Result**: You should see:
- ✅ 9 tables created (profiles, products, product_images, etc.)
- ✅ Row Level Security policies applied
- ✅ Indexes created for performance
- ✅ Triggers for automatic timestamps

## Step 5: Set Up File Storage

1. **Go to Storage** in Supabase dashboard
2. **Create Buckets**:
   
   **Bucket 1: product-images**
   - Name: `product-images`
   - Public: ✅ Yes (for product images)
   - File size limit: 50MB
   - Allowed MIME types: `image/*`
   
   **Bucket 2: user-avatars**
   - Name: `user-avatars`
   - Public: ✅ Yes (for profile pictures)
   - File size limit: 10MB
   - Allowed MIME types: `image/*`

3. **Set Storage Policies**:
   
   Go to **Storage** → **Policies** and add:
   
   **For product-images bucket**:
   ```sql
   -- Allow public read access
   CREATE POLICY "Anyone can view product images" 
   ON storage.objects FOR SELECT 
   USING (bucket_id = 'product-images');
   
   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload product images" 
   ON storage.objects FOR INSERT 
   WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
   
   -- Allow authenticated users to update
   CREATE POLICY "Authenticated users can update product images" 
   ON storage.objects FOR UPDATE 
   USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
   
   -- Allow authenticated users to delete
   CREATE POLICY "Authenticated users can delete product images" 
   ON storage.objects FOR DELETE 
   USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
   ```

## Step 6: Create Admin User

1. **Go to Authentication** → **Users**
2. **Add User Manually**:
   - Email: `admin@ashhadu.co.uk` (or your preferred admin email)
   - Password: Choose a strong password
   - Email Confirm: ✅ Skip confirmation
   - Auto Confirm: ✅ Yes

3. **Create Admin Profile**:
   
   Go to **SQL Editor** and run:
   ```sql
   -- Replace 'admin@ashhadu.co.uk' with your admin email
   INSERT INTO profiles (user_id, email, full_name, role)
   SELECT 
     id, 
     'admin@ashhadu.co.uk', 
     'Admin User', 
     'admin'
   FROM auth.users 
   WHERE email = 'admin@ashhadu.co.uk';
   ```

## Step 7: Test Database Connection

1. **Restart your Next.js development server**:
```bash
npm run dev
```

2. **Check for errors** in the terminal
3. **Test the connection** by trying to access admin pages

## Step 8: Verify Setup

Once your server is running, you should be able to:

✅ **Visit admin pages** without errors  
✅ **See database tables** in Supabase dashboard  
✅ **Upload images** to storage buckets  
✅ **Create/edit products** with real persistence  

## Troubleshooting

### Common Issues:

**1. "Missing Supabase environment variables"**
- Check `.env.local` file exists and has correct variable names
- Restart development server after adding environment variables

**2. "Failed to create client"**
- Verify your Project URL and API keys are correct
- Make sure you're using the `anon public` key for NEXT_PUBLIC_SUPABASE_ANON_KEY

**3. "Row Level Security policy violation"**
- Make sure admin user has correct role in profiles table
- Check RLS policies are created correctly

**4. "Storage bucket not found"**
- Verify buckets are created in Supabase dashboard
- Check bucket names match exactly in code

### Getting Help:

1. **Check Supabase Logs**: Dashboard → Logs → API Logs
2. **Verify Schema**: Dashboard → Table Editor
3. **Test Storage**: Dashboard → Storage → Upload test file
4. **Contact Support**: Supabase has excellent community support

## Next Steps

Once Supabase is set up:

1. **Migrate existing products** to database
2. **Test image uploads** with real file storage
3. **Set up authentication** for customers
4. **Configure Stripe** for payments

Your Islamic art e-commerce platform will now have:
- ✅ Professional PostgreSQL database
- ✅ Real-time updates
- ✅ Secure file storage with CDN
- ✅ Built-in authentication
- ✅ Scalable architecture
- ✅ Zero hosting costs (free tier)

## Cost Overview

**Free Tier Includes:**
- 500MB database storage
- 1GB file storage
- 50,000 monthly active users
- 2 million API requests
- Community support

**Perfect for:**
- Development and testing
- Small e-commerce stores
- Up to thousands of products
- Moderate traffic websites

You can always upgrade later as your business grows!