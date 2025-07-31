import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import emailService from '@/lib/email/email-service';

// Create admin Supabase client with service role key
function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';
  
  return createServerClient(
    supabaseUrl,
    supabaseServiceKey,
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
    console.log('📧 Admin Signup API: Request received');
    const { email, password, userData } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createSupabaseAdmin();

    // Create user with admin privileges - bypasses email confirmation
    console.log('👤 Creating user with admin client...');
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        marketing_consent: userData.marketingConsent || false,
      },
      email_confirm: true, // Auto-confirm the email
    });

    if (createError) {
      console.error('❌ Failed to create user:', createError);
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 400 }
      );
    }

    console.log('✅ User created successfully:', user.user?.id);

    // Create profile and customer records
    if (user.user) {
      console.log('📝 Creating profile and customer records...');
      
      try {
        // Create profile record
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            user_id: user.user.id,
            email: email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: `${userData.firstName} ${userData.lastName}`.trim(),
            phone: userData.phone,
            role: 'customer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (profileError) {
          console.error('❌ Failed to create profile:', profileError);
        } else {
          console.log('✅ Profile created successfully');
        }

        // Create customer record
        const { data: customer, error: customerError } = await supabaseAdmin
          .from('customers')
          .insert({
            email: email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            marketing_consent: userData.marketingConsent || false,
            is_guest: false, // This is a registered customer
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (customerError) {
          console.error('❌ Failed to create customer:', customerError);
        } else {
          console.log('✅ Customer created successfully');
        }
      } catch (recordError) {
        console.error('❌ Error creating profile/customer records:', recordError);
        // Don't fail the signup for record creation issues
      }
    }

    // Send custom activation email via our email service
    if (user.user) {
      console.log('📧 Sending custom activation email...');
      
      try {
        // Since the user is already confirmed, just send them to login
        // Skip the problematic magic link generation
        console.log('✅ Creating simple login link for confirmed user...');
        
        const activationUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/login?message=account-created&email=${encodeURIComponent(email)}&confirmed=true`;
        console.log('🔍 Generated simple login link:', activationUrl);
        
        // Get store settings for email contact info
        const { data: storeSettings } = await supabaseAdmin
          .from('site_settings')
          .select('key, value')
          .in('key', ['store_email', 'store_phone']);
        
        const storeEmailValue = storeSettings?.find(s => s.key === 'store_email')?.value;
        const storePhoneValue = storeSettings?.find(s => s.key === 'store_phone')?.value;
        
        const storeEmail = typeof storeEmailValue === 'string' ? storeEmailValue : 
                          (storeEmailValue && typeof storeEmailValue === 'object' && 'value' in storeEmailValue) ? 
                          String(storeEmailValue) : 'support@ashhadu.co.uk';
        const storePhone = typeof storePhoneValue === 'string' ? storePhoneValue : 
                          (storePhoneValue && typeof storePhoneValue === 'object' && 'value' in storePhoneValue) ? 
                          String(storePhoneValue) : '+44 7123 456 789';
        
        const result = await emailService.sendTemplateEmail(
          'account_activation',
          {
            to: email,
            variables: {
              firstName: userData.firstName || 'Customer',
              email: email,
              activationUrl,
              registrationDate: new Date().toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long', 
                year: 'numeric'
              }),
              storeEmail,
              storePhone,
            },
            replyTo: 'support@ashhadu.co.uk',
            tags: [
              { name: 'category', value: 'auth' },
              { name: 'template', value: 'account-activation' },
              { name: 'user_id', value: user.user.id }
            ]
          }
        );

        if (result.success) {
          console.log('✅ Activation email sent successfully');
        } else {
          console.error('❌ Failed to send activation email:', result.error);
          // Don't fail the signup for email issues
        }
      } catch (emailError) {
        console.error('❌ Error sending activation email:', emailError);
        // Don't fail the signup for email issues
      }
    }

    return NextResponse.json({
      success: true,
      user: user.user,
      message: 'Account created successfully'
    });

  } catch (error) {
    console.error('❌ Admin Signup API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}