import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    const { orderNumber } = await params;
    
    // Create admin client for order operations (bypasses RLS)
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
    
    // Extract order ID from order number (format: ASH-XXXXXX)
    if (!orderNumber || !orderNumber.startsWith('ASH-')) {
      return NextResponse.json(
        { success: false, error: 'Invalid order number format' },
        { status: 400 }
      );
    }
    
    console.log(`🔍 Confirmation API: Looking for order with number: ${orderNumber}`);
    
    // Find order by order_number field
    const { data: order, error: searchError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:customers (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        billing_address:addresses!billing_address_id (
          id,
          first_name,
          last_name,
          company,
          address_line_1,
          address_line_2,
          city,
          county,
          postcode,
          country,
          phone
        ),
        shipping_address:addresses!shipping_address_id (
          id,
          first_name,
          last_name,
          company,
          address_line_1,
          address_line_2,
          city,
          county,
          postcode,
          country,
          phone
        ),
        order_items (
          id,
          product_id,
          quantity,
          price,
          total,
          product_name,
          product_sku,
          product:products (
            id,
            name,
            arabic_name,
            featured_image,
            slug,
            islamic_category
          )
        )
      `)
      .eq('order_number', orderNumber)
      .single();
    
    if (searchError) {
      console.error('Error searching for order:', searchError);
      return NextResponse.json(
        { success: false, error: 'Failed to search for order' },
        { status: 500 }
      );
    }
    
    console.log(`🔍 Confirmation API: Found order:`, order ? `${order.order_number} (ID: ${order.id})` : 'No order found');
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Allow access to order confirmation with order number (acts as access token)
    
    // Calculate estimated delivery (7 business days from order date)
    const orderDate = new Date(order.created_at);
    const estimatedDelivery = new Date(orderDate);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);
    
    // Transform the data for the confirmation page
    const confirmationData = {
      id: order.id,
      orderNumber: `ASH-${order.id.slice(-6).toUpperCase()}`,
      orderDate: order.created_at,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method || 'N/A',
      stripePaymentIntentId: order.stripe_payment_intent_id,
      total: order.total,
      subtotal: order.subtotal,
      taxAmount: order.tax_amount,
      shippingAmount: order.shipping_amount,
      currency: order.currency,
      notes: order.notes,
      estimatedDelivery: estimatedDelivery.toISOString(),
      
      customer: order.customer ? {
        id: order.customer.id,
        firstName: order.customer.first_name,
        lastName: order.customer.last_name,
        email: order.customer.email,
        phone: order.customer.phone
      } : null,
      
      billingAddress: order.billing_address ? {
        firstName: order.billing_address.first_name,
        lastName: order.billing_address.last_name,
        company: order.billing_address.company,
        addressLine1: order.billing_address.address_line_1,
        addressLine2: order.billing_address.address_line_2,
        city: order.billing_address.city,
        county: order.billing_address.county,
        postcode: order.billing_address.postcode,
        country: order.billing_address.country,
        phone: order.billing_address.phone
      } : null,
      
      shippingAddress: order.shipping_address ? {
        firstName: order.shipping_address.first_name,
        lastName: order.shipping_address.last_name,
        company: order.shipping_address.company,
        addressLine1: order.shipping_address.address_line_1,
        addressLine2: order.shipping_address.address_line_2,
        city: order.shipping_address.city,
        county: order.shipping_address.county,
        postcode: order.shipping_address.postcode,
        country: order.shipping_address.country,
        phone: order.shipping_address.phone
      } : null,
      
      items: order.order_items.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        name: item.product_name,
        arabicName: item.product?.arabic_name || null,
        sku: item.product_sku,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        image: item.product?.featured_image || null,
        islamicCategory: item.product?.islamic_category || null,
        slug: item.product?.slug || null
      }))
    };
    
    return NextResponse.json({
      success: true,
      data: confirmationData
    });
    
  } catch (error) {
    console.error('Error in order confirmation API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}