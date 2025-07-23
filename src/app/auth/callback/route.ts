import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Auth callback: Processing email verification...');
    
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const redirectTo = searchParams.get('redirect_to') || '/';
    
    // Log all URL parameters for debugging
    const allParams = Object.fromEntries(searchParams.entries());
    console.log('🔍 Auth callback full URL:', request.url);
    console.log('🔍 Auth callback all params:', allParams);
    console.log('🔍 Auth callback params:', { 
      hasCode: !!code, 
      codeLength: code?.length || 0,
      redirectTo 
    });

    if (code) {
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
              cookieStore.set({ name, value, ...options });
            },
            remove(name: string, options: any) {
              cookieStore.set({ name, value: '', ...options });
            },
          },
        }
      );

      // Exchange code for session
      console.log('🔄 Exchanging code for session...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('❌ Auth callback: Code exchange failed:', error);
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=code_exchange_failed&error_description=${encodeURIComponent(error.message)}`);
      }

      if (data.user) {
        console.log('✅ Auth callback: User verified successfully:', data.user.email);
        
        // Check if this is email verification
        if (data.user.email_confirmed_at) {
          console.log('✅ Email confirmed at:', data.user.email_confirmed_at);
        }

        // Redirect to the specified location
        console.log('🔄 Redirecting to:', redirectTo);
        return NextResponse.redirect(`${origin}${redirectTo}`);
      }
    }

    console.log('⚠️ Auth callback: No valid code provided');
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=invalid_request&error_description=No authorization code provided`);

  } catch (error) {
    console.error('❌ Auth callback: Unexpected error:', error);
    const { origin } = new URL(request.url);
    return NextResponse.redirect(`${origin}/auth/auth-code-error?error=server_error&error_description=Authentication callback failed`);
  }
}