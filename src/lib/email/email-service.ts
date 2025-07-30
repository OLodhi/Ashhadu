import * as React from 'react';
import { resend, EMAIL_CONFIG, EmailTemplate } from './resend-client';
import { render } from '@react-email/render';
import { createServerClient } from '@supabase/ssr';
import { 
  getReactEmailTemplate, 
  hasReactEmailTemplate, 
  validateTemplateVariables,
  EmailTemplateData 
} from './template-registry';

// Create server-side Supabase client for email service
function createSupabaseClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );
}

// Email types
export interface EmailData {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType?: string;
  }>;
}

export interface TransactionalEmailData {
  customerEmail: string;
  customerName: string;
  orderNumber?: string;
  orderId?: string;
  productName?: string;
  variables?: Record<string, any>;
}

export interface AdminEmailData {
  adminEmails: string[];
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  variables?: Record<string, any>;
}

export interface MarketingEmailData {
  recipients: string[];
  subject: string;
  campaignName?: string;
  variables?: Record<string, any>;
}

class EmailService {
  /**
   * Send a raw email using Resend
   */
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log('📧 EmailService: Sending email:', {
        to: emailData.to,
        subject: emailData.subject,
        hasHtml: !!emailData.html,
        hasText: !!emailData.text
      });

      const result = await resend.emails.send({
        from: EMAIL_CONFIG.FROM_ORDERS,
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        replyTo: emailData.replyTo || EMAIL_CONFIG.REPLY_TO_SUPPORT,
        tags: emailData.tags,
        attachments: emailData.attachments,
      });

      if (result.error) {
        console.error('❌ EmailService: Resend error:', result.error);
        return { success: false, error: result.error.message };
      }

      console.log('✅ EmailService: Email sent successfully:', result.data?.id);
      
      // Log all emails to database
      await this.logEmailToDatabase(emailData, result.data?.id, true);
      
