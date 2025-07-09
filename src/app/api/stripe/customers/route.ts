import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { stripeCustomerHelpers } from '@/lib/stripe';

// POST /api/stripe/customers - Create or retrieve Stripe customer for Supabase customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, email, firstName, lastName, phone } = body;

    console.log('Creating Stripe customer for:', { customerId, email, firstName, lastName });

    if (!customerId || !email) {
      console.error('Missing required fields:', { customerId: !!customerId, email: !!email });
      return NextResponse.json(
        { error: 'Customer ID and email are required' },
        { status: 400 }
      );
    }

    // Check if Stripe is properly configured
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payment system not configured' },
        { status: 500 }
      );
    }

    // Check if this customer already has a Stripe customer ID
    const { data: existingCustomer, error: fetchError } = await supabaseAdmin
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', customerId)
      .single();

    if (fetchError) {
      console.error('Error fetching customer:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch customer' },
        { status: 500 }
      );
    }

    // If customer already has a Stripe ID, return it
    if (existingCustomer.stripe_customer_id) {
      const { customer, error } = await stripeCustomerHelpers.getCustomer(
        existingCustomer.stripe_customer_id
      );

      if (customer && !error) {
        return NextResponse.json({
          success: true,
          data: {
            stripeCustomerId: customer.id,
            existing: true
          }
        });
      }
    }

    // Create new Stripe customer
    const { customer, error } = await stripeCustomerHelpers.createCustomer({
      email,
      name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
      phone,
      metadata: {
        supabase_customer_id: customerId,
        source: 'ashhadu_website'
      }
    });

    if (error || !customer) {
      console.error('Error creating Stripe customer:', error);
      return NextResponse.json(
        { error: 'Failed to create Stripe customer' },
        { status: 500 }
      );
    }

    // Update Supabase customer with Stripe customer ID
    const { error: updateError } = await supabaseAdmin
      .from('customers')
      .update({ stripe_customer_id: customer.id })
      .eq('id', customerId);

    if (updateError) {
      console.error('Error updating customer with Stripe ID:', updateError);
      // Note: Stripe customer was created, but we couldn't link it
      // This is logged but not treated as a failure
    }

    return NextResponse.json({
      success: true,
      data: {
        stripeCustomerId: customer.id,
        existing: false
      }
    });

  } catch (error) {
    console.error('Error in Stripe customer creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/stripe/customers?customerId=... - Get Stripe customer for Supabase customer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get the Stripe customer ID from Supabase
    const { data: customer, error: fetchError } = await supabaseAdmin
      .from('customers')
      .select('stripe_customer_id, email, first_name, last_name')
      .eq('id', customerId)
      .single();

    if (fetchError) {
      console.error('Error fetching customer:', fetchError);
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    if (!customer.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Customer does not have a Stripe account' },
        { status: 404 }
      );
    }

    // Get the Stripe customer details
    const { customer: stripeCustomer, error } = await stripeCustomerHelpers.getCustomer(
      customer.stripe_customer_id
    );

    if (error || !stripeCustomer) {
      console.error('Error fetching Stripe customer:', error);
      return NextResponse.json(
        { error: 'Failed to fetch Stripe customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        stripeCustomerId: stripeCustomer.id,
        email: stripeCustomer.email,
        name: stripeCustomer.name,
        phone: stripeCustomer.phone,
        defaultPaymentMethod: stripeCustomer.invoice_settings?.default_payment_method,
        created: stripeCustomer.created,
      }
    });

  } catch (error) {
    console.error('Error in Stripe customer fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/stripe/customers - Update Stripe customer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, name, phone, email } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Get the Stripe customer ID
    const { data: customer, error: fetchError } = await supabaseAdmin
      .from('customers')
      .select('stripe_customer_id')
      .eq('id', customerId)
      .single();

    if (fetchError || !customer.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Customer not found or no Stripe account' },
        { status: 404 }
      );
    }

    // Update the Stripe customer
    const updateParams: any = {};
    if (name !== undefined) updateParams.name = name;
    if (phone !== undefined) updateParams.phone = phone;
    if (email !== undefined) updateParams.email = email;

    const { customer: updatedCustomer, error } = await stripeCustomerHelpers.updateCustomer(
      customer.stripe_customer_id,
      updateParams
    );

    if (error || !updatedCustomer) {
      console.error('Error updating Stripe customer:', error);
      return NextResponse.json(
        { error: 'Failed to update Stripe customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        stripeCustomerId: updatedCustomer.id,
        email: updatedCustomer.email,
        name: updatedCustomer.name,
        phone: updatedCustomer.phone,
      }
    });

  } catch (error) {
    console.error('Error in Stripe customer update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}