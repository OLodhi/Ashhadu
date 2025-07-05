// Test Supabase connection
// Run this with: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Anon Key:', supabaseAnonKey ? 'Set (length: ' + supabaseAnonKey.length + ')' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test authentication
    console.log('\n2. Testing authentication signup...');
    const testEmail = 'test-' + Date.now() + '@example.com';
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'test123456'
    });
    
    if (authError) {
      console.error('❌ Auth signup failed:', authError.message);
      console.error('Error details:', authError);
      return;
    }
    
    console.log('✅ Auth signup successful');
    console.log('User created:', authData.user ? 'Yes' : 'No');
    console.log('Session created:', authData.session ? 'Yes' : 'No');
    
    // Clean up test user
    if (authData.user) {
      await supabase.auth.signOut();
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();