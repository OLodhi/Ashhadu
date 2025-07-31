import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { PaymentMethodType } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentMethod, paymentData, paymentIntentId } = await request.json();
    
    // Create server-side Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Get current user - optional for guest payments
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Allow guest payments - user can be null
    const isGuestPayment = !user;
    
    console.log(`Processing ${isGuestPayment ? 'guest' : 'authenticated'} payment for order: ${orderId}`);

    // Create admin client for payment operations (bypasses RLS)
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
    
    // Validate required data
    if (!orderId || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: 'Order ID and payment method are required' },
        { status: 400 }
      );
    }
    
    // Get the order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (orderError || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Check if order is already paid
    if (order.payment_status === 'paid') {
      return NextResponse.json(
        { success: false, error: 'Order has already been paid' },
        { status: 400 }
      );
    }
    
    let paymentResult;
    
    try {
      // Process payment based on method
      switch (paymentMethod as PaymentMethodType) {
        case 'card':
          paymentResult = await processStripePayment(order, { 
            ...paymentData, 
            paymentIntentId: paymentIntentId || paymentData?.paymentIntentId 
          });
          break;
        case 'paypal':
          paymentResult = await processPayPalPayment(order, paymentData);
          break;
        case 'apple_pay':
          paymentResult = await processApplePayPayment(order, paymentData);
          break;
        case 'google_pay':
          paymentResult = await processGooglePayPayment(order, paymentData);
          break;
        default:
          return NextResponse.json(
            { success: false, error: 'Unsupported payment method' },
            { status: 400 }
          );
      }
      
      // Handle different payment result types
      if (paymentResult.success) {
        // Payment completed successfully
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'processing',
            payment_method: paymentMethod,
            stripe_payment_intent_id: paymentMethod === 'card' ? paymentResult.paymentId : null,
            notes: `${order.notes || ''}\nPayment ID: ${paymentResult.paymentId}${'status' in paymentResult && paymentResult.status ? `\nStatus: ${paymentResult.status}` : ''}`
          })
          .eq('id', orderId);
        
        if (updateError) {
          console.error('Error updating order payment status:', updateError);
          return NextResponse.json(
            { success: false, error: 'Payment processed but failed to update order' },
            { status: 500 }
          );
        }
        
        return NextResponse.json({
          success: true,
          data: {
            orderId,
            paymentId: paymentResult.paymentId,
            status: 'paid',
            orderNumber: `ASH-${orderId.slice(-6).toUpperCase()}`,
            isGuestPayment,
            message: `Payment successful!${isGuestPayment ? ' (guest payment)' : ''}`
          }
        });
      } else if ('requiresApproval' in paymentResult && paymentResult.requiresApproval) {
        // Payment requires user approval (PayPal redirect)
        return NextResponse.json({
          success: false,
          requiresApproval: true,
          approvalUrl: 'approvalUrl' in paymentResult ? paymentResult.approvalUrl : undefined,
          paypalOrderId: 'paypalOrderId' in paymentResult ? paymentResult.paypalOrderId : undefined,
          orderId,
          error: 'Payment requires user approval'
        });
      } else {
        // Payment failed
        return NextResponse.json(
          { success: false, error: ('error' in paymentResult ? paymentResult.error : null) || 'Payment failed' },
          { status: 400 }
        );
      }
      
    } catch (paymentError) {
      console.error('Payment processing error:', paymentError);
      return NextResponse.json(
        { success: false, error: 'Payment processing failed' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in payment processing API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Mock payment processing functions
// In a real application, these would integrate with actual payment providers

async function processStripePayment(order: any, paymentData: any) {
  console.log('Processing Stripe payment for order:', order.id);
  
  try {
    // Import Stripe helpers
    const { stripePaymentHelpers } = await import('@/lib/stripe');
    
    // Check if this order already has a payment intent
    if (paymentData.paymentIntentId) {
      // Retrieve the existing payment intent to confirm it was successful
      const { paymentIntent, error } = await stripePaymentHelpers.getPaymentIntent(paymentData.paymentIntentId);
      
      if (error) {
        console.error('Error retrieving payment intent:', error);
        return {
          success: false,
          error: error.message || 'Failed to verify payment'
        };
      }
      
      if (paymentIntent?.status === 'succeeded') {
        console.log('Payment already succeeded:', paymentIntent.id);
        return {
          success: true,
          paymentId: paymentIntent.id,
          transactionId: paymentIntent.id,
          amount: paymentIntent.amount / 100, // Convert from pence to pounds
          currency: paymentIntent.currency.toUpperCase(),
          status: paymentIntent.status
        };
      } else {
        return {
          success: false,
          error: `Payment not completed. Status: ${paymentIntent?.status || 'unknown'}`
        };
      }
    } else {
      // Legacy: Create a new payment intent (shouldn't happen with new flow)
      console.warn('Creating new payment intent in process endpoint - this should use the checkout flow');
      
      const { paymentIntent, error } = await stripePaymentHelpers.createPaymentIntent({
        amount: order.total,
        currency: order.currency?.toLowerCase() || 'gbp',
        customerId: null as any, // Guest payment - null for no customer
        automaticPaymentMethods: true,
        metadata: {
          orderId: order.id,
          source: 'legacy_payment_process'
        }
      });
      
      if (error || !paymentIntent) {
        console.error('Error creating payment intent:', error);
        return {
          success: false,
          error: error?.message || 'Failed to create payment intent'
        };
      }
      
      return {
        success: false,
        error: 'Payment intent created but requires client-side confirmation',
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret
      };
    }
  } catch (error: any) {
    console.error('Error in Stripe payment processing:', error);
    return {
      success: false,
      error: error.message || 'Stripe payment processing failed'
    };
  }
}

async function processPayPalPayment(order: any, paymentData: any) {
  console.log('Processing PayPal payment for order:', order.id);
  
  try {
    // Check if this is a PayPal order capture (user returned from PayPal)
    if (paymentData.paypalOrderId) {
      console.log('Capturing PayPal order:', paymentData.paypalOrderId);
      
      // Import PayPal helpers
      const { paypalHelpers } = await import('@/lib/paypal');
      
      // Capture the existing PayPal order
      const { order: capturedOrder, error: captureError } = await paypalHelpers.captureOrder(paymentData.paypalOrderId);
      
      if (captureError || !capturedOrder) {
        console.error('PayPal order capture failed:', captureError);
        return {
          success: false,
          error: captureError || 'Failed to capture PayPal payment'
        };
      }
      
      // Check if capture was successful
      if (capturedOrder.status === 'COMPLETED') {
        const capture = capturedOrder.purchase_units[0]?.payments?.captures?.[0];
        return {
          success: true,
          paymentId: capturedOrder.id,
          transactionId: capture?.id || capturedOrder.id,
          amount: parseFloat(capture?.amount?.value || order.total),
          currency: capture?.amount?.currency_code || order.currency,
          status: 'completed'
        };
      } else {
        return {
          success: false,
          error: `PayPal payment not completed. Status: ${capturedOrder.status}`
        };
      }
    } else {
      // Create a new PayPal order for immediate payment
      console.log('Creating PayPal order for immediate payment');
      
      // Import PayPal helpers
      const { paypalHelpers } = await import('@/lib/paypal');
      
      // Create PayPal order
      const { order: paypalOrder, error: orderError } = await paypalHelpers.createOrder({
        amount: order.total,
        currency: order.currency || 'GBP',
        orderId: order.id,
        description: `Order ${order.id} - Islamic Art Purchase`,
        items: paymentData.items || [],
        payerEmail: paymentData.payerEmail // Pass saved PayPal email for pre-fill
      });
      
      if (orderError || !paypalOrder) {
        console.error('PayPal order creation failed:', orderError);
        return {
          success: false,
          error: orderError || 'Failed to create PayPal order'
        };
      }
      
      // Get the approval URL
      const approvalUrl = paypalOrder.links?.find((link: any) => link.rel === 'approve')?.href;
      
      if (!approvalUrl) {
        return {
          success: false,
          error: 'PayPal approval URL not found'
        };
      }
      
      // Return the approval URL for user to complete payment
      return {
        success: false, // Not completed yet - user needs to approve
        requiresApproval: true,
        approvalUrl: approvalUrl,
        paypalOrderId: paypalOrder.id,
        error: 'PayPal payment requires user approval'
      };
    }
  } catch (error: any) {
    console.error('Error in PayPal payment processing:', error);
    return {
      success: false,
      error: error.message || 'PayPal payment processing failed'
    };
  }
}

async function processApplePayPayment(order: any, paymentData: any) {
  // Simulate Apple Pay payment processing
  console.log('Processing Apple Pay payment for order:', order.id);
  
  // Mock payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate successful payment
  return {
    success: true,
    paymentId: `apple_pay_${Date.now()}`,
    transactionId: `ap_txn_${Date.now()}`,
    amount: order.total,
    currency: order.currency
  };
}

async function processGooglePayPayment(order: any, paymentData: any) {
  // Simulate Google Pay payment processing
  console.log('Processing Google Pay payment for order:', order.id);
  
  // Mock payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate successful payment
  return {
    success: true,
    paymentId: `google_pay_${Date.now()}`,
    transactionId: `gp_txn_${Date.now()}`,
    amount: order.total,
    currency: order.currency
  };
}