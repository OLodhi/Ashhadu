'use client';

import React from 'react';
import { Settings, Eye, EyeOff } from 'lucide-react';

interface HDRIBlurControlProps {
  enabled: boolean;
  intensity: number;
  onEnabledChange: (enabled: boolean) => void;
  onIntensityChange: (intensity: number) => void;
  disabled?: boolean;
  className?: string;
}

const HDRIBlurControl: React.FC<HDRIBlurControlProps> = ({
  enabled,
  intensity,
  onEnabledChange,
  onIntensityChange,
  disabled = false,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-luxury-gold" />
          <h3 className="text-lg font-semibold text-luxury-black">Background Blur</h3>
        </div>
        
        <button
          type="button"
          onClick={() => onEnabledChange(!enabled)}
          disabled={disabled}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
            enabled
              ? 'bg-luxury-gold text-luxury-black'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {enabled ? (
            <>
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">Enabled</span>
            </>
          ) : (
            <>
              <EyeOff className="h-4 w-4" />
              <span className="text-sm font-medium">Disabled</span>
            </>
          )}
        </button>
      </div>

      {/* Blur Intensity Slider */}
      <div className={`space-y-3 ${!enabled ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-luxury-black">
            Blur Intensity
          </label>
          <span className="text-sm text-luxury-gray-600">
            {intensity}/10
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="0"
            max="10"
            step="1"
            value={intensity}
            onChange={(e) => onIntensityChange(parseInt(e.target.value))}
            disabled={disabled || !enabled}
            className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${
              disabled || !enabled ? 'cursor-not-allowed' : ''
            }`}
            style={{
              background: enabled ? `linear-gradient(to right, #d4af37 0%, #d4af37 ${intensity * 10}%, #e5e7eb ${intensity * 10}%, #e5e7eb 100%)` : '#e5e7eb'
            }}
          />
          <div className="flex justify-between text-xs text-luxury-gray-500 mt-1">
            <span>No Blur</span>
            <span>Light</span>
            <span>Medium</span>
            <span>Heavy</span>
            <span>Maximum</span>
          </div>
        </div>
      </div>

      {/* Blur Description */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Background Blur Effect:</p>
          <p>
            {intensity === 0 && 'No blur - HDRI background is fully sharp'}
            {intensity >= 1 && intensity <= 3 && 'Light blur - Subtle softening of background details'}
            {intensity >= 4 && intensity <= 6 && 'Medium blur - Balanced focus on 3D model with soft background'}
            {intensity >= 7 && intensity <= 9 && 'Heavy blur - Strong focus on model, heavily blurred background'}
            {intensity === 10 && 'Maximum blur - Almost solid color background effect'}
          </p>
        </div>
      </div>

      {/* Preview Hint */}
      {enabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">💡 Preview Tip:</p>
            <p>
              The blur effect will be visible in the 3D model viewer. 
              Use the preview to test different blur levels before publishing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HDRIBlurControl;