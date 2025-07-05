// Simple authentication test
// Run this with: node simple-auth-test.js

const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (copy from .env.local)
const supabaseUrl = 'https://wqdcwlizdhttortnxhzw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxZGN3bGl6ZGh0dG9ydG54aHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1NTgxODIsImV4cCI6MjA2NzEzNDE4Mn0.aYI30D21F5eyrHnp1peqmNzQxqnYhcrbzi8mBiLbvrU';

console.log('Testing Supabase authentication...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    // Test 1: Basic connection
    console.log('\n1. Testing database connection...');
    const { data, error } = await supabase.from('products').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      return;
    }
    console.log('✅ Database connection successful');
    
    // Test 2: Authentication signup
    console.log('\n2. Testing authentication...');
    const testEmail = 'testuser' + Date.now() + '@gmail.com';
    const testPassword = 'test123456';
    
    console.log('Attempting signup with:', testEmail);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.error('❌ Authentication failed:');
      console.error('  Message:', authError.message);
      console.error('  Status:', authError.status);
      console.error('  Details:', authError);
      return;
    }
    
    console.log('✅ Authentication successful!');
    console.log('User ID:', authData.user?.id);
    console.log('Email:', authData.user?.email);
    console.log('Confirmed:', authData.user?.email_confirmed_at ? 'Yes' : 'No');
    console.log('Session exists:', authData.session ? 'Yes' : 'No');
    
    // Test 3: Check if user appears in database
    console.log('\n3. Checking auth.users table...');
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('id, email, created_at')
      .eq('email', testEmail);
    
    if (userError) {
      console.log('Note: Cannot query auth.users directly (expected)');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuth();