-- Email System Database Schema
-- This schema supports email templates, logs, preferences, and newsletter management

-- ================================================================================
-- EMAIL TEMPLATES TABLE
-- ================================================================================
-- Store customizable email templates for different types of emails
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    subject_template TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    category VARCHAR(50) NOT NULL DEFAULT 'transactional',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_templates_key ON email_templates(template_key);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(active);

-- ================================================================================
-- EMAIL LOGS TABLE
-- ================================================================================
-- Track all email sends for debugging and analytics
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template VARCHAR(100),
    recipient_email VARCHAR(255) NOT NULL,
    subject TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    resend_email_id VARCHAR(255),
    order_number VARCHAR(100),
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    admin_user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    complained_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_order ON email_logs(order_number);

-- ================================================================================
-- EMAIL PREFERENCES TABLE
-- ================================================================================
-- Store customer email preferences and subscription settings
CREATE TABLE IF NOT EXISTS email_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    
    -- Transactional email preferences
    order_confirmations BOOLEAN DEFAULT true,
    shipping_notifications BOOLEAN DEFAULT true,
    delivery_notifications BOOLEAN DEFAULT true,
    order_updates BOOLEAN DEFAULT true,
    payment_receipts BOOLEAN DEFAULT true,
    
    -- Marketing email preferences
    newsletter BOOLEAN DEFAULT false,
    promotions BOOLEAN DEFAULT false,
    product_announcements BOOLEAN DEFAULT false,
    special_offers BOOLEAN DEFAULT false,
    
    -- Communication preferences
    email_frequency VARCHAR(20) DEFAULT 'normal', -- 'minimal', 'normal', 'frequent'
    preferred_language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Europe/London',
    
    -- Unsubscribe tokens for one-click unsubscribe
    unsubscribe_token VARCHAR(255) UNIQUE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(customer_id),
    UNIQUE(email)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_preferences_customer ON email_preferences(customer_id);
CREATE INDEX IF NOT EXISTS idx_email_preferences_email ON email_preferences(email);
CREATE INDEX IF NOT EXISTS idx_email_preferences_unsubscribe ON email_preferences(unsubscribe_token);

-- ================================================================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ================================================================================
-- Store newsletter subscribers (may not be customers yet)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    source VARCHAR(100), -- 'homepage', 'checkout', 'product_page', etc.
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
    confirmed BOOLEAN DEFAULT false,
    confirmation_token VARCHAR(255) UNIQUE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    unsubscribe_token VARCHAR(255) UNIQUE,
    
    -- Subscription preferences
    interests JSONB DEFAULT '[]', -- Array of interests: ['calligraphy', 'architecture', etc.]
    preferred_frequency VARCHAR(20) DEFAULT 'weekly', -- 'daily', 'weekly', 'monthly'
    
    -- Analytics
    signup_ip VARCHAR(45),
    signup_user_agent TEXT,
    last_email_sent_at TIMESTAMP WITH TIME ZONE,
    total_emails_sent INTEGER DEFAULT 0,
    total_emails_opened INTEGER DEFAULT 0,
    total_links_clicked INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_confirmed ON newsletter_subscribers(confirmed);
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe ON newsletter_subscribers(unsubscribe_token);

-- ================================================================================
-- EMAIL CAMPAIGNS TABLE
-- ================================================================================
-- Store marketing email campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
    
    -- Campaign content
    html_content TEXT,
    text_content TEXT,
    
    -- Targeting
    target_audience JSONB DEFAULT '{}', -- Criteria for recipient selection
    recipient_count INTEGER DEFAULT 0,
    
    -- Scheduling
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Analytics
    emails_sent INTEGER DEFAULT 0,
    emails_delivered INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    emails_bounced INTEGER DEFAULT 0,
    emails_complained INTEGER DEFAULT 0,
    
    -- Campaign settings
    track_opens BOOLEAN DEFAULT true,
    track_clicks BOOLEAN DEFAULT true,
    
    created_by UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_scheduled ON email_campaigns(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_created_by ON email_campaigns(created_by);

-- ================================================================================
-- CAMPAIGN RECIPIENTS TABLE
-- ================================================================================
-- Track individual campaign sends
CREATE TABLE IF NOT EXISTS campaign_recipients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES email_campaigns(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    newsletter_subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE SET NULL,
    
    -- Send status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
    resend_email_id VARCHAR(255),
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Engagement tracking
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    complained_at TIMESTAMP WITH TIME ZONE,
    
    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(campaign_id, email)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_email ON campaign_recipients(email);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);

-- ================================================================================
-- EMAIL SETTINGS TABLE
-- ================================================================================
-- Store global email configuration settings
CREATE TABLE IF NOT EXISTS email_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================================
-- TRIGGERS FOR UPDATED_AT
-- ================================================================================
-- Create function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at columns
DROP TRIGGER IF EXISTS update_email_templates_updated_at ON email_templates;
CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_preferences_updated_at ON email_preferences;
CREATE TRIGGER update_email_preferences_updated_at
    BEFORE UPDATE ON email_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON newsletter_subscribers;
CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_campaigns_updated_at ON email_campaigns;
CREATE TRIGGER update_email_campaigns_updated_at
    BEFORE UPDATE ON email_campaigns
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_settings_updated_at ON email_settings;
CREATE TRIGGER update_email_settings_updated_at
    BEFORE UPDATE ON email_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================================================

-- Email Templates - Admin only for modifications, public read for active templates
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active email templates" ON email_templates
    FOR SELECT
    USING (active = true);

CREATE POLICY "Admins can manage email templates" ON email_templates
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Email Logs - Admins can view all, customers can view their own
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all email logs" ON email_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Customers can view their email logs" ON email_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.email = email_logs.recipient_email
        )
    );

CREATE POLICY "System can insert email logs" ON email_logs
    FOR INSERT
    WITH CHECK (true);

-- Email Preferences - Users can manage their own preferences
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their email preferences" ON email_preferences
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM customers
            WHERE customers.id = email_preferences.customer_id
            AND EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.user_id = auth.uid()
                AND profiles.email = customers.email
            )
        )
    );

CREATE POLICY "Admins can view all email preferences" ON email_preferences
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Newsletter Subscribers - Public can insert, admins can manage
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can subscribe to newsletter" ON newsletter_subscribers
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public can update their own subscription" ON newsletter_subscribers
    FOR UPDATE
    USING (true); -- Allow updates for unsubscribe functionality

CREATE POLICY "Admins can manage newsletter subscribers" ON newsletter_subscribers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Email Campaigns - Admin only
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email campaigns" ON email_campaigns
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Campaign Recipients - Admin only
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage campaign recipients" ON campaign_recipients
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Email Settings - Admin only for modifications, public read
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view email settings" ON email_settings
    FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage email settings" ON email_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- ================================================================================
-- DEFAULT EMAIL SETTINGS
-- ================================================================================
INSERT INTO email_settings (key, value, description, category) VALUES
    ('smtp_provider', '"resend"', 'Email service provider', 'smtp'),
    ('from_name', '"Ashhadu Islamic Art"', 'Default sender name', 'general'),
    ('from_email', '"orders@ashhadu.co.uk"', 'Default sender email', 'general'),
    ('reply_to_email', '"support@ashhadu.co.uk"', 'Default reply-to email', 'general'),
    ('admin_notification_emails', '["admin@ashhadu.co.uk"]', 'Admin notification recipients', 'admin'),
    ('enable_order_confirmations', 'true', 'Send order confirmation emails', 'transactional'),
    ('enable_shipping_notifications', 'true', 'Send shipping notification emails', 'transactional'),
    ('enable_admin_notifications', 'true', 'Send admin notification emails', 'admin'),
    ('enable_newsletter', 'true', 'Enable newsletter functionality', 'marketing'),
    ('newsletter_frequency', '"weekly"', 'Default newsletter frequency', 'marketing'),
    ('email_tracking', 'true', 'Enable email open/click tracking', 'analytics'),
    ('max_daily_emails', '1000', 'Maximum emails per day limit', 'limits'),
    ('bounce_threshold', '5', 'Bounce threshold before disabling', 'limits')
ON CONFLICT (key) DO NOTHING;

