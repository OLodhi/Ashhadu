-- Supabase Database Schema for Islamic Art E-commerce
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types/enums
CREATE TYPE user_role AS ENUM ('admin', 'customer');
CREATE TYPE product_status AS ENUM ('published', 'draft', 'archived');
CREATE TYPE product_visibility AS ENUM ('public', 'private', 'password-protected');
CREATE TYPE stock_status AS ENUM ('in-stock', 'low-stock', 'out-of-stock');
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE inventory_movement_type AS ENUM ('in', 'out', 'adjustment');
CREATE TYPE payment_method_type AS ENUM ('card', 'paypal', 'apple_pay', 'google_pay');

-- 1. User Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Categories
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Products
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  arabic_name TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  regular_price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP' NOT NULL,
  vat_included BOOLEAN DEFAULT true NOT NULL,
  
  -- Categorization
  category TEXT NOT NULL,
  subcategory TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Inventory
  sku TEXT UNIQUE NOT NULL,
  stock INTEGER DEFAULT 0 NOT NULL,
  stock_status stock_status DEFAULT 'in-stock' NOT NULL,
  manage_stock BOOLEAN DEFAULT true NOT NULL,
  low_stock_threshold INTEGER DEFAULT 5,
  
  -- Physical properties
  weight DECIMAL(8,2), -- in grams
  material TEXT[] DEFAULT '{}',
  
  -- Islamic Art specific
  islamic_category TEXT NOT NULL,
  arabic_text TEXT,
  transliteration TEXT,
  translation TEXT,
  historical_context TEXT,
  
  -- Manufacturing
  print_time DECIMAL(5,2), -- in hours
  finishing_time DECIMAL(5,2), -- in hours
  difficulty TEXT DEFAULT 'Simple',
  
  -- Product flags
  featured BOOLEAN DEFAULT false NOT NULL,
  on_sale BOOLEAN DEFAULT false NOT NULL,
  status product_status DEFAULT 'draft' NOT NULL,
  visibility product_visibility DEFAULT 'public' NOT NULL,
  custom_commission BOOLEAN DEFAULT false NOT NULL,
  personalizable BOOLEAN DEFAULT false NOT NULL,
  gift_wrapping BOOLEAN DEFAULT true NOT NULL,
  
  -- Media
  featured_image TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE
);

-- 4. Product Images
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt TEXT,
  title TEXT,
  featured BOOLEAN DEFAULT false NOT NULL,
  sort_order INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 5. Customers
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  billing_address JSONB,
  shipping_address JSONB,
  date_of_birth DATE,
  marketing_consent BOOLEAN DEFAULT false NOT NULL,
  stripe_customer_id TEXT UNIQUE, -- Stripe customer ID for payment processing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 6. Addresses
CREATE TABLE addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('billing', 'shipping')),
  label TEXT, -- e.g., "Home", "Work", "Office"
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  county TEXT,
  postcode TEXT NOT NULL,
  country TEXT DEFAULT 'United Kingdom' NOT NULL,
  phone TEXT,
  is_default BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 7. Orders
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  status order_status DEFAULT 'pending' NOT NULL,
  
  -- Pricing
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
  shipping_amount DECIMAL(10,2) DEFAULT 0 NOT NULL,
  currency TEXT DEFAULT 'GBP' NOT NULL,
  
  -- Payment
  payment_status payment_status DEFAULT 'pending' NOT NULL,
  payment_method TEXT,
  stripe_payment_intent_id TEXT,
  
  -- Additional info
  notes TEXT,
  
  -- Timestamps
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 8. Order Items
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  product_name TEXT NOT NULL, -- Snapshot of product name at time of order
  product_sku TEXT NOT NULL, -- Snapshot of SKU at time of order
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 9. Reviews
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  comment TEXT NOT NULL,
  verified_purchase BOOLEAN DEFAULT false NOT NULL,
  status review_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 10. Wishlists
CREATE TABLE wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Ensure each customer can only have one entry per product
  UNIQUE(customer_id, product_id)
);

-- 11. Inventory Movements
CREATE TABLE inventory_movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  type inventory_movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference TEXT, -- Order ID, manual adjustment reference, etc.
  performed_by TEXT NOT NULL, -- User ID or system
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 12. Payment Methods (secure tokens only - never store actual card details)
CREATE TABLE payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment provider information
  type payment_method_type NOT NULL,
  provider TEXT NOT NULL DEFAULT 'stripe', -- 'stripe', 'paypal'
  provider_payment_method_id TEXT NOT NULL, -- Stripe PM ID, PayPal reference, etc.
  provider_customer_id TEXT, -- Stripe customer ID, PayPal payer ID, etc.
  
  -- Display information (for UI - never sensitive data)
  display_name TEXT, -- e.g., "Visa ending in 4242"
  brand TEXT, -- visa, mastercard, amex, etc.
  last_four TEXT, -- last 4 digits for cards
  exp_month INTEGER, -- expiry month for cards
  exp_year INTEGER, -- expiry year for cards
  
  -- PayPal specific
  paypal_email TEXT, -- PayPal account email (for display only)
  
  -- Settings
  is_default BOOLEAN DEFAULT false NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  
  -- Metadata
  billing_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraints
  UNIQUE(customer_id, provider_payment_method_id), -- Prevent duplicate tokens
  CHECK (
    (type = 'card' AND brand IS NOT NULL AND last_four IS NOT NULL) OR
    (type = 'paypal' AND paypal_email IS NOT NULL) OR
    (type IN ('apple_pay', 'google_pay'))
  )
);

