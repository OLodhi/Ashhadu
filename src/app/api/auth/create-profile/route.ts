import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Create admin client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, userData } = body;

    if (!userId || !email || !userData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('API: Creating profile for user:', { userId, email });

    // Create profile using admin client (bypasses RLS)
    let finalProfile = null;
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        email,
        full_name: `${userData.firstName} ${userData.lastName}`,
        role: 'customer'
      })
      .select()
      .single();

    if (profileError) {
      console.error('API: Profile creation error:', profileError);
      
      // Check if profile already exists
      if (profileError.code === '23505') {
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (existingProfile) {
          console.log('API: Profile already exists, continuing...');
          finalProfile = existingProfile;
        } else {
          return NextResponse.json(
            { error: 'Profile creation failed', details: profileError },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Profile creation failed', details: profileError },
          { status: 500 }
        );
      }
    } else {
      console.log('API: Profile created successfully:', profileData);
      finalProfile = profileData;
    }

    // Create customer record
    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || null,
        marketing_consent: userData.marketingConsent || false
      })
      .select()
      .single();

    if (customerError) {
      console.error('API: Customer creation error:', customerError);
      
      // Check if customer already exists
      if (customerError.code === '23505') {
        const { data: existingCustomer } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('email', email)
          .single();
        
        if (existingCustomer) {
          console.log('API: Customer already exists');
          return NextResponse.json({ 
            success: true, 
            profile: finalProfile, 
            customer: existingCustomer 
          });
        }
      }
      
      return NextResponse.json(
        { error: 'Customer creation failed', details: customerError },
        { status: 500 }
      );
    }

    console.log('API: Customer created successfully:', customerData);

    return NextResponse.json({ 
      success: true, 
      profile: profileData, 
      customer: customerData 
    });

  } catch (error: any) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}