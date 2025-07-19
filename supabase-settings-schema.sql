-- Settings table for storing site configuration
CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    category VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'string', -- string, boolean, number, json
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on category for faster queries
CREATE INDEX idx_site_settings_category ON site_settings(category);

-- Insert default settings
INSERT INTO site_settings (key, value, category, label, description, type) VALUES
    -- Payment Settings
    ('payment_stripe_enabled', 'true'::jsonb, 'payment', 'Enable Stripe Payments', 'Accept credit/debit card payments via Stripe', 'boolean'),
    ('payment_paypal_enabled', 'true'::jsonb, 'payment', 'Enable PayPal', 'Accept payments via PayPal', 'boolean'),
    ('payment_apple_pay_enabled', 'false'::jsonb, 'payment', 'Enable Apple Pay', 'Accept payments via Apple Pay (requires additional setup)', 'boolean'),
    ('payment_google_pay_enabled', 'false'::jsonb, 'payment', 'Enable Google Pay', 'Accept payments via Google Pay (requires additional setup)', 'boolean'),
    ('payment_test_mode', 'true'::jsonb, 'payment', 'Test Mode', 'Use test payment credentials (disable for production)', 'boolean'),
    
    -- Store Information
    ('store_name', '"Ashhadu Islamic Art"'::jsonb, 'store', 'Store Name', 'Your store display name', 'string'),
    ('store_email', '"info@ashhadu.co.uk"'::jsonb, 'store', 'Store Email', 'Primary contact email for customers', 'string'),
    ('store_phone', '"+44 20 1234 5678"'::jsonb, 'store', 'Store Phone', 'Primary contact phone number', 'string'),
    ('store_address', '"123 Islamic Art Lane, London, UK"'::jsonb, 'store', 'Store Address', 'Physical store or business address', 'string'),
    ('store_currency', '"GBP"'::jsonb, 'store', 'Currency', 'Store currency code', 'string'),
    ('store_country', '"GB"'::jsonb, 'store', 'Country', 'Store country code', 'string'),
    
    -- Shipping Settings
    ('shipping_free_threshold', '50'::jsonb, 'shipping', 'Free Shipping Threshold', 'Order amount for free shipping (in GBP)', 'number'),
    ('shipping_default_cost', '4.99'::jsonb, 'shipping', 'Default Shipping Cost', 'Standard shipping cost (in GBP)', 'number'),
    ('shipping_express_enabled', 'true'::jsonb, 'shipping', 'Enable Express Shipping', 'Offer express shipping option', 'boolean'),
    ('shipping_express_cost', '9.99'::jsonb, 'shipping', 'Express Shipping Cost', 'Express shipping cost (in GBP)', 'number'),
    ('shipping_international_enabled', 'false'::jsonb, 'shipping', 'Enable International Shipping', 'Ship to countries outside the UK', 'boolean'),
    
    -- Tax Settings
    ('tax_rate', '20'::jsonb, 'tax', 'VAT Rate', 'Value Added Tax rate (percentage)', 'number'),
    ('tax_inclusive_pricing', 'true'::jsonb, 'tax', 'Tax-Inclusive Pricing', 'Display prices with tax included', 'boolean'),
    ('tax_display_in_cart', 'true'::jsonb, 'tax', 'Show Tax in Cart', 'Display tax breakdown in shopping cart', 'boolean'),
    
    -- Product Settings
    ('product_low_stock_threshold', '5'::jsonb, 'product', 'Low Stock Threshold', 'Quantity threshold for low stock warnings', 'number'),
    ('product_allow_backorders', 'false'::jsonb, 'product', 'Allow Backorders', 'Allow orders when products are out of stock', 'boolean'),
    ('product_reviews_enabled', 'true'::jsonb, 'product', 'Enable Product Reviews', 'Allow customers to leave product reviews', 'boolean'),
    ('product_guest_reviews', 'false'::jsonb, 'product', 'Allow Guest Reviews', 'Allow non-registered users to leave reviews', 'boolean'),
    
    -- Customer Settings
    ('customer_guest_checkout', 'true'::jsonb, 'customer', 'Allow Guest Checkout', 'Allow checkout without creating an account', 'boolean'),
    ('customer_email_verification', 'true'::jsonb, 'customer', 'Require Email Verification', 'Require email verification for new accounts', 'boolean'),
    ('customer_marketing_default', 'false'::jsonb, 'customer', 'Marketing Opt-in Default', 'Default marketing consent for new customers', 'boolean'),
    
    -- Feature Toggles
    ('feature_wishlist', 'true'::jsonb, 'features', 'Enable Wishlist', 'Allow customers to save products to wishlist', 'boolean'),
    ('feature_search', 'true'::jsonb, 'features', 'Enable Product Search', 'Show search functionality in header', 'boolean'),
    ('feature_newsletter', 'true'::jsonb, 'features', 'Enable Newsletter Signup', 'Show newsletter signup forms', 'boolean'),
    ('feature_social_links', 'true'::jsonb, 'features', 'Show Social Media Links', 'Display social media links in footer', 'boolean'),
    
    -- Email Settings
    ('email_order_confirmation', 'true'::jsonb, 'email', 'Send Order Confirmations', 'Email customers after placing orders', 'boolean'),
    ('email_shipping_notification', 'true'::jsonb, 'email', 'Send Shipping Notifications', 'Email customers when orders ship', 'boolean'),
    ('email_admin_new_order', 'true'::jsonb, 'email', 'Admin Order Notifications', 'Email admin when new orders are placed', 'boolean'),
    ('email_admin_low_stock', 'true'::jsonb, 'email', 'Admin Low Stock Alerts', 'Email admin when products are low in stock', 'boolean'),
    
    -- Social Media Links
    ('social_instagram', '"https://instagram.com/ashhadu"'::jsonb, 'social', 'Instagram URL', 'Instagram profile URL', 'string'),
    ('social_facebook', '"https://facebook.com/ashhadu"'::jsonb, 'social', 'Facebook URL', 'Facebook page URL', 'string'),
    ('social_twitter', '"https://twitter.com/ashhadu"'::jsonb, 'social', 'Twitter/X URL', 'Twitter/X profile URL', 'string'),
    ('social_tiktok', '""'::jsonb, 'social', 'TikTok URL', 'TikTok profile URL', 'string')
ON CONFLICT (key) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE
    ON site_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view settings
CREATE POLICY "Admins can view settings" ON site_settings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update settings
CREATE POLICY "Admins can update settings" ON site_settings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- No one can insert or delete settings (only through migrations)
-- This prevents accidental deletion or addition of settings