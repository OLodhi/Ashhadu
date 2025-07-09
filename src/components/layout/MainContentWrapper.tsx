'use client';

import React from 'react';
import { useImpersonation } from '@/hooks/useImpersonation';

interface MainContentWrapperProps {
  children: React.ReactNode;
}

export function MainContentWrapper({ children }: MainContentWrapperProps) {
  const { impersonationSession } = useImpersonation();
  
  // Calculate top padding based on impersonation state
  // 54px for impersonation banner + 80px for header = 134px total
  const topPadding = impersonationSession.isImpersonating ? 'pt-[134px]' : 'pt-16 lg:pt-20';
  
  return (
    <main id="main-content" className={`${topPadding} transition-all duration-300`}>
      {children}
    </main>
  );
}