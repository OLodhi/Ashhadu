'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  X, 
  FileText, 
  Plus,
  Trash2,
  Box,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Sun,
  Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Model3DUploadProps, Model3DFormat, Model3DValidation } from '@/types/models';
import { Product3DModel, ProductHDRI } from '@/types/product';
import Model3DViewer from '@/components/models/Model3DViewer';

const showNotification = (message: string, type: 'success' | 'error') => {
  if (type === 'error') {
    toast.error(message);
  } else {
    toast.success(message);
  }
};

// Supported 3D model formats with file extensions
const SUPPORTED_FORMATS: Record<Model3DFormat, string[]> = {
  glb: ['.glb', '.GLB'],
  stl: ['.stl', '.STL'],
  obj: ['.obj', '.OBJ'],
  fbx: ['.fbx', '.FBX'],
  dae: ['.dae', '.DAE', '.collada', '.COLLADA'],
  ply: ['.ply', '.PLY']
};

// Supported HDRI formats with file extensions
const SUPPORTED_HDRI_FORMATS = {
  hdr: ['.hdr', '.HDR'],
  exr: ['.exr', '.EXR'],
  hdri: ['.hdri', '.HDRI'],
  pic: ['.pic', '.PIC']
};

// Get all supported file extensions (3D models + HDRI)
const getAllSupportedExtensions = (): string[] => {
  return [...Object.values(SUPPORTED_FORMATS).flat(), ...Object.values(SUPPORTED_HDRI_FORMATS).flat()];
};

// Get all supported HDRI extensions
const getAllSupportedHDRIExtensions = (): string[] => {
  return Object.values(SUPPORTED_HDRI_FORMATS).flat();
};

// Validate HDRI file
const validateHDRIFile = (file: File): { isValid: boolean; errors: string[]; warnings: string[] } => {
  const validation = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[]
  };

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isValidHDRI = Object.values(SUPPORTED_HDRI_FORMATS).flat().some(ext => ext.toLowerCase() === fileExtension);

  if (!isValidHDRI) {
    validation.isValid = false;
    validation.errors.push(`Unsupported HDRI format: ${fileExtension}`);
  }

  // Check file size (100MB limit for HDRI)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (file.size > maxSize) {
    validation.isValid = false;
    validation.errors.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 100MB limit`);
  }

  // Warnings for large files
  if (file.size > 50 * 1024 * 1024) { // 50MB
    validation.warnings.push(`Large HDRI file (${(file.size / 1024 / 1024).toFixed(1)}MB) may impact loading times`);
  }

  return validation;
};

// Validate 3D model file
const validateModel3DFile = (file: File): Model3DValidation => {
  const validation: Model3DValidation = {
    isValid: true,
    format: null,
    fileSize: file.size,
    errors: [],
    warnings: []
  };

  // Check file extension
  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  let detectedFormat: Model3DFormat | null = null;

  for (const [format, extensions] of Object.entries(SUPPORTED_FORMATS)) {
    if (extensions.some(ext => ext.toLowerCase() === fileExtension)) {
      detectedFormat = format as Model3DFormat;
      break;
    }
  }

  if (!detectedFormat) {
    validation.isValid = false;
    validation.errors.push(`Unsupported file format: ${fileExtension}`);
  } else {
    validation.format = detectedFormat;
  }

  // Check file size (50MB limit for 3D models)
  const maxSize = 50 * 1024 * 1024; // 50MB
  if (file.size > maxSize) {
    validation.isValid = false;
    validation.errors.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds 50MB limit`);
  }

  // Warnings for large files
  if (file.size > 10 * 1024 * 1024) { // 10MB
    validation.warnings.push(`Large file size (${(file.size / 1024 / 1024).toFixed(1)}MB) may impact loading times`);
  }

  // Format-specific warnings
  if (detectedFormat === 'stl') {
    validation.warnings.push('STL files don\'t support materials or textures');
  } else if (detectedFormat === 'obj') {
    validation.warnings.push('OBJ files may require separate material (.mtl) files');
  }

  return validation;
};

