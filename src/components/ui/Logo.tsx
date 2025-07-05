'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  textColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  textColor = 'text-luxury-black',
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Islamic Geometric Icon */}
      <div className="relative">
        <svg 
          width={size === 'sm' ? '28' : size === 'md' ? '32' : '36'} 
          height={size === 'sm' ? '28' : size === 'md' ? '32' : '36'} 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-luxury-gold"
        >
          {/* Outer Star */}
          <path 
            d="M20 2l5.878 12.122L38 16l-12.122 1.878L24 30l-4-12.122L8 16l12.122-1.878L20 2z" 
            fill="currentColor"
          />
          {/* Inner Islamic Pattern */}
          <path 
            d="M20 8l3.5 7.5L31 17l-7.5 1.5L22 26l-2-7.5L13 17l7.5-1.5L20 8z" 
            fill="white"
          />
          {/* Center Dot */}
          <circle cx="20" cy="20" r="2" fill="currentColor" />
        </svg>
      </div>
      
      {/* Brand Text */}
      <div className="flex flex-col">
        <span className={cn(
          'font-playfair font-bold leading-none',
          sizeClasses[size],
          textColor
        )}>
          Ashhadu
        </span>
        <span className={cn(
          'font-inter text-xs tracking-wider uppercase',
          size === 'sm' ? 'text-[10px]' : 'text-xs',
          textColor === 'text-luxury-black' ? 'text-luxury-gray-600' : 'text-luxury-gold'
        )}>
          Islamic Art
        </span>
      </div>
    </div>
  );
};

export default Logo;