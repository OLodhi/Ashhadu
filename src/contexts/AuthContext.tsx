'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

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
  
  console.log('🟡 AuthProvider initialized');

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setProfile(null);
          setCustomer(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId: string) => {
    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading profile:', profileError);
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
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    console.log('Starting signup process for:', email);
    
    try {
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
        console.error('Auth signup error:', error);
        return { user: null, error };
      }

      console.log('Auth signup successful:', {
        userId: data.user?.id,
        email: data.user?.email,
        emailConfirmedAt: data.user?.email_confirmed_at,
        session: data.session
      });

      // Profile and customer records are created automatically by database trigger
      // No need to manually create them
      if (data.user && data.user.id) {
        console.log('✅ User created successfully! Profile/customer created by database trigger.');
        
        // Optional: Give the trigger a moment to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Unexpected signup error:', error);
      return { user: null, error: error as AuthError };
    }
  };

  const createUserProfile = async (userId: string, email: string, userData: SignUpData) => {
    console.log('Creating user profile for:', { userId, email, userData });
    
    try {
      // Try direct database insert first
      console.log('Attempting direct database insert...');
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email,
          full_name: `${userData.firstName} ${userData.lastName}`,
          role: 'customer'
        })
        .select()
        .single();

      if (!profileError) {
        console.log('Profile created successfully via direct insert');
        
        // Create customer record
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .insert({
            email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone || null,
            marketing_consent: userData.marketingConsent || false
          })
          .select()
          .single();
          
        if (!customerError) {
          console.log('Customer created successfully via direct insert');
          return;
        }
      }
      
      // If direct insert failed, try API route (which uses service role)
      console.log('Direct insert failed, trying API route with service role...');
      console.log('Profile error:', profileError?.code, profileError?.message);
      
      const response = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email,
          userData: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            marketingConsent: userData.marketingConsent
          }
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error('API route failed:', result);
        throw new Error(result.error || 'Failed to create profile via API');
      }
      
      console.log('Profile and customer created successfully via API route');
      
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { user: data.user, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
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

  const refreshProfile = async () => {
    if (user) {
      await loadUserData(user.id);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    customer,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    updateCustomer,
    isAdmin,
    isCustomer,
    refreshProfile
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