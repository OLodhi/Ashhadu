import { type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') || '/';
  
  console.log('🔄 Auth confirm received:', { 
    token_hash: token_hash ? 'present' : 'missing',
    type,
    next
  });

  // For password recovery, redirect to reset-password page with the token
  if (type === 'recovery' && token_hash) {
    const redirectUrl = new URL('/reset-password', request.url);
    redirectUrl.searchParams.set('token_hash', token_hash);
    redirectUrl.searchParams.set('type', 'recovery');
    console.log('🔄 Redirecting to reset-password page with token');
    return NextResponse.redirect(redirectUrl);
  }

  // For other types, verify the OTP
  if (token_hash && type) {
    try {
      const supabase = await createServerSupabaseClient();
      
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash,
      });
      
      if (!error) {
        console.log('✅ OTP verified successfully, redirecting to:', next);
        return NextResponse.redirect(new URL(next, request.url));
      }
      
      console.error('❌ OTP verification error:', error);
    } catch (error) {
      console.error('❌ Auth confirm exception:', error);
    }
  }

  // Return the user to an error page with instructions
  const errorUrl = new URL('/auth/auth-code-error', request.url);
  errorUrl.searchParams.set('error', 'verification_failed');
  errorUrl.searchParams.set('error_description', 'Unable to verify the confirmation link');
  return NextResponse.redirect(errorUrl);
}