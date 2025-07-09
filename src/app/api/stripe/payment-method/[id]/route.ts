import { NextRequest, NextResponse } from 'next/server';
import { stripePaymentMethodHelpers } from '@/lib/stripe';

// GET /api/stripe/payment-method/[id] - Get payment method details from Stripe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    // Get payment method details from Stripe
    const { paymentMethod, error } = await stripePaymentMethodHelpers.getPaymentMethod(id);

    if (error || !paymentMethod) {
      console.error('Error fetching payment method from Stripe:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment method details' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          exp_month: paymentMethod.card.exp_month,
          exp_year: paymentMethod.card.exp_year,
        } : null,
        customer: paymentMethod.customer,
        created: paymentMethod.created,
      }
    });

  } catch (error) {
    console.error('Error in payment method retrieval API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}