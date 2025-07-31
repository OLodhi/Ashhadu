import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

// POST /api/admin/notifications/bulk - Bulk operations on notifications
export async function POST(request: NextRequest) {
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

    const { action, notification_ids, filters } = await request.json();

    let affectedCount = 0;
    let message = '';

    switch (action) {
      case 'mark_all_read':
        // Mark all unread notifications as read for current user
        const { data: updatedReadRows, error: readError } = await supabase
          .from('admin_notifications')
          .update({ read: true })
          .eq('admin_user_id', user.id)
          .eq('read', false)
          .select('id');

        if (readError) {
          throw readError;
        }

        affectedCount = updatedReadRows?.length || 0;
        message = `Marked ${affectedCount} notifications as read`;
        break;

      case 'mark_selected_read':
        if (!notification_ids || !Array.isArray(notification_ids)) {
          return NextResponse.json(
            { success: false, error: 'notification_ids array is required for this action' },
            { status: 400 }
          );
        }

        const { data: updatedSelectedRows, error: selectedReadError } = await supabase
          .from('admin_notifications')
          .update({ read: true })
          .eq('admin_user_id', user.id)
          .in('id', notification_ids)
          .select('id');

        if (selectedReadError) {
          throw selectedReadError;
        }

        affectedCount = updatedSelectedRows?.length || 0;
        message = `Marked ${affectedCount} selected notifications as read`;
        break;

      case 'dismiss_selected':
        if (!notification_ids || !Array.isArray(notification_ids)) {
          return NextResponse.json(
            { success: false, error: 'notification_ids array is required for this action' },
            { status: 400 }
          );
        }

        const { data: dismissedRows, error: dismissError } = await supabase
          .from('admin_notifications')
          .update({ dismissed: true })
          .eq('admin_user_id', user.id)
          .in('id', notification_ids)
          .select('id');

        if (dismissError) {
          throw dismissError;
        }

        affectedCount = dismissedRows?.length || 0;
        message = `Dismissed ${affectedCount} selected notifications`;
        break;

      case 'delete_dismissed':
        // Delete all dismissed notifications for current user
        const { data: deletedRows, error: deleteError } = await supabase
          .from('admin_notifications')
          .delete()
          .eq('admin_user_id', user.id)
          .eq('dismissed', true)
          .select('id');

        if (deleteError) {
          throw deleteError;
        }

        affectedCount = deletedRows?.length || 0;
        message = `Deleted ${affectedCount} dismissed notifications`;
        break;

      case 'delete_old':
        // Delete notifications older than specified days (default 90)
        const daysOld = filters?.days_old || 90;
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const { data: oldDeletedRows, error: oldDeleteError } = await supabase
          .from('admin_notifications')
          .delete()
          .eq('admin_user_id', user.id)
          .lt('created_at', cutoffDate.toISOString())
          .select('id');

        if (oldDeleteError) {
          throw oldDeleteError;
        }

        affectedCount = oldDeletedRows?.length || 0;
        message = `Deleted ${affectedCount} notifications older than ${daysOld} days`;
        break;

      case 'delete_by_type':
        if (!filters?.type) {
          return NextResponse.json(
            { success: false, error: 'type filter is required for this action' },
            { status: 400 }
          );
        }

        const { data: typeDeletedRows, error: typeDeleteError } = await supabase
          .from('admin_notifications')
          .delete()
          .eq('admin_user_id', user.id)
          .eq('type', filters.type)
          .select('id');

        if (typeDeleteError) {
          throw typeDeleteError;
        }

        affectedCount = typeDeletedRows?.length || 0;
        message = `Deleted ${affectedCount} notifications of type '${filters.type}'`;
        break;

      case 'clear_expired':
        // Delete notifications that have passed their expiry date
        const now = new Date().toISOString();
        const { data: expiredRows, error: expiredError } = await supabase
          .from('admin_notifications')
          .delete()
          .eq('admin_user_id', user.id)
          .not('expires_at', 'is', null)
          .lt('expires_at', now)
          .select('id');

        if (expiredError) {
          throw expiredError;
        }

        affectedCount = expiredRows?.length || 0;
        message = `Cleared ${affectedCount} expired notifications`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        affected_count: affectedCount,
        message: message
      }
    });

  } catch (error) {
    console.error('Error in bulk notifications API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}