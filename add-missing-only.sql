-- Simplified script - Add only missing tables and data (ENUMs already exist)
-- Run this script in your Supabase SQL Editor

-- 1. Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
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

-- 3. Add missing product columns if they don't exist
DO $$ 
BEGIN
    -- Add featured column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='featured') THEN
        ALTER TABLE products ADD COLUMN featured BOOLEAN DEFAULT false NOT NULL;
    END IF;
    
    -- Add on_sale column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='on_sale') THEN
        ALTER TABLE products ADD COLUMN on_sale BOOLEAN DEFAULT false NOT NULL;
    END IF;
    
    -- Add status column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='status') THEN
        ALTER TABLE products ADD COLUMN status product_status DEFAULT 'published' NOT NULL;
    END IF;
    
    -- Add visibility column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='visibility') THEN
        ALTER TABLE products ADD COLUMN visibility product_visibility DEFAULT 'public' NOT NULL;
    END IF;
    
    -- Add featured_image column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='featured_image') THEN
        ALTER TABLE products ADD COLUMN featured_image TEXT;
    END IF;
    
    -- Add print_time column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='print_time') THEN
        ALTER TABLE products ADD COLUMN print_time DECIMAL(5,2);
    END IF;
    
    -- Add finishing_time column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='finishing_time') THEN
        ALTER TABLE products ADD COLUMN finishing_time DECIMAL(5,2);
    END IF;
    
    -- Add difficulty column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='difficulty') THEN
        ALTER TABLE products ADD COLUMN difficulty TEXT DEFAULT 'Simple';
    END IF;
    
    -- Add custom_commission column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='custom_commission') THEN
        ALTER TABLE products ADD COLUMN custom_commission BOOLEAN DEFAULT false NOT NULL;
    END IF;
    
    -- Add personalizable column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='personalizable') THEN
        ALTER TABLE products ADD COLUMN personalizable BOOLEAN DEFAULT false NOT NULL;
    END IF;
    
    -- Add gift_wrapping column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='gift_wrapping') THEN
        ALTER TABLE products ADD COLUMN gift_wrapping BOOLEAN DEFAULT true NOT NULL;
    END IF;
    
    -- Add published_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='published_at') THEN
        ALTER TABLE products ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add created_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='created_at') THEN
        ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
    END IF;
    
    -- Add updated_at column if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='updated_at') THEN
        ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL;
    END IF;
END $$;

-- 4. Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- 5. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist and recreate
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Row Level Security (RLS) Policies

