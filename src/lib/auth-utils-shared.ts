/**
 * SHARED authentication utilities
 * These functions can be used in both client and server components
 * They do NOT use next/headers or other server-only APIs
 */

import { AuthProfile } from './auth-utils-server';

/**
 * Check if user has required role
 */
export function hasRole(profile: AuthProfile | null, requiredRole: 'admin' | 'customer'): boolean {
  if (!profile) return false;
  
  if (requiredRole === 'admin') {
    return profile.role === 'admin';
  }
  
  return profile.role === 'customer' || profile.role === 'admin';
}

/**
 * Get user's redirect path based on role
 */
export function getUserRedirectPath(profile: AuthProfile | null): string {
  if (!profile) return '/login';
  
  if (profile.role === 'admin') {
    return '/admin/dashboard';
  }
  
  return '/account';
}

/**
 * Handle auth errors consistently
 */
export function handleAuthError(error: any): { message: string; code?: string } {
  if (typeof error === 'string') {
    return { message: error };
  }
  
  if (error?.message) {
    // Handle specific Supabase auth errors
    if (error.message.includes('Invalid login credentials')) {
      return { message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' };
    }
    
    if (error.message.includes('Email not confirmed')) {
      return { message: 'Please confirm your email address', code: 'EMAIL_NOT_CONFIRMED' };
    }
    
    if (error.message.includes('User already registered')) {
      return { message: 'This email is already registered', code: 'USER_EXISTS' };
    }
    
    if (error.message.includes('Password should be at least')) {
      return { message: 'Password must be at least 6 characters', code: 'WEAK_PASSWORD' };
    }
    
    return { message: error.message, code: error.code };
  }
  
  return { message: 'Authentication error occurred', code: 'UNKNOWN_ERROR' };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate secure session token for client-side validation
 */
export function generateSessionToken(userId: string): string {
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(2);
  return `${userId}-${timestamp}-${randomString}`;
}