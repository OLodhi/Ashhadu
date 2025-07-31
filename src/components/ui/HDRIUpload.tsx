'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Sun, Upload, X, AlertTriangle, CheckCircle, Eye, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { ProductHDRI } from '@/types/product';

interface HDRIUploadProps {
  value?: ProductHDRI | null;
  onChange: (hdri: ProductHDRI | null) => void;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
}

const HDRIUpload: React.FC<HDRIUploadProps> = ({
  value,
  onChange,
  maxFiles = 1,
  disabled = false,
  className = '',
  showPreview = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Validate HDRI file for internal use
  const validateHDRIFile = useCallback((file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check file extension (HDR formats)
    const fileName = file.name.toLowerCase();
    const supportedExtensions = ['.hdr', '.hdri', '.exr'];
    const hasValidExtension = supportedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push(`Unsupported format. Use: ${supportedExtensions.join(', ')}`);
    }
    
    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      errors.push(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 100MB`);
    }
    
    // Check minimum file size (1KB to avoid empty files)
    if (file.size < 1024) {
      errors.push('File too small. Minimum size: 1KB');
    }
    
    return { isValid: errors.length === 0, errors };
  }, []);

  // Validator function for react-dropzone (must return FileError | FileError[] | null)
  const dropzoneValidator = useCallback((file: File) => {
    const validation = validateHDRIFile(file);
    
    if (!validation.isValid) {
      // Return the first error as a FileError object
      return {
        code: 'validation-error',
        message: validation.errors[0]
      };
    }
    
    return null; // No errors
  }, [validateHDRIFile]);

  // Upload HDRI file
  const uploadHDRIFile = useCallback(async (file: File) => {
    const validation = validateHDRIFile(file);
    
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'hdri-files');
      formData.append('folder', 'product-hdris');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && result.data?.url) {
        const newHDRI: ProductHDRI = {
          id: crypto.randomUUID(),
          url: result.data.url,
          filename: file.name,
          fileSize: file.size,
          intensity: 1.0, // Default intensity
          isDefault: false, // Not default by default
          uploadedAt: new Date().toISOString()
        };
        
        console.log('🎯 HDRI uploaded successfully:', newHDRI);
        onChange(newHDRI);
        toast.success(`HDRI uploaded: ${file.name}`);
      } else {
        toast.error(`Upload failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('HDRI upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  }, [validateHDRIFile, onChange]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        toast.error(`${file.name}: ${error.message}`);
      });
    });

    // Upload first accepted file
    if (acceptedFiles.length > 0) {
      uploadHDRIFile(acceptedFiles[0]);
    }
  }, [uploadHDRIFile]);

  // Configure dropzone
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'image/x-hdr': ['.hdr'],
      'image/vnd.radiance': ['.hdri'],
      'image/x-exr': ['.exr'],
      'application/octet-stream': ['.hdr', '.hdri', '.exr']
    },
    maxFiles,
    disabled: disabled || uploading,
    validator: dropzoneValidator
  });

  // Remove HDRI
  const removeHDRI = useCallback(() => {
    onChange(null);
    toast.success('HDRI removed');
  }, [onChange]);

  // Copy URL to clipboard
  const copyToClipboard = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('HDRI URL copied to clipboard!');
  }, []);

  // Get dropzone styles
  const getDropzoneStyle = () => {
    let baseStyle = 'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ';
    
    if (disabled || uploading) {
      baseStyle += 'bg-gray-100 border-gray-300 cursor-not-allowed ';
    } else if (isDragAccept) {
      baseStyle += 'border-green-500 bg-green-50 ';
    } else if (isDragReject) {
      baseStyle += 'border-red-500 bg-red-50 ';
    } else if (isDragActive) {
      baseStyle += 'border-luxury-gold bg-luxury-gold/5 ';
    } else {
      baseStyle += 'border-gray-300 hover:border-luxury-gold hover:bg-luxury-gold/5 ';
    }
    
    return baseStyle;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={getDropzoneStyle()}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-luxury-gold animate-pulse" />
            </div>
            <p className="text-luxury-gray-600">Uploading HDRI...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center">
              <Sun className="h-6 w-6 text-luxury-gold" />
            </div>
            <div>
              <p className="text-luxury-black font-medium">
                {isDragActive
                  ? isDragAccept
                    ? 'Drop HDRI file here'
                    : 'Invalid file type'
                  : 'Drop HDRI file here or click to upload'
                }
              </p>
              <p className="text-sm text-luxury-gray-500 mt-1">
                Supports HDR, HDRI, EXR formats up to 100MB
              </p>
            </div>
            {isDragReject && (
              <div className="flex items-center justify-center space-x-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Invalid file format</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Uploaded HDRI Display */}
      {value && (
        <div className="bg-gray-50 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-luxury-gold to-yellow-600 rounded-lg flex items-center justify-center">
                <Sun className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-luxury-black">{value.filename}</p>
                <p className="text-sm text-luxury-gray-500">
                  {value.fileSize < 1024 * 1024 
                    ? `${(value.fileSize / 1024).toFixed(0)}KB`
                    : `${(value.fileSize / 1024 / 1024).toFixed(1)}MB`
                  }
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {showPreview && (
                <button
                  type="button"
                  onClick={() => window.open(value.url, '_blank')}
                  className="p-2 text-luxury-gray-600 hover:text-luxury-gold transition-colors"
                  title="Preview HDRI"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => copyToClipboard(value.url)}
                className="px-3 py-1 bg-luxury-gold text-luxury-black text-sm rounded hover:bg-luxury-gold/80 transition-colors"
              >
                Copy URL
              </button>
              <button
                type="button"
                onClick={removeHDRI}
                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                title="Remove HDRI"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">HDRI Guidelines:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use HDR format for best compatibility</li>
              <li>Recommended resolution: 2K-4K for web use</li>
              <li>Professional HDRI environments work best for Islamic art</li>
              <li>Test with your 3D models before publishing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HDRIUpload;