-- Sample Data for Islamic Art E-commerce Website
-- Run this after the main schema to populate with sample products

-- Insert sample products
INSERT INTO products (
  name, arabic_name, slug, description, short_description,
  price, regular_price, currency, vat_included,
  category, subcategory, tags,
  sku, stock, stock_status, manage_stock, low_stock_threshold,
  weight, material,
  islamic_category, arabic_text, transliteration, translation, historical_context,
  print_time, finishing_time, difficulty,
  featured, on_sale, status, visibility, custom_commission, personalizable, gift_wrapping,
  featured_image
) VALUES 

-- Ayat al-Kursi Calligraphy
(
  'Ayat al-Kursi Calligraphy', 'آية الكرسي', 'ayat-al-kursi-calligraphy',
  'Exquisite 3D printed Arabic calligraphy featuring the Throne Verse (Ayat al-Kursi), one of the most revered verses in the Quran. This piece combines traditional Islamic calligraphy with modern 3D printing technology to create a stunning wall art piece that brings spiritual beauty to any space.',
  'Beautiful 3D printed Ayat al-Kursi calligraphy wall art',
  89.99, 109.99, 'GBP', true,
  'Islamic Calligraphy', 'Wall Art', ARRAY['ayat-al-kursi', 'calligraphy', 'wall-art', 'quran'],
  'AAK-001', 15, 'in-stock', true, 3,
  250.0, ARRAY['PLA+', 'Wood Fill'],
  'Quranic Verses', 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', 'Allahu la ilaha illa huwa al-hayyu al-qayyum',
  'Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining',
  'Known as the Throne Verse, this is considered one of the most powerful verses in the Quran, often recited for protection and blessings.',
  4.5, 2.0, 'Intermediate',
  true, true, 'published', 'public', false, false, true,
  '/images/products/ayat-al-kursi.jpg'
),

-- Masjid al-Haram Model
(
  'Masjid al-Haram Scale Model', 'المسجد الحرام', 'masjid-al-haram-model',
  'Detailed architectural scale model of the Great Mosque of Mecca (Masjid al-Haram), including the Kaaba and surrounding structures. This intricate model showcases the beauty of Islamic architecture and serves as both an educational tool and a stunning decorative piece.',
  'Detailed 3D printed model of the Great Mosque of Mecca',
  159.99, 159.99, 'GBP', true,
  'Mosque Models', 'Architecture', ARRAY['mosque', 'mecca', 'kaaba', 'architecture'],
  'MAH-001', 8, 'in-stock', true, 2,
  400.0, ARRAY['PLA+', 'PETG'],
  'Sacred Architecture', 'المسجد الحرام', 'Al-Masjid al-Haram',
  'The Sacred Mosque in Mecca, the holiest mosque in Islam',
  'The Great Mosque of Mecca surrounds the Kaaba and is the destination for the Hajj pilgrimage, one of the Five Pillars of Islam.',
  8.0, 3.5, 'Advanced',
  true, false, 'published', 'public', false, false, true,
  '/images/products/masjid-al-haram.jpg'
),

-- Bismillah Wall Art
(
  'Bismillah Geometric Wall Art', 'بسم الله', 'bismillah-wall-art',
  'Elegant combination of Islamic geometric patterns with the beautiful Bismillah inscription. This piece features traditional Islamic geometric designs that create a mesmerizing visual effect while incorporating the blessed phrase "In the name of Allah".',
  'Beautiful Bismillah calligraphy with geometric patterns',
  64.99, 64.99, 'GBP', true,
  'Wall Art', 'Geometric', ARRAY['bismillah', 'geometric', 'wall-art', 'islamic-patterns'],
  'BWA-001', 20, 'in-stock', true, 5,
  180.0, ARRAY['PLA+', 'Wood Fill'],
  'Basmala', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'Bismillah ir-Rahman ir-Rahim',
  'In the name of Allah, the Most Gracious, the Most Merciful',
  'The Basmala is recited before every chapter of the Quran except one and is said before beginning any important task.',
  3.0, 1.5, 'Simple',
  true, false, 'published', 'public', false, true, true,
  '/images/products/bismillah-art.jpg'
),

-- Custom Arabic Name
(
  'Custom Arabic Name Calligraphy', 'اسم مخصص', 'custom-arabic-name',
  'Personalized Arabic calligraphy featuring your name or chosen phrase in beautiful traditional script. Each piece is custom designed and 3D printed to create a unique piece of art that celebrates your identity in elegant Arabic calligraphy.',
  'Personalized Arabic name calligraphy - made to order',
  95.99, 95.99, 'GBP', true,
  'Custom Art', 'Personalized', ARRAY['custom', 'name', 'personalized', 'calligraphy'],
  'CAN-001', 999, 'in-stock', false, 0,
  200.0, ARRAY['PLA+', 'Wood Fill'],
  'Personal Names', 'حسب الطلب', 'Hasab al-talab',
  'According to request/custom order',
  'Arabic calligraphy has been used for centuries to create beautiful renditions of names and meaningful phrases.',
  3.5, 2.0, 'Intermediate',
  true, false, 'published', 'public', true, true, true,
  '/images/products/custom-name.jpg'
),

