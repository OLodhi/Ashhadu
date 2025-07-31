import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

/**
 * Create Supabase client for server-side operations with fallbacks for build time
 * This prevents build failures when environment variables are not available
 */
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key';

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Create Supabase client for browser-side operations with fallbacks for build time
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Runtime validation for API routes to ensure proper configuration
 */
export function validateSupabaseConfig(): { isValid: boolean; error?: string } {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      isValid: false,
      error: 'Database not configured. Missing SUPABASE environment variables.'
    };
  }
  
  return { isValid: true };
}

/**
 * Middleware for API routes to check Supabase configuration
 */
export function withSupabaseValidation<T extends any[]>(
  handler: (...args: T) => Promise<Response>
) {
  return async (...args: T): Promise<Response> => {
    const validation = validateSupabaseConfig();
    if (!validation.isValid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return handler(...args);
  };
}