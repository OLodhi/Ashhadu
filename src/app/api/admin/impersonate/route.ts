import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createImpersonationToken, verifyAdminRole } from '@/lib/impersonation';
import { ImpersonationRequest, ImpersonationResponse } from '@/types/impersonation';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: ImpersonationRequest = await request.json();
    const { customerId } = body;

    if (!customerId) {
      return NextResponse.json({
        success: false,
        error: 'Customer ID is required'
      } as ImpersonationResponse, { status: 400 });
    }

    // Runtime check for environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      } as ImpersonationResponse, { status: 500 });
    }

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      } as ImpersonationResponse, { status: 401 });
    }

    // Verify admin role
    const isAdmin = await verifyAdminRole(session.user.id);
    if (!isAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Admin role required for impersonation'
      } as ImpersonationResponse, { status: 403 });
    }

    // Create impersonation token
    const tokenResult = await createImpersonationToken(
      session.user.id,
      customerId,
      5 // 5 minutes expiration
    );

    if (!tokenResult.success) {
      return NextResponse.json({
        success: false,
        error: tokenResult.error
      } as ImpersonationResponse, { status: 400 });
    }

    // Return token and redirect URL
    const redirectUrl = `/api/auth/impersonate/${tokenResult.token}`;
    
    return NextResponse.json({
      success: true,
      token: tokenResult.token,
      redirectUrl
    } as ImpersonationResponse);

  } catch (error) {
    console.error('Error in admin impersonate API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    } as ImpersonationResponse, { status: 500 });
  }
}

// GET method to check admin permissions
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const isAdmin = await verifyAdminRole(session.user.id);
    
    return NextResponse.json({
      success: true,
      canImpersonate: isAdmin,
      userId: session.user.id
    });

  } catch (error) {
    console.error('Error checking admin permissions:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}