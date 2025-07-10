import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { adjustStock } from '@/lib/inventory';

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

    // Parse request body
    const { productId, newQuantity, reason } = await request.json();

    // Validate required fields
    if (!productId || newQuantity === undefined || !reason) {
      return NextResponse.json(
        { success: false, error: 'Product ID, new quantity, and reason are required' },
        { status: 400 }
      );
    }

    if (newQuantity < 0) {
      return NextResponse.json(
        { success: false, error: 'Quantity cannot be negative' },
        { status: 400 }
      );
    }

    // Perform stock adjustment
    await adjustStock(
      productId,
      parseInt(newQuantity),
      reason,
      user.id
    );

    // Get updated product info
    const { data: updatedProduct, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id, name, sku, stock, stock_status')
      .eq('id', productId)
      .single();

    if (fetchError) {
      console.error('Error fetching updated product:', fetchError);
    }

    return NextResponse.json({
      success: true,
      message: 'Stock adjustment completed successfully',
      data: updatedProduct
    });

  } catch (error) {
    console.error('Error in stock adjustment API:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}