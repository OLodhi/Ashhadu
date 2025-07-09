'use client';

import { useState } from 'react';
import { Share2, Check, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareButtonProps {
  productId: string;
  productName: string;
  productPrice: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button' | 'text';
  showText?: boolean;
  className?: string;
}

export default function ShareButton({
  productId,
  productName,
  productPrice,
  size = 'medium',
  variant = 'icon',
  showText = false,
  className = ''
}: ShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const handleShare = async () => {
    if (isSharing) return;

    setIsSharing(true);
    
    try {
      const productUrl = `${window.location.origin}/products/${productId}`;
      const shareData = {
        title: `${productName} - Ashhadu Islamic Art`,
        text: `Check out this beautiful Islamic art piece: ${productName} for ${productPrice}`,
        url: productUrl,
      };

      // Check if Web Share API is supported (typically on mobile)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(productUrl);
        setJustCopied(true);
        toast.success('Product link copied to clipboard!');
        
        // Reset the "copied" state after 2 seconds
        setTimeout(() => {
          setJustCopied(false);
        }, 2000);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        // AbortError occurs when user cancels the share dialog, don't show error for that
        console.error('Error sharing:', error);
        toast.error('Failed to share product');
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Size configurations
  const sizeConfig = {
    small: {
      icon: 'h-4 w-4',
      button: 'p-2',
      text: 'text-sm'
    },
    medium: {
      icon: 'h-5 w-5',
      button: 'p-2.5',
      text: 'text-base'
    },
    large: {
      icon: 'h-6 w-6',
      button: 'p-3',
      text: 'text-lg'
    }
  };

  const sizes = sizeConfig[size];

  // Variant configurations
  const baseClasses = `
    inline-flex items-center justify-center
    rounded-full transition-all duration-200
    ${sizes.button}
    ${className}
  `;

  const getVariantClasses = () => {
    switch (variant) {
      case 'icon':
        return `
          ${baseClasses}
          border-2 backdrop-blur-sm
          ${justCopied
            ? 'bg-green-500 border-green-500 text-white'
            : 'bg-white/80 border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500'
          }
          ${isSharing ? 'animate-pulse' : ''}
        `;
      
      case 'button':
        return `
          ${baseClasses}
          rounded-lg border-2 space-x-2
          ${justCopied
            ? 'bg-green-500 border-green-500 text-white'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-500'
          }
          ${isSharing ? 'animate-pulse' : ''}
        `;
      
      case 'text':
        return `
          ${baseClasses}
          bg-transparent border-none rounded-none space-x-2
          ${justCopied
            ? 'text-green-500'
            : 'text-gray-600 hover:text-blue-500'
          }
          ${isSharing ? 'animate-pulse' : ''}
        `;
      
      default:
        return baseClasses;
    }
  };

  const getButtonText = () => {
    if (isSharing) return 'Sharing...';
    if (justCopied) return 'Copied!';
    return 'Share';
  };

  const getIcon = () => {
    if (justCopied) {
      return <Check className={`${sizes.icon} transition-all duration-200`} />;
    }
    if (isSharing) {
      return <Share2 className={`${sizes.icon} animate-pulse transition-all duration-200`} />;
    }
    return <Share2 className={`${sizes.icon} transition-all duration-200`} />;
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={getVariantClasses()}
      title={getButtonText()}
      aria-label={getButtonText()}
    >
      {getIcon()}
      
      {showText && (
        <span className={`${sizes.text} font-medium`}>
          {variant === 'text' ? getButtonText() : (justCopied ? 'Copied!' : 'Share')}
        </span>
      )}
    </button>
  );
}