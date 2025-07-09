import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ImpersonationSession } from '@/types/impersonation';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const impersonationCookie = cookieStore.get('impersonation_session');

    if (!impersonationCookie) {
      return NextResponse.json({
        isImpersonating: false
      } as ImpersonationSession);
    }

    try {
      const sessionData = JSON.parse(impersonationCookie.value);
      return NextResponse.json(sessionData as ImpersonationSession);
    } catch (parseError) {
      // Invalid session data, clear the cookie
      const response = NextResponse.json({
        isImpersonating: false
      } as ImpersonationSession);

      response.cookies.set('impersonation_session', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/'
      });

      return response;
    }
  } catch (error) {
    console.error('Error checking impersonation session:', error);
    return NextResponse.json({
      isImpersonating: false
    } as ImpersonationSession, { status: 500 });
  }
}