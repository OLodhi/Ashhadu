import { supabaseAdmin } from '@/lib/supabase';
import { ImpersonationToken, ImpersonationValidation } from '@/types/impersonation';
import crypto from 'crypto';

/**
 * Generate a cryptographically secure impersonation token
 */
export function generateImpersonationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create an impersonation token for admin to access customer account
 */
export async function createImpersonationToken(
  adminUserId: string,
  customerId: string,
  expirationMinutes: number = 5
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    // Verify admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role, email')
      .eq('user_id', adminUserId)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin role required' };
    }

    // Verify customer exists
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id, email')
      .eq('id', customerId)
      .single();

    if (customerError || !customer) {
      return { success: false, error: 'Customer not found' };
    }

    // Generate secure token
    const token = generateImpersonationToken();
    const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

    // Create token record
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from('impersonation_tokens')
      .insert({
        admin_user_id: adminUserId,
        customer_id: customerId,
        token,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();

    if (tokenError) {
      console.error('Error creating impersonation token:', tokenError);
      return { success: false, error: 'Failed to create impersonation token' };
    }

    // Log audit event
    await logImpersonationAudit({
      admin_user_id: adminUserId,
      customer_id: customerId,
      action: 'start',
      token_id: tokenRecord.id,
      admin_email: profile.email,
      customer_email: customer.email
    });

    return { success: true, token };
  } catch (error) {
    console.error('Error in createImpersonationToken:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Validate and consume an impersonation token
 */
export async function validateImpersonationToken(
  token: string
): Promise<{ success: boolean; customerData?: ImpersonationValidation; error?: string }> {
  try {
    // Use the stored function to validate and consume the token
    const { data, error } = await supabaseAdmin
      .rpc('validate_impersonation_token', { token_value: token });

    if (error) {
      console.error('Error validating impersonation token:', error);
      return { success: false, error: 'Failed to validate token' };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Invalid or expired token' };
    }

    const customerData = data[0] as ImpersonationValidation;
    return { success: true, customerData };
  } catch (error) {
    console.error('Error in validateImpersonationToken:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Log an impersonation audit event
 */
export async function logImpersonationAudit(auditData: {
  admin_user_id: string;
  customer_id: string;
  action: 'start' | 'stop' | 'expire';
  token_id?: string;
  admin_email: string;
  customer_email: string;
  ip_address?: string;
  user_agent?: string;
  session_duration?: string;
}): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('impersonation_audit')
      .insert(auditData);

    if (error) {
      console.error('Error logging impersonation audit:', error);
    }
  } catch (error) {
    console.error('Error in logImpersonationAudit:', error);
  }
}

/**
 * Cleanup expired impersonation tokens
 */
export async function cleanupExpiredTokens(): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .rpc('cleanup_expired_impersonation_tokens');

    if (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  } catch (error) {
    console.error('Error in cleanupExpiredTokens:', error);
  }
}

/**
 * Get impersonation session data from request/session
 */
export function getImpersonationSessionKey(adminUserId: string): string {
  return `impersonation_session_${adminUserId}`;
}

/**
 * Validate if user has admin permissions
 */
export async function verifyAdminRole(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single();

    return !error && profile?.role === 'admin';
  } catch (error) {
    console.error('Error verifying admin role:', error);
    return false;
  }
}

/**
 * Get customer profile data for impersonation
 */
export async function getCustomerForImpersonation(customerId: string): Promise<{
  success: boolean;
  customer?: any;
  error?: string;
}> {
  try {
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();

    if (error || !customer) {
      return { success: false, error: 'Customer not found' };
    }

    return { success: true, customer };
  } catch (error) {
    console.error('Error getting customer for impersonation:', error);
    return { success: false, error: 'Internal server error' };
  }
}