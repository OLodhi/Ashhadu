'use client';

import React, { useState, useRef } from 'react';
import { Upload, Sun, X, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface HDRIFile {
  id: string;
  url: string;
  filename: string;
  fileSize: number;
}

const HDRIUploadTest: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [hdriFiles, setHdriFiles] = useState<HDRIFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateHDRIFile = (file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check file extension (currently only HDR format is supported by Three.js RGBELoader)
    const fileName = file.name.toLowerCase();
    const supportedExtensions = ['.hdr', '.hdri']; // Removed .exr and .pic for now
    const hasValidExtension = supportedExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push(`Unsupported format. Use: ${supportedExtensions.join(', ')}`);
    }
    
    // Check file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      errors.push(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 100MB`);
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const uploadHDRIFile = async (file: File) => {
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
      formData.append('folder', 'test');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && result.data?.url) {
        const newHDRI: HDRIFile = {
          id: crypto.randomUUID(),
          url: result.data.url,
          filename: file.name,
          fileSize: file.size
        };
        
        setHdriFiles(prev => [...prev, newHDRI]);
        toast.success(`HDRI uploaded: ${file.name}`);
      } else {
        toast.error(`Upload failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    Array.from(files).forEach(file => {
      uploadHDRIFile(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeHDRI = (id: string) => {
    setHdriFiles(prev => prev.filter(hdri => hdri.id !== id));
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('HDRI URL copied to clipboard!');
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center space-x-2">
        <Sun className="h-6 w-6 text-luxury-gold" />
        <h2 className="text-xl font-semibold text-luxury-black">HDRI Upload Test</h2>
      </div>
      
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-luxury-gold bg-luxury-gold/5'
            : 'border-gray-300 hover:border-luxury-gold hover:bg-luxury-gold/5'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".hdr,.hdri"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
        
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
              <p className="text-luxury-black font-medium">Drop HDRI files here or click to upload</p>
              <p className="text-sm text-luxury-gray-500 mt-1">
                Supports HDR, HDRI formats up to 100MB (EXR support coming soon)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded HDRIs */}
      {hdriFiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-luxury-black">Uploaded HDRI Files</h3>
          
          <div className="space-y-3">
            {hdriFiles.map((hdri) => (
              <div
                key={hdri.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-luxury-gold to-yellow-600 rounded-lg flex items-center justify-center">
                    <Sun className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-luxury-black">{hdri.filename}</p>
                    <p className="text-sm text-luxury-gray-500">
                      {hdri.fileSize < 1024 * 1024 
                        ? `${(hdri.fileSize / 1024).toFixed(0)}KB`
                        : `${(hdri.fileSize / 1024 / 1024).toFixed(1)}MB`
                      }
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(hdri.url)}
                    className="px-3 py-1 bg-luxury-gold text-luxury-black text-sm rounded hover:bg-luxury-gold/80 transition-colors"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => removeHDRI(hdri.id)}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How to use uploaded HDRI:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Upload your HDRI file above</li>
              <li>Copy the URL from the uploaded file</li>
              <li>Use the URL in your Model3DViewer component:</li>
            </ol>
            <code className="block mt-2 p-2 bg-blue-100 rounded text-xs">
              {`<Model3DViewer hdriUrl="YOUR_COPIED_URL" hdriIntensity={1.2} enableHdri={true} />`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HDRIUploadTest;