-- Profiles: Users can only see/edit their own profile, admins can see all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Reviews: Public read, authenticated users can write their own
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (
  customer_email = (SELECT email FROM profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage all reviews" ON reviews FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- 7. Insert sample categories if they don't exist
INSERT INTO categories (name, slug, description) 
SELECT * FROM (VALUES
  ('Islamic Calligraphy', 'islamic-calligraphy', 'Beautiful Arabic calligraphy art pieces'),
  ('Mosque Models', 'mosque-models', '3D printed models of famous mosques'),
  ('Geometric Art', 'geometric-art', 'Islamic geometric patterns and designs'),
  ('Arabic Text', 'arabic-text', 'Arabic text and name customizations'),
  ('Decorative Art', 'decorative-art', 'Decorative Islamic art pieces'),
  ('Custom Commissions', 'custom-commissions', 'Custom commission work and personalized pieces')
) AS v(name, slug, description)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = v.slug);

-- 8. Insert sample products if none exist
INSERT INTO products (
  name, arabic_name, slug, description, short_description,
  price, regular_price, currency, vat_included,
  category, subcategory, tags,
  sku, stock, stock_status, manage_stock, low_stock_threshold,
  weight, material,
  islamic_category, arabic_text, transliteration, translation,
  print_time, finishing_time, difficulty,
  featured, on_sale, status, visibility, custom_commission, personalizable, gift_wrapping,
  featured_image, created_at, updated_at, published_at
)
SELECT * FROM (VALUES
  (
    'Ayat al-Kursi Calligraphy', 'آية الكرسي', 'ayat-al-kursi-calligraphy',
    'Exquisite 3D printed Arabic calligraphy featuring the Throne Verse (Ayat al-Kursi), one of the most revered verses in the Quran. This piece combines traditional Islamic calligraphy with modern 3D printing technology to create a stunning wall art piece that brings spiritual beauty to any space.',
    'Beautiful 3D printed Ayat al-Kursi calligraphy wall art',
    89.99, 109.99, 'GBP', true,
    'Islamic Calligraphy', 'Wall Art', ARRAY['ayat-al-kursi', 'calligraphy', 'wall-art', 'quran'],
    'AAK-001', 15, 'in-stock'::stock_status, true, 3,
    250.0, ARRAY['PLA+', 'Wood Fill'],
    'Quranic Verses', 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', 'Allahu la ilaha illa huwa al-hayyu al-qayyum',
    'Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining',
    4.5, 2.0, 'Intermediate',
    true, true, 'published'::product_status, 'public'::product_visibility, false, false, true,
    '/images/products/ayat-al-kursi.jpg', NOW(), NOW(), NOW()
  ),
  (
    'Masjid al-Haram Scale Model', 'المسجد الحرام', 'masjid-al-haram-model',
    'Detailed architectural scale model of the Great Mosque of Mecca (Masjid al-Haram), including the Kaaba and surrounding structures. This intricate model showcases the beauty of Islamic architecture and serves as both an educational tool and a stunning decorative piece.',
    'Detailed 3D printed model of the Great Mosque of Mecca',
    159.99, 159.99, 'GBP', true,
    'Mosque Models', 'Architecture', ARRAY['mosque', 'mecca', 'kaaba', 'architecture'],
    'MAH-001', 8, 'in-stock'::stock_status, true, 2,
    400.0, ARRAY['PLA+', 'PETG'],
    'Sacred Architecture', 'المسجد الحرام', 'Al-Masjid al-Haram',
    'The Sacred Mosque in Mecca, the holiest mosque in Islam',
    8.0, 3.5, 'Advanced',
    true, false, 'published'::product_status, 'public'::product_visibility, false, false, true,
    '/images/products/masjid-al-haram.jpg', NOW(), NOW(), NOW()
  ),
  (
    'Bismillah Geometric Wall Art', 'بسم الله', 'bismillah-wall-art',
    'Elegant combination of Islamic geometric patterns with the beautiful Bismillah inscription. This piece features traditional Islamic geometric designs that create a mesmerizing visual effect while incorporating the blessed phrase "In the name of Allah".',
    'Beautiful Bismillah calligraphy with geometric patterns',
    64.99, 64.99, 'GBP', true,
    'Wall Art', 'Geometric', ARRAY['bismillah', 'geometric', 'wall-art', 'islamic-patterns'],
    'BWA-001', 20, 'in-stock'::stock_status, true, 5,
    180.0, ARRAY['PLA+', 'Wood Fill'],
    'Basmala', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'Bismillah ir-Rahman ir-Rahim',
    'In the name of Allah, the Most Gracious, the Most Merciful',
    3.0, 1.5, 'Simple',
    true, false, 'published'::product_status, 'public'::product_visibility, false, true, true,
    '/images/products/bismillah-art.jpg', NOW(), NOW(), NOW()
  ),
  (
    'Custom Arabic Name Calligraphy', 'اسم مخصص', 'custom-arabic-name',
    'Personalized Arabic calligraphy featuring your name or chosen phrase in beautiful traditional script. Each piece is custom designed and 3D printed to create a unique piece of art that celebrates your identity in elegant Arabic calligraphy.',
    'Personalized Arabic name calligraphy - made to order',
    95.99, 95.99, 'GBP', true,
    'Custom Art', 'Personalized', ARRAY['custom', 'name', 'personalized', 'calligraphy'],
    'CAN-001', 999, 'in-stock'::stock_status, false, 0,
    200.0, ARRAY['PLA+', 'Wood Fill'],
    'Personal Names', 'حسب الطلب', 'Hasab al-talab',
    'According to request/custom order',
    3.5, 2.0, 'Intermediate',
    true, false, 'published'::product_status, 'public'::product_visibility, true, true, true,
    '/images/products/custom-name.jpg', NOW(), NOW(), NOW()
  ),
  (
    'Islamic Geometric Pattern Art', 'نمط هندسي إسلامي', 'islamic-geometric-pattern',
    'Intricate Islamic geometric pattern inspired by traditional mosque decorations and manuscript illuminations. This piece showcases the mathematical beauty and spiritual significance of Islamic geometric art.',
    'Complex geometric pattern inspired by Islamic art',
    74.99, 74.99, 'GBP', true,
    'Geometric Art', 'Decorative', ARRAY['geometric', 'pattern', 'islamic-art', 'decorative'],
    'IGP-001', 12, 'in-stock'::stock_status, true, 3,
    220.0, ARRAY['PLA+'],
    'Geometric Patterns', 'النمط الهندسي الإسلامي', 'An-namat al-handasi al-islami',
    'Islamic geometric pattern',
    5.0, 2.5, 'Intermediate',
    false, false, 'published'::product_status, 'public'::product_visibility, false, false, true,
    '/images/products/geometric-pattern.jpg', NOW(), NOW(), NOW()
  ),
  (
    'Elegant Quran Stand', 'حامل القرآن', 'elegant-quran-stand',
    'Beautifully crafted Quran stand featuring Islamic geometric patterns. Perfect for holding the Holy Quran during recitation or display. The design incorporates traditional Islamic motifs while providing practical functionality.',
    'Decorative Quran stand with Islamic patterns',
    45.99, 45.99, 'GBP', true,
    'Religious Items', 'Functional', ARRAY['quran', 'stand', 'holder', 'islamic-patterns'],
    'QS-001', 25, 'in-stock'::stock_status, true, 5,
    150.0, ARRAY['PLA+', 'Wood Fill'],
    'Religious Accessories', 'حامل القرآن الكريم', 'Hamil al-Quran al-Karim',
    'Holder for the Noble Quran',
    2.5, 1.0, 'Simple',
    false, false, 'published'::product_status, 'public'::product_visibility, false, false, true,
    '/images/products/quran-stand.jpg', NOW(), NOW(), NOW()
  )
) AS v(name, arabic_name, slug, description, short_description, price, regular_price, currency, vat_included, category, subcategory, tags, sku, stock, stock_status, manage_stock, low_stock_threshold, weight, material, islamic_category, arabic_text, transliteration, translation, print_time, finishing_time, difficulty, featured, on_sale, status, visibility, custom_commission, personalizable, gift_wrapping, featured_image, created_at, updated_at, published_at)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku = v.sku);

