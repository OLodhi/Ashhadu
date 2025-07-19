import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { NotificationFilters, AdminNotification } from '@/types/notifications';

// GET /api/admin/notifications - Fetch user-specific notifications
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

    // Parse query parameters
    const url = new URL(request.url);
    const filters: NotificationFilters = {
      read: url.searchParams.get('read') ? url.searchParams.get('read') === 'true' : undefined,
      dismissed: url.searchParams.get('dismissed') ? url.searchParams.get('dismissed') === 'true' : undefined,
      type: url.searchParams.get('type') as any || undefined,
      priority: url.searchParams.get('priority') as any || undefined,
      related_type: url.searchParams.get('related_type') as any || undefined,
      search: url.searchParams.get('search') || undefined,
      limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 20,
      offset: url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0,
      since: url.searchParams.get('since') || undefined,
      until: url.searchParams.get('until') || undefined,
    };

    // Build query
    let query = supabase
      .from('admin_notifications')
      .select('*')
      .eq('admin_user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.read !== undefined) {
      query = query.eq('read', filters.read);
    }
    
    if (filters.dismissed !== undefined) {
      query = query.eq('dismissed', filters.dismissed);
    }
    
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    
    if (filters.related_type) {
      query = query.eq('related_type', filters.related_type);
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
    }
    
    if (filters.since) {
      query = query.gte('created_at', filters.since);
    }
    
    if (filters.until) {
      query = query.lte('created_at', filters.until);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data: notifications, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('admin_user_id', user.id);

    // Apply same filters for count (except pagination)
    if (filters.read !== undefined) {
      countQuery = countQuery.eq('read', filters.read);
    }
    if (filters.dismissed !== undefined) {
      countQuery = countQuery.eq('dismissed', filters.dismissed);
    }
    if (filters.type) {
      countQuery = countQuery.eq('type', filters.type);
    }
    if (filters.priority) {
      countQuery = countQuery.eq('priority', filters.priority);
    }
    if (filters.related_type) {
      countQuery = countQuery.eq('related_type', filters.related_type);
    }
    if (filters.search) {
      countQuery = countQuery.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
    }
    if (filters.since) {
      countQuery = countQuery.gte('created_at', filters.since);
    }
    if (filters.until) {
      countQuery = countQuery.lte('created_at', filters.until);
    }

    const { count: totalCount } = await countQuery;

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('admin_user_id', user.id)
      .eq('read', false)
      .eq('dismissed', false);

    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications || [],
        total: totalCount || 0,
        unread_count: unreadCount || 0,
        has_more: (filters.offset || 0) + (filters.limit || 20) < (totalCount || 0),
        filters: filters
      }
    });

  } catch (error) {
    console.error('Error in notifications API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/notifications - Create notification (system use only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // This endpoint is primarily for system/trigger use
    // In production, you might want to restrict this to service role key only
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

    const notificationData = await request.json();

    // Validate required fields
    if (!notificationData.type || !notificationData.title || !notificationData.message) {
      return NextResponse.json(
        { success: false, error: 'Type, title, and message are required' },
        { status: 400 }
      );
    }

    // Create notification for all admin users using our database function
    const { data, error: createError } = await supabase
      .rpc('create_notification_for_all_admins', {
        notification_type: notificationData.type,
        notification_title: notificationData.title,
        notification_message: notificationData.message,
        related_entity_id: notificationData.related_id || null,
        related_entity_type: notificationData.related_type || null,
        notification_priority: notificationData.priority || 'normal',
        action_url: notificationData.action_url || null,
        notification_metadata: notificationData.metadata || {}
      });

    if (createError) {
      console.error('Error creating notifications:', createError);
      return NextResponse.json(
        { success: false, error: 'Failed to create notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: `Created notifications for ${data} admin users`,
        affected_count: data
      }
    });

  } catch (error) {
    console.error('Error in create notification API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}