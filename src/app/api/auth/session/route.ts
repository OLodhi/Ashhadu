import { NextRequest, NextResponse } from 'next/server';
import { validateUserSession, createAuthResponse, refreshUserSession } from '@/lib/auth-utils-server';

/**
 * GET - Validate current session
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Session API: Validating current session...');
    
    const validationResult = await validateUserSession();
    
    if (!validationResult.isValid) {
      console.log('❌ Session API: Session invalid:', validationResult.error);
      return createAuthResponse(false, {
        valid: false,
        error: validationResult.error
      }, validationResult.error, 401);
    }

    console.log('✅ Session API: Session valid');
    return createAuthResponse(true, {
      valid: true,
      user: validationResult.session!.user,
      profile: validationResult.profile,
      customer: validationResult.customer
    });

  } catch (error) {
    console.error('❌ Session API: Unexpected error:', error);
    return createAuthResponse(false, null, 'Internal server error', 500);
  }
}

/**
 * POST - Refresh session
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Session API: Refreshing session...');
    
    const refreshResult = await refreshUserSession();
    
    if (!refreshResult.success) {
      console.log('❌ Session API: Refresh failed:', refreshResult.error);
      return createAuthResponse(false, {
        refreshed: false,
        error: refreshResult.error
      }, refreshResult.error, 401);
    }

    console.log('✅ Session API: Session refreshed successfully');
    
    // Validate the refreshed session
    const validationResult = await validateUserSession();
    
    return createAuthResponse(true, {
      refreshed: true,
      valid: validationResult.isValid,
      user: validationResult.session?.user,
      profile: validationResult.profile,
      customer: validationResult.customer
    });

  } catch (error) {
    console.error('❌ Session API: Unexpected error:', error);
    return createAuthResponse(false, null, 'Internal server error', 500);
  }
}