-- 9. Insert product images for the sample products
INSERT INTO product_images (product_id, url, alt, title, featured, sort_order) 
SELECT 
  p.id,
  '/images/products/' || p.slug || '.jpg',
  p.name || ' - Main Image',
  p.name,
  true,
  0
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = p.id);

-- 10. Insert sample reviews for the products
INSERT INTO reviews (
  product_id, customer_name, customer_email, rating, title, comment, 
  verified_purchase, status, created_at
)
SELECT 
  p.id,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Ahmed Al-Hassan'
    WHEN 1 THEN 'Fatima Ibrahim'
    WHEN 2 THEN 'Omar Malik'
    ELSE 'Aisha Rahman'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'ahmed.hassan@email.com'
    WHEN 1 THEN 'fatima.ibrahim@email.com'
    WHEN 2 THEN 'omar.malik@email.com'
    ELSE 'aisha.rahman@email.com'
  END,
  4 + (random())::int, -- Rating between 4-5
  CASE (random() * 2)::int
    WHEN 0 THEN 'Beautiful craftsmanship'
    ELSE 'Excellent quality'
  END,
  CASE (random() * 3)::int
    WHEN 0 THEN 'Absolutely beautiful piece! The detail and craftsmanship is incredible.'
    WHEN 1 THEN 'Such high quality work. The Arabic calligraphy is elegant and the 3D printing is flawless.'
    ELSE 'This exceeded my expectations. The attention to detail is remarkable.'
  END,
  true,
  'approved',
  NOW() - (random() * interval '30 days')
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE product_id = p.id)
LIMIT 12; -- Add 2 reviews per product

-- Confirm what was added
SELECT 'Database setup complete!' as message;
SELECT 'Products added: ' || count(*) as products_count FROM products;
SELECT 'Reviews added: ' || count(*) as reviews_count FROM reviews;
SELECT 'Categories added: ' || count(*) as categories_count FROM categories;