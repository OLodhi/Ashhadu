import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

// GET /api/addresses - Fetch current user's addresses
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // First, get the customer ID from the user's email
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .single();

    if (customerError) {
      console.error('Error fetching customer:', customerError);
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Fetch customer addresses
    const { data: addresses, error } = await supabase
      .from('addresses')
      .select(`
        id,
        type,
        label,
        first_name,
        last_name,
        company,
        address_line_1,
        address_line_2,
        city,
        county,
        postcode,
        country,
        phone,
        is_default,
        created_at,
        updated_at
      `)
      .eq('customer_id', customer.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch addresses' },
        { status: 500 }
      );
    }

    // Transform to camelCase for frontend
    const transformedAddresses = addresses?.map(address => ({
      id: address.id,
      type: address.type,
      label: address.label,
      firstName: address.first_name,
      lastName: address.last_name,
      company: address.company,
      addressLine1: address.address_line_1,
      addressLine2: address.address_line_2,
      city: address.city,
      county: address.county,
      postcode: address.postcode,
      country: address.country,
      phone: address.phone,
      isDefault: address.is_default,
      createdAt: address.created_at,
      updatedAt: address.updated_at,
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedAddresses
    });

  } catch (error) {
    console.error('Error in addresses API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the request body
    const addressData = await request.json();

    // Validate required fields
    if (!addressData.customer_id || !addressData.first_name || !addressData.last_name || 
        !addressData.address_line_1 || !addressData.city || !addressData.postcode || 
        !addressData.country || !addressData.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the customer belongs to the authenticated user
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('id', addressData.customer_id)
      .eq('email', user.email)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found or access denied' },
        { status: 404 }
      );
    }

    // If this is set as default, first unset other defaults of the same type
    if (addressData.is_default) {
      const { error: updateError } = await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', addressData.customer_id)
        .eq('type', addressData.type);

      if (updateError) {
        console.error('Error updating default addresses:', updateError);
        // Continue anyway, the new address will still be created
      }
    }

    // Create the new address
    const { data: newAddress, error: createError } = await supabase
      .from('addresses')
      .insert([addressData])
      .select()
      .single();

    if (createError) {
      console.error('Error creating address:', createError);
      return NextResponse.json(
        { error: 'Failed to create address' },
        { status: 500 }
      );
    }

    // Transform to camelCase for frontend
    const transformedAddress = {
      id: newAddress.id,
      type: newAddress.type,
      label: newAddress.label,
      firstName: newAddress.first_name,
      lastName: newAddress.last_name,
      company: newAddress.company,
      addressLine1: newAddress.address_line_1,
      addressLine2: newAddress.address_line_2,
      city: newAddress.city,
      county: newAddress.county,
      postcode: newAddress.postcode,
      country: newAddress.country,
      phone: newAddress.phone,
      isDefault: newAddress.is_default,
      createdAt: newAddress.created_at,
      updatedAt: newAddress.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedAddress
    });

  } catch (error) {
    console.error('Error in addresses POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}