'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';

function AuthCodeErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const error_description = searchParams.get('error_description');

  return (
    <div className="min-h-screen bg-luxury-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-luxury rounded-lg sm:px-10">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-luxury-black mb-4">Authentication Error</h2>
            <p className="text-luxury-gray-600 mb-6">
              There was a problem with your authentication request.
            </p>
            
            {(error || error_description) && (
              <div className="bg-red-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-red-800 font-semibold">Error Details:</p>
                {error && (
                  <p className="text-sm text-red-700 mt-1">
                    <strong>Error:</strong> {error}
                  </p>
                )}
                {error_description && (
                  <p className="text-sm text-red-700 mt-1">
                    <strong>Description:</strong> {error_description}
                  </p>
                )}
              </div>
            )}
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <strong>What you can do:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 text-left">
                <li>• Try requesting a new password reset link</li>
                <li>• Make sure you\'re clicking the most recent email link</li>
                <li>• Check that the link hasn\'t expired (1 hour limit)</li>
                <li>• Clear your browser cookies and try again</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-luxury-gold hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold transition-colors"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Request New Reset Link
              </Link>
              <Link
                href="/login"
                className="w-full flex justify-center items-center py-2 px-4 border border-luxury-gray-300 rounded-md shadow-sm text-sm font-medium text-luxury-gray-700 bg-white hover:bg-luxury-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-luxury-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-luxury rounded-lg sm:px-10">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-luxury-black mb-4">Loading...</h2>
              <p className="text-luxury-gray-600">Please wait while we process your request.</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <AuthCodeErrorContent />
    </Suspense>
  );
}