// Test script for password reset functionality
// Run with: node test-password-reset.js

const testEmail = 'test@example.com'; // Replace with a valid email

async function testPasswordReset() {
  console.log('🧪 Testing Password Reset Flow\n');
  
  // Step 1: Check configuration
  console.log('1️⃣ Checking configuration...');
  try {
    const configResponse = await fetch('http://localhost:3000/api/debug/check-reset-email');
    const configData = await configResponse.json();
    console.log('✅ Configuration:', configData);
    console.log('\n');
  } catch (error) {
    console.error('❌ Failed to check configuration:', error.message);
  }
  
  // Step 2: Send test reset email
  console.log('2️⃣ Sending test reset email...');
  try {
    const resetResponse = await fetch('http://localhost:3000/api/debug/check-reset-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
    });
    const resetData = await resetResponse.json();
    console.log('✅ Reset email result:', resetData);
    
    if (resetData.success) {
      console.log('\n📧 Password reset email sent successfully!');
      console.log('📍 Check your email and click the reset link');
      console.log('🔍 The link should redirect to: /auth/callback?code=XXX&next=/auth/reset-password');
      console.log('✨ Then you should be redirected to the password reset form');
    } else {
      console.log('\n❌ Failed to send reset email');
      console.log('Error details:', resetData);
    }
  } catch (error) {
    console.error('❌ Failed to send reset email:', error.message);
  }
  
  console.log('\n📋 Next Steps:');
  console.log('1. Check the email inbox for', testEmail);
  console.log('2. Click the password reset link');
  console.log('3. Check browser console for debug logs');
  console.log('4. Verify you can see the password reset form');
  console.log('5. Try setting a new password');
  
  console.log('\n⚠️  Important Supabase Configuration:');
  console.log('Make sure these URLs are in Supabase Dashboard → Authentication → URL Configuration → Redirect URLs:');
  console.log('- http://localhost:3000/auth/callback');
  console.log('- https://yourdomain.com/auth/callback (for production)');
}

testPasswordReset();