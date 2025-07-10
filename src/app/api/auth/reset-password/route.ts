import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

export async function POST(request: NextRequest) {
  try {
    const { email, isAdminRequest } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createServerSupabaseClient();

    // Validate admin request if specified
    if (isAdminRequest) {
      // Get current user to verify admin role
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Admin verification failed:', authError);
        return NextResponse.json(
          { error: 'Unauthorized - admin access required' },
          { status: 401 }
        );
      }

      // Check if user has admin role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        console.error('Admin role verification failed:', profileError);
        return NextResponse.json(
          { error: 'Unauthorized - admin access required' },
          { status: 403 }
        );
      }

      console.log(`🔧 Admin ${user.email} initiated password reset for ${email}`);
    }

    // Send password reset email using Supabase Auth
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (resetError) {
      console.error('Password reset error:', resetError);
      
      // Check if it's a user not found error
      if (resetError.message.includes('User not found')) {
        return NextResponse.json(
          { error: 'No account found with this email address' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to send password reset email' },
        { status: 500 }
      );
    }

    console.log(`📧 Password reset email sent to ${email}${isAdminRequest ? ' (admin-initiated)' : ''}`);

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully',
      data: {
        email,
        sentAt: new Date().toISOString(),
        isAdminRequest: !!isAdminRequest
      }
    });

  } catch (error) {
    console.error('Password reset API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for password reset status checks
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createServerSupabaseClient();

    // Check if user exists
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('Error checking user existence:', error);
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      );
    }

    const userExists = users?.some(user => user.email === email);

    return NextResponse.json({
      success: true,
      data: {
        email,
        userExists,
        checkedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Password reset check API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}