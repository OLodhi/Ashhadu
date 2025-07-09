import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get current user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({
        success: false,
        error: 'Profile not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        profile: profile,
        user: {
          id: user.id,
          email: user.email
        }
      }
    });

  } catch (error) {
    console.error('Error in debug user-info API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}