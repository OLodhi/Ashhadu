'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TestResetPage() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const allParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      allParams[key] = value;
    });
    setParams(allParams);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Test Reset Password URL Parameters</h1>
        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Current URL:</h2>
          <code className="block bg-gray-100 p-2 rounded text-sm break-all">
            {typeof window !== 'undefined' ? window.location.href : 'Loading...'}
          </code>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">URL Parameters:</h2>
          {Object.keys(params).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(params).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-medium mr-2">{key}:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm break-all flex-1">
                    {value}
                  </code>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No parameters found</p>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Expected Parameters:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>token</strong> or <strong>token_hash</strong>: The recovery token from the email</li>
            <li><strong>type</strong>: Should be "recovery" for password reset</li>
          </ul>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Request a password reset from the forgot password page</li>
            <li>Check your email for the reset link</li>
            <li>Instead of clicking the link, copy it and paste the URL here by changing /reset-password to /test-reset</li>
            <li>This will show you exactly what parameters Supabase is sending</li>
          </ol>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This is a test page to debug the password reset flow. 
            Once we identify the correct parameters, we can update the reset-password page accordingly.
          </p>
        </div>
      </div>
    </div>
  );
}