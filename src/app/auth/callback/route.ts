import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  
  console.log('🔄 Auth callback received:', { 
    code: code?.substring(0, 10) + '...', 
    next,
    error,
    error_description 
  });
  
  // If there's an error, redirect to the error page with details
  if (error) {
    console.error('❌ Auth callback error:', error, error_description);
    const errorUrl = new URL('/auth/auth-code-error', request.url);
    errorUrl.searchParams.set('error', error);
    if (error_description) {
      errorUrl.searchParams.set('error_description', error_description);
    }
    return NextResponse.redirect(errorUrl);
  }

  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      
      // Exchange the code for a session
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ Auth callback error:', error);
        return NextResponse.redirect(new URL('/auth/auth-code-error', request.url));
      }
      
      if (session) {
        console.log('✅ Auth callback successful, redirecting to:', next);
        return NextResponse.redirect(new URL(next, request.url));
      }
    } catch (error) {
      console.error('❌ Auth callback exception:', error);
      return NextResponse.redirect(new URL('/auth/auth-code-error', request.url));
    }
  }

  // If no code, redirect to login
  console.log('❌ No auth code found, redirecting to login');
  return NextResponse.redirect(new URL('/login', request.url));
}