import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { checkStockAvailability, deductStock } from '@/lib/inventory';
import { sendOrderConfirmationEmail, sendAdminNewOrderNotification } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const orderData = await request.json();
    
    // Create server-side Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Get current user (customer) - optional for guest checkout
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Allow guest checkout - user can be null
    const isGuestCheckout = !user;
    
    console.log(`Processing ${isGuestCheckout ? 'guest' : 'authenticated'} order for email: ${orderData.customer?.email}`);
    console.log('Order data received:', {
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentStatus,
      paymentIntentId: orderData.paymentIntentId,
      total: orderData.total,
      customerEmail: orderData.customer?.email
    });

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
    
    // Validate required order data
    if (!orderData.customer || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order data. Customer information and items are required.' },
        { status: 400 }
      );
    }

    // Find or create customer record
    let customerId = null;
    
    // First try to find existing customer by email
    const { data: existingCustomer, error: findCustomerError } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('email', orderData.customer.email)
      .single();
    
    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Create new customer
      // Determine if this is a guest customer (no authenticated user)
      const isGuest = !orderData.userId; // If no userId provided, it's a guest checkout
      
      const { data: newCustomer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          email: orderData.customer.email,
          first_name: orderData.customer.firstName || '',
          last_name: orderData.customer.lastName || '',
          phone: orderData.customer.phone || null,
          date_of_birth: null,
          marketing_consent: false,
          is_guest: isGuest
        })
        .select('id')
        .single();
      
      if (customerError) {
        console.error('Error creating customer:', customerError);
        return NextResponse.json(
          { success: false, error: 'Failed to create customer record' },
          { status: 500 }
        );
      }
      
      customerId = newCustomer.id;
    }
    
    // Create billing address if provided
    let billingAddressId = null;
    if (orderData.billing && orderData.billing.address) {
      // Check if we should use an existing address
      if (orderData.billing.existingAddressId) {
        billingAddressId = orderData.billing.existingAddressId;
      } else {
        // Create new address only if not using existing one
        const { data: billingAddress, error: billingError } = await supabaseAdmin
          .from('addresses')
          .insert({
            customer_id: customerId,
            type: 'billing',
            first_name: orderData.customer.firstName || '',
            last_name: orderData.customer.lastName || '',
            address_line_1: orderData.billing.address,
            address_line_2: orderData.billing.address2 || null,
            city: orderData.billing.city,
            county: orderData.billing.county || null,
            postcode: orderData.billing.postcode,
            country: orderData.billing.country || 'GB'
          })
          .select('id')
          .single();
        
        if (!billingError) {
          billingAddressId = billingAddress.id;
        }
      }
    }
    
    // Create shipping address if different from billing
    let shippingAddressId = billingAddressId;
    if (orderData.shipping && !orderData.shipping.sameAsBilling && orderData.shipping.address) {
      // Check if we should use an existing address
      if (orderData.shipping.existingAddressId) {
        shippingAddressId = orderData.shipping.existingAddressId;
      } else {
        // Create new address only if not using existing one
        const { data: shippingAddress, error: shippingError } = await supabaseAdmin
          .from('addresses')
          .insert({
            customer_id: customerId,
            type: 'shipping',
            first_name: orderData.customer.firstName || '',
            last_name: orderData.customer.lastName || '',
            address_line_1: orderData.shipping.address,
            address_line_2: orderData.shipping.address2 || null,
            city: orderData.shipping.city,
            county: orderData.shipping.county || null,
            postcode: orderData.shipping.postcode,
            country: orderData.shipping.country || 'GB'
          })
          .select('id')
          .single();
        
        if (!shippingError) {
          shippingAddressId = shippingAddress.id;
        }
      }
    }
    
    // Validate stock availability for all items
    try {
      const stockValidation = await checkStockAvailability(
        orderData.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        supabaseAdmin
      );

      if (!stockValidation.isValid) {
        const errorMessages = stockValidation.errors.map(error => 
          `${error.productName}: requested ${error.requestedQuantity}, available ${error.currentStock}`
        );
        
        return NextResponse.json(
          { 
            success: false, 
            error: 'Some items are out of stock',
            details: errorMessages
          },
          { status: 400 }
        );
      }
    } catch (stockError) {
      console.error('Error validating stock:', stockError);
      return NextResponse.json(
        { success: false, error: 'Failed to validate stock availability' },
        { status: 500 }
      );
    }
    
    // Generate order number first (we'll use a temporary one, then update after getting the ID)
    const tempOrderNumber = `ASH-${Date.now().toString().slice(-6)}`;
    
    // Create the order
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: customerId,
        order_number: tempOrderNumber, // Temporary order number
        status: orderData.paymentStatus === 'paid' ? 'processing' : 'pending',
        total: orderData.total,
        subtotal: orderData.subtotal || orderData.total,
        tax_amount: orderData.vatAmount || 0,
        shipping_amount: orderData.shippingAmount || 0,
        currency: orderData.currency || 'GBP',
        payment_status: orderData.paymentStatus || 'pending',
        payment_method: orderData.paymentMethod || null,
        stripe_payment_intent_id: orderData.paymentIntentId || null,
        billing_address_id: billingAddressId,
        shipping_address_id: shippingAddressId,
        notes: orderData.notes || null
      })
      .select('*')
      .single();
    
    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
        { status: 500 }
      );
    }
    
    // Create order items
    const orderItems = orderData.items.map((item: any) => ({
      order_id: newOrder.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      total: item.total || (item.price * item.quantity),
      product_name: item.name,
      product_sku: item.sku || `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    
    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      
      // Clean up the order if items creation failed
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', newOrder.id);
      
      return NextResponse.json(
        { success: false, error: 'Failed to create order items' },
        { status: 500 }
      );
    }
    
    // Deduct stock for all order items
    try {
      await deductStock(
        orderData.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        `Customer order: ${newOrder.id}`,
        newOrder.id,
        user?.id || 'guest', // customer user who placed the order or 'guest'
        supabaseAdmin
      );
      
      console.log(`Stock deducted successfully for customer order ${newOrder.id}`);
    } catch (stockError) {
      console.error('Error deducting stock for customer order:', stockError);
      
      // If stock deduction fails, clean up the order
      await supabaseAdmin
        .from('order_items')
        .delete()
        .eq('order_id', newOrder.id);
        
      await supabaseAdmin
        .from('orders')
        .delete()
        .eq('id', newOrder.id);
      
      return NextResponse.json(
        { success: false, error: 'Failed to process inventory. Please try again.' },
        { status: 500 }
      );
    }
    
    // Generate proper order number based on UUID
    const orderNumber = `ASH-${newOrder.id.slice(-6).toUpperCase()}`;
    console.log(`🔍 Order Creation: Order ID: ${newOrder.id}`);
    console.log(`🔍 Order Creation: Generated order number: ${orderNumber}`);
    console.log(`🔍 Order Creation: Last 6 chars: ${newOrder.id.slice(-6).toUpperCase()}`);
    
    // Update order with proper order number
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ order_number: orderNumber })
      .eq('id', newOrder.id);
    
    if (updateError) {
      console.error('Error updating order number:', updateError);
      // Don't fail the entire order creation for this
    }
    
    // Send email notifications for paid orders
    console.log('🔍 Order Creation: Payment Status:', orderData.paymentStatus);
    if (orderData.paymentStatus === 'paid') {
      console.log('📧 Sending email notifications for paid order:', orderNumber);
      await sendEmailNotifications(newOrder, orderNumber, orderData, orderItems, supabaseAdmin);
    } else {
      console.log('⏳ Skipping email notifications - order not paid yet:', orderNumber, 'Status:', orderData.paymentStatus);
      // TEMPORARY: Send emails for all orders during testing
      console.log('🧪 TEST MODE: Sending email notifications anyway for testing');
      await sendEmailNotifications(newOrder, orderNumber, orderData, orderItems, supabaseAdmin);
    }
    
    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        orderId: newOrder.id,
        orderNumber: orderNumber,
        customerId: customerId,
        total: newOrder.total,
        status: newOrder.status,
        paymentStatus: newOrder.payment_status,
        isGuestOrder: isGuestCheckout,
        message: `Order created successfully${isGuestCheckout ? ' (guest checkout)' : ''}. Please complete payment to confirm your order.`
      }
    });
    
  } catch (error) {
    console.error('Error in customer order creation API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Send email notifications for new orders
 */
async function sendEmailNotifications(
  order: any, 
  orderNumber: string, 
  orderData: any, 
  orderItems: any[], 
  supabaseAdmin: any
) {
  try {
    console.log('📧 Sending email notifications for order:', orderNumber);

    // Get customer information
    const customerName = `${orderData.customer.firstName || ''} ${orderData.customer.lastName || ''}`.trim() || orderData.customer.email;

    // Get product details for order items
    const productIds = orderData.items.map((item: any) => item.productId);
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id, name, arabic_name, image_url')
      .in('id', productIds);

    // Get address details
    const { data: shippingAddress } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('id', order.shipping_address_id)
      .single();

    const { data: billingAddress } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('id', order.billing_address_id)
      .single();

    // Prepare order items with product details
    const enrichedOrderItems = orderData.items.map((item: any) => {
      const product = products?.find(p => p.id === item.productId);
      return {
        id: item.productId,
        name: item.name || product?.name || 'Unknown Product',
        arabic_name: product?.arabic_name,
        price: item.price,
        quantity: item.quantity,
        image_url: product?.image_url,
      };
    });

    // Send customer order confirmation email
    const customerEmailResult = await sendOrderConfirmationEmail(
      orderData.customer.email,
      customerName,
      orderNumber,
      {
        orderDate: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        orderItems: enrichedOrderItems,
        subtotal: orderData.subtotal || order.subtotal,
        shipping: orderData.shippingAmount || order.shipping_amount,
        tax: orderData.vatAmount || order.tax_amount,
        total: order.total,
        shippingAddress: shippingAddress ? {
          name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          address: shippingAddress.address_line_1,
          city: shippingAddress.city,
          postalCode: shippingAddress.postcode,
          country: shippingAddress.country,
        } : null,
        orderId: order.id,
      }
    );

    if (customerEmailResult.success) {
      console.log('✅ Customer order confirmation email sent successfully');
    } else {
      console.error('❌ Failed to send customer order confirmation email:', customerEmailResult.error);
    }

    // Get admin emails from site settings
    const { data: adminEmailsSetting, error: adminEmailsError } = await supabaseAdmin
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_notification_emails')
      .single();

    console.log('🔍 Admin Email Setting Debug:', {
      adminEmailsSetting,
      adminEmailsError,
      settingValue: adminEmailsSetting?.value,
      settingType: typeof adminEmailsSetting?.value
    });

    const adminEmails = adminEmailsSetting?.value || ['admin@ashhadu.co.uk'];
    console.log('🔍 Final Admin Emails:', adminEmails);

    // Send admin notification email
    const adminEmailResult = await sendAdminNewOrderNotification(
      Array.isArray(adminEmails) ? adminEmails : [adminEmails],
      orderNumber,
      {
        orderDate: new Date().toLocaleDateString('en-GB'),
        customerName,
        customerEmail: orderData.customer.email,
        customerPhone: orderData.customer.phone,
        orderItems: enrichedOrderItems,
        subtotal: orderData.subtotal || order.subtotal,
        shipping: orderData.shippingAmount || order.shipping_amount,
        tax: orderData.vatAmount || order.tax_amount,
        total: order.total,
        paymentMethod: orderData.paymentMethod,
        paymentStatus: order.payment_status,
        shippingAddress: shippingAddress ? {
          name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          address: shippingAddress.address_line_1,
          city: shippingAddress.city,
          postalCode: shippingAddress.postcode,
          country: shippingAddress.country,
        } : null,
        billingAddress: billingAddress ? {
          name: `${billingAddress.first_name} ${billingAddress.last_name}`,
          address: billingAddress.address_line_1,
          city: billingAddress.city,
          postalCode: billingAddress.postcode,
          country: billingAddress.country,
        } : null,
        orderId: order.id,
        urgent: order.total > 200, // Mark as urgent for large orders
      }
    );

    if (adminEmailResult.success) {
      console.log('✅ Admin order notification email sent successfully');
    } else {
      console.error('❌ Failed to send admin order notification email:', adminEmailResult.error);
    }

  } catch (error) {
    console.error('❌ Error sending email notifications:', error);
    // Don't fail the order creation if email fails
  }
}