import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { SiteSetting } from '@/types/settings';

// GET /api/settings - Get all settings (public)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get specific category from query params if provided
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    
    let query = supabase
      .from('site_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }
    
    // Convert to a more convenient format for frontend
    const settingsMap: Record<string, any> = {};
    data?.forEach((setting: SiteSetting) => {
      settingsMap[setting.key] = setting.value;
    });
    
    return NextResponse.json({
      success: true,
      data: {
        settings: settingsMap,
        raw: data // Include raw data if needed
      }
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user profile to check role
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
    
    // Get updates from request body
    const updates = await request.json();
    
    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    // Update each setting
    const updatePromises = updates.map(({ key, value }) => 
      supabase
        .from('site_settings')
        .update({ 
          value,
          updated_at: new Date().toISOString()
        })
        .eq('key', key)
    );
    
    const results = await Promise.all(updatePromises);
    
    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Settings update errors:', errors);
      return NextResponse.json(
        { success: false, error: 'Some settings failed to update' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `${updates.length} settings updated successfully`
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}