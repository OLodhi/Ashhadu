'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Shop page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main id="main-content" className="pt-16 lg:pt-20 bg-luxury-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-lg shadow-luxury p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-6" />
            
            <h1 className="text-3xl font-bold text-luxury-black mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-luxury-gray-600 mb-6 max-w-2xl mx-auto">
              We encountered an error while loading the shop page. This might be a temporary issue.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={reset}
                className="btn-luxury inline-flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </button>
              
              <p className="text-sm text-luxury-gray-500">
                If the problem persists, please contact our support team.
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm font-medium text-luxury-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 p-4 bg-luxury-gray-100 rounded text-xs overflow-auto">
                  {error.message}
                  {error.stack && '\n\n' + error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}