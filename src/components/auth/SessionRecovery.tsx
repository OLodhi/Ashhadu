'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

interface SessionRecoveryProps {
  onRecoveryComplete?: () => void;
  showUI?: boolean;
}

export default function SessionRecovery({ onRecoveryComplete, showUI = true }: SessionRecoveryProps) {
  const { user, loading, error, validateSession, clearError } = useAuth();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [recoveryMessage, setRecoveryMessage] = useState('');

  useEffect(() => {
    // Auto-attempt recovery if there's an error and no user
    if (error && !user && !loading && !isRecovering) {
      attemptRecovery();
    }
  }, [error, user, loading, isRecovering]);

  const attemptRecovery = async () => {
    if (isRecovering) return;
    
    setIsRecovering(true);
    setRecoveryStatus('checking');
    setRecoveryMessage('Attempting to recover session...');
    
    try {
      console.log('🔄 SessionRecovery: Starting recovery process...');
      
      // Clear any existing errors
      clearError();
      
      // Try to validate/refresh the session
      const isValid = await validateSession();
      
      if (isValid) {
        console.log('✅ SessionRecovery: Session recovered successfully');
        setRecoveryStatus('success');
        setRecoveryMessage('Session recovered successfully');
        
        // Wait a bit before calling completion callback
        setTimeout(() => {
          onRecoveryComplete?.();
        }, 1000);
      } else {
        console.log('❌ SessionRecovery: Session recovery failed');
        setRecoveryStatus('failed');
        setRecoveryMessage('Session recovery failed. Please sign in again.');
      }
    } catch (error) {
      console.error('❌ SessionRecovery: Recovery error:', error);
      setRecoveryStatus('failed');
      setRecoveryMessage('Recovery failed due to an error. Please try again.');
    } finally {
      setIsRecovering(false);
      
      // Reset status after a delay
      setTimeout(() => {
        setRecoveryStatus('idle');
        setRecoveryMessage('');
      }, 5000);
    }
  };

  const handleManualRecovery = () => {
    attemptRecovery();
  };

  if (!showUI) {
    return null;
  }

  // Don't show if user is authenticated or still loading
  if (user || loading) {
    return null;
  }

  // Don't show if no error
  if (!error && recoveryStatus === 'idle') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            {recoveryStatus === 'checking' && (
              <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
            )}
            {recoveryStatus === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {recoveryStatus === 'failed' && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            {recoveryStatus === 'idle' && error && (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">
              {recoveryStatus === 'checking' && 'Recovering Session'}
              {recoveryStatus === 'success' && 'Session Recovered'}
              {recoveryStatus === 'failed' && 'Recovery Failed'}
              {recoveryStatus === 'idle' && error && 'Authentication Issue'}
            </div>
            
            <div className="mt-1 text-sm text-gray-500">
              {recoveryMessage || error || 'There was an issue with your session'}
            </div>
            
            {recoveryStatus === 'idle' && error && (
              <div className="mt-3 flex space-x-3">
                <button
                  onClick={handleManualRecovery}
                  disabled={isRecovering}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </button>
                
                <button
                  onClick={clearError}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}