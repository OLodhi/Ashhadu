import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration constants
export const EMAIL_CONFIG = {
  // From addresses - using verified ashhadu.co.uk domain
  FROM_ADMIN: 'Ashhadu Islamic Art <admin@ashhadu.co.uk>',
  FROM_ORDERS: 'Ashhadu Islamic Art <orders@ashhadu.co.uk>',
  FROM_SUPPORT: 'Ashhadu Islamic Art <support@ashhadu.co.uk>',
  FROM_MARKETING: 'Ashhadu Islamic Art <newsletter@ashhadu.co.uk>',
  
  // Reply-to addresses
  REPLY_TO_ADMIN: 'admin@ashhadu.co.uk',
  REPLY_TO_SUPPORT: 'support@ashhadu.co.uk',
  
  // Email templates (will be created later)
  TEMPLATES: {
    ORDER_CONFIRMATION: 'order-confirmation',
    ORDER_SHIPPED: 'order-shipped',
    ORDER_DELIVERED: 'order-delivered',
    ORDER_CANCELLED: 'order-cancelled',
    PASSWORD_RESET: 'password-reset',
    WELCOME: 'welcome',
    ADMIN_NEW_ORDER: 'admin-new-order',
    ADMIN_LOW_STOCK: 'admin-low-stock',
    ADMIN_NEW_CUSTOMER: 'admin-new-customer',
    NEWSLETTER_WELCOME: 'newsletter-welcome',
    NEWSLETTER_DIGEST: 'newsletter-digest',
  },
  
  // Email subjects
  SUBJECTS: {
    ORDER_CONFIRMATION: 'Order Confirmation - #{orderNumber}',
    ORDER_SHIPPED: 'Your Order Has Been Shipped - #{orderNumber}',
    ORDER_DELIVERED: 'Your Order Has Been Delivered - #{orderNumber}',
    ORDER_CANCELLED: 'Order Cancellation - #{orderNumber}',
    PASSWORD_RESET: 'Reset Your Password - Ashhadu Islamic Art',
    WELCOME: 'Welcome to Ashhadu Islamic Art',
    ADMIN_NEW_ORDER: 'New Order Received - #{orderNumber}',
    ADMIN_LOW_STOCK: 'Low Stock Alert - {productName}',
    ADMIN_NEW_CUSTOMER: 'New Customer Registration - {customerName}',
    NEWSLETTER_WELCOME: 'Welcome to Ashhadu Newsletter',
    NEWSLETTER_DIGEST: 'Ashhadu Newsletter - {month} {year}',
  }
} as const;

export type EmailTemplate = keyof typeof EMAIL_CONFIG.TEMPLATES;
export type EmailSubject = keyof typeof EMAIL_CONFIG.SUBJECTS;