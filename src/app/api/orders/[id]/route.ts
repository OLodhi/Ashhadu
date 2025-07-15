import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { addStock } from '@/lib/inventory';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Create server-side Supabase client
    const supabaseAdmin = await createServerSupabaseClient();
    
    // Get current user for authentication
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is admin or if it's their own order
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      return NextResponse.json(
        { success: false, error: 'Failed to verify user role' },
        { status: 403 }
      );
    }
    
    // Build the query based on user role
    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        customer:customers!inner (
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
          *,
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
      .eq('id', id);
    
    // If not admin, only allow access to their own orders
    if (profile.role !== 'admin') {
      // Get customer record for this user
      const { data: customer, error: customerError } = await supabaseAdmin
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (customerError || !customer) {
        return NextResponse.json(
          { success: false, error: 'Customer not found' },
          { status: 404 }
        );
      }
      
      query = query.eq('customer_id', customer.id);
    }
    
    const { data: order, error: orderError } = await query.single();
    
    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching order:', orderError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch order' },
        { status: 500 }
      );
    }
    
    // Transform the data to match the expected format
    const transformedOrder = {
      id: order.id,
      orderNumber: `ASH-${order.id.slice(-6).toUpperCase()}`,
      customerId: order.customer_id,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method || 'manual',
      total: order.total,
      subtotal: order.subtotal,
      taxAmount: order.tax_amount,
      shippingAmount: order.shipping_amount,
      currency: order.currency,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      shippedAt: order.shipped_at,
      deliveredAt: order.delivered_at,
      customer: {
        id: order.customer.id,
        firstName: order.customer.first_name,
        lastName: order.customer.last_name,
        email: order.customer.email,
        phone: order.customer.phone
      },
      billingAddress: order.billing_address ? {
        id: order.billing_address.id,
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
        id: order.shipping_address.id,
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
        arabicName: item.product?.arabic_name || '',
        sku: item.product_sku,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        image: item.product?.featured_image || '',
        islamicCategory: item.product?.islamic_category || '',
        product: item.product
      }))
    };
    
    return NextResponse.json({
      success: true,
      data: transformedOrder
    });
    
  } catch (error) {
    console.error('Error in order GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    
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
    
    // First get the current order to check if we can make the requested changes
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Prevent cancellation of shipped or delivered orders
    if (updates.status === 'cancelled' && 
        (currentOrder.status === 'shipped' || currentOrder.status === 'delivered')) {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel orders that have been shipped or delivered' },
        { status: 400 }
      );
    }
    
    // Prepare update data, converting camelCase to snake_case
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.paymentStatus !== undefined) updateData.payment_status = updates.paymentStatus;
    if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.shippedAt !== undefined) updateData.shipped_at = updates.shippedAt;
    if (updates.deliveredAt !== undefined) updateData.delivered_at = updates.deliveredAt;
    
    // Update the order
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // Handle stock restoration for cancelled orders
    if (updates.status === 'cancelled' && currentOrder.status !== 'cancelled') {
      try {
        // Get order items to restore stock
        const { data: orderItems, error: itemsError } = await supabaseAdmin
          .from('order_items')
          .select('product_id, quantity, product_name')
          .eq('order_id', id);

        if (itemsError) {
          console.error('Error fetching order items for stock restoration:', itemsError);
        } else if (orderItems && orderItems.length > 0) {
          await addStock(
            orderItems.map(item => ({
              productId: item.product_id,
              quantity: item.quantity
            })),
            `Order cancelled: ${id}`,
            id,
            user.id // admin user who cancelled the order
          );

          console.log(`Stock restored for cancelled order ${id}`);
        }
      } catch (stockError) {
        console.error('Error restoring stock for cancelled order:', stockError);
        // Don't fail the order cancellation if stock restoration fails
        // We can handle this manually later if needed
      }
    }
    
    return NextResponse.json({
      success: true,
      data: updatedOrder
    });
    
  } catch (error) {
    console.error('Error in order PUT API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}