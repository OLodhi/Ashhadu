'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Eye, Box, RotateCcw, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { SETTING_KEYS } from '@/types/settings';
import Model3DViewer from '@/components/models/Model3DViewer';
import toast from 'react-hot-toast';

const ACCEPTED_FORMATS = ['.glb', '.stl', '.obj', '.ply'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function Showcase3DSettings() {
  const { getSetting, updateSetting, refreshSettings } = useSettings();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current settings
  const isEnabled = getSetting(SETTING_KEYS.SHOWCASE_3D_MODEL_ENABLED) || false;
  const modelUrl = getSetting(SETTING_KEYS.SHOWCASE_3D_MODEL_URL) || '';
  const modelFormat = getSetting(SETTING_KEYS.SHOWCASE_3D_MODEL_FORMAT) || 'glb';
  const rotationSpeed = getSetting(SETTING_KEYS.SHOWCASE_3D_ROTATION_SPEED) || 1.0;
  const title = getSetting(SETTING_KEYS.SHOWCASE_3D_TITLE) || 'Featured Islamic Art';
  const description = getSetting(SETTING_KEYS.SHOWCASE_3D_DESCRIPTION) || 'Experience our artisanal Islamic art in interactive 3D';

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_FORMATS.includes(fileExtension)) {
      toast.error(`Unsupported file format. Please use: ${ACCEPTED_FORMATS.join(', ')}`);
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Maximum size is 50MB.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', '3d-models');
      formData.append('folder', 'showcase');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `Upload failed with status ${response.status}`);
      }
      
      if (result.success) {
        // Update settings with new model
        const modelUrl = result.data?.url || result.url;
        await updateSetting(SETTING_KEYS.SHOWCASE_3D_MODEL_URL, modelUrl);
        await updateSetting(SETTING_KEYS.SHOWCASE_3D_MODEL_FORMAT, fileExtension.substring(1)); // Remove the dot
        
        if (result.data?.warning) {
          toast.success(`3D model uploaded successfully! (${result.data.warning})`);
        } else {
          toast.success('3D model uploaded successfully!');
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading 3D model:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to upload 3D model: ${errorMessage}`);
    } finally {
      setUploading(false);
    }
  }, [updateSetting]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const removeModel = async () => {
    try {
      await updateSetting(SETTING_KEYS.SHOWCASE_3D_MODEL_URL, '');
      await updateSetting(SETTING_KEYS.SHOWCASE_3D_MODEL_FORMAT, 'glb');
      toast.success('3D model removed');
    } catch (error) {
      toast.error('Failed to remove 3D model');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          3D Model Showcase
        </h2>
        <p className="text-sm text-gray-600">
          Configure a 3D model to showcase on your homepage. The model will slowly rotate to give customers an interactive preview of your Islamic art.
        </p>
        
        {/* Debug Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-blue-900">Current Settings:</h4>
            <button
              onClick={refreshSettings}
              className="text-blue-600 hover:text-blue-800 p-1 rounded"
              title="Refresh settings from database"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <div>Enabled: {isEnabled ? 'Yes' : 'No'}</div>
            <div>Model URL: {modelUrl || 'Not set'}</div>
            <div>Format: {modelFormat}</div>
            <div>Rotation Speed: {rotationSpeed}x</div>
          </div>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Enable 3D Showcase</h3>
            <p className="text-sm text-gray-600 mt-1">
              Display a rotating 3D model on the homepage to showcase your products
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => updateSetting(SETTING_KEYS.SHOWCASE_3D_MODEL_ENABLED, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
          </label>
        </div>
      </div>

      {isEnabled && (
        <>
          {/* 3D Model Upload */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">3D Model File</h3>
            
            {!modelUrl ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-luxury-gold bg-luxury-gold/5' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Box className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <div className="text-lg font-medium text-gray-900 mb-2">
                  Upload 3D Model
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop your 3D model file here, or click to browse
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Supports: {ACCEPTED_FORMATS.join(', ')} • Max size: 50MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-luxury-gold hover:bg-luxury-gold/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose File
                    </>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_FORMATS.join(',')}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        3D Model Uploaded
                      </p>
                      <p className="text-xs text-green-600">
                        Format: {modelFormat.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {showPreview ? 'Hide' : 'Preview'}
                    </button>
                    <button
                      type="button"
                      onClick={removeModel}
                      className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </button>
                  </div>
                </div>

                {showPreview && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="h-64">
                      <Model3DViewer
                        modelUrl={modelUrl}
                        format={modelFormat}
                        showControls={false}
                        autoRotate={true}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Configuration Settings */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Showcase Configuration</h3>
            
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Showcase Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => updateSetting(SETTING_KEYS.SHOWCASE_3D_TITLE, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                placeholder="Featured Islamic Art"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Showcase Description
              </label>
              <textarea
                value={description}
                onChange={(e) => updateSetting(SETTING_KEYS.SHOWCASE_3D_DESCRIPTION, e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-transparent"
                placeholder="Experience our artisanal Islamic art in interactive 3D"
              />
            </div>

            {/* Rotation Speed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rotation Speed
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0.2"
                  max="3.0"
                  step="0.1"
                  value={rotationSpeed}
                  onChange={(e) => updateSetting(SETTING_KEYS.SHOWCASE_3D_ROTATION_SPEED, parseFloat(e.target.value))}
                  className="flex-1"
                />
                <div className="text-sm text-gray-600 min-w-[80px]">
                  {rotationSpeed}x {rotationSpeed < 0.7 ? '(Slow)' : rotationSpeed > 1.5 ? '(Fast)' : '(Normal)'}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Adjust how fast the 3D model rotates on the homepage
              </p>
            </div>
          </div>

          {/* Preview Section */}
          {modelUrl && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Homepage Preview</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-2xl font-serif text-gray-900 mb-2">{title}</h4>
                  <p className="text-gray-600">{description}</p>
                </div>
                <div className="h-96 border border-gray-200 rounded-lg">
                  <Model3DViewer
                    modelUrl={modelUrl}
                    format={modelFormat}
                    showControls={false}
                    autoRotate={true}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}