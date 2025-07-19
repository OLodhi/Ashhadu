import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNewsletterWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email, name, source } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create admin client for newsletter operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Check if subscriber already exists
    const { data: existingSubscriber, error: checkError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, status')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing subscriber:', checkError);
      return NextResponse.json(
        { success: false, error: 'Failed to check subscription status' },
        { status: 500 }
      );
    }

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json({
          success: true,
          message: 'Already subscribed to newsletter',
          data: { email, existing: true }
        });
      } else {
        // Reactivate unsubscribed user
        const { error: updateError } = await supabaseAdmin
          .from('newsletter_subscribers')
          .update({
            status: 'active',
            name: name || null,
            source: source || 'unknown',
            unsubscribed_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSubscriber.id);

        if (updateError) {
          console.error('Error reactivating subscriber:', updateError);
          return NextResponse.json(
            { success: false, error: 'Failed to reactivate subscription' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Newsletter subscription reactivated',
          data: { email, reactivated: true }
        });
      }
    }

    // Create new subscriber
    const confirmationToken = `newsletter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const unsubscribeToken = `unsub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const { data: newSubscriber, error: createError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({
        email,
        name: name || null,
        source: source || 'unknown',
        status: 'active', // Skip confirmation for now
        confirmed: true, // Auto-confirm for simplicity
        confirmed_at: new Date().toISOString(),
        confirmation_token: confirmationToken,
        unsubscribe_token: unsubscribeToken,
        signup_ip: request.headers.get('x-forwarded-for') || 'unknown',
        signup_user_agent: request.headers.get('user-agent') || 'unknown'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating subscriber:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to subscribe to newsletter' },
        { status: 500 }
      );
    }

    console.log('Newsletter subscriber created:', newSubscriber.id);

    // Send welcome email
    try {
      const welcomeEmailResult = await sendNewsletterWelcomeEmail(email, name);
      
      if (welcomeEmailResult.success) {
        console.log('✅ Newsletter welcome email sent successfully');
      } else {
        console.error('❌ Failed to send newsletter welcome email:', welcomeEmailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Error sending newsletter welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: { email, subscribed: true }
    });

  } catch (error) {
    console.error('Error in newsletter subscription API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}