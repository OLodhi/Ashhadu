-- User-Specific Admin Notification System Schema
-- Run this SQL in your Supabase SQL Editor to create the notification system

-- 1. Admin Notifications Table (User-Specific)
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN (
    'order_new', 'order_cancelled', 'order_shipped', 'order_delivered',
    'product_low_stock', 'product_out_of_stock', 'product_back_in_stock',
    'customer_new', 'customer_updated',
    'review_pending', 'review_approved', 'review_rejected',
    'payment_failed', 'payment_disputed',
    'system_alert', 'inventory_updated'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID, -- ID of related entity (order_id, product_id, customer_id)
  related_type TEXT CHECK (related_type IN ('order', 'product', 'customer', 'review', 'payment')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  read BOOLEAN DEFAULT false NOT NULL,
  dismissed BOOLEAN DEFAULT false NOT NULL,
  action_url TEXT, -- Deep link to relevant admin page
  metadata JSONB DEFAULT '{}'::JSONB, -- Additional contextual data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE -- Optional expiry for temporary notifications
);

-- 2. User-Specific Notification Settings Table
CREATE TABLE IF NOT EXISTS user_notification_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value JSONB NOT NULL DEFAULT 'true'::JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, setting_key)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_notifications_user_read ON admin_notifications(admin_user_id, read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_user_created ON admin_notifications(admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type ON admin_notifications(type);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_priority ON admin_notifications(priority);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_related ON admin_notifications(related_type, related_id);
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user ON user_notification_settings(user_id);

-- 4. Update trigger for user_notification_settings
CREATE OR REPLACE FUNCTION update_user_notification_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_notification_settings_updated_at
  BEFORE UPDATE ON user_notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_user_notification_settings_updated_at();

-- 5. Notification Distribution Function
-- Creates notifications for all admin users when system events occur
CREATE OR REPLACE FUNCTION create_notification_for_all_admins(
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  related_entity_id UUID DEFAULT NULL,
  related_entity_type TEXT DEFAULT NULL,
  notification_priority TEXT DEFAULT 'normal',
  action_url TEXT DEFAULT NULL,
  notification_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS INTEGER AS $$
DECLARE
  admin_count INTEGER := 0;
BEGIN
  -- Insert notification for each admin user
  INSERT INTO admin_notifications (
    admin_user_id, type, title, message, related_id, 
    related_type, priority, action_url, metadata
  )
  SELECT 
    p.user_id, 
    notification_type, 
    notification_title, 
    notification_message,
    related_entity_id, 
    related_entity_type, 
    notification_priority, 
    action_url, 
    notification_metadata
  FROM profiles p 
  WHERE p.role = 'admin';
  
  GET DIAGNOSTICS admin_count = ROW_COUNT;
  
  RAISE NOTICE 'Created % notifications for % admin users', admin_count, (admin_count / CASE WHEN admin_count > 0 THEN 1 ELSE 1 END);
  
  RETURN admin_count;
END;
$$ LANGUAGE plpgsql;

-- 6. New Order Notification Trigger
CREATE OR REPLACE FUNCTION notify_admins_new_order() 
RETURNS TRIGGER AS $$
DECLARE
  customer_name TEXT;
  order_total_formatted TEXT;
BEGIN
  -- Only notify for new orders (not updates)
  IF TG_OP = 'INSERT' AND NEW.status IN ('pending', 'processing') THEN
    -- Get customer name for notification
    SELECT COALESCE(NULLIF(first_name || ' ' || last_name, ' '), email) 
    INTO customer_name
    FROM customers 
    WHERE id = NEW.customer_id;
    
    -- Format total with currency
    order_total_formatted := '£' || to_char(NEW.total, 'FM999,999.00');
    
    -- Create notification for all admins
    PERFORM create_notification_for_all_admins(
      'order_new',
      'New Order Received',
      'Order #' || NEW.order_number || ' - ' || order_total_formatted || 
      CASE WHEN customer_name IS NOT NULL THEN ' from ' || customer_name ELSE '' END,
      NEW.id,
      'order',
      'normal',
      '/admin/orders/' || NEW.id::TEXT,
      jsonb_build_object(
        'order_total', NEW.total, 
        'order_number', NEW.order_number,
        'customer_name', customer_name,
        'payment_method', NEW.payment_method
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_admins_new_order();

-- 7. Order Cancellation Notification Trigger
CREATE OR REPLACE FUNCTION notify_admins_order_cancelled() 
RETURNS TRIGGER AS $$
DECLARE
  customer_name TEXT;
  order_total_formatted TEXT;
BEGIN
  -- Only notify when order status changes to cancelled
  IF TG_OP = 'UPDATE' AND OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
    -- Get customer name for notification
    SELECT COALESCE(NULLIF(first_name || ' ' || last_name, ' '), email) 
    INTO customer_name
    FROM customers 
    WHERE id = NEW.customer_id;
    
    -- Format total with currency
    order_total_formatted := '£' || to_char(NEW.total, 'FM999,999.00');
    
    -- Create notification for all admins
    PERFORM create_notification_for_all_admins(
      'order_cancelled',
      'Order Cancelled',
      'Order #' || NEW.order_number || ' (' || order_total_formatted || ') has been cancelled' ||
      CASE WHEN customer_name IS NOT NULL THEN ' by ' || customer_name ELSE '' END,
      NEW.id,
      'order',
      'high',
      '/admin/orders/' || NEW.id::TEXT,
      jsonb_build_object(
        'order_total', NEW.total, 
        'order_number', NEW.order_number,
        'customer_name', customer_name,
        'cancellation_reason', COALESCE(NEW.notes, 'No reason provided')
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_notify_order_cancelled
  AFTER UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION notify_admins_order_cancelled();

-- 8. Low Stock Notification Trigger
CREATE OR REPLACE FUNCTION notify_admins_low_stock() 
RETURNS TRIGGER AS $$
BEGIN
  -- Check if stock crossed below threshold (from above to below)
  IF OLD.stock > OLD.low_stock_threshold AND NEW.stock <= NEW.low_stock_threshold AND NEW.stock > 0 THEN
    PERFORM create_notification_for_all_admins(
      'product_low_stock',
      'Low Stock Alert',
      NEW.name || ' is running low (' || NEW.stock::TEXT || ' remaining)',
      NEW.id,
      'product',
      'high',
      '/admin/products/' || NEW.id::TEXT || '/edit',
      jsonb_build_object(
        'current_stock', NEW.stock, 
        'threshold', NEW.low_stock_threshold,
        'product_name', NEW.name,
        'sku', NEW.sku
      )
    );
  END IF;
  
  -- Check if item went out of stock (from in-stock to zero)
  IF OLD.stock > 0 AND NEW.stock = 0 THEN
    PERFORM create_notification_for_all_admins(
      'product_out_of_stock',
      'Out of Stock Alert',
      NEW.name || ' is now out of stock',
      NEW.id,
      'product',
      'urgent',
      '/admin/products/' || NEW.id::TEXT || '/edit',
      jsonb_build_object(
        'product_name', NEW.name, 
        'sku', NEW.sku,
        'category', NEW.category
      )
    );
  END IF;
  
  -- Check if item came back in stock (from zero to positive)
  IF OLD.stock = 0 AND NEW.stock > 0 THEN
    PERFORM create_notification_for_all_admins(
      'product_back_in_stock',
      'Back in Stock',
      NEW.name || ' is back in stock (' || NEW.stock::TEXT || ' available)',
      NEW.id,
      'product',
      'normal',
      '/admin/products/' || NEW.id::TEXT,
      jsonb_build_object(
        'current_stock', NEW.stock,
        'product_name', NEW.name,
        'sku', NEW.sku
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_notify_stock_levels
  AFTER UPDATE OF stock ON products
  FOR EACH ROW EXECUTE FUNCTION notify_admins_low_stock();

-- 9. New Customer Notification Trigger
CREATE OR REPLACE FUNCTION notify_admins_new_customer() 
RETURNS TRIGGER AS $$
BEGIN
  -- Notify when new customer is created
  IF TG_OP = 'INSERT' THEN
    PERFORM create_notification_for_all_admins(
      'customer_new',
      'New Customer Registered',
      COALESCE(NULLIF(NEW.first_name || ' ' || NEW.last_name, ' '), 'Customer') || 
      ' (' || NEW.email || ') has registered',
      NEW.id,
      'customer',
      'low',
      '/admin/customers/' || NEW.id::TEXT,
      jsonb_build_object(
        'customer_name', COALESCE(NULLIF(NEW.first_name || ' ' || NEW.last_name, ' '), 'Customer'),
        'email', NEW.email,
        'marketing_consent', NEW.marketing_consent
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_notify_new_customer
  AFTER INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION notify_admins_new_customer();

-- 10. Review Notification Trigger
CREATE OR REPLACE FUNCTION notify_admins_new_review() 
RETURNS TRIGGER AS $$
DECLARE
  product_name TEXT;
  customer_name TEXT;
BEGIN
  -- Only notify for new reviews (not updates)
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- Get product name
    SELECT name INTO product_name FROM products WHERE id = NEW.product_id;
    
    -- Get customer name
    SELECT COALESCE(NULLIF(first_name || ' ' || last_name, ' '), email) 
    INTO customer_name
    FROM customers 
    WHERE id = NEW.customer_id;
    
    PERFORM create_notification_for_all_admins(
      'review_pending',
      'New Review Pending Approval',
      'Review for ' || COALESCE(product_name, 'Unknown Product') || 
      ' by ' || COALESCE(customer_name, 'Customer') || 
      ' (' || NEW.rating::TEXT || ' stars)',
      NEW.id,
      'review',
      'normal',
      '/admin/reviews/' || NEW.id::TEXT,
      jsonb_build_object(
        'product_name', product_name,
        'customer_name', customer_name,
        'rating', NEW.rating,
        'review_excerpt', LEFT(NEW.comment, 100)
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_notify_new_review
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION notify_admins_new_review();

-- 11. Row Level Security (RLS) Policies
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON admin_notifications 
  FOR SELECT USING (admin_user_id = auth.uid());

-- Users can update their own notification read/dismissed status
CREATE POLICY "Users can update own notifications" ON admin_notifications 
  FOR UPDATE USING (admin_user_id = auth.uid());

-- Users can delete their own dismissed notifications
CREATE POLICY "Users can delete own dismissed notifications" ON admin_notifications 
  FOR DELETE USING (admin_user_id = auth.uid() AND dismissed = true);

-- System can create notifications for admin users (service role key)
CREATE POLICY "System can create notifications" ON admin_notifications 
  FOR INSERT WITH CHECK (true);

-- Users can manage their own notification settings
CREATE POLICY "Users can manage own notification settings" ON user_notification_settings 
  FOR ALL USING (user_id = auth.uid());

-- 12. Default Notification Settings for New Admin Users
-- This function sets up default notification preferences when a new admin user is created
CREATE OR REPLACE FUNCTION setup_default_admin_notification_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set up for admin users
  IF NEW.role = 'admin' THEN
    INSERT INTO user_notification_settings (user_id, setting_key, setting_value) VALUES
    (NEW.user_id, 'notification_new_orders', 'true'::JSONB),
    (NEW.user_id, 'notification_cancelled_orders', 'true'::JSONB),
    (NEW.user_id, 'notification_low_stock', 'true'::JSONB),
    (NEW.user_id, 'notification_out_of_stock', 'true'::JSONB),
    (NEW.user_id, 'notification_back_in_stock', 'false'::JSONB),
    (NEW.user_id, 'notification_new_customers', 'false'::JSONB),
    (NEW.user_id, 'notification_pending_reviews', 'true'::JSONB),
    (NEW.user_id, 'notification_payment_failures', 'true'::JSONB),
    (NEW.user_id, 'notification_sound_enabled', 'true'::JSONB),
    (NEW.user_id, 'notification_desktop_enabled', 'true'::JSONB),
    (NEW.user_id, 'notification_email_digest', '"daily"'::JSONB),
    (NEW.user_id, 'notification_auto_dismiss_days', '30'::JSONB)
    ON CONFLICT (user_id, setting_key) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS trigger_setup_admin_notification_settings
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION setup_default_admin_notification_settings();

-- 13. Cleanup function for old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM admin_notifications 
  WHERE created_at < NOW() - INTERVAL '1 day' * days_old 
  AND (dismissed = true OR read = true);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RAISE NOTICE 'Cleaned up % old notifications', deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE admin_notifications IS 'User-specific admin notifications for system events';
COMMENT ON TABLE user_notification_settings IS 'Individual notification preferences per admin user';
COMMENT ON FUNCTION create_notification_for_all_admins IS 'Creates notifications for all admin users when system events occur';
COMMENT ON FUNCTION cleanup_old_notifications IS 'Removes old read/dismissed notifications to keep table size manageable';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ User-specific admin notification system schema created successfully!';
  RAISE NOTICE 'Tables created: admin_notifications, user_notification_settings';
  RAISE NOTICE 'Triggers created: new orders, cancelled orders, stock levels, new customers, new reviews';
  RAISE NOTICE 'RLS policies: user-scoped access for notifications and settings';
  RAISE NOTICE 'Ready to implement notification APIs and UI components!';
END
$$;