import { NextRequest, NextResponse } from 'next/server';
import { stripePaymentMethodHelpers } from '@/lib/stripe';

// POST /api/stripe/setup-intent - Create setup intent for saving payment methods
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, paymentMethodTypes = ['card'], metadata = {} } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Stripe customer ID is required' },
        { status: 400 }
      );
    }

    // Create setup intent
    const { setupIntent, error } = await stripePaymentMethodHelpers.createSetupIntent({
      customerId,
      paymentMethodTypes,
      metadata: {
        source: 'ashhadu_payment_methods',
        ...metadata,
      },
    });

    if (error || !setupIntent) {
      console.error('Error creating setup intent:', error);
      return NextResponse.json(
        { error: 'Failed to create setup intent' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: setupIntent.id,
        client_secret: setupIntent.client_secret,
        status: setupIntent.status,
        payment_method_types: setupIntent.payment_method_types,
      }
    });

  } catch (error) {
    console.error('Error in setup intent creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}