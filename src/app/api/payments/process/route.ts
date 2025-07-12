import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { PaymentMethodType } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentMethod, paymentData } = await request.json();
    
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
          paymentResult = await processStripePayment(order, paymentData);
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
      
      // Update order with payment result
      if (paymentResult.success) {
        const { error: updateError } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'paid',
            status: 'processing',
            payment_method: paymentMethod,
            notes: `${order.notes || ''}\nPayment ID: ${paymentResult.paymentId}`
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
      } else {
        return NextResponse.json(
          { success: false, error: paymentResult.error || 'Payment failed' },
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
  // Simulate Stripe payment processing
  console.log('Processing Stripe payment for order:', order.id);
  
  // Mock payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate successful payment
  return {
    success: true,
    paymentId: `stripe_pi_${Date.now()}`,
    transactionId: `txn_${Date.now()}`,
    amount: order.total,
    currency: order.currency
  };
}

async function processPayPalPayment(order: any, paymentData: any) {
  // Simulate PayPal payment processing
  console.log('Processing PayPal payment for order:', order.id);
  
  // Mock payment processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate successful payment
  return {
    success: true,
    paymentId: `paypal_${Date.now()}`,
    transactionId: `pp_txn_${Date.now()}`,
    amount: order.total,
    currency: order.currency
  };
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