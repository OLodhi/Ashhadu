import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PaymentMethod, AddPaymentMethodFormData } from '@/types/payment';

// GET /api/payment-methods - Fetch customer's payment methods
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

    // Fetch payment methods for the customer
    const { data: paymentMethods, error } = await supabaseAdmin
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
      .eq('customer_id', customerId)
      .eq('is_active', true)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment methods' },
        { status: 500 }
      );
    }

    // Transform database fields to camelCase
    const transformedPaymentMethods = paymentMethods?.map((pm: any) => ({
      id: pm.id,
      customerId: pm.customer_id,
      type: pm.type,
      provider: pm.provider,
      providerPaymentMethodId: pm.provider_payment_method_id,
      providerCustomerId: pm.provider_customer_id,
      displayName: pm.display_name,
      brand: pm.brand,
      lastFour: pm.last_four,
      expMonth: pm.exp_month,
      expYear: pm.exp_year,
      paypalEmail: pm.paypal_email,
      isDefault: pm.is_default,
      isActive: pm.is_active,
      billingAddressId: pm.billing_address_id,
      createdAt: pm.created_at,
      updatedAt: pm.updated_at,
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedPaymentMethods
    });

  } catch (error) {
    console.error('Error in payment methods API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/payment-methods - Create new payment method
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      type,
      provider = 'stripe',
      providerPaymentMethodId,
      providerCustomerId,
      displayName,
      brand,
      lastFour,
      expMonth,
      expYear,
      paypalEmail,
      billingAddressId,
      setAsDefault = false
    } = body;

    // Validate required fields
    if (!customerId || !type || !providerPaymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId, type, providerPaymentMethodId' },
        { status: 400 }
      );
    }

    // Validate type-specific requirements
    if (type === 'card' && (!brand || !lastFour || !expMonth || !expYear)) {
      return NextResponse.json(
        { error: 'Card payment methods require brand, lastFour, expMonth, and expYear' },
        { status: 400 }
      );
    }

    if (type === 'paypal' && !paypalEmail) {
      return NextResponse.json(
        { error: 'PayPal payment methods require paypalEmail' },
        { status: 400 }
      );
    }

    console.log('Creating payment method with data:', {
      customerId,
      type,
      provider,
      providerPaymentMethodId,
      brand,
      lastFour,
      expMonth,
      expYear,
      setAsDefault
    });

    // Skip stored procedure and go directly to manual insertion
    // (stored procedure likely doesn't exist in the database)
    
    try {
        // If setting as default, unset other defaults first
        if (setAsDefault) {
          console.log('Setting as default, unsetting other defaults...');
          const { error: updateError } = await supabaseAdmin
            .from('payment_methods')
            .update({ is_default: false })
            .eq('customer_id', customerId);
            
          if (updateError) {
            console.error('Error unsetting other defaults:', updateError);
          }
        }

        // Insert the new payment method
        const insertData = {
          customer_id: customerId,
          type,
          provider,
          provider_payment_method_id: providerPaymentMethodId,
          provider_customer_id: providerCustomerId,
          display_name: displayName,
          brand,
          last_four: lastFour,
          exp_month: expMonth,
          exp_year: expYear,
          paypal_email: paypalEmail,
          billing_address_id: billingAddressId,
          is_default: setAsDefault,
          is_active: true
        };

        console.log('Inserting payment method with data:', insertData);

        const { data: newPaymentMethod, error: insertError } = await supabaseAdmin
          .from('payment_methods')
          .insert(insertData)
          .select()
          .single();

        if (insertError) {
          console.error('Detailed error inserting payment method:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            insertData
          });
          
          // Check for specific error types
          if (insertError.code === '23505') {
            return NextResponse.json(
              { error: 'This payment method is already saved to your account' },
              { status: 409 }
            );
          }
          
          if (insertError.code === '23503') {
            return NextResponse.json(
              { error: 'Invalid customer ID or foreign key constraint violation' },
              { status: 400 }
            );
          }
          
          return NextResponse.json(
            { error: `Failed to save payment method: ${insertError.message}` },
            { status: 500 }
          );
        }

        // Transform response to camelCase
        const transformedPaymentMethod = {
          id: newPaymentMethod.id,
          customerId: newPaymentMethod.customer_id,
          type: newPaymentMethod.type,
          provider: newPaymentMethod.provider,
          providerPaymentMethodId: newPaymentMethod.provider_payment_method_id,
          providerCustomerId: newPaymentMethod.provider_customer_id,
          displayName: newPaymentMethod.display_name,
          brand: newPaymentMethod.brand,
          lastFour: newPaymentMethod.last_four,
          expMonth: newPaymentMethod.exp_month,
          expYear: newPaymentMethod.exp_year,
          paypalEmail: newPaymentMethod.paypal_email,
          isDefault: newPaymentMethod.is_default,
          isActive: newPaymentMethod.is_active,
          billingAddressId: newPaymentMethod.billing_address_id,
          createdAt: newPaymentMethod.created_at,
          updatedAt: newPaymentMethod.updated_at,
        };

        console.log('Payment method saved successfully:', transformedPaymentMethod.id);

        return NextResponse.json({
          success: true,
          data: transformedPaymentMethod,
          message: 'Payment method saved successfully'
        });
        
    } catch (insertError) {
      console.error('Unexpected error in payment method creation:', insertError);
      return NextResponse.json(
        { error: 'Unexpected error occurred while saving payment method' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in payment methods creation API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}