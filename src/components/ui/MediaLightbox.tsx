'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Model3DViewer from '@/components/models/Model3DViewer';
import { Product3DModel } from '@/types/product';
import { Model3DFormat } from '@/types/models';

interface MediaItem {
  type: 'image' | '3d';
  url: string;
  alt?: string;
  format?: Model3DFormat; // For 3D models
  model?: Product3DModel; // Full model data for 3D items
}

interface MediaLightboxProps {
  mediaItems: MediaItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  // HDRI Environment Data
  hdriUrl?: string;
  hdriIntensity?: number;
  enableHdri?: boolean;
  backgroundBlur?: number;
}

export default function MediaLightbox({
  mediaItems,
  initialIndex,
  isOpen,
  onClose,
  productName,
  // HDRI Environment Data
  hdriUrl,
  hdriIntensity = 1.0,
  enableHdri = true,
  backgroundBlur = 0
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Update current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Handle ESC key to close lightbox
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    } else if (event.key === 'ArrowLeft') {
      goToPrevious();
    } else if (event.key === 'ArrowRight') {
      goToNext();
    }
  }, [onClose]);

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  };

  const currentItem = mediaItems[currentIndex];

  if (!isOpen || !currentItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Previous media"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                aria-label="Next media"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Media Content */}
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.type === 'image' ? (
              // Image Display
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src={currentItem.url}
                  alt={currentItem.alt || `${productName} - Image ${currentIndex + 1}`}
                  className="object-contain max-w-full max-h-full"
                  width={1200}
                  height={1200}
                  quality={95}
                  priority
                />
              </div>
            ) : (
              // 3D Model Display
              <div className="w-full h-full min-h-[500px] bg-gradient-to-br from-gray-900 to-black rounded-lg overflow-hidden">
                <Model3DViewer
                  modelUrl={currentItem.url}
                  format={currentItem.format || 'obj' as Model3DFormat}
                  showControls={true}
                  autoRotate={false}
                  enableZoom={true}
                  enablePan={true}
                  className="w-full h-full"
                  // ✨ HDRI Environment Support - Use Product's HDRI Data
                  hdriUrl={hdriUrl}
                  hdriIntensity={hdriIntensity}
                  enableHdri={enableHdri && !!hdriUrl}
                  backgroundBlur={backgroundBlur}
                />
                
                {/* 3D Model Info Overlay */}
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-medium">3D Model</span>
                    <span className="text-xs text-gray-300">
                      {currentItem.format?.toUpperCase()} • Click & drag to rotate
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Media Counter */}
          {mediaItems.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {mediaItems.length}
            </div>
          )}

          {/* Thumbnail Navigation */}
          {mediaItems.length > 1 && (
            <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-[90vw] overflow-x-auto">
              {mediaItems.map((item, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(index);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentIndex
                      ? 'border-white'
                      : 'border-transparent hover:border-white/50'
                  }`}
                >
                  {item.type === 'image' ? (
                    <Image
                      src={item.url}
                      alt={`Thumbnail ${index + 1}`}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <Package className="w-4 h-4 text-white mx-auto mb-1" />
                        <div className="text-white text-xs">{item.format?.toUpperCase()}</div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}