-- ================================================================================
-- DEFAULT EMAIL TEMPLATES
-- ================================================================================
INSERT INTO email_templates (template_key, name, description, subject_template, html_content, text_content, category) VALUES
    (
        'order-confirmation',
        'Order Confirmation',
        'Sent when a customer places an order',
        'Order Confirmation - #{{orderNumber}}',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">Order Confirmation</h2>
            <p>Dear {{customerName}},</p>
            <p>Thank you for your order! Your order #{{orderNumber}} has been confirmed.</p>
            <p><strong>Order Details:</strong></p>
            <ul>{{orderItems}}</ul>
            <p><strong>Total: £{{orderTotal}}</strong></p>
            <p>We''ll send you another email when your order ships.</p>
            <p>Best regards,<br>Ashhadu Islamic Art Team</p>
        </div>',
        'Order Confirmation

Dear {{customerName}},

Thank you for your order! Your order #{{orderNumber}} has been confirmed.

Order Details:
{{orderItems}}

Total: £{{orderTotal}}

We''ll send you another email when your order ships.

Best regards,
Ashhadu Islamic Art Team',
        'transactional'
    ),
    (
        'welcome',
        'Welcome Email',
        'Sent to new customers',
        'Welcome to Ashhadu Islamic Art',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">Welcome to Ashhadu Islamic Art</h2>
            <p>Dear {{customerName}},</p>
            <p>Welcome to our community of Islamic art enthusiasts!</p>
            <p>Explore our collection of beautiful Islamic calligraphy and art pieces.</p>
            <p><a href="{{siteUrl}}/shop" style="background: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Shop Now</a></p>
            <p>Best regards,<br>Ashhadu Islamic Art Team</p>
        </div>',
        'Welcome to Ashhadu Islamic Art

Dear {{customerName}},

Welcome to our community of Islamic art enthusiasts!

Explore our collection of beautiful Islamic calligraphy and art pieces.

Visit our shop: {{siteUrl}}/shop

Best regards,
Ashhadu Islamic Art Team',
        'transactional'
    ),
    (
        'admin-new-order',
        'Admin New Order Notification',
        'Sent to admins when new order is placed',
        '[NEW ORDER] Order #{{orderNumber}} - {{customerName}}',
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">New Order Received</h2>
            <p><strong>Order #{{orderNumber}}</strong></p>
            <p><strong>Customer:</strong> {{customerName}} ({{customerEmail}})</p>
            <p><strong>Total:</strong> £{{orderTotal}}</p>
            <p><strong>Items:</strong></p>
            <ul>{{orderItems}}</ul>
            <p><a href="{{adminUrl}}/orders/{{orderId}}" style="background: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a></p>
        </div>',
        'New Order Received

Order #{{orderNumber}}

Customer: {{customerName}} ({{customerEmail}})
Total: £{{orderTotal}}

Items:
{{orderItems}}

View order in admin: {{adminUrl}}/orders/{{orderId}}',
        'admin'
    )
ON CONFLICT (template_key) DO NOTHING;

-- ================================================================================
-- HELPFUL VIEWS
-- ================================================================================

-- Email analytics view
CREATE OR REPLACE VIEW email_analytics AS
SELECT 
    template,
    DATE_TRUNC('day', sent_at) as date,
    COUNT(*) as emails_sent,
    COUNT(*) FILTER (WHERE status = 'sent') as emails_delivered,
    COUNT(*) FILTER (WHERE opened_at IS NOT NULL) as emails_opened,
    COUNT(*) FILTER (WHERE clicked_at IS NOT NULL) as emails_clicked,
    COUNT(*) FILTER (WHERE bounced_at IS NOT NULL) as emails_bounced,
    COUNT(*) FILTER (WHERE complained_at IS NOT NULL) as emails_complained,
    ROUND(
        (COUNT(*) FILTER (WHERE opened_at IS NOT NULL)::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE status = 'sent'), 0)) * 100, 
        2
    ) as open_rate,
    ROUND(
        (COUNT(*) FILTER (WHERE clicked_at IS NOT NULL)::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE opened_at IS NOT NULL), 0)) * 100, 
        2
    ) as click_rate
FROM email_logs
WHERE sent_at IS NOT NULL
GROUP BY template, DATE_TRUNC('day', sent_at);

-- Newsletter analytics view
CREATE OR REPLACE VIEW newsletter_analytics AS
SELECT 
    status,
    confirmed,
    COUNT(*) as subscriber_count,
    AVG(total_emails_opened::DECIMAL / NULLIF(total_emails_sent, 0)) as avg_open_rate,
    AVG(total_links_clicked::DECIMAL / NULLIF(total_emails_sent, 0)) as avg_click_rate
FROM newsletter_subscribers
GROUP BY status, confirmed;

-- ================================================================================
-- COMMENTS
-- ================================================================================
COMMENT ON TABLE email_templates IS 'Stores customizable email templates for different types of emails';
COMMENT ON TABLE email_logs IS 'Tracks all email sends for debugging and analytics';
COMMENT ON TABLE email_preferences IS 'Stores customer email preferences and subscription settings';
COMMENT ON TABLE newsletter_subscribers IS 'Stores newsletter subscribers who may not be customers yet';
COMMENT ON TABLE email_campaigns IS 'Stores marketing email campaigns';
COMMENT ON TABLE campaign_recipients IS 'Tracks individual campaign sends';
COMMENT ON TABLE email_settings IS 'Stores global email configuration settings';

COMMENT ON COLUMN email_templates.variables IS 'JSONB object containing available template variables and their descriptions';
COMMENT ON COLUMN email_logs.metadata IS 'JSONB object for storing additional email metadata';
COMMENT ON COLUMN newsletter_subscribers.interests IS 'JSONB array of subscriber interests for targeted campaigns';