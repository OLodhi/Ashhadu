import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { sendWelcomeEmail } from '@/lib/email';

// GET /api/customers - List all customers for admin
export async function GET(request: NextRequest) {
  try {
    // Create server-side Supabase client
    const supabaseAdmin = await createServerSupabaseClient();
    
    // Get current user for admin verification
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    console.log('Customers API - Fetching admin emails...');

    // First get all admin emails to exclude them
    const { data: adminProfiles, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('role', 'admin');

    if (adminError) {
      console.error('Error fetching admin emails:', adminError);
      return NextResponse.json(
        { error: 'Failed to fetch admin data', details: adminError.message },
        { status: 500 }
      );
    }

    const adminEmails = adminProfiles?.map(profile => profile.email) || [];
    console.log('Admin emails to exclude:', adminEmails);

    console.log('Customers API - Fetching registered customers (excluding guests)...');

    // Get all customers (excluding guest customers)
    const { data: allCustomers, error: customersError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('is_guest', false) // Only show registered customers, not guest checkouts
      .order('created_at', { ascending: false });

    if (customersError) {
      console.error('Database error:', customersError);
      return NextResponse.json(
        { error: 'Failed to fetch customers', details: customersError.message },
        { status: 500 }
      );
    }

    console.log('Total registered customers fetched:', allCustomers?.length || 0);

    // Filter out admin emails from the results (client-side filtering for reliability)
    const filteredCustomers = (allCustomers || []).filter(customer => 
      !adminEmails.includes(customer.email)
    );

    console.log('Customers after admin filtering:', filteredCustomers.length);

    // Apply client-side search filtering on the admin-filtered results
    let finalCustomers = filteredCustomers;
    
    if (search) {
      const searchLower = search.toLowerCase();
      finalCustomers = filteredCustomers.filter(customer =>
        customer.first_name.toLowerCase().includes(searchLower) ||
        customer.last_name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination on the filtered results
    let paginatedCustomers = finalCustomers;
    if (offset || limit) {
      const startIndex = offset ? parseInt(offset) : 0;
      const endIndex = limit ? startIndex + parseInt(limit) : finalCustomers.length;
      paginatedCustomers = finalCustomers.slice(startIndex, endIndex);
    }

    // Fetch counts separately for each customer with proper filtering
    const transformedData = await Promise.all(
      paginatedCustomers.map(async (customer) => {
        const [addressResult, paymentResult, orderResult] = await Promise.all([
          supabaseAdmin
            .from('addresses')
            .select('id', { count: 'exact' })
            .eq('customer_id', customer.id)
            .eq('type', 'shipping'), // Only count shipping addresses
          supabaseAdmin
            .from('payment_methods')
            .select('id', { count: 'exact' })
            .eq('customer_id', customer.id)
            .eq('is_active', true),
          supabaseAdmin
            .from('orders')
            .select('id', { count: 'exact' })
            .eq('customer_id', customer.id)
        ]);

        return {
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
          addressCount: addressResult.count || 0, // Shipping addresses only
          paymentMethodCount: paymentResult.count || 0,
          orderCount: orderResult.count || 0,
        };
      })
    );

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
    // Create server-side Supabase client
    const supabaseAdmin = await createServerSupabaseClient();
    
    // Get current user for admin verification
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user profile 
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('user_id', user.id)
      .single();
    
    if (profileError) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, firstName, lastName, phone, marketingConsent } = body;

    // Allow users to create customer records for their own email OR admins to create any
    if (profile.role !== 'admin' && profile.email !== email) {
      return NextResponse.json(
        { success: false, error: 'You can only create customer records for your own email address' },
        { status: 403 }
      );
    }

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

    // Send welcome email to new customers (but not for admin-created customers)
    if (profile.role !== 'admin') {
      try {
        const customerName = `${firstName} ${lastName}`.trim();
        const welcomeEmailResult = await sendWelcomeEmail(email, customerName);
        
        if (welcomeEmailResult.success) {
          console.log('✅ Welcome email sent to new customer:', email);
        } else {
          console.error('❌ Failed to send welcome email:', welcomeEmailResult.error);
        }
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError);
        // Don't fail customer creation if email fails
      }
    }

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