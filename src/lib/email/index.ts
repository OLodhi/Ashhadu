// Email service exports
export { emailService as default, EmailService } from './email-service';
export { resend, EMAIL_CONFIG } from './resend-client';
export type { 
  EmailData, 
  TransactionalEmailData, 
  AdminEmailData, 
  MarketingEmailData,
  EmailTemplate 
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
  try {
    // Import the React Email component
    const { default: OrderConfirmationEmail } = await import('../../emails/OrderConfirmationEmail');
    const { render } = await import('@react-email/render');
    
    // Prepare email data
    const emailData = {
      customerName,
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
      trackingUrl: orderDetails?.trackingUrl,
    };

    // Render the email template
    const html = await render(OrderConfirmationEmail(emailData));
    const text = `Order Confirmation - #${orderNumber}

Dear ${customerName},

Thank you for your order! Your order #${orderNumber} has been confirmed.

Order Total: £${orderDetails?.total?.toFixed(2) || '0.00'}

We'll send you another email when your order ships.

Best regards,
Ashhadu Islamic Art Team`;

    // Send using the email service
    return await emailService.sendEmail({
      to: customerEmail,
      subject: `Order Confirmation - #${orderNumber}`,
      html,
      text,
      replyTo: 'support@ashhadu.co.uk',
      tags: [
        { name: 'category', value: 'transactional' },
        { name: 'template', value: 'order-confirmation' },
        { name: 'order_number', value: orderNumber }
      ]
    });
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return { success: false, error: 'Failed to send order confirmation email' };
  }
}

/**
 * Send welcome email to new customers
 */
export async function sendWelcomeEmail(
  customerEmail: string,
  customerName: string
) {
  try {
    // Import the React Email component
    const { default: WelcomeEmail } = await import('../../emails/WelcomeEmail');
    const { render } = await import('@react-email/render');
    
    // Prepare email data
    const emailData = {
      customerName,
      customerEmail,
    };

    // Render the email template
    const html = await render(WelcomeEmail(emailData));
    const text = `Welcome to Ashhadu Islamic Art

As-salāmu ʿalaykum, ${customerName}!

We're delighted to welcome you to our community of Islamic art enthusiasts.

Ashhadu Islamic Art specializes in creating premium 3D printed Islamic calligraphy and architectural pieces that bring the beauty of Islamic heritage into your home.

As a welcome gift, enjoy 10% off your first order with code: WELCOME10
Valid for 30 days • Minimum order £50 • Cannot be combined with other offers

Start Shopping: https://ashhadu.co.uk/shop

Best regards,
Ashhadu Islamic Art Team`;

    // Send using the email service
    return await emailService.sendEmail({
      to: customerEmail,
      subject: 'Welcome to Ashhadu Islamic Art',
      html,
      text,
      replyTo: 'support@ashhadu.co.uk',
      tags: [
        { name: 'category', value: 'transactional' },
        { name: 'template', value: 'welcome' },
        { name: 'customer_email', value: customerEmail }
      ]
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: 'Failed to send welcome email' };
  }
}

/**
 * Send admin notification for new orders
 */
export async function sendAdminNewOrderNotification(
  adminEmails: string[],
  orderNumber: string,
  orderDetails: Record<string, any>
) {
  try {
    // Import the React Email component
    const { default: AdminNewOrderEmail } = await import('../../emails/AdminNewOrderEmail');
    const { render } = await import('@react-email/render');
    
    // Prepare email data
    const emailData = {
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
    };

    // Render the email template
    const html = await render(AdminNewOrderEmail(emailData));
    const priorityLabel = emailData.urgent ? '[URGENT]' : '[NEW ORDER]';
    const text = `${priorityLabel} New Order Received - #${orderNumber}

Customer: ${orderDetails.customerName} (${orderDetails.customerEmail})
Total: £${orderDetails.total?.toFixed(2) || '0.00'}
Payment: ${orderDetails.paymentMethod} - ${orderDetails.paymentStatus}

Items:
${orderDetails.orderItems?.map((item: any) => `- ${item.name} x${item.quantity} = £${(item.price * item.quantity).toFixed(2)}`).join('\n') || 'No items'}

View order in admin: https://ashhadu.co.uk/admin/orders/${orderDetails.orderId}`;

    // Send using the email service
    return await emailService.sendEmail({
      to: adminEmails,
      subject: `${priorityLabel} Order #${orderNumber} - ${orderDetails.customerName}`,
      html,
      text,
      replyTo: 'admin@ashhadu.co.uk',
      tags: [
        { name: 'category', value: 'admin' },
        { name: 'template', value: 'admin-new-order' },
        { name: 'order_number', value: orderNumber },
        { name: 'priority', value: emailData.urgent ? 'urgent' : 'normal' }
      ]
    });
  } catch (error) {
    console.error('Error sending admin new order notification:', error);
    return { success: false, error: 'Failed to send admin notification email' };
  }
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
  return emailService.sendAdminEmail('admin-low-stock', {
    adminEmails,
    title: `Low Stock Alert - ${productName}`,
    message: `Product "${productName}" is running low on stock. Current: ${currentStock}, Threshold: ${threshold}`,
    priority: 'high',
    variables: { productName, currentStock, threshold }
  });
}

/**
 * Send newsletter welcome email
 */
export async function sendNewsletterWelcomeEmail(
  subscriberEmail: string,
  subscriberName?: string
) {
  try {
    // Simple newsletter welcome email (we can create a React template later)
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37;">Welcome to Ashhadu Newsletter</h2>
        <p>Dear ${subscriberName || 'Subscriber'},</p>
        <p>Thank you for subscribing to our newsletter! You'll be the first to know about:</p>
        <ul>
          <li>New Islamic art pieces and collections</li>
          <li>Special offers and discounts</li>
          <li>Behind-the-scenes crafting stories</li>
          <li>Islamic art history and inspiration</li>
        </ul>
        <p>Stay tuned for beautiful Islamic art updates!</p>
        <p>Best regards,<br>Ashhadu Islamic Art Team</p>
        <hr style="border: 1px solid #e5e5e5;">
        <p style="color: #666; font-size: 12px;">
          You can <a href="{{unsubscribeUrl}}">unsubscribe</a> at any time.
        </p>
      </div>
    `;

    const text = `Welcome to Ashhadu Newsletter

Dear ${subscriberName || 'Subscriber'},

Thank you for subscribing to our newsletter! You'll be the first to know about new Islamic art pieces, special offers, and inspiring stories.

Stay tuned for beautiful Islamic art updates!

Best regards,
Ashhadu Islamic Art Team

You can unsubscribe at any time.`;

    // Send using the email service with proper logging
    return await emailService.sendEmail({
      to: subscriberEmail,
      subject: 'Welcome to Ashhadu Newsletter',
      html,
      text,
      replyTo: 'support@ashhadu.co.uk',
      tags: [
        { name: 'category', value: 'marketing' },
        { name: 'template', value: 'newsletter-welcome' },
        { name: 'subscriber_email', value: subscriberEmail }
      ]
    });
  } catch (error) {
    console.error('Error sending newsletter welcome email:', error);
    return { success: false, error: 'Failed to send newsletter welcome email' };
  }
}