const Model3DUpload: React.FC<Model3DUploadProps> = ({
  models = [],
  onModelsChange,
  maxModels = 3,
  maxFileSize = 50, // 50MB default
  className = '',
  showFeaturedToggle = true,
  featuredModel,
  onFeaturedModelChange,
  // HDRI Support
  enableHdriUpload = false,
  hdriFiles = [],
  onHdriFilesChange,
  maxHdriFiles = 2,
  defaultHdri,
  onDefaultHdriChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewModel, setPreviewModel] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'models' | 'hdri'>('models');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hdriInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxModels - models.length;
    if (files.length > remainingSlots) {
      showNotification(`You can only upload ${remainingSlots} more 3D model(s)`, 'error');
      return;
    }

    uploadFiles(Array.from(files));
  };

  const uploadFiles = async (files: File[]) => {
    setUploading(true);
    const newModels: Product3DModel[] = [];

    try {
      for (const file of files) {
        // Validate file
        const validation = validateModel3DFile(file);
        
        if (!validation.isValid) {
          showNotification(`${file.name}: ${validation.errors.join(', ')}`, 'error');
          continue;
        }

        // Show warnings
        if (validation.warnings.length > 0) {
          validation.warnings.forEach(warning => {
            toast(`${file.name}: ${warning}`, { icon: '⚠️' });
          });
        }

        try {
          // Upload to Supabase storage via API
          const formData = new FormData();
          formData.append('file', file);
          formData.append('bucket', '3d-models');
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
            const newModel: Product3DModel = {
              id: crypto.randomUUID(),
              url: result.data.url,
              filename: file.name,
              fileType: '3dModel',
              format: validation.format!,
              fileSize: file.size,
              featured: models.length === 0 && newModels.length === 0, // First model is featured
              title: file.name.split('.')[0], // Remove extension for title
              description: '',
              sortOrder: models.length + newModels.length,
              uploadedAt: new Date().toISOString()
            };

            newModels.push(newModel);
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

      const updatedModels = [...models, ...newModels];
      onModelsChange(updatedModels);

      // Set first uploaded model as featured if none is set
      if (!featuredModel && newModels.length > 0 && onFeaturedModelChange) {
        onFeaturedModelChange(newModels[0].id);
      }

      showNotification(`${newModels.length} 3D model(s) uploaded successfully`, 'success');
    } catch (error) {
      showNotification('Failed to upload 3D models', 'error');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeModel = (index: number) => {
    const modelToRemove = models[index];
    const updatedModels = models.filter((_, i) => i !== index);
    onModelsChange(updatedModels);

    // If removed model was featured, set first remaining model as featured
    if (featuredModel === modelToRemove.id && onFeaturedModelChange) {
      if (updatedModels.length > 0) {
        onFeaturedModelChange(updatedModels[0].id);
      } else {
        onFeaturedModelChange('');
      }
    }

    showNotification('3D model removed', 'success');
  };

  const setFeaturedModel = (modelId: string) => {
    if (onFeaturedModelChange) {
      onFeaturedModelChange(modelId);
      showNotification('Featured 3D model updated', 'success');
    }
  };

  const togglePreview = (modelUrl: string) => {
    setPreviewModel(previewModel === modelUrl ? null : modelUrl);
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

  const getSupportedFormatsText = () => {
    return Object.keys(SUPPORTED_FORMATS).map(format => format.toUpperCase()).join(', ');
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
            : models.length >= maxModels
            ? 'border-luxury-gray-200 bg-luxury-gray-50 cursor-not-allowed'
            : 'border-luxury-gray-300 hover:border-luxury-gold hover:bg-luxury-gold/5'
        }`}
        onClick={() => {
          if (models.length < maxModels) {
            openFileDialog();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={getAllSupportedExtensions().join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading || models.length >= maxModels}
        />

        {uploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center">
              <Upload className="h-6 w-6 text-luxury-gold animate-pulse" />
            </div>
            <p className="text-luxury-gray-600">Uploading 3D models...</p>
          </div>
        ) : models.length >= maxModels ? (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-luxury-gray-200 rounded-full flex items-center justify-center">
              <Box className="h-6 w-6 text-luxury-gray-400" />
            </div>
            <p className="text-luxury-gray-500">Maximum {maxModels} 3D models reached</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center">
              <Box className="h-6 w-6 text-luxury-gold" />
            </div>
            <div>
              <p className="text-luxury-black font-medium">
                Drop 3D models here or click to upload
              </p>
              <p className="text-sm text-luxury-gray-500 mt-1">
                {getSupportedFormatsText()} up to {maxFileSize}MB ({models.length}/{maxModels})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Model Preview Grid */}
      {models.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-luxury-black">
            3D Models ({models.length}/{maxModels})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map((model, index) => (
              <div
                key={model.id}
                className={`relative group bg-white rounded-lg border-2 transition-colors overflow-hidden ${
                  showFeaturedToggle && featuredModel === model.id
                    ? 'border-luxury-gold'
                    : 'border-luxury-gray-200'
                }`}
              >
                {/* Model Info Header */}
                <div className="p-4 border-b border-luxury-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-luxury-gray-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-luxury-black truncate">
                          {model.filename}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-luxury-gray-500">
                        <span className="uppercase font-medium">{model.format}</span>
                        <span>
                          {model.fileSize < 1024 * 1024 
                            ? `${(model.fileSize / 1024).toFixed(0)}KB`
                            : `${(model.fileSize / 1024 / 1024).toFixed(1)}MB`
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      {/* Preview Toggle */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          togglePreview(model.url);
                        }}
                        className="p-1.5 bg-luxury-gray-100 hover:bg-luxury-gray-200 rounded text-luxury-gray-600 transition-colors"
                        title={previewModel === model.url ? 'Hide preview' : 'Show preview'}
                      >
                        {previewModel === model.url ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </button>


                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeModel(index);
                        }}
                        className="p-1.5 bg-red-100 hover:bg-red-200 rounded text-red-600 transition-colors"
                        title="Remove model"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3D Model Preview */}
                {previewModel === model.url && (
                  <div className="h-64 bg-gradient-to-br from-gray-900 to-black">
                    <Model3DViewer
                      modelUrl={model.url}
                      format={model.format}
                      showControls={true}
                      autoRotate={true}
                      className="w-full h-full"
                    />
                  </div>
                )}

                {/* Featured Badge */}
              </div>
            ))}
            
            {/* Add More Button */}
            {models.length < maxModels && (
              <div
                onClick={() => openFileDialog()}
                className={`h-32 border-2 border-dashed border-luxury-gray-300 rounded-lg flex flex-col items-center justify-center space-y-2 text-luxury-gray-500 hover:border-luxury-gold hover:text-luxury-gold transition-colors cursor-pointer ${
                  uploading ? 'cursor-not-allowed opacity-50' : ''
                }`}
              >
                <Plus className="h-6 w-6" />
                <span className="text-sm font-medium">Add 3D Model</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-luxury-gray-500 space-y-1">
        <p>• Supported formats: {getSupportedFormatsText()}</p>
        <p>• Maximum file size: {maxFileSize}MB per model</p>
        <p>• Recommended: GLB format for best performance and compatibility</p>
        <p>• STL files: No materials/textures supported</p>
        <p>• OBJ files: May require separate .mtl material files</p>
        {showFeaturedToggle && (
          <p>• The featured model will be used as the main 3D visualization</p>
        )}
      </div>
    </div>
  );
};

export default Model3DUpload;