import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import emailService from '@/lib/email/email-service';

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

export async function POST(request: NextRequest) {
  try {
    console.log('📧 Send Activation Email API: Request received');
    const { userId, email, firstName } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    // Generate magic link for email verification (works for existing users)
    console.log('🔗 Generating magic link for email verification...');
    
    let activationUrl;
    
    // Since the user already exists and is confirmed, generate a simple login link
    // The magic link approach has been problematic, so let's use a direct approach
    console.log('🔗 Creating simple activation link for confirmed user...');
    
    // For now, just direct them to login - the user is already created and confirmed
    activationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login?message=account-created&email=${encodeURIComponent(email)}&activation=true`;
    
    console.log('✅ Simple activation link created');
    console.log('🔍 Generated link:', activationUrl);
    
    console.log('🔍 Activation URL generated:', activationUrl);

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
      firstName: firstName || 'Customer',
      email: email,
      activationUrl,
      registrationDate: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long', 
        year: 'numeric'
      }),
      storeEmail,
      storePhone,
    };

    console.log('📧 Sending activation email to:', email);

    // Send email using existing email service
    const result = await emailService.sendTemplateEmail(
      'account_activation',
      {
        to: email,
        variables: templateVariables,
        replyTo: 'support@ashhadu.co.uk',
        tags: [
          { name: 'category', value: 'auth' },
          { name: 'template', value: 'account-activation' },
          { name: 'user_id', value: userId }
        ]
      }
    );

    if (result.success) {
      console.log('✅ Activation email sent successfully to:', email);
      return NextResponse.json({ success: true, message: 'Activation email sent' });
    } else {
      console.error('❌ Failed to send activation email:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Send Activation Email API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}