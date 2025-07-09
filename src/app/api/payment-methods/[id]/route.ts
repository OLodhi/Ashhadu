import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/payment-methods/[id] - Fetch single payment method
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

    const { data: paymentMethod, error } = await supabaseAdmin
      .from('payment_methods')
      .select(`
        id,
        customer_id,
        type,
        provider,
        provider_payment_method_id,
        provider_customer_id,
        display_name,
        brand,
        last_four,
        exp_month,
        exp_year,
        paypal_email,
        is_default,
        is_active,
        billing_address_id,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Payment method not found' },
          { status: 404 }
        );
      }
      
      console.error('Error fetching payment method:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment method' },
        { status: 500 }
      );
    }

    // Transform database fields to camelCase
    const transformedPaymentMethod = {
      id: paymentMethod.id,
      customerId: paymentMethod.customer_id,
      type: paymentMethod.type,
      provider: paymentMethod.provider,
      providerPaymentMethodId: paymentMethod.provider_payment_method_id,
      providerCustomerId: paymentMethod.provider_customer_id,
      displayName: paymentMethod.display_name,
      brand: paymentMethod.brand,
      lastFour: paymentMethod.last_four,
      expMonth: paymentMethod.exp_month,
      expYear: paymentMethod.exp_year,
      paypalEmail: paymentMethod.paypal_email,
      isDefault: paymentMethod.is_default,
      isActive: paymentMethod.is_active,
      billingAddressId: paymentMethod.billing_address_id,
      createdAt: paymentMethod.created_at,
      updatedAt: paymentMethod.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedPaymentMethod
    });

  } catch (error) {
    console.error('Error in payment method API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/payment-methods/[id] - Update payment method
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Payment method ID is required' },
        { status: 400 }
      );
    }

    const {
      displayName,
      billingAddressId,
      setAsDefault
    } = body;

    // Build update object with snake_case field names
    const updateData: any = {};
    
    if (displayName !== undefined) {
      updateData.display_name = displayName;
    }
    
    if (billingAddressId !== undefined) {
      updateData.billing_address_id = billingAddressId;
    }

    // Handle default payment method logic
    if (setAsDefault === true) {
      // First get the customer_id for this payment method
      const { data: currentPaymentMethod, error: fetchError } = await supabaseAdmin
        .from('payment_methods')
        .select('customer_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching payment method for default update:', fetchError);
        return NextResponse.json(
          { error: 'Failed to update payment method' },
          { status: 500 }
        );
      }

      // Unset default on all other payment methods for this customer
      await supabaseAdmin
        .from('payment_methods')
        .update({ is_default: false })
        .eq('customer_id', currentPaymentMethod.customer_id)
        .neq('id', id);

      updateData.is_default = true;
    }

    // Update the payment method
    const { data: updatedPaymentMethod, error } = await supabaseAdmin
      .from('payment_methods')
      .update(updateData)
      .eq('id', id)
      .eq('is_active', true)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment method:', error);
      return NextResponse.json(
        { error: 'Failed to update payment method' },
        { status: 500 }
      );
    }

    // Transform response to camelCase
    const transformedPaymentMethod = {
      id: updatedPaymentMethod.id,
      customerId: updatedPaymentMethod.customer_id,
      type: updatedPaymentMethod.type,
      provider: updatedPaymentMethod.provider,
      providerPaymentMethodId: updatedPaymentMethod.provider_payment_method_id,
      providerCustomerId: updatedPaymentMethod.provider_customer_id,
      displayName: updatedPaymentMethod.display_name,
      brand: updatedPaymentMethod.brand,
      lastFour: updatedPaymentMethod.last_four,
      expMonth: updatedPaymentMethod.exp_month,
      expYear: updatedPaymentMethod.exp_year,
      paypalEmail: updatedPaymentMethod.paypal_email,
      isDefault: updatedPaymentMethod.is_default,
      isActive: updatedPaymentMethod.is_active,
      billingAddressId: updatedPaymentMethod.billing_address_id,
      createdAt: updatedPaymentMethod.created_at,
      updatedAt: updatedPaymentMethod.updated_at,
    };

    return NextResponse.json({
      success: true,
      data: transformedPaymentMethod,
      message: 'Payment method updated successfully'
    });

  } catch (error) {
    console.error('Error in payment method update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/payment-methods/[id] - Delete (deactivate) payment method
export async function DELETE(
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

    // Check if this is the default payment method
    const { data: paymentMethod, error: fetchError } = await supabaseAdmin
      .from('payment_methods')
      .select('customer_id, is_default')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Payment method not found' },
          { status: 404 }
        );
      }
      
      console.error('Error fetching payment method for deletion:', fetchError);
      return NextResponse.json(
        { error: 'Failed to delete payment method' },
        { status: 500 }
      );
    }

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabaseAdmin
      .from('payment_methods')
      .update({ 
        is_active: false,
        is_default: false // Remove default status when deleting
      })
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting payment method:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete payment method' },
        { status: 500 }
      );
    }

    // If we deleted the default payment method, set a new default
    if (paymentMethod.is_default) {
      const { data: otherPaymentMethods, error: otherMethodsError } = await supabaseAdmin
        .from('payment_methods')
        .select('id')
        .eq('customer_id', paymentMethod.customer_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!otherMethodsError && otherPaymentMethods && otherPaymentMethods.length > 0) {
        // Set the most recent payment method as the new default
        await supabaseAdmin
          .from('payment_methods')
          .update({ is_default: true })
          .eq('id', otherPaymentMethods[0].id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment method deleted successfully'
    });

  } catch (error) {
    console.error('Error in payment method deletion API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}