import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/customers/[id] - Fetch customer details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Fetch customer from database
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        stripe_customer_id,
        marketing_consent,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Detailed error fetching customer:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        customerId: id
      });
      
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to fetch customer: ${error.message}` },
        { status: 500 }
      );
    }

    // Transform to camelCase for frontend
    const transformedCustomer = {
      id: customer.id,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      phone: customer.phone,
      stripeCustomerId: customer.stripe_customer_id,
      marketingConsent: customer.marketing_consent,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedCustomer
    });

  } catch (error) {
    console.error('Error in customer API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}