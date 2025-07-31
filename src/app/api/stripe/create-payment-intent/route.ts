import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { stripePaymentHelpers, formatStripeAmount } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'gbp', orderId, metadata = {} } = await request.json();
    
    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    // Create server-side Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Get current user - optional for guest payments
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    const isGuestPayment = !user;
    
    console.log(`Creating Payment Intent for ${isGuestPayment ? 'guest' : 'authenticated'} user`);

    // For authenticated users, try to get or create a Stripe customer
    let stripeCustomerId: string | undefined;
    
    if (!isGuestPayment && user) {
      try {
        // Check if user already has a Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_customer_id, email, full_name')
          .eq('user_id', user.id)
          .single();

        if (profile?.stripe_customer_id) {
          stripeCustomerId = profile.stripe_customer_id;
        } else if (profile?.email) {
          // Create a new Stripe customer
          const { stripeCustomerHelpers } = await import('@/lib/stripe');
          const { customer, error } = await stripeCustomerHelpers.createCustomer({
            email: profile.email,
            name: profile.full_name || undefined,
            metadata: {
              supabase_user_id: user.id,
              source: 'ashhadu_checkout'
            }
          });

          if (customer && !error) {
            stripeCustomerId = customer.id;
            
            // Save Stripe customer ID to profile
            await supabase
              .from('profiles')
              .update({ stripe_customer_id: customer.id })
              .eq('user_id', user.id);
            
            console.log(`Created new Stripe customer: ${customer.id}`);
          }
        }
      } catch (error) {
        console.error('Error handling Stripe customer:', error);
        // Continue without customer ID - payment will work without it
      }
    }

    // Create Payment Intent
    const paymentIntentParams = {
      amount: amount, // Amount in pounds (will be converted to pence in helper)
      currency,
      customerId: stripeCustomerId || null as any, // Fallback to null for guest payments
      automaticPaymentMethods: true,
      metadata: {
        orderId: orderId || 'pending',
        isGuestPayment: isGuestPayment.toString(),
        source: 'ashhadu_checkout',
        ...metadata
      }
    };

    const { paymentIntent, error } = await stripePaymentHelpers.createPaymentIntent(paymentIntentParams);

    if (error || !paymentIntent) {
      console.error('Error creating Payment Intent:', error);
      return NextResponse.json(
        { success: false, error: error?.message || 'Failed to create payment intent' },
        { status: 500 }
      );
    }

    console.log(`Payment Intent created: ${paymentIntent.id}`);

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerId: stripeCustomerId,
        isGuestPayment
      }
    });

  } catch (error) {
    console.error('Error in create-payment-intent API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET method for retrieving existing Payment Intent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    const { paymentIntent, error } = await stripePaymentHelpers.getPaymentIntent(paymentIntentId);

    if (error || !paymentIntent) {
      console.error('Error retrieving Payment Intent:', error);
      return NextResponse.json(
        { success: false, error: error?.message || 'Payment Intent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        clientSecret: paymentIntent.client_secret
      }
    });

  } catch (error) {
    console.error('Error in get payment intent API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}