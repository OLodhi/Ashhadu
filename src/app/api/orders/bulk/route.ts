import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { addStock } from '@/lib/inventory';

export async function POST(request: NextRequest) {
  try {
    const { action, orderIds, data } = await request.json();
    
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
    
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No orders selected' },
        { status: 400 }
      );
    }
    
    let updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Handle different bulk actions
    switch (action) {
      case 'update_status':
        if (!data.status) {
          return NextResponse.json(
            { success: false, error: 'Status is required' },
            { status: 400 }
          );
        }
        updateData.status = data.status;
        break;
        
      case 'mark_paid':
        updateData.payment_status = 'paid';
        break;
        
      case 'mark_shipped':
        updateData.status = 'shipped';
        updateData.shipped_at = new Date().toISOString();
        break;
        
      case 'cancel_orders':
        // First check if any of the orders are already shipped
        const { data: ordersToCancel, error: checkError } = await supabaseAdmin
          .from('orders')
          .select('id, status')
          .in('id', orderIds);
        
        if (checkError) {
          return NextResponse.json(
            { success: false, error: 'Failed to verify order status' },
            { status: 500 }
          );
        }
        
        const shippedOrders = ordersToCancel?.filter(o => o.status === 'shipped' || o.status === 'delivered') || [];
        
        if (shippedOrders.length > 0) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Cannot cancel ${shippedOrders.length} order(s) that have already been shipped or delivered.`,
              shippedOrderIds: shippedOrders.map(o => o.id)
            },
            { status: 400 }
          );
        }
        
        updateData.status = 'cancelled';
        if (data.reason) {
          updateData.notes = data.reason;
        }
        break;
        
      case 'start_production':
        updateData.status = 'processing';
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    // Update all selected orders
    const { data: updatedOrders, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .in('id', orderIds)
      .select('id, status, payment_status');
    
    if (updateError) {
      console.error('Error updating orders:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update orders' },
        { status: 500 }
      );
    }

    // Handle stock restoration for bulk cancellations
    if (action === 'cancel_orders' && updatedOrders && updatedOrders.length > 0) {
      try {
        // Get all order items for the cancelled orders to restore stock
        const { data: orderItems, error: itemsError } = await supabaseAdmin
          .from('order_items')
          .select('product_id, quantity, order_id')
          .in('order_id', orderIds);

        if (itemsError) {
          console.error('Error fetching order items for bulk stock restoration:', itemsError);
        } else if (orderItems && orderItems.length > 0) {
          // Group items by product to combine quantities
          const stockToRestore: { [productId: string]: number } = {};
          
          orderItems.forEach(item => {
            if (stockToRestore[item.product_id]) {
              stockToRestore[item.product_id] += item.quantity;
            } else {
              stockToRestore[item.product_id] = item.quantity;
            }
          });

          // Restore stock for all products
          const stockItems = Object.entries(stockToRestore).map(([productId, quantity]) => ({
            productId,
            quantity
          }));

          await addStock(
            stockItems,
            `Bulk order cancellation: ${orderIds.length} orders`,
            `bulk-cancel-${Date.now()}`,
            user.id // admin user who performed bulk cancellation
          );

          console.log(`Stock restored for ${orderIds.length} cancelled orders`);
        }
      } catch (stockError) {
        console.error('Error restoring stock for bulk cancelled orders:', stockError);
        // Don't fail the bulk operation if stock restoration fails
        // We can handle this manually later if needed
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        updatedCount: updatedOrders?.length || 0,
        updatedOrders
      }
    });
    
  } catch (error) {
    console.error('Error in bulk orders API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}