'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Admin Panel Error
          </h2>
          <p className="text-gray-600 mb-6">
            An error occurred in the admin panel. Please try again or contact support if the issue persists.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => reset()}
              className="w-full bg-luxury-gold hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded transition-colors"
            >
              Try again
            </button>
            <Link
              href="/admin/dashboard"
              className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded text-center transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}