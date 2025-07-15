import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { stripePaymentHelpers } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentMethodId, amount, currency = 'gbp', customerId } = await request.json();
    
    // Validate required fields
    if (!orderId || !paymentMethodId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Order ID, payment method ID, and valid amount are required' },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log(`Processing saved payment method for user: ${user.id}`);
    console.log('Request parameters:', { orderId, paymentMethodId, amount, currency, customerId });

    // Validate customer ID
    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required for saved payment methods' },
        { status: 400 }
      );
    }

    // Create and confirm Payment Intent with saved payment method
    const { paymentIntent, error } = await stripePaymentHelpers.createPaymentIntent({
      amount: amount, // Amount in pounds (will be converted to pence in helper)
      currency,
      customerId,
      paymentMethodId,
      returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/confirmation`,
      metadata: {
        orderId: orderId.toString(),
        userId: user.id,
        source: 'ashhadu_saved_payment'
      }
    });

    if (error || !paymentIntent) {
      console.error('Error creating Payment Intent with saved method:', error);
      return NextResponse.json(
        { success: false, error: error?.message || 'Failed to create payment intent' },
        { status: 500 }
      );
    }

    // Check if payment requires additional authentication
    if (paymentIntent.status === 'requires_action') {
      return NextResponse.json({
        success: false,
        error: 'Payment requires additional authentication. Please use the payment form.',
        requiresAction: true,
        clientSecret: paymentIntent.client_secret
      });
    }

    // Check if payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      console.error('Payment failed with status:', paymentIntent.status);
      return NextResponse.json(
        { success: false, error: 'Payment failed. Please try again.' },
        { status: 400 }
      );
    }

    // Update order with payment information using admin client (bypasses RLS)
    console.log(`Updating order ${orderId} with payment info...`);
    
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
    
    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        stripe_payment_intent_id: paymentIntent.id,
        payment_status: 'paid',
        status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('*');

    console.log('Order update result:', updateResult);
    console.log('Order update error:', updateError);

    if (updateError) {
      console.error('Error updating order with payment info:', updateError);
      // Payment succeeded but order update failed - this needs manual handling
      return NextResponse.json(
        { success: false, error: `Payment succeeded but order update failed: ${updateError.message}. Please contact support.` },
        { status: 500 }
      );
    }

    if (!updateResult || updateResult.length === 0) {
      console.error('Order update returned no results - order may not exist:', orderId);
      return NextResponse.json(
        { success: false, error: `Payment succeeded but order ${orderId} not found. Please contact support.` },
        { status: 500 }
      );
    }

    console.log(`Payment processed successfully: ${paymentIntent.id}`);

    return NextResponse.json({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        orderId
      }
    });

  } catch (error) {
    console.error('Error in process-saved-payment API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}