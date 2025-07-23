// Email service exports
export { emailService as default, EmailService } from './email-service';
export { resend, EMAIL_CONFIG } from './resend-client';
export type { 
  EmailData, 
  TransactionalEmailData, 
  AdminEmailData, 
  MarketingEmailData
} from './email-service';

// Convenience functions for common email operations
import emailService from './email-service';

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  orderDetails?: Record<string, any>
) {
  return await emailService.sendTemplateEmail('order_confirmation', {
    to: customerEmail,
    variables: {
      customerName,
      customerEmail,
      orderNumber,
      orderDate: orderDetails?.orderDate || new Date().toLocaleDateString('en-GB'),
      orderItems: orderDetails?.orderItems || [],
      subtotal: orderDetails?.subtotal || 0,
      shipping: orderDetails?.shipping || 0,
      tax: orderDetails?.tax || 0,
      total: orderDetails?.total || 0,
      shippingAddress: orderDetails?.shippingAddress || {
        name: customerName,
        address: 'Address not provided',
        city: 'Unknown',
        postalCode: 'Unknown',
        country: 'UK'
      },
      billingAddress: orderDetails?.billingAddress || orderDetails?.shippingAddress,
      trackingUrl: orderDetails?.trackingUrl,
    },
    replyTo: 'support@ashhadu.co.uk',
    tags: [
      { name: 'category', value: 'transactional' },
      { name: 'template', value: 'order_confirmation' },
      { name: 'order_number', value: orderNumber }
    ]
  });
}

/**
 * Send welcome email to new customers
 */
export async function sendWelcomeEmail(
  customerEmail: string,
  customerName: string
) {
  return await emailService.sendTemplateEmail('welcome', {
    to: customerEmail,
    variables: {
      customerName,
      customerEmail,
    },
    replyTo: 'support@ashhadu.co.uk',
    tags: [
      { name: 'category', value: 'transactional' },
      { name: 'template', value: 'welcome' },
      { name: 'customer_email', value: customerEmail }
    ]
  });
}

/**
 * Send admin notification for new orders
 */
export async function sendAdminNewOrderNotification(
  adminEmails: string[],
  orderNumber: string,
  orderDetails: Record<string, any>
) {
  return await emailService.sendTemplateEmail('admin_new_order', {
    to: adminEmails,
    variables: {
      orderNumber,
      orderDate: orderDetails.orderDate || new Date().toLocaleDateString('en-GB'),
      customerName: orderDetails.customerName,
      customerEmail: orderDetails.customerEmail,
      customerPhone: orderDetails.customerPhone,
      orderItems: orderDetails.orderItems || [],
      subtotal: orderDetails.subtotal || 0,
      shipping: orderDetails.shipping || 0,
      tax: orderDetails.tax || 0,
      total: orderDetails.total || 0,
      paymentMethod: orderDetails.paymentMethod || 'Unknown',
      paymentStatus: orderDetails.paymentStatus || 'pending',
      shippingAddress: orderDetails.shippingAddress || {
        name: orderDetails.customerName,
        address: 'Address not provided',
        city: 'Unknown',
        postalCode: 'Unknown',
        country: 'UK'
      },
      billingAddress: orderDetails.billingAddress || orderDetails.shippingAddress || {
        name: orderDetails.customerName,
        address: 'Address not provided',
        city: 'Unknown',
        postalCode: 'Unknown',
        country: 'UK'
      },
      orderId: orderDetails.orderId,
      urgent: orderDetails.urgent || false,
    },
    replyTo: 'admin@ashhadu.co.uk',
    tags: [
      { name: 'category', value: 'admin' },
      { name: 'template', value: 'admin_new_order' },
      { name: 'order_number', value: orderNumber },
      { name: 'priority', value: orderDetails.urgent ? 'urgent' : 'normal' }
    ]
  });
}

/**
 * Send admin low stock notification
 */
export async function sendAdminLowStockNotification(
  adminEmails: string[],
  productName: string,
  currentStock: number,
  threshold: number
) {
  return await emailService.sendTemplateEmail('admin_low_stock', {
    to: adminEmails,
    variables: {
      productName,
      currentStock,
      threshold
    },
    replyTo: 'admin@ashhadu.co.uk',
    tags: [
      { name: 'category', value: 'admin' },
      { name: 'template', value: 'admin_low_stock' },
      { name: 'priority', value: 'high' },
      { name: 'product_name', value: productName }
    ]
  });
}

/**
 * Send newsletter welcome email
 */
export async function sendNewsletterWelcomeEmail(
  subscriberEmail: string,
  subscriberName?: string
) {
  return await emailService.sendTemplateEmail('newsletter_welcome', {
    to: subscriberEmail,
    variables: {
      subscriberName: subscriberName || 'Subscriber',
      subscriberEmail,
    },
    replyTo: 'support@ashhadu.co.uk',
    tags: [
      { name: 'category', value: 'marketing' },
      { name: 'template', value: 'newsletter_welcome' },
      { name: 'subscriber_email', value: subscriberEmail }
    ]
  });
}