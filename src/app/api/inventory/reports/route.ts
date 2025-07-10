import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { getLowStockProducts, getStockSummary } from '@/lib/inventory';

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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';

    switch (reportType) {
      case 'summary':
        const stockSummary = await getStockSummary();
        return NextResponse.json({
          success: true,
          data: stockSummary,
          reportType: 'summary'
        });

      case 'low-stock':
        const lowStockProducts = await getLowStockProducts();
        return NextResponse.json({
          success: true,
          data: lowStockProducts,
          reportType: 'low-stock'
        });

      case 'detailed':
        // Get detailed stock information for all products
        const { data: detailedProducts, error: detailedError } = await supabaseAdmin
          .from('products')
          .select(`
            id,
            name,
            sku,
            stock,
            stock_status,
            low_stock_threshold,
            manage_stock,
            price,
            category,
            islamic_category,
            created_at,
            updated_at
          `)
          .eq('status', 'published')
          .order('stock', { ascending: true });

        if (detailedError) {
          throw new Error(`Failed to fetch detailed stock report: ${detailedError.message}`);
        }

        // Calculate additional metrics
        const detailedReport = {
          products: detailedProducts || [],
          summary: await getStockSummary(),
          lastUpdated: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          data: detailedReport,
          reportType: 'detailed'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid report type. Use: summary, low-stock, or detailed' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in inventory reports API:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}