import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

// GET /api/customers/[id]/addresses - Fetch customer addresses
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

    // Verify admin access
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - admin access required' },
        { status: 403 }
      );
    }

    // Fetch customer addresses
    const { data: addresses, error } = await supabaseAdmin
      .from('addresses')
      .select(`
        id,
        type,
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
      .eq('customer_id', id)
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
    console.error('Error in customer addresses API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}