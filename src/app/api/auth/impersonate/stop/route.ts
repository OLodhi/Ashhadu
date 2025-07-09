import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logImpersonationAudit } from '@/lib/impersonation';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
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