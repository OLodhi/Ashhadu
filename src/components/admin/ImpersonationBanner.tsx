'use client';

import React from 'react';
import { useImpersonation } from '@/hooks/useImpersonation';
import { X, User, Shield } from 'lucide-react';

export function ImpersonationBanner() {
  const { impersonationSession, stopImpersonation, loading } = useImpersonation();

  if (!impersonationSession.isImpersonating || !impersonationSession.impersonatedCustomer) {
    return null;
  }

  const { impersonatedCustomer } = impersonationSession;

  const handleStopImpersonation = async () => {
    await stopImpersonation();
  };

  const bannerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%)',
    borderBottom: '2px solid #b8860b',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1a1a1a'
  };

  const contentStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '1200px',
    width: '100%',
    justifyContent: 'space-between'
  };

  const leftSideStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const iconStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    color: '#1a1a1a'
  };

  const textStyle: React.CSSProperties = {
    color: '#1a1a1a',
    fontSize: '14px',
    fontWeight: 'bold'
  };

  const buttonStyle: React.CSSProperties = {
    background: 'rgba(26, 26, 26, 0.1)',
    border: '1px solid rgba(26, 26, 26, 0.2)',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.6 : 1
  };

  return (
    <div style={bannerStyle}>
      <div style={contentStyle}>
        <div style={leftSideStyle}>
          <Shield style={iconStyle} />
          <span style={textStyle}>
            Admin Impersonation Active
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '8px' }}>
            <User style={{ width: '16px', height: '16px' }} />
            <span style={{ fontSize: '13px', fontWeight: 'normal' }}>
              Viewing as: <strong>{impersonatedCustomer.fullName}</strong> ({impersonatedCustomer.email})
            </span>
          </div>
        </div>
        
        <button
          onClick={handleStopImpersonation}
          disabled={loading}
          style={buttonStyle}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = 'rgba(26, 26, 26, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.background = 'rgba(26, 26, 26, 0.1)';
            }
          }}
        >
          <X style={{ width: '14px', height: '14px' }} />
          {loading ? 'Ending...' : 'End Impersonation'}
        </button>
      </div>
    </div>
  );
}

// Higher-order component to add top padding when impersonation is active
export function withImpersonationPadding<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function ImpersonationPaddedComponent(props: T) {
    const { impersonationSession } = useImpersonation();
    
    const containerStyle: React.CSSProperties = {
      paddingTop: impersonationSession.isImpersonating ? '54px' : '0',
      transition: 'padding-top 0.3s ease'
    };

    return (
      <div style={containerStyle}>
        <WrappedComponent {...props} />
      </div>
    );
  };
}