export interface SiteSetting {
  key: string;
  value: any;
  category: SettingCategory;
  label: string;
  description?: string;
  type: SettingType;
  created_at: string;
  updated_at: string;
}

export type SettingCategory = 
  | 'payment' 
  | 'store' 
  | 'shipping' 
  | 'tax' 
  | 'product' 
  | 'customer' 
  | 'features' 
  | 'email' 
  | 'social'
  | 'notifications'
  | 'showcase';

export type SettingType = 'string' | 'boolean' | 'number' | 'json';

export interface SettingsCategoryGroup {
  category: SettingCategory;
  title: string;
  description: string;
  icon?: string;
  settings: SiteSetting[];
}

// Type-safe setting keys
export const SETTING_KEYS = {
  // Payment Settings
  PAYMENT_STRIPE_ENABLED: 'payment_stripe_enabled',
  PAYMENT_PAYPAL_ENABLED: 'payment_paypal_enabled',
  PAYMENT_APPLE_PAY_ENABLED: 'payment_apple_pay_enabled',
  PAYMENT_GOOGLE_PAY_ENABLED: 'payment_google_pay_enabled',
  PAYMENT_TEST_MODE: 'payment_test_mode',
  
  // Store Information
  STORE_NAME: 'store_name',
  STORE_EMAIL: 'store_email',
  STORE_PHONE: 'store_phone',
  STORE_ADDRESS: 'store_address',
  STORE_CURRENCY: 'store_currency',
  STORE_COUNTRY: 'store_country',
  
  // Shipping Settings
  SHIPPING_FREE_THRESHOLD: 'shipping_free_threshold',
  SHIPPING_DEFAULT_COST: 'shipping_default_cost',
  SHIPPING_EXPRESS_ENABLED: 'shipping_express_enabled',
  SHIPPING_EXPRESS_COST: 'shipping_express_cost',
  SHIPPING_INTERNATIONAL_ENABLED: 'shipping_international_enabled',
  
  // Tax Settings
  TAX_RATE: 'tax_rate',
  TAX_INCLUSIVE_PRICING: 'tax_inclusive_pricing',
  TAX_DISPLAY_IN_CART: 'tax_display_in_cart',
  
  // Product Settings
  PRODUCT_LOW_STOCK_THRESHOLD: 'product_low_stock_threshold',
  PRODUCT_ALLOW_BACKORDERS: 'product_allow_backorders',
  PRODUCT_REVIEWS_ENABLED: 'product_reviews_enabled',
  PRODUCT_GUEST_REVIEWS: 'product_guest_reviews',
  
  // Customer Settings
  CUSTOMER_GUEST_CHECKOUT: 'customer_guest_checkout',
  CUSTOMER_EMAIL_VERIFICATION: 'customer_email_verification',
  CUSTOMER_MARKETING_DEFAULT: 'customer_marketing_default',
  
  // Feature Toggles
  FEATURE_WISHLIST: 'feature_wishlist',
  FEATURE_SEARCH: 'feature_search',
  FEATURE_NEWSLETTER: 'feature_newsletter',
  FEATURE_SOCIAL_LINKS: 'feature_social_links',
  
  // Email Settings
  EMAIL_ORDER_CONFIRMATION: 'email_order_confirmation',
  EMAIL_SHIPPING_NOTIFICATION: 'email_shipping_notification',
  EMAIL_ADMIN_NEW_ORDER: 'email_admin_new_order',
  EMAIL_ADMIN_LOW_STOCK: 'email_admin_low_stock',
  
  // Social Media Links
  SOCIAL_INSTAGRAM: 'social_instagram',
  SOCIAL_FACEBOOK: 'social_facebook',
  SOCIAL_TWITTER: 'social_twitter',
  SOCIAL_TIKTOK: 'social_tiktok',
  
  // Showcase 3D Model Settings
  SHOWCASE_3D_MODEL_ENABLED: 'showcase_3d_model_enabled',
  SHOWCASE_3D_MODEL_URL: 'showcase_3d_model_url',
  SHOWCASE_3D_MODEL_FORMAT: 'showcase_3d_model_format',
  SHOWCASE_3D_ROTATION_SPEED: 'showcase_3d_rotation_speed',
  SHOWCASE_3D_TITLE: 'showcase_3d_title',
  SHOWCASE_3D_DESCRIPTION: 'showcase_3d_description',
} as const;

export type SettingKey = typeof SETTING_KEYS[keyof typeof SETTING_KEYS];

// Helper type for getting setting value by key
export type SettingValue<K extends SettingKey> = 
  K extends 'payment_stripe_enabled' | 'payment_paypal_enabled' | 'payment_apple_pay_enabled' | 'payment_google_pay_enabled' | 'payment_test_mode' |
            'shipping_express_enabled' | 'shipping_international_enabled' | 'tax_inclusive_pricing' | 'tax_display_in_cart' |
            'product_allow_backorders' | 'product_reviews_enabled' | 'product_guest_reviews' | 'customer_guest_checkout' |
            'customer_email_verification' | 'customer_marketing_default' | 'feature_wishlist' | 'feature_search' |
            'feature_newsletter' | 'feature_social_links' | 'email_order_confirmation' | 'email_shipping_notification' |
            'email_admin_new_order' | 'email_admin_low_stock' | 'showcase_3d_model_enabled' ? boolean :
  K extends 'shipping_free_threshold' | 'shipping_default_cost' | 'shipping_express_cost' | 'tax_rate' | 
            'product_low_stock_threshold' | 'showcase_3d_rotation_speed' ? number :
  string;