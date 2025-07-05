import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Admin client for server-side operations that bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

// For server-side operations only
export const supabaseAdmin = supabaseServiceKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Helper function to create user profile and customer records
// This bypasses RLS by using the service role key
export async function createUserProfileAdmin(
  userId: string, 
  email: string, 
  userData: {
    firstName: string;
    lastName: string;
    phone?: string;
    marketingConsent?: boolean;
  }
) {
  if (!supabaseAdmin) {
    throw new Error('Service role key not configured');
  }

  try {
    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: userId,
        email,
        full_name: `${userData.firstName} ${userData.lastName}`,
        role: 'customer'
      });

    if (profileError) {
      console.error('Admin: Error creating profile:', profileError);
      throw profileError;
    }

    // Create customer record
    const { error: customerError } = await supabaseAdmin
      .from('customers')
      .insert({
        email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || null,
        marketing_consent: userData.marketingConsent || false
      });

    if (customerError) {
      console.error('Admin: Error creating customer:', customerError);
      throw customerError;
    }

    return { success: true };
  } catch (error) {
    console.error('Admin: Error in createUserProfileAdmin:', error);
    throw error;
  }
}