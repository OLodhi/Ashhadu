'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus,
  Trash2,
  Camera,
  FileImage
} from 'lucide-react';
import toast from 'react-hot-toast';

const showNotification = (message: string, type: 'success' | 'error') => {
  if (type === 'error') {
    toast.error(message);
  } else {
    toast.success(message);
  }
};

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  className?: string;
  showFeaturedToggle?: boolean;
  featuredImage?: string;
  onFeaturedImageChange?: (image: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images = [],
  onImagesChange,
  maxImages = 5,
  aspectRatio = 'square',
  className = '',
  showFeaturedToggle = true,
  featuredImage,
  onFeaturedImageChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      showNotification(`You can only upload ${remainingSlots} more image(s)`, 'error');
      return;
    }

    uploadFiles(Array.from(files));
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    const newImages: string[] = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          showNotification(`${file.name} is not an image file`, 'error');
          continue;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          showNotification(`${file.name} is too large. Maximum size is 5MB`, 'error');
          continue;
        }

        try {
          // Upload to Supabase storage via API
          const formData = new FormData();
          formData.append('file', file);
          formData.append('bucket', 'product-images');
          formData.append('folder', 'products');

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            showNotification(`Failed to upload ${file.name}: ${errorData.error}`, 'error');
            continue;
          }

          const result = await response.json();
          
          if (result.success && result.data.url) {
            newImages.push(result.data.url);
          } else {
            showNotification(`Failed to upload ${file.name}`, 'error');
            continue;
          }
        } catch (uploadError) {
          console.error('Error uploading file:', uploadError);
          showNotification(`Failed to upload ${file.name}`, 'error');
          continue;
        }
      }

      const updatedImages = [...images, ...newImages];
      onImagesChange(updatedImages);

      // Set first uploaded image as featured if none is set
      if (!featuredImage && newImages.length > 0 && onFeaturedImageChange) {
        onFeaturedImageChange(newImages[0]);
      }

      showNotification(`${newImages.length} image(s) uploaded successfully`, 'success');
    } catch (error) {
      showNotification('Failed to upload images', 'error');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange(updatedImages);

    // If removed image was featured, set first remaining image as featured
    if (featuredImage === imageToRemove && onFeaturedImageChange) {
      if (updatedImages.length > 0) {
        onFeaturedImageChange(updatedImages[0]);
      } else {
        onFeaturedImageChange('');
      }
    }

    // Clean up object URL to prevent memory leaks (for old object URLs)
    if (imageToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove);
    }

    // Note: For production, you might want to delete the file from storage
    // when the user removes it, but for now we'll keep files in storage
    // since they might be referenced elsewhere

    showNotification('Image removed', 'success');
  };

  const setFeaturedImage = (image: string) => {
    if (onFeaturedImageChange) {
      onFeaturedImageChange(image);
      showNotification('Featured image updated', 'success');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragOver
            ? 'border-luxury-gold bg-luxury-gold/5'
            : images.length >= maxImages
            ? 'border-luxury-gray-200 bg-luxury-gray-50 cursor-not-allowed'
            : 'border-luxury-gray-300 hover:border-luxury-gold hover:bg-luxury-gold/5'
        }`}
        onClick={() => {
          if (images.length < maxImages) {
            openFileDialog();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading || images.length >= maxImages}
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-luxury-gold animate-pulse" />
            </div>
            <p className="text-luxury-gray-600">Uploading images...</p>
          </div>
        ) : images.length >= maxImages ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-luxury-gray-200 rounded-full flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-luxury-gray-400" />
            </div>
            <p className="text-luxury-gray-500">Maximum {maxImages} images reached</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center">
              <Camera className="h-6 w-6 text-luxury-gold" />
            </div>
            <div>
              <p className="text-luxury-black font-medium">
                Drop images here or click to upload
              </p>
              <p className="text-sm text-luxury-gray-500 mt-1">
                PNG, JPG, JPEG up to 5MB ({images.length}/{maxImages})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-luxury-black">
            Product Images ({images.length}/{maxImages})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative group ${getAspectRatioClass()} bg-luxury-gray-50 rounded-lg overflow-hidden border-2 transition-colors ${
                  showFeaturedToggle && featuredImage === image
                    ? 'border-luxury-gold'
                    : 'border-luxury-gray-200'
                }`}
              >
                <Image
                  src={image}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                
                {/* Featured Badge */}
                {showFeaturedToggle && featuredImage === image && (
                  <div className="absolute top-2 left-2 bg-luxury-gold text-luxury-black px-2 py-1 text-xs font-medium rounded">
                    Featured
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  {showFeaturedToggle && featuredImage !== image && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setFeaturedImage(image);
                      }}
                      className="p-2 bg-white/90 hover:bg-white rounded-full text-luxury-black transition-colors"
                      title="Set as featured image"
                    >
                      <FileImage className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="p-2 bg-red-500/90 hover:bg-red-500 rounded-full text-white transition-colors"
                    title="Remove image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add More Button */}
            {images.length < maxImages && (
              <button
                type="button"
                onClick={() => openFileDialog()}
                disabled={uploading}
                className={`${getAspectRatioClass()} border-2 border-dashed border-luxury-gray-300 rounded-lg flex flex-col items-center justify-center space-y-2 text-luxury-gray-500 hover:border-luxury-gold hover:text-luxury-gold transition-colors ${
                  uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">Add Image</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-luxury-gray-500 space-y-1">
        <p>• Recommended image size: 1200x1200 pixels for best quality</p>
        <p>• Supported formats: PNG, JPG, JPEG</p>
        <p>• Maximum file size: 5MB per image</p>
        {showFeaturedToggle && (
          <p>• The featured image will be used as the main product photo</p>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;