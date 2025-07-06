'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface OAuthButtonsProps {
  mode: 'signin' | 'signup';
  className?: string;
}

export default function OAuthButtons({ mode, className = '' }: OAuthButtonsProps) {
  const { signInWithGoogle, signInWithFacebook, signInWithApple, oauthLoading } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthLogin = async (
    provider: 'google' | 'facebook' | 'apple',
    loginFunction: () => Promise<any>
  ) => {
    setLoadingProvider(provider);
    
    try {
      const { error } = await loginFunction();
      
      if (error) {
        toast.error(`${provider} login failed: ${error.message}`);
      }
      // Success handling is done by the OAuth callback
    } catch (error) {
      toast.error(`An error occurred during ${provider} login`);
    } finally {
      setLoadingProvider(null);
    }
  };

  const buttonText = mode === 'signin' ? 'Sign in with' : 'Sign up with';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-600"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white/10 text-gray-400">Or continue with</span>
        </div>
      </div>

      {/* OAuth Buttons */}
      <div className="grid grid-cols-1 gap-3">
        {/* Google */}
        <button
          type="button"
          onClick={() => handleOAuthLogin('google', signInWithGoogle)}
          disabled={oauthLoading}
          className="w-full inline-flex justify-center items-center px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingProvider === 'google' ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <GoogleIcon className="w-5 h-5 mr-2" />
          )}
          {buttonText} Google
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={() => handleOAuthLogin('facebook', signInWithFacebook)}
          disabled={oauthLoading}
          className="w-full inline-flex justify-center items-center px-4 py-3 bg-[#1877f2] border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-[#166fe5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877f2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingProvider === 'facebook' ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <FacebookIcon className="w-5 h-5 mr-2" />
          )}
          {buttonText} Facebook
        </button>

        {/* Apple */}
        <button
          type="button"
          onClick={() => handleOAuthLogin('apple', signInWithApple)}
          disabled={oauthLoading}
          className="w-full inline-flex justify-center items-center px-4 py-3 bg-black border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loadingProvider === 'apple' ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <AppleIcon className="w-5 h-5 mr-2" />
          )}
          {buttonText} Apple
        </button>
      </div>
    </div>
  );
}

// Icon components
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const AppleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);