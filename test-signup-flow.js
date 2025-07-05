const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignupFlow() {
  console.log('=== Testing Signup Flow ===\n');
  
  // Test email - use a unique email to avoid conflicts
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  console.log(`1. Testing signup with email: ${testEmail}`);
  
  try {
    // Step 1: Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
          phone: '+44 7123 456789',
          marketing_consent: true,
        }
      }
    });
    
    if (signUpError) {
      console.error('Signup error:', signUpError);
      return;
    }
    
    console.log('✓ User created in auth.users');
    console.log('User ID:', signUpData.user?.id);
    console.log('Email confirmation required:', !signUpData.user?.email_confirmed_at);
    
    // Step 2: Check if profile was created
    console.log('\n2. Checking profiles table...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', signUpData.user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Profile not found:', profileError.message);
      console.log('Error code:', profileError.code);
      console.log('Error details:', profileError.details);
    } else {
      console.log('✓ Profile found:', profileData);
    }
    
    // Step 3: Check if customer was created
    console.log('\n3. Checking customers table...');
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (customerError) {
      console.error('❌ Customer not found:', customerError.message);
      console.log('Error code:', customerError.code);
      console.log('Error details:', customerError.details);
    } else {
      console.log('✓ Customer found:', customerData);
    }
    
    // Step 4: Test direct insert to profiles table
    console.log('\n4. Testing direct insert to profiles table...');
    const { error: directProfileError } = await supabase
      .from('profiles')
      .insert({
        user_id: signUpData.user.id,
        email: testEmail,
        full_name: 'Test User',
        role: 'customer'
      });
    
    if (directProfileError) {
      console.error('❌ Direct profile insert failed:', directProfileError.message);
      console.log('Error code:', directProfileError.code);
      console.log('Error details:', directProfileError.details);
      console.log('Error hint:', directProfileError.hint);
    } else {
      console.log('✓ Direct profile insert succeeded');
    }
    
    // Step 5: Test direct insert to customers table
    console.log('\n5. Testing direct insert to customers table...');
    const { error: directCustomerError } = await supabase
      .from('customers')
      .insert({
        email: testEmail,
        first_name: 'Test',
        last_name: 'User',
        phone: '+44 7123 456789',
        marketing_consent: true
      });
    
    if (directCustomerError) {
      console.error('❌ Direct customer insert failed:', directCustomerError.message);
      console.log('Error code:', directCustomerError.code);
      console.log('Error details:', directCustomerError.details);
      console.log('Error hint:', directCustomerError.hint);
    } else {
      console.log('✓ Direct customer insert succeeded');
    }
    
    // Clean up - delete test user
    console.log('\n6. Cleaning up test data...');
    // Note: This might fail if user wasn't created properly
    const { error: deleteError } = await supabase.auth.admin.deleteUser(signUpData.user.id);
    if (deleteError) {
      console.log('Could not delete test user:', deleteError.message);
    } else {
      console.log('✓ Test user cleaned up');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testSignupFlow().then(() => {
  console.log('\n=== Test Complete ===');
  process.exit(0);
}).catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});