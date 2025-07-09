import { useState, useEffect } from 'react';
import { ImpersonationSession } from '@/types/impersonation';
import toast from 'react-hot-toast';

export function useImpersonation() {
  const [impersonationSession, setImpersonationSession] = useState<ImpersonationSession>({
    isImpersonating: false
  });
  const [loading, setLoading] = useState(false);

  // Check for impersonation session on mount
  useEffect(() => {
    checkImpersonationSession();
  }, []);

  const checkImpersonationSession = async () => {
    try {
      // Check if we have an impersonation session cookie
      const response = await fetch('/api/auth/impersonate/session', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.isImpersonating) {
          setImpersonationSession(sessionData);
        }
      }
    } catch (error) {
      console.error('Error checking impersonation session:', error);
    }
  };

  const startImpersonation = async (customerId: string): Promise<boolean> => {
    setLoading(true);
    try {
      // Call admin impersonation API
      const response = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success && result.redirectUrl) {
        // Redirect to the impersonation endpoint
        window.location.href = result.redirectUrl;
        return true;
      } else {
        toast.error(result.error || 'Failed to start impersonation');
        return false;
      }
    } catch (error) {
      console.error('Error starting impersonation:', error);
      toast.error('Failed to start impersonation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const stopImpersonation = async (): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/impersonate/stop', {
        method: 'POST',
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        setImpersonationSession({ isImpersonating: false });
        
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        }
        
        toast.success('Impersonation ended');
        return true;
      } else {
        toast.error(result.error || 'Failed to stop impersonation');
        return false;
      }
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      toast.error('Failed to stop impersonation');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const canImpersonate = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/admin/impersonate', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        return result.canImpersonate || false;
      }
      return false;
    } catch (error) {
      console.error('Error checking impersonation permissions:', error);
      return false;
    }
  };

  return {
    impersonationSession,
    loading,
    startImpersonation,
    stopImpersonation,
    canImpersonate,
    refreshSession: checkImpersonationSession
  };
}