-- Create indexes for performance
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_islamic_category ON products(islamic_category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_stock_status ON products(stock_status);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_inventory_movements_product_id ON inventory_movements(product_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_addresses_customer_id ON addresses(customer_id);
CREATE INDEX idx_addresses_type ON addresses(type);
CREATE INDEX idx_addresses_is_default ON addresses(is_default);
CREATE INDEX idx_wishlists_customer_id ON wishlists(customer_id);
CREATE INDEX idx_wishlists_product_id ON wishlists(product_id);
CREATE INDEX idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX idx_payment_methods_type ON payment_methods(type);
CREATE INDEX idx_payment_methods_is_default ON payment_methods(is_default);
CREATE INDEX idx_payment_methods_provider ON payment_methods(provider);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON payment_methods FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Profiles: Users can only see/edit their own profile, admins can see all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Products: Public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published products" ON products FOR SELECT USING (status = 'published' AND visibility = 'public');
CREATE POLICY "Admins can manage all products" ON products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Product Images: Public read, admin write
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product images" ON product_images FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM products WHERE id = product_id AND status = 'published' AND visibility = 'public'
  )
);
CREATE POLICY "Admins can manage product images" ON product_images FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Categories: Public read, admin write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Customers: Users can only see their own data
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own customer data" ON customers FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND email = customers.email
  )
);
CREATE POLICY "Users can update own customer data" ON customers FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND email = customers.email
  )
);
CREATE POLICY "Admins can manage all customers" ON customers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Addresses: Users can only see their own addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own addresses" ON addresses FOR SELECT USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can insert own addresses" ON addresses FOR INSERT WITH CHECK (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can update own addresses" ON addresses FOR UPDATE USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can delete own addresses" ON addresses FOR DELETE USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Admins can manage all addresses" ON addresses FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Orders: Users can only see their own orders, admins can see all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Admins can manage all orders" ON orders FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Order Items: Users can only see their own order items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
  order_id IN (
    SELECT id FROM orders WHERE customer_id IN (
      SELECT id FROM customers WHERE email = (
        SELECT email FROM profiles WHERE user_id = auth.uid()
      )
    )
  )
);
CREATE POLICY "Admins can manage all order items" ON order_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Wishlists: Users can only manage their own wishlist items
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own wishlist" ON wishlists FOR SELECT USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can add to own wishlist" ON wishlists FOR INSERT WITH CHECK (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can remove from own wishlist" ON wishlists FOR DELETE USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Admins can manage all wishlists" ON wishlists FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Reviews: Public read, authenticated users can write their own
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (
  customer_email = (SELECT email FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Inventory Movements: Admin only
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage inventory movements" ON inventory_movements FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Payment Methods: Users can only see their own payment methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payment methods" ON payment_methods FOR SELECT USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can insert own payment methods" ON payment_methods FOR INSERT WITH CHECK (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can update own payment methods" ON payment_methods FOR UPDATE USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Users can delete own payment methods" ON payment_methods FOR DELETE USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);
CREATE POLICY "Admins can manage all payment methods" ON payment_methods FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert some initial categories
INSERT INTO categories (name, slug, description) VALUES
('Islamic Calligraphy', 'islamic-calligraphy', 'Beautiful Arabic calligraphy art pieces'),
('Mosque Models', 'mosque-models', '3D printed models of famous mosques'),
('Geometric Art', 'geometric-art', 'Islamic geometric patterns and designs'),
('Arabic Text', 'arabic-text', 'Arabic text and name customizations'),
('Decorative Art', 'decorative-art', 'Decorative Islamic art pieces'),
('Custom Commissions', 'custom-commissions', 'Custom commission work and personalized pieces');

-- Create storage buckets (run these in Supabase dashboard)
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
-- insert into storage.buckets (id, name, public) values ('user-avatars', 'user-avatars', true);

-- Storage policies (uncomment and run in Supabase dashboard)
-- create policy "Anyone can view product images" on storage.objects for select using (bucket_id = 'product-images');
-- create policy "Admins can upload product images" on storage.objects for insert with check (bucket_id = 'product-images' AND auth.role() = 'authenticated');
-- create policy "Admins can update product images" on storage.objects for update using (bucket_id = 'product-images' AND auth.role() = 'authenticated');
-- create policy "Admins can delete product images" on storage.objects for delete using (bucket_id = 'product-images' AND auth.role() = 'authenticated');