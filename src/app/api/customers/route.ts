import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/customers - List all customers for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    let query = supabaseAdmin
      .from('customers')
      .select(`
        *,
        addresses:addresses(count),
        payment_methods:payment_methods(count),
        orders:orders(count)
      `)
      .order('created_at', { ascending: false });

    // Add search filtering
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Add pagination
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (parseInt(limit || '50') - 1));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch customers', details: error.message },
        { status: 500 }
      );
    }

    // Transform data to match frontend expectations
    const transformedData = data?.map(customer => ({
      id: customer.id,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      fullName: `${customer.first_name} ${customer.last_name}`,
      phone: customer.phone,
      marketingConsent: customer.marketing_consent,
      stripeCustomerId: customer.stripe_customer_id,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      addressCount: customer.addresses?.[0]?.count || 0,
      paymentMethodCount: customer.payment_methods?.[0]?.count || 0,
      orderCount: customer.orders?.[0]?.count || 0,
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedData,
      total: transformedData.length
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create new customer record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, phone, marketingConsent } = body;

    console.log('Creating customer with data:', { email, firstName, lastName, phone, marketingConsent });

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Check if customer already exists
    const { data: existingCustomer, error: checkError } = await supabaseAdmin
      .from('customers')
      .select('id, email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing customer:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing customer' },
        { status: 500 }
      );
    }

    if (existingCustomer) {
      console.log('Customer already exists:', existingCustomer.id);
      return NextResponse.json({
        success: true,
        data: {
          id: existingCustomer.id,
          email: existingCustomer.email,
          existing: true
        }
      });
    }

    // Create new customer record
    const { data: newCustomer, error: createError } = await supabaseAdmin
      .from('customers')
      .insert({
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        marketing_consent: marketingConsent || false,
        billing_address: null,
        shipping_address: null,
        date_of_birth: null,
        stripe_customer_id: null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating customer:', createError);
      return NextResponse.json(
        { error: 'Failed to create customer record' },
        { status: 500 }
      );
    }

    console.log('Customer created successfully:', newCustomer.id);

    // Transform to camelCase for frontend
    const transformedCustomer = {
      id: newCustomer.id,
      email: newCustomer.email,
      firstName: newCustomer.first_name,
      lastName: newCustomer.last_name,
      phone: newCustomer.phone,
      marketingConsent: newCustomer.marketing_consent,
      stripeCustomerId: newCustomer.stripe_customer_id,
      createdAt: newCustomer.created_at,
      updatedAt: newCustomer.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedCustomer
    });

  } catch (error) {
    console.error('Error in customer creation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}