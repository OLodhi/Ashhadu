'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/ui/Logo';
import SafeLink from '@/components/ui/SafeLink';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { resetPassword } = useAuth();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
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

    try {
      const { error } = await resetPassword(email);

      if (error) {
        if (error.message.includes('User not found')) {
          setErrors({ general: 'No account found with this email address.' });
        } else {
          setErrors({ general: error.message });
        }
        return;
      }

      setSubmitted(true);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
            {/* Success Message */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <h1 className="text-3xl font-playfair font-bold text-white mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-400">
                We've sent a password reset link to{' '}
                <span className="text-luxury-gold font-medium">{email}</span>
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-luxury-gold/20 p-8 shadow-2xl">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    What's Next?
                  </h2>
                  <div className="space-y-3 text-gray-300">
                    <p className="text-sm">
                      1. Check your email inbox for a message from Ashhadu Islamic Art
                    </p>
                    <p className="text-sm">
                      2. Click the password reset link in the email
                    </p>
                    <p className="text-sm">
                      3. Enter your new password and confirm it
                    </p>
                    <p className="text-sm">
                      4. Sign in with your new password
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-6">
                  <p className="text-sm text-gray-400 text-center mb-4">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail('');
                    }}
                    className="w-full px-4 py-2 bg-white/10 border border-gray-600 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Try Different Email
                  </button>
                </div>
              </div>
            </div>

            {/* Back to Login */}
            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-luxury-gold hover:text-yellow-400 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
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
              Enter your email address and we'll send you a password reset link
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
                    placeholder="Enter your email address"
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email}</p>
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
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    Send Reset Link
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