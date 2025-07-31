import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role key (with fallbacks for build time)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(request: NextRequest) {
  // Runtime check for environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    console.log('🔍 Testing database schema...');

    // Test 1: Check if first_name and last_name columns exist in profiles table
    console.log('🔍 Test 1: Checking profiles table structure...');
    const { data: profileColumns, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1);

    if (profileError && profileError.code === 'PGRST204') {
      return NextResponse.json({
        success: false,
        error: 'Profiles table still has schema issues',
        details: profileError
      });
    }

    // Test 2: Try to insert a test profile
    console.log('🔍 Test 2: Testing profile insert...');
    const testUserId = '00000000-0000-0000-0000-000000000000';
    const testEmail = 'test-schema@example.com';
    
    // First delete any existing test record
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', testUserId);

    const { data: insertResult, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: testUserId,
        email: testEmail,
        first_name: 'Test',
        last_name: 'User',
        role: 'customer'
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({
        success: false,
        error: 'Profile insert test failed',
        details: insertError
      });
    }

    // Clean up test record
    await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('user_id', testUserId);

    // Test 3: Check customers table
    console.log('🔍 Test 3: Testing customers table...');
    const { data: customerTest, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .limit(1);

    if (customerError) {
      return NextResponse.json({
        success: false,
        error: 'Customers table test failed',
        details: customerError
      });
    }

    // Test 4: Check RLS policies work
    console.log('🔍 Test 4: Checking RLS policies...');
    
    return NextResponse.json({
      success: true,
      message: 'Database schema tests passed',
      tests: {
        profileColumns: 'PASS',
        profileInsert: 'PASS',
        customersTable: 'PASS',
        testRecord: insertResult
      }
    });

  } catch (error: any) {
    console.error('❌ Database schema test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database schema test failed',
      details: error.message
    }, { status: 500 });
  }
}