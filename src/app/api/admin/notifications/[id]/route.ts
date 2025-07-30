import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

// PUT /api/admin/notifications/[id] - Update notification (mark as read/dismissed)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: notificationId } = await params;
    const updates = await request.json();

    // Validate notification exists and belongs to user
    const { data: existingNotification, error: fetchError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('admin_user_id', user.id)
      .single();

    if (fetchError || !existingNotification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    // Update notification
    const { data: updatedNotification, error: updateError } = await supabase
      .from('admin_notifications')
      .update({
        read: updates.read !== undefined ? updates.read : existingNotification.read,
        dismissed: updates.dismissed !== undefined ? updates.dismissed : existingNotification.dismissed,
      })
      .eq('id', notificationId)
      .eq('admin_user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating notification:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedNotification,
      message: `Notification ${updates.read ? 'marked as read' : updates.dismissed ? 'dismissed' : 'updated'}`
    });

  } catch (error) {
    console.error('Error in update notification API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/notifications/[id] - Delete notification (user can only delete dismissed ones)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: notificationId } = await params;

    // Validate notification exists, belongs to user, and is dismissed
    const { data: existingNotification, error: fetchError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('admin_user_id', user.id)
      .single();

    if (fetchError || !existingNotification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    if (!existingNotification.dismissed) {
      return NextResponse.json(
        { success: false, error: 'Can only delete dismissed notifications' },
        { status: 400 }
      );
    }

    // Delete notification
    const { error: deleteError } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('id', notificationId)
      .eq('admin_user_id', user.id);

    if (deleteError) {
      console.error('Error deleting notification:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error in delete notification API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/admin/notifications/[id] - Get single notification
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: notificationId } = await params;

    // Get notification
    const { data: notification, error: fetchError } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('admin_user_id', user.id)
      .single();

    if (fetchError || !notification) {
      return NextResponse.json(
        { success: false, error: 'Notification not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification
    });

  } catch (error) {
    console.error('Error in get notification API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}