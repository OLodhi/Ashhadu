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
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
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
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
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
 * Now supports impersonation sessions
 */
export async function validateUserSession(): Promise<AuthValidationResult> {
  try {
    console.log('🔍 validateUserSession: Starting session validation...');
    
    // FIRST: Check if we have an impersonation session
    const impersonationResult = await validateImpersonationSession();
    
    if (impersonationResult.isImpersonating) {
      console.log('✅ validateUserSession: Using impersonation session');
      
      if (impersonationResult.customerData && impersonationResult.profile) {
        // Create a synthetic session for the impersonated customer
        const syntheticSession: AuthSession = {
          user: {
            id: impersonationResult.customerData.id,
            email: impersonationResult.customerData.email,
            user_metadata: {
              full_name: `${impersonationResult.customerData.first_name} ${impersonationResult.customerData.last_name}`,
              role: 'customer'
            }
          },
          access_token: 'impersonation_token',
          refresh_token: 'impersonation_refresh',
          expires_at: Date.now() + 3600000 // 1 hour from now
        };
        
        return {
          isValid: true,
          session: syntheticSession,
          profile: impersonationResult.profile,
          customer: impersonationResult.customerData,
          error: null
        };
      } else {
        console.error('❌ validateUserSession: Impersonation session missing customer data');
        return {
          isValid: false,
          session: null,
          profile: null,
          customer: null,
          error: 'Invalid impersonation session data'
        };
      }
    }
    
    // SECOND: If no impersonation, check regular authentication
    console.log('🔍 validateUserSession: Checking regular authentication session...');
    
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

/**
 * Validate impersonation session and return customer data
 */
export async function validateImpersonationSession(): Promise<{
  isImpersonating: boolean;
  customerData?: AuthCustomer;
  profile?: AuthProfile;
  adminUserId?: string;
  error?: string;
}> {
  try {
    console.log('🔍 validateImpersonationSession: Checking for impersonation session...');
    
    const cookieStore = await cookies();
    const impersonationCookie = cookieStore.get('impersonation_session');
    
    if (!impersonationCookie) {
      console.log('🔍 validateImpersonationSession: No impersonation session found');
      return { isImpersonating: false };
    }
    
    let impersonationSession;
    try {
      impersonationSession = JSON.parse(impersonationCookie.value);
    } catch (parseError) {
      console.error('❌ validateImpersonationSession: Invalid session data:', parseError);
      // Clear invalid cookie
      await clearImpersonationSession();
      return { isImpersonating: false, error: 'Invalid impersonation session' };
    }
    
    if (!impersonationSession.isImpersonating || !impersonationSession.impersonatedCustomer) {
      console.log('🔍 validateImpersonationSession: Invalid impersonation session structure');
      await clearImpersonationSession();
      return { isImpersonating: false, error: 'Invalid impersonation session structure' };
    }
    
    // Check if session has expired (2 hours)
    const sessionStartTime = new Date(impersonationSession.impersonationStartedAt);
    const currentTime = new Date();
    const sessionDuration = currentTime.getTime() - sessionStartTime.getTime();
    const maxDuration = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    
    if (sessionDuration > maxDuration) {
      console.log('⏰ validateImpersonationSession: Session expired');
      await clearImpersonationSession();
      return { isImpersonating: false, error: 'Impersonation session expired' };
    }
    
    console.log('✅ validateImpersonationSession: Found active impersonation session:', {
      customerId: impersonationSession.impersonatedCustomer.id,
      customerEmail: impersonationSession.impersonatedCustomer.email,
      adminUserId: impersonationSession.originalAdminUserId,
      sessionDuration: `${Math.round(sessionDuration / 1000 / 60)} minutes`
    });
    
    // Load customer data from database
    const supabase = await createServerSupabaseClient();
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', impersonationSession.impersonatedCustomer.id)
      .single();
    
    if (customerError) {
      console.error('❌ validateImpersonationSession: Error loading customer data:', customerError);
      return { 
        isImpersonating: false, 
        error: 'Failed to load customer data' 
      };
    }
    
    if (!customerData) {
      console.error('❌ validateImpersonationSession: Customer not found');
      return { 
        isImpersonating: false, 
        error: 'Customer not found' 
      };
    }
    
    // Validate customer data integrity
    if (!customerData.first_name || !customerData.last_name || !customerData.email) {
      console.error('❌ validateImpersonationSession: Incomplete customer data:', {
        hasFirstName: !!customerData.first_name,
        hasLastName: !!customerData.last_name,
        hasEmail: !!customerData.email
      });
      return { 
        isImpersonating: false, 
        error: 'Incomplete customer data' 
      };
    }
    
    // Create a synthetic profile for the customer
    const customerProfile: AuthProfile = {
      user_id: impersonationSession.impersonatedCustomer.id, // Use customer ID as user_id
      email: customerData.email,
      full_name: `${customerData.first_name} ${customerData.last_name}`,
      role: 'customer',
      created_at: customerData.created_at,
      updated_at: customerData.updated_at
    };
    
    console.log('✅ validateImpersonationSession: Customer data loaded successfully:', {
      customerId: customerData.id,
      customerName: customerProfile.full_name,
      customerEmail: customerData.email,
      hasPhone: !!customerData.phone,
      hasBillingAddress: !!customerData.billing_address,
      hasShippingAddress: !!customerData.shipping_address
    });
    
    return {
      isImpersonating: true,
      customerData: customerData as AuthCustomer,
      profile: customerProfile,
      adminUserId: impersonationSession.originalAdminUserId
    };
    
  } catch (error) {
    console.error('❌ validateImpersonationSession: Unexpected error:', error);
    return { 
      isImpersonating: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Clear impersonation session cookie
 */
async function clearImpersonationSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.set('impersonation_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });
    console.log('🧹 clearImpersonationSession: Impersonation session cleared');
  } catch (error) {
    console.error('❌ clearImpersonationSession: Error clearing session:', error);
  }
}

/**
 * Debug helper to log current authentication state
 */
export async function debugAuthState(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    console.log('🔍 DEBUG: Current authentication state:', {
      cookieCount: allCookies.length,
      cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value, length: c.value.length })),
      impersonationCookie: !!cookieStore.get('impersonation_session'),
      supabaseCookies: allCookies.filter(c => c.name.includes('supabase')).map(c => c.name)
    });
    
    // Check impersonation session
    const impersonationResult = await validateImpersonationSession();
    console.log('🔍 DEBUG: Impersonation check result:', {
      isImpersonating: impersonationResult.isImpersonating,
      hasCustomerData: !!impersonationResult.customerData,
      hasProfile: !!impersonationResult.profile,
      error: impersonationResult.error
    });
    
    // Check regular session
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔍 DEBUG: Regular session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      error: sessionError?.message
    });
    
  } catch (error) {
    console.error('❌ DEBUG: Error in debug function:', error);
  }
}