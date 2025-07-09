import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database';

/**
 * SERVER-ONLY authentication utilities
 * These functions use next/headers and can only be used in:
 * - API routes
 * - Server components  
 * - Middleware
 */

export interface AuthSession {
  user: {
    id: string;
    email: string;
    user_metadata: any;
  };
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface AuthProfile {
  user_id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'customer';
  created_at: string;
  updated_at: string;
}

export interface AuthCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthValidationResult {
  isValid: boolean;
  session: AuthSession | null;
  profile: AuthProfile | null;
  customer: AuthCustomer | null;
  error: string | null;
}

/**
 * Create a server-side Supabase client for API routes
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  
  console.log('🔍 createServerSupabaseClient: Available cookies:', {
    allCookies: cookieStore.getAll().map(c => ({ name: c.name, hasValue: !!c.value })),
    authCookies: cookieStore.getAll().filter(c => c.name.includes('supabase')).map(c => ({ name: c.name, hasValue: !!c.value }))
  });
  
  const supabaseClient = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = cookieStore.get(name)?.value;
          console.log(`🔍 Cookie get: ${name}=${value ? 'present' : 'missing'}`);
          return value;
        },
        set(name: string, value: string, options: any) {
          console.log(`🔍 Cookie set: ${name}=${value ? 'setting value' : 'clearing'}`);
          try {
            cookieStore.set({ 
              name, 
              value, 
              ...options,
              // Ensure cookie options are properly set for authentication
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/'
            });
          } catch (error) {
            // Don't silently ignore - this might be why auth context is lost
            console.error('🚨 Cookie setting failed:', { name, error: error instanceof Error ? error.message : error });
          }
        },
        remove(name: string, options: any) {
          console.log(`🔍 Cookie remove: ${name}`);
          try {
            cookieStore.set({ 
              name, 
              value: '', 
              ...options,
              maxAge: 0,
              expires: new Date(0)
            });
          } catch (error) {
            console.error('🚨 Cookie removal failed:', { name, error: error instanceof Error ? error.message : error });
          }
        },
      },
    }
  );
  
  // Test the auth context immediately after creation
  try {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    console.log('🔍 createServerSupabaseClient: Auth context test:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      error: error?.message,
      accessToken: session?.access_token ? 'present' : 'missing'
    });
  } catch (error) {
    console.error('🚨 createServerSupabaseClient: Auth context test failed:', error);
  }
  
  return supabaseClient;
}

/**
 * Create a server-side Supabase client for middleware
 */
export function createMiddlewareSupabaseClient(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: req.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          req.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: { headers: req.headers },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  return { supabase, response };
}

/**
 * Validate user session and load complete user data
 */
export async function validateUserSession(): Promise<AuthValidationResult> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get session with retry logic
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    console.log('🔍 validateUserSession: Session details:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      sessionError: sessionError?.message
    });
    
    if (sessionError) {
      console.error('Session validation error:', sessionError);
      return {
        isValid: false,
        session: null,
        profile: null,
        customer: null,
        error: 'Session validation failed'
      };
    }

    if (!session) {
      return {
        isValid: false,
        session: null,
        profile: null,
        customer: null,
        error: 'No session found'
      };
    }

    // Load user profile with retry logic
    let profile: AuthProfile | null = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    console.log('🔍 validateUserSession: Attempting to load profile for user:', session.user.id);
    
    while (retryCount < maxRetries) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      
      console.log('🔍 validateUserSession: Profile query result:', {
        hasData: !!profileData,
        error: profileError?.message,
        errorCode: profileError?.code,
        retryCount
      });

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, try to create it
        console.log('Profile not found, attempting to create...');
        const createResult = await createUserProfile(session.user);
        if (createResult.success) {
          retryCount++;
          continue; // Retry loading profile
        }
      } else if (profileError) {
        console.error('Profile loading error:', profileError);
        break;
      } else {
        profile = profileData;
        break;
      }
      
      retryCount++;
    }

    // Load customer data if profile exists and user is a customer
    let customer: AuthCustomer | null = null;
    if (profile && profile.role === 'customer') {
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', profile.email)
        .single();

      if (customerError && customerError.code !== 'PGRST116') {
        console.error('Customer loading error:', customerError);
      } else {
        customer = customerData;
      }
    }

    return {
      isValid: true,
      session: session as AuthSession,
      profile,
      customer,
      error: null
    };
  } catch (error) {
    console.error('Unexpected error in validateUserSession:', error);
    return {
      isValid: false,
      session: null,
      profile: null,
      customer: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Create user profile and customer records
 */
export async function createUserProfile(user: any): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Extract user data
    const email = user.email;
    const fullName = user.user_metadata?.full_name || 
                    `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 
                    null;
    
    // Get role from user metadata, default to customer
    const userRole = user.user_metadata?.role || user.app_metadata?.role || 'customer';
    
    console.log('Creating profile for user:', { userId: user.id, email, fullName, role: userRole });
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email,
        full_name: fullName,
        role: userRole
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return { success: false, error: profileError.message };
    }

    // Create customer record if we have the necessary data
    if (user.user_metadata?.first_name && user.user_metadata?.last_name) {
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          email,
          first_name: user.user_metadata.first_name,
          last_name: user.user_metadata.last_name,
          phone: user.user_metadata.phone || null,
          marketing_consent: user.user_metadata.marketing_consent || false
        });

      if (customerError) {
        console.error('Customer creation error:', customerError);
        // Don't fail if customer creation fails, profile is more important
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Session refresh utility
 */
export async function refreshUserSession() {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, session };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Create standardized auth response
 */
export function createAuthResponse(
  success: boolean,
  data?: any,
  error?: string,
  status: number = 200
) {
  return NextResponse.json(
    {
      success,
      data: data || null,
      error: error || null,
      timestamp: new Date().toISOString()
    },
    { status }
  );
}