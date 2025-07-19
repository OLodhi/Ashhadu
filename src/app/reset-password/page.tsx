'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, CheckCircle, AlertTriangle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase-client';
import Logo from '@/components/ui/Logo';
import SafeLink from '@/components/ui/SafeLink';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasValidSession, setHasValidSession] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [sessionUser, setSessionUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // Check for valid session on mount
  useEffect(() => {
    console.log('🔍 Reset Password: Checking for recovery token');
    
    // Check URL parameters for recovery flow indicators
    const type = searchParams.get('type');
    const token = searchParams.get('token');
    const tokenHash = searchParams.get('token_hash');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const errorCode = searchParams.get('error_code');
    
    console.log('🔍 URL parameters:', { 
      type, 
      token: token ? `${token.substring(0, 10)}...` : null, 
      tokenHash: tokenHash ? `${tokenHash.substring(0, 10)}...` : null, 
      error, 
      errorDescription,
      errorCode 
    });
    
    // Handle any errors from Supabase
    if (error || errorCode) {
      console.error('❌ Supabase error:', error, errorDescription, errorCode);
      setIsValidatingToken(false);
      setHasValidSession(false);
      
      if (errorDescription) {
        toast.error(errorDescription);
      } else if (error) {
        toast.error(error);
      }
      return;
    }
    
    // If we have a recovery token, handle it
    // The email template sends 'token' parameter, not 'token_hash'
    if (token && type === 'recovery') {
      // For password recovery, we use the token as token_hash in verifyOtp
      handleRecoveryToken(token);
    } else if (tokenHash && type === 'recovery') {
      // Fallback to token_hash if available
      handleRecoveryToken(tokenHash);
    } else {
      // Check if session already exists
      checkValidSession();
    }
  }, [searchParams]);

  const handleRecoveryToken = async (token: string) => {
    try {
      setIsValidatingToken(true);
      console.log('🔄 Verifying recovery token...');
      
      // Check if this is a 6-digit OTP or a token hash
      const isOTP = /^\d{6}$/.test(token);
      const tokenParam = searchParams.get('token');
      const tokenHashParam = searchParams.get('token_hash');
      
      console.log('🔍 Token analysis:', {
        length: token.length,
        isOTP,
        isFromTokenParam: token === tokenParam,
        isFromTokenHashParam: token === tokenHashParam,
        prefix: token.substring(0, 10)
      });
      
      let verifyResult;
      
      // If it's a 6-digit OTP from 'token' parameter, we need the user's email
      if (isOTP && token === tokenParam) {
        console.log('📧 Detected 6-digit OTP, need email for verification');
        
        // For OTP verification, we need the user's email
        // This is a limitation - the user would need to provide their email
        // For now, show an error message
        toast.error('Please use the password reset link from your email. The 6-digit code requires additional verification.');
        setHasValidSession(false);
        setIsValidatingToken(false);
        return;
      } else {
        // Use token_hash verification (PKCE flow)
        console.log('🔐 Using token_hash verification');
        verifyResult = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        });
      }
      
      const { data, error } = verifyResult;
      
      if (error) {
        console.error('❌ Token verification error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: (error as any).status,
          code: (error as any).code
        });
        
        // If verification fails, check if we already have a session
        // This can happen if the user refreshes the page after clicking the link
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (session && session.user) {
          console.log('✅ Existing session found');
          setHasValidSession(true);
          setSessionUser(session.user);
          setIsValidatingToken(false);
          
          // Clean URL
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('token');
          cleanUrl.searchParams.delete('token_hash');
          cleanUrl.searchParams.delete('type');
          window.history.replaceState({}, '', cleanUrl.toString());
          return;
        }
        
        console.error('❌ No valid session found:', sessionError);
        setHasValidSession(false);
        setIsValidatingToken(false);
        
        // Show more specific error message
        if (error.message.includes('expired') || error.message.includes('Token has expired')) {
          toast.error('This password reset link has expired. Please request a new one.');
        } else if (error.message.includes('invalid') || error.message.includes('verification_failed')) {
          toast.error('This password reset link is invalid. Please check the SUPABASE_EMAIL_TEMPLATE_SETUP.md file for correct email template configuration.');
        } else {
          toast.error(error.message || 'Unable to verify password reset link.');
        }
        return;
      }
      
      if (data?.session) {
        console.log('✅ Session established via OTP verification');
        console.log('✅ Session details:', {
          user: data.session.user.email,
          expires: data.session.expires_at
        });
        setHasValidSession(true);
        setSessionUser(data.session.user);
        setIsValidatingToken(false);
        
        // Clean URL
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('token');
        cleanUrl.searchParams.delete('token_hash');
        cleanUrl.searchParams.delete('type');
        window.history.replaceState({}, '', cleanUrl.toString());
      } else {
        console.log('❌ No session returned from token verification');
        setHasValidSession(false);
        setIsValidatingToken(false);
        toast.error('Unable to verify password reset link. Please request a new one.');
      }
    } catch (error) {
      console.error('❌ Error handling recovery token:', error);
      setHasValidSession(false);
      setIsValidatingToken(false);
      toast.error('An error occurred while verifying the reset link.');
    }
  };

  const checkValidSession = async () => {
    try {
      setIsValidatingToken(true);
      
      // Check if we have a current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('🔍 Session check:', { 
        hasSession: !!session, 
        user: session?.user?.id, 
        error: error?.message
      });
      
      if (error) {
        console.error('❌ Session check error:', error);
        setHasValidSession(false);
        setIsValidatingToken(false);
        return;
      }
      
      if (session && session.user) {
        console.log('✅ Valid session found for password reset');
        setHasValidSession(true);
        setSessionUser(session.user);
        setIsValidatingToken(false);
        return;
      }
      
      // Listen for auth state changes
      console.log('🔄 No session found, listening for auth state changes...');
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          console.log('🔄 Auth state change:', event, !!session);
          
          if (event === 'PASSWORD_RECOVERY' && session) {
            console.log('✅ Password recovery session established');
            setHasValidSession(true);
            setSessionUser(session.user);
            setIsValidatingToken(false);
            subscription.unsubscribe();
          } else if (event === 'SIGNED_IN' && session) {
            // Also accept regular signed in state for recovery
            console.log('✅ User signed in, checking for recovery flow');
            setHasValidSession(true);
            setSessionUser(session.user);
            setIsValidatingToken(false);
            subscription.unsubscribe();
          }
        }
      );
      
      // Timeout after 3 seconds
      setTimeout(() => {
        console.log('⏰ Session validation timeout');
        subscription.unsubscribe();
        setIsValidatingToken(false);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error checking session:', error);
      setHasValidSession(false);
      setIsValidatingToken(false);
    }
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!hasValidSession) {
      toast.error('Invalid or expired reset link. Please request a new password reset.');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log('🔄 Updating password for user:', sessionUser?.id);
      
      // First, ensure we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('❌ No valid session for password update');
        toast.error('Your session has expired. Please request a new password reset.');
        setHasValidSession(false);
        return;
      }
      
      // Update the password directly (session is already established)
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      });

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Password updated successfully');
      toast.success('Password updated successfully!');
      
      // Clear the session to ensure clean state
      await supabase.auth.signOut();
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login?message=password-updated');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      
      if (error.message.includes('Invalid refresh token') || 
          error.message.includes('refresh_token_not_found')) {
        toast.error('Reset link has expired. Please request a new password reset.');
        setHasValidSession(false);
      } else if (error.message.includes('session_not_found') || 
                 error.message.includes('invalid_grant')) {
        toast.error('Invalid reset link. Please request a new password reset.');
        setHasValidSession(false);
      } else if (error.message.includes('same as the old')) {
        toast.error('New password must be different from your current password.');
      } else {
        toast.error(error.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black">
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
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-luxury-gold/20 p-8 shadow-2xl">
              <div className="text-center">
                <Loader2 className="animate-spin h-12 w-12 text-luxury-gold mx-auto mb-4" />
                <h2 className="text-2xl font-playfair font-bold text-white mb-4">Verifying Reset Link</h2>
                <p className="text-gray-400">
                  Please wait while we verify your password reset link...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no valid session is available
  if (!hasValidSession && !isValidatingToken) {
    console.log('❌ No valid session found, showing error page');
    
    // Check if we have specific error parameters
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black">
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
            {/* Error Title */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-16 w-16 text-red-400" />
              </div>
              <h1 className="text-3xl font-playfair font-bold text-white mb-2">
                Invalid Reset Link
              </h1>
              <p className="text-gray-400">
                {errorDescription || 'This password reset link is invalid or has expired'}
              </p>
            </div>

            {/* Error Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-luxury-gold/20 p-8 shadow-2xl">
              <div className="space-y-6">
                {errorParam && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-sm text-red-400">
                      <strong>Error:</strong> {errorParam}
                    </p>
                  </div>
                )}
                
                <div className="bg-white/5 border border-gray-600 rounded-lg p-4">
                  <p className="text-sm text-white mb-2 font-semibold">
                    Troubleshooting:
                  </p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Check that you clicked the link from the most recent email</li>
                    <li>• Ensure the link hasn't expired (links expire after 1 hour)</li>
                    <li>• Try copying and pasting the full URL into your browser</li>
                    <li>• Make sure your email template is configured correctly</li>
                  </ul>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-sm text-blue-300">
                    <strong>Email Template Issue?</strong> If you're seeing "verification_failed" errors, 
                    your Supabase email template may need to be updated. Check the SUPABASE_EMAIL_TEMPLATE_SETUP.md 
                    file for instructions.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <Link
                    href="/forgot-password"
                    className="w-full flex items-center justify-center px-6 py-3 bg-luxury-gold text-luxury-black font-semibold rounded-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
                  >
                    Request New Reset Link
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/login"
                    className="w-full flex items-center justify-center px-6 py-3 bg-white/10 border border-gray-600 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Sign In
                  </Link>
                </div>
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
                Need help?{' '}
                <Link href="/contact" className="text-luxury-gold hover:text-yellow-400">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black">
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
              Reset Your Password
            </h1>
            <p className="text-gray-400">
              Enter your new password below
            </p>
          </div>

          {/* Reset Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-luxury-gold/20 p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{errors.general}</p>
                </div>
              )}

              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors ${
                      errors.password ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter your new password"
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
                <p className="mt-1 text-xs text-gray-400">
                  At least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`block w-full pl-10 pr-12 py-3 bg-white/5 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-luxury-gold transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-luxury-gold transition-colors" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
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
                    Updating Password...
                  </>
                ) : (
                  <>
                    Update Password
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-luxury-gold hover:text-yellow-400 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
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
              Need help?{' '}
              <Link href="/contact" className="text-luxury-gold hover:text-yellow-400">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}