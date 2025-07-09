'use client';

import { Star } from 'lucide-react';

interface HollowStarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  showRating?: boolean;
  className?: string;
}

export default function HollowStarRating({
  rating,
  maxRating = 5,
  size = 'medium',
  showRating = false,
  className = ''
}: HollowStarRatingProps) {
  // Ensure rating is within bounds
  const normalizedRating = Math.max(0, Math.min(rating, maxRating));

  // Size configurations
  const sizeConfig = {
    small: {
      star: 'h-3 w-3',
      text: 'text-sm'
    },
    medium: {
      star: 'h-4 w-4',
      text: 'text-base'
    },
    large: {
      star: 'h-5 w-5',
      text: 'text-lg'
    }
  };

  const sizes = sizeConfig[size];

  // Generate stars array
  const stars = Array.from({ length: maxRating }, (_, index) => {
    const starValue = index + 1;
    const fillPercentage = Math.max(0, Math.min(100, (normalizedRating - index) * 100));
    
    return (
      <div key={index} className="relative inline-block">
        {/* Background (hollow) star */}
        <Star
          className={`${sizes.star} text-luxury-gray-300 stroke-current fill-none`}
        />
        
        {/* Foreground (filled) star with clipping for partial fills */}
        {fillPercentage > 0 && (
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${fillPercentage}%` }}
          >
            <Star
              className={`${sizes.star} text-luxury-gold stroke-current fill-current`}
            />
          </div>
        )}
      </div>
    );
  });

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex items-center">
        {stars}
      </div>
      
      {showRating && (
        <span className={`${sizes.text} text-luxury-gray-600 ml-2`}>
          {normalizedRating > 0 ? normalizedRating.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
}