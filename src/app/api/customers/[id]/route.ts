import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

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
        date_of_birth,
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

    // Also fetch counts for addresses, payment methods, and orders
    const [addressResult, paymentResult, orderResult] = await Promise.all([
      supabaseAdmin
        .from('addresses')
        .select('id', { count: 'exact' })
        .eq('customer_id', id),
      supabaseAdmin
        .from('payment_methods')
        .select('id', { count: 'exact' })
        .eq('customer_id', id)
        .eq('is_active', true),
      supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('customer_id', id)
    ]);

    // Transform to camelCase for frontend
    const transformedCustomer = {
      id: customer.id,
      email: customer.email,
      firstName: customer.first_name,
      lastName: customer.last_name,
      fullName: `${customer.first_name} ${customer.last_name}`,
      phone: customer.phone,
      dateOfBirth: customer.date_of_birth,
      stripeCustomerId: customer.stripe_customer_id,
      marketingConsent: customer.marketing_consent,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
      addressCount: addressResult.count || 0,
      paymentMethodCount: paymentResult.count || 0,
      orderCount: orderResult.count || 0,
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

// PUT /api/customers/[id] - Update customer details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

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

    // Validate and transform request data
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      marketingConsent
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: 'First name, last name, and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (phone && !/^(\+44|0)[0-9]{10,11}$/.test(phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid UK phone number format' },
        { status: 400 }
      );
    }

    // First, fetch the current customer to get the full name
    const { data: currentCustomer, error: fetchError } = await supabaseAdmin
      .from('customers')
      .select('first_name, last_name')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch customer' },
        { status: 500 }
      );
    }

    // Update customer data
    const { data: updatedCustomer, error: updateError } = await supabaseAdmin
      .from('customers')
      .update({
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone || null,
        date_of_birth: dateOfBirth || null,
        marketing_consent: marketingConsent || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        email,
        first_name,
        last_name,
        phone,
        date_of_birth,
        stripe_customer_id,
        marketing_consent,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error('Error updating customer:', updateError);
      
      if (updateError.code === '23505') {
        return NextResponse.json(
          { error: 'A customer with this email already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update customer' },
        { status: 500 }
      );
    }

    // Also fetch updated counts for addresses, payment methods, and orders
    const [addressResult, paymentResult, orderResult] = await Promise.all([
      supabaseAdmin
        .from('addresses')
        .select('id', { count: 'exact' })
        .eq('customer_id', id),
      supabaseAdmin
        .from('payment_methods')
        .select('id', { count: 'exact' })
        .eq('customer_id', id)
        .eq('is_active', true),
      supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('customer_id', id)
    ]);

    // Transform to camelCase for frontend
    const transformedCustomer = {
      id: updatedCustomer.id,
      email: updatedCustomer.email,
      firstName: updatedCustomer.first_name,
      lastName: updatedCustomer.last_name,
      fullName: `${updatedCustomer.first_name} ${updatedCustomer.last_name}`,
      phone: updatedCustomer.phone,
      dateOfBirth: updatedCustomer.date_of_birth,
      stripeCustomerId: updatedCustomer.stripe_customer_id,
      marketingConsent: updatedCustomer.marketing_consent,
      createdAt: updatedCustomer.created_at,
      updatedAt: updatedCustomer.updated_at,
      addressCount: addressResult.count || 0,
      paymentMethodCount: paymentResult.count || 0,
      orderCount: orderResult.count || 0,
    };

    console.log(`✅ Admin ${user.email} updated customer ${transformedCustomer.fullName} (${transformedCustomer.email})`);

    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      data: transformedCustomer
    });

  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/customers/[id] - Delete customer (if no orders exist)
export async function DELETE(
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

    // First, check if customer exists and get their details
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id, first_name, last_name, email')
      .eq('id', id)
      .single();

    if (customerError) {
      console.error('Customer fetch error details:', {
        code: customerError.code,
        message: customerError.message,
        details: customerError.details,
        hint: customerError.hint,
        customerId: id
      });
      
      if (customerError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: `Failed to fetch customer: ${customerError.message}` },
        { status: 500 }
      );
    }

    // Check if customer has any orders
    const { data: orders, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('customer_id', id);

    if (orderError) {
      console.error('Error checking customer orders:', orderError);
      return NextResponse.json(
        { error: 'Failed to check customer orders' },
        { status: 500 }
      );
    }

    // If customer has orders, prevent deletion
    if (orders && orders.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete customer account', 
          message: `Customer ${customer.first_name} ${customer.last_name} has ${orders.length} order(s) on file. Accounts with existing orders cannot be deleted for record keeping purposes.`,
          orderCount: orders.length
        },
        { status: 409 }
      );
    }

    // If no orders, proceed with secure deletion
    console.log(`🗑️  Admin ${user.email} initiating deletion of customer ${customer.first_name} ${customer.last_name} (${customer.email})`);

    // Step 1: Deactivate all payment methods (don't delete for audit trail)
    const { error: paymentError } = await supabaseAdmin
      .from('payment_methods')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('customer_id', id);

    if (paymentError) {
      console.error('Error deactivating payment methods:', paymentError);
      return NextResponse.json(
        { error: 'Failed to deactivate payment methods' },
        { status: 500 }
      );
    }

    // Step 2: Delete all addresses
    const { error: addressError } = await supabaseAdmin
      .from('addresses')
      .delete()
      .eq('customer_id', id);

    if (addressError) {
      console.error('Error deleting addresses:', addressError);
      return NextResponse.json(
        { error: 'Failed to delete customer addresses' },
        { status: 500 }
      );
    }

    // Step 3: Delete customer record
    const { error: deleteCustomerError } = await supabaseAdmin
      .from('customers')
      .delete()
      .eq('id', id);

    if (deleteCustomerError) {
      console.error('Error deleting customer:', deleteCustomerError);
      return NextResponse.json(
        { error: 'Failed to delete customer record' },
        { status: 500 }
      );
    }

    // Step 4: Delete user profile if it exists (find by email)
    const { data: existingProfile, error: profileFetchError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email')
      .eq('email', customer.email)
      .single();

    if (existingProfile && !profileFetchError) {
      const { error: profileDeleteError } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('user_id', existingProfile.user_id);

      if (profileDeleteError) {
        console.error('Error deleting profile:', profileDeleteError);
        // Don't fail the entire operation if profile deletion fails
        console.log('⚠️  Profile deletion failed but customer deletion succeeded');
      } else {
        console.log(`✅ Successfully deleted profile for ${customer.email}`);
      }
    } else {
      console.log(`ℹ️  No profile found for ${customer.email} or profile fetch failed`);
    }

    console.log(`✅ Successfully deleted customer ${customer.first_name} ${customer.last_name} (${customer.email}) and associated data`);

    return NextResponse.json({
      success: true,
      message: `Customer ${customer.first_name} ${customer.last_name} has been successfully deleted`,
      data: {
        deletedCustomer: {
          id: customer.id,
          name: `${customer.first_name} ${customer.last_name}`,
          email: customer.email
        },
        deletedAt: new Date().toISOString(),
        deletedBy: user.email
      }
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}