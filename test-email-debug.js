const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// Initialize clients
const supabase = createClient(
  'https://cjyvvdbgudgjcubrpddj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeXZ2ZGJndWRnamN1YnJwZGRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTM5NTA0MCwiZXhwIjoyMDUwOTcxMDQwfQ.V52dDJh9-lRUiOoaU9WvZfcM-dHuNIYJdBVnUaOJp6Q'
);

const resend = new Resend('re_Hrfgw9xF_Q8nTSiQACnk9axTQu2Ums7hW');

async function testEmailAndDatabase() {
  console.log('🔍 Testing email system...');
  
  try {
    // 1. Test Resend email sending
    console.log('📧 Sending test email via Resend...');
    const emailResult = await resend.emails.send({
      from: 'Ashhadu Islamic Art <orders@ashhadu.co.uk>',
      to: 'test-debug@example.com',
      subject: 'Test Email - Debug',
      html: '<p>This is a test email to verify Resend is working.</p>',
      tags: [
        { name: 'category', value: 'test' },
        { name: 'template', value: 'debug-test' }
      ]
    });
    
    if (emailResult.error) {
      console.error('❌ Resend error:', emailResult.error);
    } else {
      console.log('✅ Email sent successfully via Resend, ID:', emailResult.data?.id);
      
      // 2. Test database logging
      console.log('💾 Logging email to database...');
      const { data: logResult, error: logError } = await supabase
        .from('email_logs')
        .insert({
          template: 'debug-test',
          recipient_email: 'test-debug@example.com',
          subject: 'Test Email - Debug',
          status: 'sent',
          resend_email_id: emailResult.data?.id,
          sent_at: new Date().toISOString(),
          metadata: {
            tags: [
              { name: 'category', value: 'test' },
              { name: 'template', value: 'debug-test' }
            ]
          }
        })
        .select();
      
      if (logError) {
        console.error('❌ Database logging error:', logError);
      } else {
        console.log('✅ Email logged to database successfully:', logResult);
      }
    }
    
    // 3. Check recent email logs
    console.log('📊 Checking recent email logs...');
    const { data: recentLogs, error: fetchError } = await supabase
      .from('email_logs')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Error fetching logs:', fetchError);
    } else {
      console.log('📋 Recent email logs:', recentLogs);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailAndDatabase();