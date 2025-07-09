'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';
import { Database } from '@/types/database';
import { useCartStore } from '@/store/cartStore';
import { handleAuthError } from '@/lib/auth-utils-shared';

// Types
type Profile = Database['public']['Tables']['profiles']['Row'];
type Customer = Database['public']['Tables']['customers']['Row'];

interface AuthContextType {
  // Authentication state
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  customer: Customer | null;
  loading: boolean;
  error: string | null;
  
  // Authentication methods
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  
  // Profile methods
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  updateCustomer: (updates: Partial<Customer>) => Promise<{ error: Error | null }>;
  
  // Utility methods
  isAdmin: () => boolean;
  isCustomer: () => boolean;
  refreshProfile: () => Promise<void>;
  validateSession: () => Promise<boolean>;
  clearError: () => void;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  phone?: string;
  marketingConsent?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { clearCart } = useCartStore();
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔍 AuthContext: Initializing authentication...');
        
        // Get initial session with retry logic
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ AuthContext: Session error:', sessionError);
          setError('Failed to load session');
          setLoading(false);
          return;
        }
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('✅ AuthContext: Session found, loading user data...');
          await loadUserData(session.user.id);
        } else {
          console.log('🔍 AuthContext: No session found');
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ AuthContext: Initialization error:', error);
        if (mounted) {
          setError('Authentication initialization failed');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 AuthContext: Auth state changed:', event);
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        setError(null); // Clear errors on auth change
        
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setProfile(null);
          setCustomer(null);
          clearCart(); // Clear cart when user signs out
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [clearCart]);

  const loadUserData = useCallback(async (userId: string) => {
    try {
      console.log('🔍 AuthContext: Loading user data for:', userId);
      
      // Try to load profile with server-side validation
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ AuthContext: User data loaded successfully');
          setProfile(result.data.profile);
          setCustomer(result.data.customer);
          setError(null);
        } else {
          console.error('❌ AuthContext: Profile API error:', result.error);
          setError('Failed to load profile');
        }
      } else {
        console.error('❌ AuthContext: Profile API request failed:', response.status);
        
        // Fallback to direct database query
        console.log('🔄 AuthContext: Falling back to direct database query...');
        await loadUserDataFallback(userId);
      }
    } catch (error) {
      console.error('❌ AuthContext: Error loading user data:', error);
      
      // Fallback to direct database query
      await loadUserDataFallback(userId);
    } finally {
      setLoading(false);
    }
  }, []);
  
  const loadUserDataFallback = async (userId: string) => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
        setError('Failed to load profile');
      } else {
        setProfile(profileData);
      }

      // Load customer data if user is a customer
      if (profileData?.role === 'customer') {
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('email', profileData.email)
          .single();

        if (customerError && customerError.code !== 'PGRST116') {
          console.error('Error loading customer:', customerError);
        } else {
          setCustomer(customerData);
        }
      }
    } catch (error) {
      console.error('Error in fallback user data loading:', error);
      setError('Failed to load user data');
    }
  };

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      console.log('🔍 AuthContext: Starting signup process...');
      setError(null);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            marketing_consent: userData.marketingConsent || false,
          },
          emailRedirectTo: `${window.location.origin}/login?verified=true`
        }
      });

      if (error) {
        console.error('❌ AuthContext: Signup error:', error);
        const authError = handleAuthError(error);
        setError(authError.message);
        return { user: null, error };
      }

      console.log('✅ AuthContext: Signup successful');
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('❌ AuthContext: Unexpected signup error:', error);
      const authError = handleAuthError(error);
      setError(authError.message);
      return { user: null, error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔍 AuthContext: Starting signin process...');
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ AuthContext: Signin error:', error);
        const authError = handleAuthError(error);
        setError(authError.message);
        return { user: null, error };
      }

      console.log('✅ AuthContext: Signin successful');
      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('❌ AuthContext: Unexpected signin error:', error);
      const authError = handleAuthError(error);
      setError(authError.message);
      return { user: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log('🔍 AuthContext: Starting signout process...');
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ AuthContext: Signout error:', error);
        const authError = handleAuthError(error);
        setError(authError.message);
        return { error };
      }

      console.log('✅ AuthContext: Signout successful');
      clearCart(); // Clear cart on successful signout
      return { error: null };
    } catch (error: any) {
      console.error('❌ AuthContext: Unexpected signout error:', error);
      const authError = handleAuthError(error);
      setError(authError.message);
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      // Refresh profile data
      await loadUserData(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const updateCustomer = async (updates: Partial<Customer>) => {
    if (!user || !profile) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('customers')
        .update(updates)
        .eq('email', profile.email);

      if (error) {
        return { error: new Error(error.message) };
      }

      // Refresh customer data
      await loadUserData(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const isAdmin = () => profile?.role === 'admin';
  const isCustomer = () => profile?.role === 'customer';

  const refreshProfile = useCallback(async () => {
    if (user) {
      console.log('🔄 AuthContext: Refreshing profile...');
      await loadUserData(user.id);
    }
  }, [user, loadUserData]);
  
  const validateSession = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🔍 AuthContext: Validating session...');
      
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.valid) {
          console.log('✅ AuthContext: Session valid');
          return true;
        }
      }
      
      console.log('❌ AuthContext: Session invalid, attempting refresh...');
      
      // Try to refresh session
      const refreshResponse = await fetch('/api/auth/session', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json();
        if (refreshResult.success && refreshResult.data.refreshed) {
          console.log('✅ AuthContext: Session refreshed successfully');
          return true;
        }
      }
      
      console.log('❌ AuthContext: Session validation failed');
      return false;
    } catch (error) {
      console.error('❌ AuthContext: Session validation error:', error);
      return false;
    }
  }, []);

  const value: AuthContextType = {
    user,
    session,
    profile,
    customer,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    updateCustomer,
    isAdmin,
    isCustomer,
    refreshProfile,
    validateSession,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useUser() {
  const { user, profile, customer, loading } = useAuth();
  return { user, profile, customer, loading };
}