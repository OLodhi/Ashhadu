'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { WishlistButtonProps } from '@/types/wishlist';
import toast from 'react-hot-toast';

export default function WishlistButton({
  productId,
  size = 'medium',
  variant = 'icon',
  showText = false,
  className = '',
  onToggle
}: WishlistButtonProps) {
  const { user } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist, loading } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);

  const isInWishlistState = isInWishlist(productId);

  const handleToggle = async () => {
    if (!user) {
      toast.error('Please log in to save items to your wishlist');
      return;
    }

    if (isToggling || loading) return;

    setIsToggling(true);
    
    try {
      if (isInWishlistState) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist(productId);
      }
      
      onToggle?.(productId, !isInWishlistState);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsToggling(false);
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
          ${isInWishlistState
            ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600'
            : 'bg-white/80 border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
          }
          ${isToggling ? 'animate-pulse' : ''}
        `;
      
      case 'button':
        return `
          ${baseClasses}
          rounded-lg border-2 space-x-2
          ${isInWishlistState
            ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-200 hover:text-red-500'
          }
          ${isToggling ? 'animate-pulse' : ''}
        `;
      
      case 'text':
        return `
          ${baseClasses}
          bg-transparent border-none rounded-none space-x-2
          ${isInWishlistState
            ? 'text-red-500 hover:text-red-600'
            : 'text-gray-600 hover:text-red-500'
          }
          ${isToggling ? 'animate-pulse' : ''}
        `;
      
      default:
        return baseClasses;
    }
  };

  const getButtonText = () => {
    if (isToggling) return 'Saving...';
    if (isInWishlistState) return 'Remove from Wishlist';
    return 'Add to Wishlist';
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling || loading}
      className={getVariantClasses()}
      title={getButtonText()}
      aria-label={getButtonText()}
    >
      <Heart
        className={`
          ${sizes.icon}
          ${isInWishlistState ? 'fill-current' : ''}
          ${isToggling ? 'animate-pulse' : ''}
          transition-all duration-200
        `}
      />
      
      {showText && (
        <span className={`${sizes.text} font-medium`}>
          {variant === 'text' ? getButtonText() : (isInWishlistState ? 'Saved' : 'Save')}
        </span>
      )}
    </button>
  );
}