import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug: Testing signup process...');
    const { email, password, userData } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      });
    }

    console.log('🔍 Debug: Creating user via admin client...');
    
    // Test 1: Create user with admin client (this should work)
    const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
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

    if (adminError) {
      console.error('❌ Debug: Admin user creation failed:', adminError);
      return NextResponse.json({
        success: false,
        error: 'Admin user creation failed',
        details: adminError
      });
    }

    console.log('✅ Debug: Admin user created successfully:', adminUser.user?.id);

    // Test 2: Create profile record
    if (adminUser.user) {
      console.log('🔍 Debug: Creating profile record...');
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: adminUser.user.id,
          email: email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          role: 'customer'
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Debug: Profile creation failed:', profileError);
        return NextResponse.json({
          success: false,
          error: 'Profile creation failed',
          details: profileError,
          userCreated: true,
          userId: adminUser.user.id
        });
      }

      console.log('✅ Debug: Profile created successfully:', profile.id);

      // Test 3: Create customer record
      console.log('🔍 Debug: Creating customer record...');
      const { data: customer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          email: email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          phone: userData.phone,
          marketing_consent: userData.marketingConsent || false,
          is_guest: false
        })
        .select()
        .single();

      if (customerError) {
        console.error('❌ Debug: Customer creation failed:', customerError);
        return NextResponse.json({
          success: false,
          error: 'Customer creation failed',
          details: customerError,
          userCreated: true,
          profileCreated: true,
          userId: adminUser.user.id,
          profileId: profile.id
        });
      }

      console.log('✅ Debug: Customer created successfully:', customer.id);

      return NextResponse.json({
        success: true,
        message: 'Complete signup test successful',
        data: {
          user: adminUser.user,
          profile: profile,
          customer: customer
        }
      });
    }

    return NextResponse.json({
      success: false,
      error: 'User created but no user object returned'
    });

  } catch (error: any) {
    console.error('❌ Debug: Signup test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Signup test failed',
      details: error.message
    }, { status: 500 });
  }
}