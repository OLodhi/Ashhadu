import { NextRequest, NextResponse } from 'next/server';
import { paypalHelpers } from '@/lib/paypal';

export async function POST(request: NextRequest) {
  try {
    const { paypalOrderId } = await request.json();
    
    if (!paypalOrderId) {
      return NextResponse.json(
        { success: false, error: 'PayPal order ID is required' },
        { status: 400 }
      );
    }

    console.log('Getting PayPal order details for:', paypalOrderId);
    
    // Get PayPal order details
    const { order, error } = await paypalHelpers.getOrder(paypalOrderId);
    
    if (error || !order) {
      console.error('Error getting PayPal order:', error);
      return NextResponse.json(
        { success: false, error: error || 'Failed to get PayPal order' },
        { status: 500 }
      );
    }

    // Extract our internal order ID from the reference_id
    const referenceId = order.purchase_units?.[0]?.reference_id;
    
    return NextResponse.json({
      success: true,
      data: {
        paypalOrderId: order.id,
        status: order.status,
        referenceId: referenceId, // Our internal order ID
        amount: order.purchase_units?.[0]?.amount?.value,
        currency: order.purchase_units?.[0]?.amount?.currency_code,
        links: order.links
      }
    });

  } catch (error) {
    console.error('Error in PayPal get-order API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}