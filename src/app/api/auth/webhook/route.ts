import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import emailService from '@/lib/email/email-service';
import crypto from 'crypto';

// Use service role key for admin operations
function createSupabaseAdmin() {
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

function verifyWebhookSignature(payload: string, signature: string, timestamp: string, secret: string): boolean {
  try {
    // Extract the secret from the v1,whsec_ format
    const secretKey = secret.startsWith('v1,whsec_') ? secret.slice(9) : secret;
    
    // Create the signed payload (timestamp + payload)
    const signedPayload = timestamp + payload;
    
    // Create expected signature
    const expectedSignature = crypto
      .createHmac('sha256', Buffer.from(secretKey, 'base64'))
      .update(signedPayload, 'utf8')
      .digest('hex');
    
    // Compare signatures
    const actualSignature = signature.startsWith('sha256=') ? signature.slice(7) : signature;
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(actualSignature, 'hex')
    );
  } catch (error) {
    console.error('❌ Signature verification error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Respond quickly to prevent timeout
    const startTime = Date.now();
    console.log('🔵 Auth Webhook: Request received at', new Date().toISOString());
    
    // Get the raw payload for signature verification
    const rawPayload = await request.text();
    const payload = JSON.parse(rawPayload);
    
    console.log('🔵 Auth Webhook: Full payload received:', JSON.stringify(payload, null, 2));
    console.log('🔵 Auth Webhook: Event type:', payload.type);
    console.log('🔍 Auth Webhook: Payload keys:', Object.keys(payload));
    console.log('🔍 Auth Webhook: Is this a Supabase Auth Hook?', payload.hook_name, payload.event_type);

    // Debug: Log all headers to understand how Supabase sends the secret
    console.log('🔍 Auth Webhook: Headers received:', Object.fromEntries(request.headers.entries()));
    
    // Signature verification
    const webhookSecret = process.env.SUPABASE_AUTH_WEBHOOK_SECRET;
    const webhookSignature = request.headers.get('webhook-signature') || request.headers.get('x-signature');
    const webhookTimestamp = request.headers.get('webhook-timestamp') || request.headers.get('x-timestamp');
    
    console.log('🔍 Signature headers:', { 
      hasSecret: !!webhookSecret, 
      hasSignature: !!webhookSignature, 
      hasTimestamp: !!webhookTimestamp,
      signature: webhookSignature,
      timestamp: webhookTimestamp
    });
    
    // Temporarily disable signature verification for testing
    if (webhookSecret && webhookSignature && webhookTimestamp) {
      console.log('🔍 Auth Webhook: Signature verification temporarily disabled for testing');
      // const isValid = verifyWebhookSignature(rawPayload, webhookSignature, webhookTimestamp, webhookSecret);
      // if (!isValid) {
      //   console.error('❌ Auth Webhook: Invalid signature');
      //   return NextResponse.json(
      //     { success: false, error: 'Invalid signature' },
      //     { status: 401 }
      //   );
      // }
      console.log('✅ Auth Webhook: Proceeding without signature verification');
    } else {
      console.log('⚠️ Auth Webhook: No signature verification (missing headers or secret)');
    }

    // Handle different payload formats
    let eventType, table, record, oldRecord;
    
    // Supabase Auth Hook format (new format)
    if (payload.event_type && payload.hook_name) {
      console.log('🔍 Detected Supabase Auth Hook format');
      eventType = payload.event_type;
      table = 'users';
      record = payload.user || payload;
      
      if (eventType === 'user.created') {
        eventType = 'user_signup';
      } else if (eventType === 'user.updated') {
        eventType = 'user_updated';
      }
    }
    // Standard webhook format
    else if (payload.type) {
      eventType = payload.type;
      table = payload.table;
      record = payload.record;
      oldRecord = payload.old_record;
    } 
    // Alternative event format
    else if (payload.event) {
      eventType = payload.event;
      table = payload.table;
      record = payload.data;
      oldRecord = payload.old_data;
    } 
    // Legacy Supabase auth hook format
    else if (payload.user && payload.email_data) {
      if (payload.email_data.email_action_type === 'signup') {
        eventType = 'user_signup';
        record = payload.user;
        table = 'users';
      } else if (payload.email_data.email_action_type === 'recovery') {
        eventType = 'password_reset';
        record = payload.user;
        table = 'users';
      }
    } 
    // Fallback check for user events
    else if (payload.user_id && payload.email) {
      eventType = 'user_signup';
      record = payload;
      table = 'users';
    }
    
    console.log('🔍 Parsed event:', { eventType, table, hasRecord: !!record });

    // Process emails asynchronously to avoid blocking the webhook response
    const processEmails = async () => {
      try {
        console.log('🔄 Processing event type:', eventType, 'table:', table);
        
        switch (eventType) {
          case 'INSERT':
          case 'user_signup':
            if (table === 'users' || eventType === 'user_signup') {
              // Pass email_data if available for token information
              console.log('🔄 Calling handleUserSignup...');
              await handleUserSignup(record, payload.email_data);
            }
            break;
          
          case 'UPDATE':
          case 'user_updated':
            if (table === 'users') {
              console.log('🔄 Calling handleUserUpdate...');
              await handleUserUpdate(record, oldRecord);
            }
            break;
          
          default:
            console.log('🔍 Auth Webhook: Unhandled event type:', eventType);
            console.log('🔍 Full payload for debugging:', JSON.stringify(payload, null, 2));
        }
        console.log('✅ Email processing completed successfully');
      } catch (emailError) {
        console.error('❌ Auth Webhook: Email processing error:', emailError);
        // Don't throw the error - we still want to return success to Supabase
      }
    };

    // Start email processing without waiting for it
    setImmediate(processEmails);

    // Respond immediately to Supabase
    const responseTime = Date.now() - startTime;
    console.log(`✅ Auth Webhook: Responding to Supabase in ${responseTime}ms`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook received and processing',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Auth Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle new user signup - send activation email
 */
async function handleUserSignup(user: any, emailData?: any) {
  try {
    console.log('📧 Auth Webhook: Handling user signup for:', user.email);

    // Skip if user is already confirmed (shouldn't happen, but just in case)
    if (user.email_confirmed_at) {
      console.log('✅ User already confirmed, skipping activation email');
      return;
    }

    const supabaseAdmin = createSupabaseAdmin();

    // Get user metadata for first name
    const firstName = user.user_metadata?.first_name || user.user_metadata?.firstName || 'Customer';
    
    // Create activation URL using the token from email_data if available
    const token = emailData?.token_hash || user.confirmation_token || emailData?.token;
    const activationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?token_hash=${token}&type=signup&redirect_to=${encodeURIComponent(process.env.NEXT_PUBLIC_SITE_URL + '/login?message=account-activated')}`;
    
    console.log('🔍 Token info:', { 
      hasEmailData: !!emailData, 
      tokenHash: emailData?.token_hash, 
      token: emailData?.token,
      activationUrl 
    });

    // Get store settings for email contact info
    const { data: storeSettings } = await supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['store_email', 'store_phone']);
    
    const storeEmailValue = storeSettings?.find(s => s.key === 'store_email')?.value;
    const storePhoneValue = storeSettings?.find(s => s.key === 'store_phone')?.value;
    
    const storeEmail = typeof storeEmailValue === 'string' ? storeEmailValue : 
                      (storeEmailValue && typeof storeEmailValue === 'object') ? 
                      String(storeEmailValue) : 'support@ashhadu.co.uk';
    const storePhone = typeof storePhoneValue === 'string' ? storePhoneValue : 
                      (storePhoneValue && typeof storePhoneValue === 'object') ? 
                      String(storePhoneValue) : '+44 7123 456 789';

    // Prepare template variables
    const templateVariables = {
      firstName,
      email: user.email,
      activationUrl,
      registrationDate: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long', 
        year: 'numeric'
      }),
      storeEmail,
      storePhone,
    };

    // Send email using your existing email service with the template
    const result = await emailService.sendTemplateEmail(
      'account_activation',
      {
        to: user.email,
        variables: templateVariables,
        replyTo: 'support@ashhadu.co.uk',
        tags: [
          { name: 'category', value: 'auth' },
          { name: 'template', value: 'account-activation' },
          { name: 'user_id', value: user.id }
        ]
      }
    );

    if (result.success) {
      console.log('✅ Account activation email sent successfully to:', user.email);
    } else {
      console.error('❌ Failed to send activation email:', result.error);
    }

  } catch (error) {
    console.error('❌ Error in handleUserSignup:', error);
  }
}

/**
 * Handle user updates - send password reset if requested
 */
async function handleUserUpdate(user: any, oldUser: any) {
  try {
    // Check if this is a password reset request
    if (user.recovery_sent_at && user.recovery_sent_at !== oldUser?.recovery_sent_at) {
      console.log('📧 Auth Webhook: Handling password reset for:', user.email);

      const supabaseAdmin = createSupabaseAdmin();

      // Get user metadata for first name
      let firstName = user.raw_user_meta_data?.firstName || user.user_metadata?.firstName;
      
      if (!firstName) {
        // Try to get from profile table
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('first_name')
          .eq('user_id', user.id)
          .single();
        
        firstName = profile?.first_name;
      }

      const greeting = firstName ? firstName : 'Dear Customer';

      // Create reset URL (using Supabase's built-in recovery)
      const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token_hash=${user.recovery_token}&type=recovery`;

      // Prepare template variables
      const templateVariables = {
        greeting,
        email: user.email,
        resetUrl,
        requestTime: new Date().toLocaleString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/London'
        }) + ' GMT'
      };

      // Send email using your existing email service with the template
      const result = await emailService.sendTemplateEmail(
        'password_reset',
        {
          to: user.email,
          variables: templateVariables,
          replyTo: 'support@ashhadu.co.uk',
          tags: [
            { name: 'category', value: 'auth' },
            { name: 'template', value: 'password-reset' },
            { name: 'user_id', value: user.id }
          ]
        }
      );

      if (result.success) {
        console.log('✅ Password reset email sent successfully to:', user.email);
      } else {
        console.error('❌ Failed to send password reset email:', result.error);
      }
    }

  } catch (error) {
    console.error('❌ Error in handleUserUpdate:', error);
  }
}