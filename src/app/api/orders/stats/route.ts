import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

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
    
    // Get URL parameters for date range
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'all'; // 'today', 'week', 'month', 'year', 'all'
    
    // Calculate date range
    let dateFilter = '';
    const now = new Date();
    
    switch (period) {
      case 'today':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        dateFilter = `AND created_at >= '${today.toISOString()}'`;
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = `AND created_at >= '${weekAgo.toISOString()}'`;
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        dateFilter = `AND created_at >= '${monthAgo.toISOString()}'`;
        break;
      case 'year':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        dateFilter = `AND created_at >= '${yearAgo.toISOString()}'`;
        break;
      default:
        dateFilter = '';
    }
    
    // Get all orders for the specified period
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('id, status, payment_status, total, created_at, order_items(*)')
      .order('created_at', { ascending: false });
    
    if (ordersError) {
      console.error('Error fetching orders for stats:', ordersError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch order statistics' },
        { status: 500 }
      );
    }
    
    // Filter orders by date if needed
    let filteredOrders = orders;
    if (period !== 'all') {
      const cutoffDate = (() => {
        switch (period) {
          case 'today':
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
          case 'week':
            return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          case 'month':
            return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          case 'year':
            return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          default:
            return new Date(0);
        }
      })();
      
      filteredOrders = orders.filter(order => new Date(order.created_at) >= cutoffDate);
    }
    
    // Calculate statistics
    const stats = {
      // Basic counts
      totalOrders: filteredOrders.length,
      
      // Status breakdown
      pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
      processingOrders: filteredOrders.filter(o => o.status === 'processing').length,
      shippedOrders: filteredOrders.filter(o => o.status === 'shipped').length,
      deliveredOrders: filteredOrders.filter(o => o.status === 'delivered').length,
      cancelledOrders: filteredOrders.filter(o => o.status === 'cancelled').length,
      
      // Payment breakdown
      paidOrders: filteredOrders.filter(o => o.payment_status === 'paid').length,
      unpaidOrders: filteredOrders.filter(o => o.payment_status === 'pending').length,
      failedOrders: filteredOrders.filter(o => o.payment_status === 'failed').length,
      refundedOrders: filteredOrders.filter(o => o.payment_status === 'refunded').length,
      
      // Financial metrics (exclude cancelled orders from revenue)
      totalRevenue: filteredOrders
        .filter(o => o.payment_status === 'paid' && o.status !== 'cancelled')
        .reduce((sum, o) => sum + (o.total || 0), 0),
      
      averageOrderValue: (() => {
        const validOrders = filteredOrders.filter(o => o.status !== 'cancelled');
        return validOrders.length > 0 
          ? validOrders.reduce((sum, o) => sum + (o.total || 0), 0) / validOrders.length 
          : 0;
      })(),
      
      // Islamic art business specific
      ordersInProduction: filteredOrders.filter(o => o.status === 'processing').length,
      
      // Item statistics
      totalItems: filteredOrders.reduce((sum, o) => sum + (o.order_items?.length || 0), 0),
      
      // Time-based comparisons
      period: period,
      generatedAt: new Date().toISOString(),
    };
    
    // Get top selling products for this period
    const itemCounts: { [key: string]: { count: number; revenue: number; name: string } } = {};
    
    filteredOrders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const key = item.product_name;
        if (!itemCounts[key]) {
          itemCounts[key] = { count: 0, revenue: 0, name: item.product_name };
        }
        itemCounts[key].count += item.quantity;
        itemCounts[key].revenue += item.total;
      });
    });
    
    const topProducts = Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => ({
        name: item.name,
        quantity: item.count,
        revenue: item.revenue
      }));
    
    // Recent orders for dashboard
    const recentOrders = filteredOrders
      .slice(0, 5)
      .map(order => ({
        id: order.id,
        orderNumber: `ASH-${order.id.slice(-6).toUpperCase()}`,
        status: order.status,
        paymentStatus: order.payment_status,
        total: order.total,
        createdAt: order.created_at,
        itemCount: order.order_items?.length || 0
      }));
    
    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        topProducts,
        recentOrders
      }
    });
    
  } catch (error) {
    console.error('Error in order stats API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}