import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { NOTIFICATION_SETTING_KEYS, DEFAULT_NOTIFICATION_SETTINGS, NotificationSettings } from '@/types/notifications';

// GET /api/admin/notification-settings - Get user's notification settings
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

    // Get user's notification settings
    const { data: settingsData, error: fetchError } = await supabase
      .from('user_notification_settings')
      .select('setting_key, setting_value')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Error fetching notification settings:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch notification settings' },
        { status: 500 }
      );
    }

    // Convert settings array to object with default values
    const settings: NotificationSettings = { ...DEFAULT_NOTIFICATION_SETTINGS };
    
    if (settingsData) {
      settingsData.forEach(setting => {
        if (setting.setting_key in settings) {
          // Parse JSON value back to appropriate type
          (settings as any)[setting.setting_key] = setting.setting_value;
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Error in notification settings GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/notification-settings - Update user's notification settings
export async function PUT(request: NextRequest) {
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

    const updatedSettings: Partial<NotificationSettings> = await request.json();

    // Validate settings keys
    const validKeys = Object.values(NOTIFICATION_SETTING_KEYS);
    const invalidKeys = Object.keys(updatedSettings).filter(key => !validKeys.includes(key as any));
    
    if (invalidKeys.length > 0) {
      return NextResponse.json(
        { success: false, error: `Invalid setting keys: ${invalidKeys.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare upsert data
    const upsertData = Object.entries(updatedSettings).map(([key, value]) => ({
      user_id: user.id,
      setting_key: key,
      setting_value: JSON.stringify(value) // Store as JSON to handle all types
    }));

    if (upsertData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid settings provided' },
        { status: 400 }
      );
    }

    // Upsert settings (insert or update if exists)
    const { data: upsertResult, error: upsertError } = await supabase
      .from('user_notification_settings')
      .upsert(upsertData, { 
        onConflict: 'user_id,setting_key',
        ignoreDuplicates: false 
      })
      .select();

    if (upsertError) {
      console.error('Error updating notification settings:', upsertError);
      return NextResponse.json(
        { success: false, error: 'Failed to update notification settings' },
        { status: 500 }
      );
    }

    // Get updated settings to return
    const { data: updatedSettingsData, error: fetchError } = await supabase
      .from('user_notification_settings')
      .select('setting_key, setting_value')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Error fetching updated settings:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Settings updated but failed to fetch updated values' },
        { status: 500 }
      );
    }

    // Convert back to settings object
    const currentSettings: NotificationSettings = { ...DEFAULT_NOTIFICATION_SETTINGS };
    
    if (updatedSettingsData) {
      updatedSettingsData.forEach(setting => {
        if (setting.setting_key in currentSettings) {
          currentSettings[setting.setting_key as keyof NotificationSettings] = setting.setting_value;
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: currentSettings,
      message: `Updated ${upsertData.length} notification settings`
    });

  } catch (error) {
    console.error('Error in notification settings PUT API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/notification-settings/reset - Reset settings to defaults
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

    // Delete all existing settings for user
    const { error: deleteError } = await supabase
      .from('user_notification_settings')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting notification settings:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to reset notification settings' },
        { status: 500 }
      );
    }

    // Insert default settings
    const defaultData = Object.entries(DEFAULT_NOTIFICATION_SETTINGS).map(([key, value]) => ({
      user_id: user.id,
      setting_key: key,
      setting_value: JSON.stringify(value)
    }));

    const { error: insertError } = await supabase
      .from('user_notification_settings')
      .insert(defaultData);

    if (insertError) {
      console.error('Error inserting default settings:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to set default notification settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: DEFAULT_NOTIFICATION_SETTINGS,
      message: 'Notification settings reset to defaults'
    });

  } catch (error) {
    console.error('Error in notification settings reset API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}