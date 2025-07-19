import { resend, EMAIL_CONFIG, EmailTemplate } from './resend-client';
import { render } from '@react-email/render';
import { supabase } from '@/lib/supabase';

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
        reply_to: emailData.replyTo || EMAIL_CONFIG.REPLY_TO_SUPPORT,
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
   * Log email send attempt to database (universal logging)
   */
  private async logEmailToDatabase(
    emailData: EmailData,
    resendEmailId?: string,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    try {
      const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
      
      // Log each recipient separately
      for (const recipient of recipients) {
        // Extract template from tags
        const templateTag = emailData.tags?.find(tag => tag.name === 'template');
        const orderTag = emailData.tags?.find(tag => tag.name === 'order_number');
        
        await supabase
          .from('email_logs')
          .insert({
            template: templateTag?.value || 'unknown',
            recipient_email: recipient,
            subject: emailData.subject,
            order_number: orderTag?.value || null,
            status: success ? 'sent' : 'failed',
            resend_email_id: resendEmailId,
            error_message: errorMessage,
            sent_at: new Date().toISOString(),
            metadata: {
              tags: emailData.tags || [],
              hasHtml: !!emailData.html,
              hasText: !!emailData.text
            }
          });
      }
      
      console.log('✅ EmailService: Email logged to database for', recipients.length, 'recipients');
    } catch (error) {
      console.error('❌ EmailService: Failed to log email to database:', error);
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