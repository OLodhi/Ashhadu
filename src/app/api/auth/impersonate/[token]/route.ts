import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateImpersonationToken, logImpersonationAudit, getCustomerForImpersonation } from '@/lib/impersonation';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/customers?error=invalid_token', request.url));
    }

    // Validate the impersonation token
    const tokenResult = await validateImpersonationToken(token);

    if (!tokenResult.success || !tokenResult.customerData) {
      return NextResponse.redirect(new URL('/admin/customers?error=invalid_or_expired_token', request.url));
    }

    const { customerData } = tokenResult;

    // Get customer's full data for session creation
    const customerResult = await getCustomerForImpersonation(customerData.customer_id);

    if (!customerResult.success || !customerResult.customer) {
      return NextResponse.redirect(new URL('/admin/customers?error=customer_not_found', request.url));
    }

    const customer = customerResult.customer;

    // Check if customer has a corresponding auth user
    let authUser = null;
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email')
      .eq('email', customer.email)
      .limit(1);

    if (!profilesError && profiles && profiles.length > 0) {
      authUser = profiles[0];
    }

    // Create Supabase client for session management
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options);
          },
          remove(name: string, options: any) {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );

    // Store impersonation session data in cookies
    const impersonationSession = {
      isImpersonating: true,
      originalAdminUserId: customerData.admin_user_id,
      impersonatedCustomer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        fullName: `${customer.first_name} ${customer.last_name}`
      },
      impersonationStartedAt: new Date().toISOString()
    };

    // Set impersonation session cookie
    const response = NextResponse.redirect(new URL('/account', request.url));
    
    response.cookies.set('impersonation_session', JSON.stringify(impersonationSession), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 2, // 2 hours
      path: '/'
    });

    // If customer has an auth account, sign them in
    if (authUser) {
      // Create a session for the customer
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: customer.email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/account`
        }
      });

      if (!sessionError && sessionData?.properties?.action_link) {
        // Extract token from magic link
        const url = new URL(sessionData.properties.action_link);
        const accessToken = url.searchParams.get('access_token');
        const refreshToken = url.searchParams.get('refresh_token');

        if (accessToken && refreshToken) {
          // Set session cookies
          response.cookies.set('sb-access-token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60, // 1 hour
            path: '/'
          });

          response.cookies.set('sb-refresh-token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 1 week
            path: '/'
          });
        }
      }
    }

    // Log successful impersonation start
    await logImpersonationAudit({
      admin_user_id: customerData.admin_user_id,
      customer_id: customerData.customer_id,
      action: 'start',
      admin_email: 'admin@ashhadu.co.uk', // We'll get this from the admin profile
      customer_email: customer.email,
      ip_address: request.ip || undefined,
      user_agent: request.headers.get('user-agent') || undefined
    });

    return response;

  } catch (error) {
    console.error('Error in impersonation endpoint:', error);
    return NextResponse.redirect(new URL('/admin/customers?error=impersonation_failed', request.url));
  }
}

// POST method to stop impersonation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const cookieStore = await cookies();
    
    // Get impersonation session from cookies
    const impersonationCookie = cookieStore.get('impersonation_session');
    
    if (!impersonationCookie) {
      return NextResponse.json({
        success: false,
        error: 'No active impersonation session'
      }, { status: 400 });
    }

    const impersonationSession = JSON.parse(impersonationCookie.value);

    // Calculate session duration
    const startTime = new Date(impersonationSession.impersonationStartedAt);
    const endTime = new Date();
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationInterval = `${Math.floor(durationMs / 1000)} seconds`;

    // Log impersonation stop
    await logImpersonationAudit({
      admin_user_id: impersonationSession.originalAdminUserId,
      customer_id: impersonationSession.impersonatedCustomer.id,
      action: 'stop',
      admin_email: 'admin@ashhadu.co.uk',
      customer_email: impersonationSession.impersonatedCustomer.email,
      session_duration: durationInterval,
      ip_address: request.ip || undefined,
      user_agent: request.headers.get('user-agent') || undefined
    });

    // Create response that clears session
    const response = NextResponse.json({
      success: true,
      redirectUrl: '/admin/customers'
    });

    // Clear all session-related cookies
    response.cookies.set('impersonation_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    response.cookies.set('sb-refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Error stopping impersonation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to stop impersonation'
    }, { status: 500 });
  }
}