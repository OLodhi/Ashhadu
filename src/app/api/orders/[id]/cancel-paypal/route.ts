import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addStock } from '@/lib/inventory';

// Use service role key for this endpoint since it's called without user authentication
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    console.log(`🔍 PayPal cancellation requested for order: ${id}`);
    
    // First, verify the order exists and can be cancelled
    const { data: currentOrder, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('id, status, customer_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !currentOrder) {
      console.error('Order not found for PayPal cancellation:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Only allow cancellation of pending orders
    if (currentOrder.status !== 'pending') {
      console.log(`Order ${id} is ${currentOrder.status}, cannot cancel`);
      return NextResponse.json(
        { success: false, error: `Order is ${currentOrder.status}, cannot cancel` },
        { status: 400 }
      );
    }
    
    // Update the order to cancelled status
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'cancelled',
        payment_status: 'failed',
        notes: 'Order cancelled due to PayPal payment cancellation',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating order to cancelled:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to cancel order' },
        { status: 500 }
      );
    }
    
    console.log(`✅ Order ${id} successfully cancelled`);
    
    // Restore stock for cancelled order
    try {
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
          `PayPal payment cancelled: ${id}`,
          id,
          'system' // system user for PayPal cancellations
        );

        console.log(`✅ Stock restored for PayPal cancelled order ${id}`);
      }
    } catch (stockError) {
      console.error('Error restoring stock for PayPal cancelled order:', stockError);
      // Don't fail the cancellation if stock restoration fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully due to PayPal payment cancellation',
      data: {
        orderId: id,
        status: 'cancelled',
        paymentStatus: 'failed'
      }
    });
    
  } catch (error) {
    console.error('Error in PayPal order cancellation API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}