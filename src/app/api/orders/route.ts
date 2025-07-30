import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { Order, OrderItem } from '@/types/order';
import { checkStockAvailability, deductStock } from '@/lib/inventory';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const orderData = await request.json();
    
    // Create server-side Supabase client
    const supabaseAdmin = await createServerSupabaseClient();
    
    // Get current user for admin verification
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Create customer if needed
    let customerId = orderData.customer.id;
    
    if (!customerId) {
      // Create new customer from order data
      const { data: newCustomer, error: customerError } = await supabaseAdmin
        .from('customers')
        .insert({
          email: orderData.customer.email,
          first_name: orderData.customer.firstName,
          last_name: orderData.customer.lastName,
          phone: orderData.customer.phone || null,
          marketing_consent: false
        })
        .select('id')
        .single();
      
      if (customerError) {
        console.error('Error creating customer:', customerError);
        return NextResponse.json(
          { success: false, error: 'Failed to create customer' },
          { status: 500 }
        );
      }
      
      customerId = newCustomer.id;
    }
    
    // Validate stock availability before creating the order
    if (orderData.items && orderData.items.length > 0) {
      try {
        const stockValidation = await checkStockAvailability(
          orderData.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        );

        if (!stockValidation.isValid) {
          const errorMessages = stockValidation.errors.map(error => 
            `${error.productName}: requested ${error.requestedQuantity}, available ${error.currentStock}`
          );
          
          return NextResponse.json(
            { 
              success: false, 
              error: 'Insufficient stock for the following items',
              details: errorMessages
            },
            { status: 400 }
          );
        }

        console.log('Stock validation passed for all items');
      } catch (stockError) {
        console.error('Error validating stock:', stockError);
        return NextResponse.json(
          { success: false, error: 'Failed to validate stock availability' },
          { status: 500 }
        );
      }
    }
    
    // Create the order in the database
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: customerId,
        status: orderData.status || 'pending',
        total: orderData.total,
        subtotal: orderData.subtotal,
        tax_amount: orderData.taxAmount || 0,
        shipping_amount: orderData.shippingAmount || 0,
        currency: orderData.currency || 'GBP',
        payment_status: orderData.paymentStatus || 'pending',
        payment_method: orderData.paymentMethod?.type || null,
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
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map((item: any) => ({
        order_id: newOrder.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        product_name: item.name,
        product_sku: item.sku || `ITEM-${Date.now()}`
      }));
      
      const { error: itemsError } = await supabaseAdmin
        .from('order_items')
        .insert(orderItems);
      
      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Try to clean up the order if items failed
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
          `Order created: ${newOrder.id}`,
          newOrder.id,
          user.id // admin user who created the order
        );

        console.log(`Stock deducted successfully for order ${newOrder.id}`);
      } catch (stockError) {
        console.error('Error deducting stock:', stockError);
        
        // If stock deduction fails, we should clean up the order
        await supabaseAdmin
          .from('order_items')
          .delete()
          .eq('order_id', newOrder.id);
          
        await supabaseAdmin
          .from('orders')
          .delete()
          .eq('id', newOrder.id);
        
        return NextResponse.json(
          { success: false, error: 'Failed to process inventory. Order cancelled.' },
          { status: 500 }
        );
      }
    }
    
    // Return success with the created order
    return NextResponse.json({
      success: true,
      data: {
        orderId: newOrder.id,
        orderNumber: `ASH-${newOrder.id.slice(-6).toUpperCase()}`,
        order: newOrder
      }
    });
    
  } catch (error) {
    console.error('Error in order creation API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabaseAdmin = await createServerSupabaseClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // Get search parameters
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');
    
    // Build the base query to fetch ALL orders (both admin and customer created)
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:customers (
          id,
          first_name,
          last_name,
          email
        ),
        order_items (
          *,
          product:products (
            id,
            name,
            featured_image,
            slug
          )
        )
      `);
    
    // Add search functionality if search term is provided
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      
      // Search in multiple fields using PostgreSQL OR condition
      query = query.or(
        `id.ilike.%${searchLower}%,` +
        `customer.email.ilike.%${searchLower}%,` +
        `customer.first_name.ilike.%${searchLower}%,` +
        `customer.last_name.ilike.%${searchLower}%,` +
        `status.ilike.%${searchLower}%,` +
        `payment_status.ilike.%${searchLower}%,` +
        `notes.ilike.%${searchLower}%`
      );
    }
    
    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });
    
    const { data: orders, error: ordersError } = await query;
    
    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }
    
    // Add debugging to check what orders are being returned
    console.log(`Admin orders API: Found ${orders?.length || 0} orders`);
    if (orders && orders.length > 0) {
      // Check for orders with null customers
      const ordersWithoutCustomers = orders.filter(order => !order.customer);
      if (ordersWithoutCustomers.length > 0) {
        console.warn(`Warning: Found ${ordersWithoutCustomers.length} orders with null customer data:`, 
          ordersWithoutCustomers.map(order => ({ 
            order_id: order.id, 
            customer_id: order.customer_id 
          }))
        );
      }
      
      console.log('Sample order data:', {
        id: orders[0].id,
        customer_id: orders[0].customer_id,
        status: orders[0].status,
        payment_status: orders[0].payment_status,
        total: orders[0].total,
        created_at: orders[0].created_at,
        hasCustomer: !!orders[0].customer,
        customerData: orders[0].customer
      });
    }
    
    return NextResponse.json({
      success: true,
      data: orders,
      searchTerm: searchTerm || null
    });
    
  } catch (error) {
    console.error('Error in orders GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}