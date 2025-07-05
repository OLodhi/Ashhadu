'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface SafeLinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: React.ReactNode;
  forceReload?: boolean;
}

/**
 * SafeLink component that ensures proper navigation between pages with different styles.
 * It can force a hard navigation when needed to avoid hydration issues.
 */
export default function SafeLink({ 
  href, 
  children, 
  forceReload = false,
  onClick,
  ...props 
}: SafeLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Call any custom onClick handler
    if (onClick) {
      onClick(e);
    }

    // If not forcing reload and not an external link, use Next.js navigation
    if (!forceReload && href.startsWith('/')) {
      e.preventDefault();
      router.push(href);
    }
    // For external links or forced reload, let the browser handle it
  };

  return (
    <a 
      href={href} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}