'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/ui/Logo';
import SafeLink from '@/components/ui/SafeLink';
import OAuthButtons from '@/components/auth/OAuthButtons';
import SessionRecovery from '@/components/auth/SessionRecovery';
import toast from 'react-hot-toast';

function LoginPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, user, error: authError, clearError, validateSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') || '/account';
  const message = searchParams.get('message');

  // Clear auth errors when component mounts
  useEffect(() => {
    if (clearError) {
      clearError();
    }
  }, [clearError]);

  // Show success message if password was updated or account was created
  useEffect(() => {
    if (message === 'password-updated') {
      toast.success('Password updated successfully! Please sign in with your new password.');
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
    } else if (message === 'account-created') {
      const emailParam = searchParams.get('email');
      const isConfirmed = searchParams.get('confirmed') === 'true';
      
      if (isConfirmed) {
        toast.success('Account created successfully! You can now sign in with your email and password.');
        if (emailParam) {
          setEmail(decodeURIComponent(emailParam));
        }
      }
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      url.searchParams.delete('email');
      url.searchParams.delete('confirmed');
      window.history.replaceState({}, '', url.toString());
    }
  }, [message, searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Check role and redirect appropriately
      const checkRoleAndRedirect = async () => {
        try {
          console.log('🔍 Login: User detected, checking role...');
          
          // First validate session
          const isValid = await validateSession();
          if (!isValid) {
            console.log('❌ Login: Session invalid, staying on login page');
            return;
          }
          
          const response = await fetch('/api/debug/user-info');
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Login: User info loaded:', data);
            
            if (data.success && data.data.profile?.role === 'admin') {
              console.log('🔄 Login: Redirecting admin to dashboard');
              router.push('/admin/dashboard');
            } else {
              console.log('🔄 Login: Redirecting customer to account');
              router.push('/account');
            }
          } else {
            console.log('⚠️ Login: Failed to load user info, defaulting to account');
            router.push('/account');
          }
        } catch (error) {
          console.error('❌ Login: Error checking user role:', error);
          router.push('/account');
        }
      };
      
      checkRoleAndRedirect();
    }
  }, [user, router, validateSession]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    if (clearError) {
      clearError(); // Clear any previous auth errors
    }

    try {
      console.log('🔍 Login: Starting signin process...');
      
      const { user, error } = await signIn(email, password);

      if (error) {
        console.error('❌ Login: Signin failed:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please try again.' });
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please check your email and click the confirmation link before signing in.' });
        } else {
          setErrors({ general: error.message });
        }
        return;
      }

      if (user) {
        console.log('✅ Login: Signin successful');
        toast.success('Welcome back!');
        
        // Check role immediately and redirect appropriately
        (async () => {
          try {
            console.log('🔍 Login: Checking user role for redirect...');
            
            const response = await fetch('/api/debug/user-info');
            if (response.ok) {
              const data = await response.json();
              console.log('✅ Login: User info loaded:', data);
              
              if (data.success && data.data.profile?.role === 'admin') {
                console.log('🔄 Login: Redirecting admin to dashboard');
                router.push('/admin/dashboard');
              } else {
                console.log('🔄 Login: Redirecting customer to account');
                router.push('/account');
              }
            } else {
              console.log('⚠️ Login: Failed to fetch user info, defaulting to account');
              router.push('/account');
            }
          } catch (error) {
            console.error('❌ Login: Error checking user role:', error);
            router.push('/account');
          }
        })();
      }
    } catch (error) {
      console.error('❌ Login: Unexpected error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black">
      {/* Session Recovery Component - Disabled to reduce popup clutter */}
      {/* <SessionRecovery /> */}
      
      {/* White Header Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center">
              <SafeLink href="/" className="inline-block -ml-10">
                <Logo className="w-12 h-12" />
              </SafeLink>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 top-[80px] opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <circle cx="25" cy="25" r="2" fill="#d4af37" />
                <circle cx="75" cy="25" r="2" fill="#d4af37" />
                <circle cx="25" cy="75" r="2" fill="#d4af37" />
                <circle cx="75" cy="75" r="2" fill="#d4af37" />
                <circle cx="50" cy="50" r="3" fill="#d4af37" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
          </svg>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-playfair font-bold text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-400">
              Sign in to your Ashhadu Islamic Art account
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-luxury-gold/20 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-luxury-gold transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-luxury-gold transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-luxury-gold hover:text-yellow-400 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-6 py-3 bg-luxury-gold text-luxury-black font-semibold rounded-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* OAuth Buttons */}
          <OAuthButtons mode="signin" className="mt-6" />

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                href="/signup"
                className="text-luxury-gold hover:text-yellow-400 font-medium transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>

          {/* Additional Links */}
          <div className="mt-8 text-center space-y-2">
            <SafeLink
              href="/"
              className="text-gray-400 hover:text-luxury-gold transition-colors text-sm"
            >
              ← Back to Homepage
            </SafeLink>
            <div className="text-gray-500 text-xs">
              By signing in, you agree to our{' '}
              <Link href="/privacy" className="text-luxury-gold hover:text-yellow-400">
                Privacy Policy
              </Link>{' '}
              and{' '}
              <Link href="/terms" className="text-luxury-gold hover:text-yellow-400">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black">
        {/* White Header Banner Loading */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-center">
                <div className="animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Loading */}
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
          {/* Islamic Pattern Overlay */}
          <div className="absolute inset-0 top-[80px] opacity-5">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="islamic-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                  <circle cx="25" cy="25" r="2" fill="#d4af37" />
                  <circle cx="75" cy="25" r="2" fill="#d4af37" />
                  <circle cx="25" cy="75" r="2" fill="#d4af37" />
                  <circle cx="75" cy="75" r="2" fill="#d4af37" />
                  <circle cx="50" cy="50" r="3" fill="#d4af37" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
            </svg>
          </div>

          <div className="relative z-10 w-full max-w-md">
            {/* Page Title Loading */}
            <div className="text-center mb-8 animate-pulse">
              <div className="h-8 bg-white/20 rounded w-48 mx-auto mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-64 mx-auto"></div>
            </div>

            {/* Login Form Loading */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-luxury-gold/20 p-8 shadow-2xl">
              <div className="space-y-6 animate-pulse">
                {/* Email Field Loading */}
                <div>
                  <div className="h-4 bg-white/20 rounded w-24 mb-2"></div>
                  <div className="h-12 bg-white/5 border border-gray-600 rounded-lg flex items-center px-3">
                    <div className="w-5 h-5 bg-gray-400 rounded mr-3"></div>
                    <div className="h-4 bg-white/20 rounded flex-1"></div>
                  </div>
                </div>

                {/* Password Field Loading */}
                <div>
                  <div className="h-4 bg-white/20 rounded w-16 mb-2"></div>
                  <div className="h-12 bg-white/5 border border-gray-600 rounded-lg flex items-center px-3">
                    <div className="w-5 h-5 bg-gray-400 rounded mr-3"></div>
                    <div className="h-4 bg-white/20 rounded flex-1 mr-3"></div>
                    <div className="w-5 h-5 bg-gray-400 rounded"></div>
                  </div>
                </div>

                {/* Forgot Password Link Loading */}
                <div className="text-right">
                  <div className="h-4 bg-luxury-gold/30 rounded w-32 ml-auto"></div>
                </div>

                {/* Submit Button Loading */}
                <div className="h-12 bg-luxury-gold/30 rounded-lg flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-luxury-black/20 border-t-luxury-black rounded-full animate-spin mr-3"></div>
                  <span className="text-luxury-black/50">Loading...</span>
                </div>
              </div>

              {/* OAuth Buttons Loading */}
              <div className="mt-6 space-y-3 animate-pulse">
                <div className="h-12 bg-white/5 border border-gray-600 rounded-lg"></div>
                <div className="h-12 bg-white/5 border border-gray-600 rounded-lg"></div>
              </div>

              {/* Sign Up Link Loading */}
              <div className="mt-6 text-center animate-pulse">
                <div className="h-4 bg-white/20 rounded w-48 mx-auto"></div>
              </div>
            </div>

            {/* Additional Links Loading */}
            <div className="mt-8 text-center space-y-2 animate-pulse">
              <div className="h-4 bg-white/20 rounded w-32 mx-auto"></div>
              <div className="h-3 bg-white/10 rounded w-64 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}