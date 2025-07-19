import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

// GET /api/admin/notifications/unread-count - Get unread notification count for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get current admin user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get unread count
    const { count: unreadCount, error: countError } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('admin_user_id', user.id)
      .eq('read', false)
      .eq('dismissed', false);

    if (countError) {
      console.error('Error getting unread count:', countError);
      return NextResponse.json(
        { success: false, error: 'Failed to get unread count' },
        { status: 500 }
      );
    }

    // Get counts by priority for additional context
    const { data: priorityCounts, error: priorityError } = await supabase
      .from('admin_notifications')
      .select('priority')
      .eq('admin_user_id', user.id)
      .eq('read', false)
      .eq('dismissed', false);

    const priorityBreakdown = {
      low: 0,
      normal: 0,
      high: 0,
      urgent: 0
    };

    if (!priorityError && priorityCounts) {
      priorityCounts.forEach(item => {
        priorityBreakdown[item.priority as keyof typeof priorityBreakdown]++;
      });
    }

    // Get recent notifications count (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { count: recentCount, error: recentError } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('admin_user_id', user.id)
      .gte('created_at', oneDayAgo.toISOString());

    return NextResponse.json({
      success: true,
      data: {
        unread_count: unreadCount || 0,
        priority_breakdown: priorityBreakdown,
        recent_count: recentCount || 0,
        last_updated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in unread count API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}