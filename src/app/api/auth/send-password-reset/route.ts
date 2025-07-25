import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import emailService from '@/lib/email/email-service';

// Create Supabase client
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

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Password Reset API: Request received');
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('📧 Password Reset API: Processing reset for:', email);

    const supabaseAdmin = createSupabaseClient();

    // Check if user exists in our system
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, email, user_id')
      .eq('email', email)
      .single();

    if (profileError || !profile) {
      console.log('❌ User not found for email:', email);
      // TEMPORARY: Generate link anyway for debugging
      console.log('🔬 TEMP: Generating link for debugging purposes...');
    } else {
      console.log('✅ User found:', profile.first_name, profile.last_name);
    }

    // Generate password reset token using Supabase Auth
    console.log('🔄 Attempting to generate recovery link...');
    const { data, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
      }
    });
    
    console.log('🔍 GenerateLink result:', {
      hasData: !!data,
      hasError: !!resetError,
      errorMessage: resetError?.message,
      errorCode: resetError?.code,
      hasActionLink: !!data?.properties?.action_link
    });

    if (resetError || !data.properties?.action_link) {
      console.error('❌ Failed to generate reset token:', resetError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate password reset link' },
        { status: 500 }
      );
    }

    console.log('🔗 Password reset link generated successfully');
    console.log('🔍 Generated URL:', data.properties.action_link);
    console.log('🔍 URL Analysis:');
    const url = new URL(data.properties.action_link);
    console.log('  - Full URL:', url.href);
    console.log('  - Origin:', url.origin);
    console.log('  - Pathname:', url.pathname);
    console.log('  - Search params:', Object.fromEntries(url.searchParams));
    console.log('  - Hash:', url.hash);

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

    // Send custom password reset email using our email service
    console.log('📧 Sending password reset email via custom service...');
    
    const result = await emailService.sendTemplateEmail(
      'password_reset',
      {
        to: email,
        variables: {
          firstName: profile?.first_name || 'Customer',
          email: email,
          resetUrl: data.properties.action_link,
          requestTime: new Date().toLocaleString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/London'
          }),
          storeEmail,
          storePhone,
        },
        replyTo: storeEmail,
        tags: [
          { name: 'category', value: 'auth' },
          { name: 'template', value: 'password-reset' },
          { name: 'user_id', value: profile?.user_id || 'debug-test' }
        ]
      }
    );

    if (result.success) {
      console.log('✅ Password reset email sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } else {
      console.error('❌ Failed to send password reset email:', result.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Password Reset API error:', error);
    console.error('❌ Error stack:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}