      return { success: true, id: result.data?.id };
    } catch (error) {
      console.error('❌ EmailService: Send email error:', error);
      // Log failed emails too
      await this.logEmailToDatabase(emailData, undefined, false, error instanceof Error ? error.message : 'Unknown email error');
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown email error' 
      };
    }
  }

  /**
   * Send transactional email (order confirmations, shipping notifications, etc.)
   */
  async sendTransactionalEmail(
    template: EmailTemplate,
    data: TransactionalEmailData
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log('📧 EmailService: Sending transactional email:', {
        template,
        customerEmail: data.customerEmail,
        orderNumber: data.orderNumber
      });

      // Get email template from database or use fallback
      const emailTemplate = await this.getEmailTemplate(template, data);
      
      const emailData: EmailData = {
        to: data.customerEmail,
        subject: this.formatSubject(template, data),
        html: emailTemplate.html,
        text: emailTemplate.text,
        replyTo: EMAIL_CONFIG.REPLY_TO_SUPPORT,
        tags: [
          { name: 'category', value: 'transactional' },
          { name: 'template', value: template },
          ...(data.orderNumber ? [{ name: 'order_number', value: data.orderNumber }] : [])
        ]
      };

      const result = await this.sendEmail(emailData);

      // Log email send attempt to database
      if (data.orderNumber) {
        await this.logEmailSend(template, data.customerEmail, data.orderNumber, result.success, result.id);
      }

      return result;
    } catch (error) {
      console.error('❌ EmailService: Transactional email error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown transactional email error' 
      };
    }
  }

  /**
   * Send admin notification email
   */
  async sendAdminEmail(
    template: EmailTemplate,
    data: AdminEmailData
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log('📧 EmailService: Sending admin email:', {
        template,
        adminCount: data.adminEmails.length,
        priority: data.priority
      });

      // Get email template
      const emailTemplate = await this.getAdminEmailTemplate(template, data);
      
      const emailData: EmailData = {
        to: data.adminEmails,
        subject: `[${data.priority.toUpperCase()}] ${data.title}`,
        html: emailTemplate.html,
        text: emailTemplate.text,
        replyTo: EMAIL_CONFIG.REPLY_TO_ADMIN,
        tags: [
          { name: 'category', value: 'admin' },
          { name: 'template', value: template },
          { name: 'priority', value: data.priority }
        ]
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('❌ EmailService: Admin email error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown admin email error' 
      };
    }
  }

  /**
   * Send marketing email (newsletters, promotions, etc.)
   */
  async sendMarketingEmail(
    template: EmailTemplate,
    data: MarketingEmailData
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log('📧 EmailService: Sending marketing email:', {
        template,
        recipientCount: data.recipients.length,
        campaignName: data.campaignName
      });

      // Get email template
      const emailTemplate = await this.getMarketingEmailTemplate(template, data);
      
      const emailData: EmailData = {
        to: data.recipients,
        subject: data.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
        replyTo: EMAIL_CONFIG.REPLY_TO_SUPPORT,
        tags: [
          { name: 'category', value: 'marketing' },
          { name: 'template', value: template },
          ...(data.campaignName ? [{ name: 'campaign', value: data.campaignName }] : [])
        ]
      };

      return await this.sendEmail(emailData);
    } catch (error) {
      console.error('❌ EmailService: Marketing email error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown marketing email error' 
      };
    }
  }

  /**
   * Get email template from database or use fallback
   */
  private async getEmailTemplate(
    template: EmailTemplate,
    data: TransactionalEmailData
  ): Promise<{ html: string; text: string }> {
    try {
      // Try to get custom template from database first
      const supabase = createSupabaseClient();
      const { data: templateData } = await supabase
        .from('email_templates')
        .select('html_content, text_content')
        .eq('template_key', template)
        .eq('active', true)
        .single();

      if (templateData) {
        return {
          html: this.renderTemplate(templateData.html_content, data.variables || {}),
          text: this.renderTemplate(templateData.text_content, data.variables || {})
        };
      }
    } catch (error) {
      console.log('📧 EmailService: No custom template found, using fallback');
    }

    // Fallback to React Email templates (will be implemented next)
    return await this.getFallbackTemplate(template, data);
  }

  /**
   * Get admin email template
   */
  private async getAdminEmailTemplate(
    template: EmailTemplate,
    data: AdminEmailData
  ): Promise<{ html: string; text: string }> {
    // For now, return simple HTML template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37;">${data.title}</h2>
        <p>${data.message}</p>
        <p><strong>Priority:</strong> ${data.priority.toUpperCase()}</p>
        <hr style="border: 1px solid #e5e5e5;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from Ashhadu Islamic Art admin system.
        </p>
      </div>
    `;

    const text = `
      ${data.title}
      
      ${data.message}
      
      Priority: ${data.priority.toUpperCase()}
      
      ---
      This is an automated message from Ashhadu Islamic Art admin system.
    `;

    return { html, text };
  }

  /**
   * Get marketing email template
   */
  private async getMarketingEmailTemplate(
    template: EmailTemplate,
    data: MarketingEmailData
  ): Promise<{ html: string; text: string }> {
    // For now, return simple HTML template
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4af37;">Ashhadu Islamic Art Newsletter</h2>
        <p>Thank you for subscribing to our newsletter!</p>
        <hr style="border: 1px solid #e5e5e5;">
        <p style="color: #666; font-size: 12px;">
          You can unsubscribe at any time by clicking the link in the footer.
        </p>
      </div>
    `;

    const text = `
      Ashhadu Islamic Art Newsletter
      
      Thank you for subscribing to our newsletter!
      
      ---
      You can unsubscribe at any time.
    `;

    return { html, text };
  }

  /**
   * Get fallback React Email template
   */
  private async getFallbackTemplate(
    template: EmailTemplate,
    data: TransactionalEmailData
  ): Promise<{ html: string; text: string }> {
    // Simple fallback templates (will be replaced with React Email templates)
    const templates = {
      'order-confirmation': {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">Order Confirmation</h2>
            <p>Dear ${data.customerName},</p>
            <p>Thank you for your order! Your order #${data.orderNumber} has been confirmed.</p>
            <p>We'll send you another email when your order ships.</p>
            <p>Best regards,<br>Ashhadu Islamic Art Team</p>
          </div>
        `,
        text: `
          Order Confirmation
          
          Dear ${data.customerName},
          
          Thank you for your order! Your order #${data.orderNumber} has been confirmed.
          
          We'll send you another email when your order ships.
          
          Best regards,
          Ashhadu Islamic Art Team
        `
      },
      'welcome': {
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d4af37;">Welcome to Ashhadu Islamic Art</h2>
            <p>Dear ${data.customerName},</p>
            <p>Welcome to our community of Islamic art enthusiasts!</p>
            <p>Explore our collection of beautiful Islamic calligraphy and art pieces.</p>
            <p>Best regards,<br>Ashhadu Islamic Art Team</p>
          </div>
        `,
        text: `
          Welcome to Ashhadu Islamic Art
          
          Dear ${data.customerName},
          
          Welcome to our community of Islamic art enthusiasts!
          
          Explore our collection of beautiful Islamic calligraphy and art pieces.
          
          Best regards,
          Ashhadu Islamic Art Team
        `
      }
    };

    return templates[template] || templates['welcome'];
  }

  /**
   * Format email subject with variables
   */
  private formatSubject(template: EmailTemplate, data: TransactionalEmailData): string {
    const subjectTemplate = EMAIL_CONFIG.SUBJECTS[template as keyof typeof EMAIL_CONFIG.SUBJECTS] || 'Ashhadu Islamic Art';
    
    return subjectTemplate
      .replace('#{orderNumber}', data.orderNumber || '')
      .replace('{customerName}', data.customerName || '')
      .replace('{productName}', data.productName || '');
  }

  /**
   * Render template with variables
   */
  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      rendered = rendered.replace(regex, String(value));
    });
    
    return rendered;
  }

  /**
   * Generate subject line for React Email templates
   */
  private generateSubjectForTemplate(templateKey: string, variables: Record<string, any>): string {
    switch (templateKey) {
      case 'order_confirmation':
        return `Order Confirmation - #${variables.orderNumber || 'N/A'}`;
      case 'welcome':
        return 'Welcome to Ashhadu Islamic Art';
      case 'admin_new_order':
        const priority = variables.urgent ? '[URGENT]' : '[NEW ORDER]';
        return `${priority} Order #${variables.orderNumber || 'N/A'} - ${variables.customerName || 'Customer'}`;
      case 'admin_low_stock':
        return `Low Stock Alert - ${variables.productName || 'Product'}`;
      case 'newsletter_welcome':
        return 'Welcome to Ashhadu Newsletter';
      case 'account_activation':
        return `Welcome to Ashhadu Islamic Art - Activate Your Account`;
      case 'password_reset':
        return `Reset Your Ashhadu Islamic Art Password`;
      default:
        return `Notification from Ashhadu Islamic Art`;
    }
  }

  /**
   * Generate fallback email content for templates without React components or database templates
   */
  private generateFallbackEmail(templateKey: string, variables: Record<string, any>): { subject: string; html: string; text: string } | null {
    switch (templateKey) {
      case 'admin_low_stock':
        return {
          subject: `Low Stock Alert - ${variables.productName || 'Product'}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d4af37;">Low Stock Alert</h2>
              <p>Product <strong>${variables.productName}</strong> is running low on stock.</p>
              <ul>
                <li>Current Stock: ${variables.currentStock}</li>
                <li>Low Stock Threshold: ${variables.threshold}</li>
              </ul>
              <p>Please restock this item soon to avoid stockouts.</p>
              <p>Best regards,<br>Ashhadu Islamic Art System</p>
            </div>
          `,
          text: `Low Stock Alert\n\nProduct "${variables.productName}" is running low on stock.\n\nCurrent Stock: ${variables.currentStock}\nThreshold: ${variables.threshold}\n\nPlease restock this item soon.\n\nBest regards,\nAshhadu Islamic Art System`
        };
      
      case 'newsletter_welcome':
        return {
          subject: 'Welcome to Ashhadu Newsletter',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d4af37;">Welcome to Ashhadu Newsletter</h2>
              <p>Dear ${variables.subscriberName || 'Subscriber'},</p>
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
                You can unsubscribe at any time.
              </p>
            </div>
          `,
          text: `Welcome to Ashhadu Newsletter\n\nDear ${variables.subscriberName || 'Subscriber'},\n\nThank you for subscribing to our newsletter! You'll be the first to know about new Islamic art pieces, special offers, and inspiring stories.\n\nStay tuned for beautiful Islamic art updates!\n\nBest regards,\nAshhadu Islamic Art Team\n\nYou can unsubscribe at any time.`
        };

      case 'account_activation':
        return {
          subject: 'Activate Your Ashhadu Account',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d4af37;">Welcome to Ashhadu Islamic Art</h2>
              <p>Dear ${variables.firstName || 'Customer'},</p>
              <p>Thank you for creating an account with Ashhadu Islamic Art! To complete your registration, please activate your account by clicking the link below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${variables.activationUrl}" style="background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Activate Your Account</a>
              </div>
              <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
              <p style="word-break: break-all; color: #666; font-size: 14px;">${variables.activationUrl}</p>
              <p>This link will expire in 24 hours for security reasons.</p>
              <p>If you didn't create this account, please ignore this email.</p>
              <p>Best regards,<br>Ashhadu Islamic Art Team</p>
              <hr style="border: 1px solid #e5e5e5;">
              <p style="color: #666; font-size: 12px;">
                Registration Date: ${variables.registrationDate}<br>
                Email: ${variables.email}
              </p>
            </div>
          `,
          text: `Welcome to Ashhadu Islamic Art\n\nDear ${variables.firstName || 'Customer'},\n\nThank you for creating an account with Ashhadu Islamic Art! To complete your registration, please activate your account by visiting:\n\n${variables.activationUrl}\n\nThis link will expire in 24 hours for security reasons.\n\nIf you didn't create this account, please ignore this email.\n\nBest regards,\nAshhadu Islamic Art Team\n\nRegistration Date: ${variables.registrationDate}\nEmail: ${variables.email}`
        };

      case 'password_reset':
        return {
          subject: 'Reset Your Ashhadu Password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d4af37;">Password Reset Request</h2>
              <p>${variables.greeting || 'Dear Customer'},</p>
              <p>We received a request to reset the password for your Ashhadu Islamic Art account (${variables.email}).</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${variables.resetUrl}" style="background-color: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Your Password</a>
              </div>
              <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
              <p style="word-break: break-all; color: #666; font-size: 14px;">${variables.resetUrl}</p>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
              <p>Best regards,<br>Ashhadu Islamic Art Team</p>
              <hr style="border: 1px solid #e5e5e5;">
              <p style="color: #666; font-size: 12px;">
                Request Time: ${variables.requestTime}<br>
                Email: ${variables.email}
              </p>
            </div>
          `,
          text: `Password Reset Request\n\n${variables.greeting || 'Dear Customer'},\n\nWe received a request to reset the password for your Ashhadu Islamic Art account (${variables.email}).\n\nTo reset your password, visit:\n${variables.resetUrl}\n\nThis link will expire in 1 hour for security reasons.\n\nIf you didn't request this password reset, please ignore this email. Your password will remain unchanged.\n\nBest regards,\nAshhadu Islamic Art Team\n\nRequest Time: ${variables.requestTime}\nEmail: ${variables.email}`
        };
        
      default:
        return null;
    }
  }

  /**
   * Enhanced log email to database with template source tracking
   */
  private async logEmailToDatabase(
    data: EmailData | {
      template: string;
      recipients: string[];
      subject: string;
      success: boolean;
      resendEmailId?: string;
      errorMessage?: string;
      templateSource?: string;
    },
    resendEmailId?: string,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    try {
      // Handle both EmailData and custom logging data formats
      let recipients: string[];
      let template: string;
      let subject: string;
      let orderNumber: string | null = null;
      let templateSource: string | null = null;
      
      if ('to' in data) {
        // EmailData format
        recipients = Array.isArray(data.to) ? data.to : [data.to];
        const templateTag = data.tags?.find(tag => tag.name === 'template');
        const orderTag = data.tags?.find(tag => tag.name === 'order_number');
        const sourceTag = data.tags?.find(tag => tag.name === 'source');
        
        template = templateTag?.value || 'unknown';
        subject = data.subject;
        orderNumber = orderTag?.value || null;
        templateSource = sourceTag?.value || null;
      } else {
        // Custom logging format
        recipients = data.recipients;
        template = data.template;
        subject = data.subject;
        templateSource = data.templateSource || null;
        success = data.success;
        resendEmailId = data.resendEmailId;
        errorMessage = data.errorMessage;
      }
      
      // Log each recipient separately
      const supabase = createSupabaseClient();
      for (const recipient of recipients) {
        await supabase
          .from('email_logs')
          .insert({
            template,
            recipient_email: recipient,
            subject,
            order_number: orderNumber,
            status: success ? 'sent' : 'failed',
            resend_email_id: resendEmailId,
            error_message: errorMessage,
            sent_at: new Date().toISOString(),
            metadata: {
              templateSource,
              hasHtml: 'to' in data ? !!data.html : true,
              hasText: 'to' in data ? !!data.text : true,
              tags: 'to' in data ? (data.tags || []) : []
            }
          });
      }
      
      console.log('✅ EmailService: Email logged to database for', recipients.length, 'recipients');
    } catch (error) {
      console.error('❌ EmailService: Failed to log email to database:', error);
    }
  }

  /**
   * Send email using template (React Email component or database template)
   */
  async sendTemplateEmail(
    templateKey: string,
    options: {
      to: string | string[];
      variables?: Record<string, any>;
      replyTo?: string;
      tags?: Array<{ name: string; value: string }>;
      subject?: string; // Optional custom subject override
    }
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log('📧 EmailService: Sending template email:', templateKey);

      const variables = options.variables || {};
      
      // Validate required variables
      const validationErrors = validateTemplateVariables(templateKey, variables as EmailTemplateData);
      if (validationErrors.length > 0) {
        console.error('❌ EmailService: Template validation failed:', validationErrors);
        return {
          success: false,
          error: `Template validation failed: ${validationErrors.join(', ')}`
        };
      }

      let subject: string;
      let html: string;
      let text: string;

      // Try React Email component first
      if (hasReactEmailTemplate(templateKey)) {
        console.log('🎨 Using React Email component for template:', templateKey);
        
        const ReactComponent = await getReactEmailTemplate(templateKey);
        if (ReactComponent) {
          try {
            // Render React Email component
            const componentProps = variables as EmailTemplateData;
            html = await render(React.createElement(ReactComponent, componentProps));
            text = await render(React.createElement(ReactComponent, componentProps), { plainText: true });
            
            // Generate subject based on template type
            subject = options.subject || this.generateSubjectForTemplate(templateKey, variables);
            
            console.log('✅ React Email component rendered successfully');
          } catch (renderError) {
            console.error('❌ React Email render failed:', renderError);
            throw new Error(`Failed to render React Email component: ${renderError}`);
          }
        } else {
          throw new Error(`React Email component not found for template: ${templateKey}`);
        }
      } 
      // Fallback to database template
      else {
        console.log('📄 Using database template for:', templateKey);
        
        const supabase = createSupabaseClient();
        const { data: template, error: templateError } = await supabase
          .from('email_templates')
          .select('subject_template, html_content, text_content, variables')
          .eq('template_key', templateKey)
          .eq('active', true)
          .single();

        if (templateError || !template) {
          console.error('❌ EmailService: Database template not found:', templateKey, templateError);
          
          // Generate fallback email for templates that don't exist
          const fallbackEmail = this.generateFallbackEmail(templateKey, variables);
          if (fallbackEmail) {
            ({ subject, html, text } = fallbackEmail);
            console.log('📧 Using fallback email template');
          } else {
            return {
              success: false,
              error: `Email template '${templateKey}' not found and no fallback available`
            };
          }
        } else {
          // Render database template with variables
          subject = options.subject || this.renderTemplate(template.subject_template, variables);
          html = this.renderTemplate(template.html_content, variables);
          text = this.renderTemplate(template.text_content, variables);
        }
      }

      // Send the email
      const emailData: EmailData = {
        to: options.to,
        subject,
        html,
        text,
        replyTo: options.replyTo || EMAIL_CONFIG.REPLY_TO_SUPPORT,
        tags: options.tags || [
          { name: 'template', value: templateKey },
          { name: 'source', value: hasReactEmailTemplate(templateKey) ? 'react-email' : 'database' }
        ]
      };

      const result = await this.sendEmail(emailData);

      // Enhanced logging with template source information
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      await this.logEmailToDatabase({
        template: templateKey,
        recipients,
        subject,
        success: result.success,
        resendEmailId: result.id,
        errorMessage: result.error,
        templateSource: hasReactEmailTemplate(templateKey) ? 'react-email' : 'database'
      });

      return result;

    } catch (error) {
      console.error('❌ EmailService: Template email error:', error);
      
      // Enhanced error logging
      await this.logEmailToDatabase({
        template: templateKey,
        recipients: Array.isArray(options.to) ? options.to : [options.to],
        subject: `Failed: ${templateKey}`,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown template email error',
        templateSource: hasReactEmailTemplate(templateKey) ? 'react-email' : 'database'
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown template email error'
      };
    }
  }

  /**
   * Log email send attempt to database (legacy function for order emails)
   */
  private async logEmailSend(
    template: string,
    email: string,
    orderNumber: string,
    success: boolean,
    resendEmailId?: string
  ): Promise<void> {
    try {
      const supabase = createSupabaseClient();
      await supabase
        .from('email_logs')
        .insert({
          template,
          recipient_email: email,
          order_number: orderNumber,
          status: success ? 'sent' : 'failed',
          resend_email_id: resendEmailId,
          sent_at: new Date().toISOString()
        });
      console.log('✅ EmailService: Order email logged to database');
    } catch (error) {
      console.error('❌ EmailService: Failed to log email send:', error);
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export { EmailService };
export default emailService;