-- Islamic Geometric Pattern
(
  'Islamic Geometric Pattern Art', 'نمط هندسي إسلامي', 'islamic-geometric-pattern',
  'Intricate Islamic geometric pattern inspired by traditional mosque decorations and manuscript illuminations. This piece showcases the mathematical beauty and spiritual significance of Islamic geometric art.',
  'Complex geometric pattern inspired by Islamic art',
  74.99, 74.99, 'GBP', true,
  'Geometric Art', 'Decorative', ARRAY['geometric', 'pattern', 'islamic-art', 'decorative'],
  'IGP-001', 12, 'in-stock', true, 3,
  220.0, ARRAY['PLA+'],
  'Geometric Patterns', 'النمط الهندسي الإسلامي', 'An-namat al-handasi al-islami',
  'Islamic geometric pattern',
  'Islamic geometric patterns represent the infinite nature of Allah and are found in mosques, manuscripts, and decorative arts throughout the Islamic world.',
  5.0, 2.5, 'Intermediate',
  false, false, 'published', 'public', false, false, true,
  '/images/products/geometric-pattern.jpg'
),

-- Quran Stand
(
  'Elegant Quran Stand', 'حامل القرآن', 'elegant-quran-stand',
  'Beautifully crafted Quran stand featuring Islamic geometric patterns. Perfect for holding the Holy Quran during recitation or display. The design incorporates traditional Islamic motifs while providing practical functionality.',
  'Decorative Quran stand with Islamic patterns',
  45.99, 45.99, 'GBP', true,
  'Religious Items', 'Functional', ARRAY['quran', 'stand', 'holder', 'islamic-patterns'],
  'QS-001', 25, 'in-stock', true, 5,
  150.0, ARRAY['PLA+', 'Wood Fill'],
  'Religious Accessories', 'حامل القرآن الكريم', 'Hamil al-Quran al-Karim',
  'Holder for the Noble Quran',
  'Quran stands have been used for centuries to hold the Holy Book during recitation and study, often decorated with beautiful Islamic art.',
  2.5, 1.0, 'Simple',
  false, false, 'published', 'public', false, false, true,
  '/images/products/quran-stand.jpg'
);

-- Insert sample product images
INSERT INTO product_images (product_id, url, alt, title, featured, sort_order) 
SELECT 
  p.id,
  '/images/products/' || p.slug || '-1.jpg',
  p.name || ' - Main Image',
  p.name,
  true,
  0
FROM products p;

-- Add additional images for featured products
INSERT INTO product_images (product_id, url, alt, title, featured, sort_order)
SELECT 
  p.id,
  '/images/products/' || p.slug || '-' || (row_number() OVER (PARTITION BY p.id ORDER BY p.id) + 1) || '.jpg',
  p.name || ' - Detail View',
  p.name || ' Detail',
  false,
  row_number() OVER (PARTITION BY p.id ORDER BY p.id)
FROM products p
WHERE p.featured = true
CROSS JOIN generate_series(1, 2) -- Add 2 additional images for featured products

ON CONFLICT DO NOTHING;

-- Insert sample reviews
INSERT INTO reviews (
  product_id, customer_name, customer_email, rating, title, comment, 
  verified_purchase, status, created_at
)
SELECT 
  p.id,
  CASE (random() * 5)::int
    WHEN 0 THEN 'Ahmed Al-Hassan'
    WHEN 1 THEN 'Fatima Ibrahim'
    WHEN 2 THEN 'Omar Malik'
    WHEN 3 THEN 'Aisha Rahman'
    ELSE 'Yusuf Abdullah'
  END,
  CASE (random() * 5)::int
    WHEN 0 THEN 'ahmed.hassan@email.com'
    WHEN 1 THEN 'fatima.ibrahim@email.com'
    WHEN 2 THEN 'omar.malik@email.com'
    WHEN 3 THEN 'aisha.rahman@email.com'
    ELSE 'yusuf.abdullah@email.com'
  END,
  4 + (random())::int, -- Rating between 4-5
  CASE (random() * 3)::int
    WHEN 0 THEN 'Beautiful craftsmanship'
    WHEN 1 THEN 'Excellent quality'
    ELSE 'Highly recommended'
  END,
  CASE (random() * 4)::int
    WHEN 0 THEN 'Absolutely beautiful piece! The detail and craftsmanship is incredible. It arrived perfectly packaged and looks amazing on my wall.'
    WHEN 1 THEN 'Such high quality work. The Arabic calligraphy is elegant and the 3D printing is flawless. Very happy with my purchase.'
    WHEN 2 THEN 'This exceeded my expectations. The attention to detail is remarkable and it makes a perfect gift for any Muslim home.'
    ELSE 'Outstanding quality and beautiful design. The seller was very helpful and the shipping was fast. Will definitely order again.'
  END,
  true,
  'approved',
  NOW() - (random() * interval '30 days')
FROM products p
CROSS JOIN generate_series(1, 3) -- 3 reviews per product
LIMIT 18; -- Total of 18 reviews across all products