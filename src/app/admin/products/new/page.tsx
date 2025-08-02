'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  X, 
  Upload, 
  Plus, 
  Minus,
  Eye,
  EyeOff
} from 'lucide-react';
// Removed useProductStore - now using API routes
import { ProductCategory, Product, ProductImage, Product3DModel, ProductHDRI } from '@/types/product';
import { toast } from 'react-hot-toast';
import ImageUpload from '@/components/ui/ImageUpload';
import Model3DUpload from '@/components/ui/Model3DUpload';
import HDRIUpload from '@/components/ui/HDRIUpload';

const NewProductPage = () => {
  const router = useRouter();
  // Generate SKU helper function
  const generateSku = (category: string, name: string) => {
    const categoryPrefix = category.split('-')[0].substring(0, 3).toUpperCase();
    const namePrefix = name.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString(36);
    return `${categoryPrefix}-${namePrefix}-${timestamp}`;
  };

  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    description: '',
    shortDescription: '',
    price: 0,
    originalPrice: 0,
    regularPrice: 0,
    currency: 'GBP' as const,
    vatIncluded: true,
    category: 'Islamic Calligraphy' as ProductCategory,
    subcategory: '',
    tags: [] as string[],
    images: [] as any[],
    imageUrls: [] as string[], // Simple array for ImageUpload component
    featuredImage: '',
    models: [] as Product3DModel[],
    has3dModel: false,
    featuredModel: '',
    hdriFiles: [] as ProductHDRI[],
    defaultHdri: '',
    backgroundBlur: 0,
    sku: '',
    stock: 0,
    stockStatus: 'in-stock' as const,
    manageStock: true,
    lowStockThreshold: 5,
    weight: 0,
    material: [] as string[],
    color: [] as string[],
    arabicText: '',
    transliteration: '',
    translation: '',
    historicalContext: '',
    printTime: 0,
    finishingTime: 0,
    difficulty: 'Simple' as const,
    metaTitle: '',
    metaDescription: '',
    featured: false,
    onSale: false,
    status: 'draft' as any,
    visibility: 'public' as any,
    customCommission: false,
    personalizable: false,
    giftWrapping: true,
    certificates: [] as string[],
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentMaterial, setCurrentMaterial] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [currentCertificate, setCurrentCertificate] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate SKU when name or category changes
    if (field === 'name' || field === 'category') {
      const name = field === 'name' ? value : formData.name;
      const category = field === 'category' ? value : formData.category;
      if (name && category) {
        const sku = generateSku(category, name);
        setFormData(prev => ({ ...prev, sku }));
      }
    }
  };

  const addToArray = (field: string, value: string, currentValue: string, setter: (value: string) => void) => {
    if (currentValue.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), currentValue.trim()]
      }));
      setter('');
    }
  };

  const removeFromArray = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  const handleImagesChange = (newImages: string[]) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: newImages,
      // Convert to ProductImage format for backend storage
      images: newImages.map((url, index) => ({
        id: `temp_${Date.now()}_${index}`,
        url,
        alt: `${prev.name} - Image ${index + 1}`,
        title: prev.name,
        featured: url === prev.featuredImage,
        sortOrder: index
      }))
    }));
  };

  const handleFeaturedImageChange = (featuredImage: string) => {
    setFormData(prev => ({
      ...prev,
      featuredImage,
      // Update the images array to reflect the new featured selection
      images: prev.images.map(img => ({
        ...img,
        featured: img.url === featuredImage
      }))
    }));
  };

  const handleModelsChange = (newModels: Product3DModel[]) => {
    setFormData(prev => ({
      ...prev,
      models: newModels,
      has3dModel: newModels.length > 0
    }));
  };

  const handleFeaturedModelChange = (featuredModel: string) => {
    setFormData(prev => ({
      ...prev,
      featuredModel,
      // Update the models array to reflect the new featured selection
      models: prev.models.map(model => ({
        ...model,
        featured: model.id === featuredModel
      }))
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || formData.regularPrice <= 0) {
      toast.error('Please fill in all required fields (name, description, regular price)');
      return;
    }

    // Debug: Log form data before submission
    console.log('🔍 Form submission data:');
    console.log('- HDRI Files:', formData.hdriFiles);
    console.log('- HDRI Files Length:', formData.hdriFiles?.length);
    console.log('- Models:', formData.models?.length);
    console.log('- Images:', formData.images?.length);

    try {
      const productData = {
        ...formData,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        sku: formData.sku || generateSku(formData.category, formData.name),
        published_at: formData.status === 'published' ? new Date().toISOString() : undefined,
        // Handle price logic: if no sale price is set, use regular price as the current price
        price: formData.price || formData.regularPrice,
        // Set onSale flag if sale price is different from regular price
        on_sale: formData.price > 0 && formData.price < formData.regularPrice,
        // Format images for database
        images: formData.images.length > 0 ? formData.images : undefined,
        // Format 3D models for database
        models: formData.models,
        has3dModel: formData.has3dModel,
        featuredModel: formData.featuredModel,
        // Format HDRI files for database
        hdriFiles: formData.hdriFiles,
        defaultHdri: formData.defaultHdri,
        backgroundBlur: formData.backgroundBlur,
      };

      // Call the API route to create the product
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Product created successfully!');
        router.push('/admin/products');
      } else {
        throw new Error(result.error || 'Failed to create product');
      }
    } catch (error) {
      toast.error(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Product creation error:', error);
    }
  };

  const categories = [
    { value: 'Islamic Calligraphy', label: 'Islamic Calligraphy' },
    { value: 'Islamic Architecture', label: 'Islamic Architecture' },
    { value: 'Geometric Art', label: 'Geometric Art' },
    { value: 'Heritage Collections', label: 'Heritage Collections' },
  ];


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-section text-luxury-black">Create New Product</h1>
          <p className="text-body mt-2">Add a new Islamic art product to your catalog</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="btn-luxury-ghost"
          >
            {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          <button
            onClick={() => router.back()}
            className="btn-luxury-ghost"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <h2 className="text-xl font-semibold text-luxury-black mb-6">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-luxury"
                placeholder="e.g., Ayat al-Kursi Calligraphy"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Arabic Name
              </label>
              <input
                type="text"
                value={formData.arabicName}
                onChange={(e) => handleInputChange('arabicName', e.target.value)}
                className="input-luxury arabic-text"
                placeholder="اسم المنتج بالعربية"
                dir="rtl"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-luxury-black mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="textarea-luxury"
              placeholder="Detailed description of your Islamic art piece..."
              required
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-luxury-black mb-2">
              Short Description
            </label>
            <textarea
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              rows={2}
              className="textarea-luxury"
              placeholder="Brief description for product listings..."
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <h2 className="text-xl font-semibold text-luxury-black mb-6">Pricing & Inventory</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Regular Price (GBP) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.regularPrice}
                onChange={(e) => handleInputChange('regularPrice', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="input-luxury"
                placeholder="89.99"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Sale Price (GBP)
                <span className="text-xs text-luxury-gray-500 ml-1">(Optional - leave empty if not on sale)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                className="input-luxury"
                placeholder="Enter sale price if product is on sale"
              />
              {formData.price > 0 && formData.regularPrice > 0 && formData.price < formData.regularPrice && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {Math.round(((formData.regularPrice - formData.price) / formData.regularPrice) * 100)}% discount applied
                </p>
              )}
              {formData.price > 0 && formData.regularPrice > 0 && formData.price >= formData.regularPrice && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠ Sale price should be lower than regular price
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                className="input-luxury"
                placeholder="100"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                className="input-luxury"
                placeholder="Auto-generated"
                readOnly
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Low Stock Threshold
              </label>
              <input
                type="number"
                min="0"
                value={formData.lowStockThreshold}
                onChange={(e) => handleInputChange('lowStockThreshold', parseInt(e.target.value) || 0)}
                className="input-luxury"
                placeholder="5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Weight (grams)
              </label>
              <input
                type="number"
                min="0"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                className="input-luxury"
                placeholder="250"
              />
            </div>
          </div>
        </div>

        {/* Categories & Classification */}
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <h2 className="text-xl font-semibold text-luxury-black mb-6">Categories & Classification</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Product Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="input-luxury"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                className="input-luxury"
                placeholder="e.g., Ayat al-Kursi, Bismillah"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-luxury-black mb-2">
              Tags
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                className="input-luxury flex-1"
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('tags', currentTag, currentTag, setCurrentTag))}
              />
              <button
                type="button"
                onClick={() => addToArray('tags', currentTag, currentTag, setCurrentTag)}
                className="btn-luxury-ghost"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-luxury-gray-100 text-luxury-black rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeFromArray('tags', index)}
                    className="ml-2 text-luxury-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Islamic Art Details */}
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <h2 className="text-xl font-semibold text-luxury-black mb-6">Islamic Art Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Arabic Text
              </label>
              <textarea
                value={formData.arabicText}
                onChange={(e) => handleInputChange('arabicText', e.target.value)}
                rows={3}
                className="textarea-luxury arabic-text"
                placeholder="النص العربي..."
                dir="rtl"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Transliteration
              </label>
              <input
                type="text"
                value={formData.transliteration}
                onChange={(e) => handleInputChange('transliteration', e.target.value)}
                className="input-luxury"
                placeholder="e.g., Ayat al-Kursi"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                English Translation
              </label>
              <textarea
                value={formData.translation}
                onChange={(e) => handleInputChange('translation', e.target.value)}
                rows={3}
                className="textarea-luxury"
                placeholder="English translation of the Arabic text..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Historical Context
              </label>
              <textarea
                value={formData.historicalContext}
                onChange={(e) => handleInputChange('historicalContext', e.target.value)}
                rows={3}
                className="textarea-luxury"
                placeholder="Background and significance of this Islamic art piece..."
              />
            </div>
          </div>
        </div>

        {/* Manufacturing Details */}
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <h2 className="text-xl font-semibold text-luxury-black mb-6">Manufacturing Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Print Time (hours)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.printTime}
                onChange={(e) => handleInputChange('printTime', parseFloat(e.target.value) || 0)}
                className="input-luxury"
                placeholder="2.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Finishing Time (hours)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.finishingTime}
                onChange={(e) => handleInputChange('finishingTime', parseFloat(e.target.value) || 0)}
                className="input-luxury"
                placeholder="1.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className="input-luxury"
              >
                <option value="Simple">Simple</option>
                <option value="Moderate">Moderate</option>
                <option value="Complex">Complex</option>
                <option value="Master">Master</option>
              </select>
            </div>
          </div>

          {/* Materials */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-luxury-black mb-2">
              Materials
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={currentMaterial}
                onChange={(e) => setCurrentMaterial(e.target.value)}
                className="input-luxury flex-1"
                placeholder="e.g., PLA+, Resin"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('material', currentMaterial, currentMaterial, setCurrentMaterial))}
              />
              <button
                type="button"
                onClick={() => addToArray('material', currentMaterial, currentMaterial, setCurrentMaterial)}
                className="btn-luxury-ghost"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.material.map((material, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-luxury-gray-100 text-luxury-black rounded-full text-sm"
                >
                  {material}
                  <button
                    type="button"
                    onClick={() => removeFromArray('material', index)}
                    className="ml-2 text-luxury-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <h2 className="text-xl font-semibold text-luxury-black mb-6">Product Images</h2>
          
          <ImageUpload
            images={formData.imageUrls}
            onImagesChange={handleImagesChange}
            featuredImage={formData.featuredImage}
            onFeaturedImageChange={handleFeaturedImageChange}
            maxImages={8}
            aspectRatio="square"
            showFeaturedToggle={true}
          />
        </div>

        {/* 3D Model & Environment */}
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <h2 className="text-xl font-semibold text-luxury-black mb-6">3D Model & Environment</h2>
          <p className="text-sm text-luxury-gray-600 mb-6">
            Upload your 3D model and configure HDRI environment lighting for realistic product visualization. 
            HDRI environments enhance the visual quality and realism of 3D product displays.
          </p>
          
          {/* 3D Model Upload Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-luxury-black mb-4">3D Model</h3>
            <Model3DUpload
              models={formData.models}
              onModelsChange={handleModelsChange}
              featuredModel={formData.featuredModel}
              onFeaturedModelChange={handleFeaturedModelChange}
              maxModels={1}
              showFeaturedToggle={true}
            />
          </div>

          {/* HDRI Environment Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-luxury-black mb-4">HDRI Environment Lighting</h3>
            
            <HDRIUpload
              value={formData.hdriFiles?.[0] || null}
              onChange={(hdri) => {
                if (hdri) {
                  setFormData(prev => ({ ...prev, hdriFiles: [hdri] }));
                } else {
                  setFormData(prev => ({ ...prev, hdriFiles: [] }));
                }
              }}
              maxFiles={1}
              showPreview={true}
            />

            {/* HDRI Controls */}
            {formData.hdriFiles.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="text-base font-medium text-luxury-black">Environment Settings</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* HDRI Intensity */}
                  <div>
                    <label className="block text-sm font-medium text-luxury-black mb-2">
                      HDRI Intensity
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={formData.hdriFiles[0]?.intensity || 1.0}
                        onChange={(e) => {
                          const intensity = parseFloat(e.target.value);
                          if (formData.hdriFiles[0]) {
                            const updatedHdri = { ...formData.hdriFiles[0], intensity };
                            setFormData(prev => ({ ...prev, hdriFiles: [updatedHdri] }));
                          }
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-luxury-gray-500">
                        <span>0.0 (Dark)</span>
                        <span className="font-medium text-luxury-black">
                          {formData.hdriFiles[0]?.intensity?.toFixed(1) || '1.0'}
                        </span>
                        <span>2.0 (Bright)</span>
                      </div>
                    </div>
                  </div>

                  {/* Background Blur */}
                  <div>
                    <label className="block text-sm font-medium text-luxury-black mb-2">
                      Background Blur Intensity
                    </label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={formData.backgroundBlur}
                        onChange={(e) => handleInputChange('backgroundBlur', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-luxury-gray-500">
                        <span>0 (Sharp)</span>
                        <span className="font-medium text-luxury-black">
                          {formData.backgroundBlur}
                        </span>
                        <span>10 (Blurred)</span>
                      </div>
                    </div>
                    <p className="text-xs text-luxury-gray-500 mt-1">
                      Controls how blurred the HDRI background appears behind the 3D model
                    </p>
                  </div>
                </div>

                {/* HDRI Preview Settings */}
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="text-sm font-medium text-luxury-black mb-2">Environment Guidelines</h5>
                  <div className="text-sm text-luxury-gray-600 space-y-1">
                    <p>• <strong>Intensity:</strong> Controls the brightness of the HDRI environment lighting</p>
                    <p>• <strong>Background Blur:</strong> Adds depth of field effect to focus attention on the product</p>
                    <p>• <strong>Recommended:</strong> Start with intensity 1.0 and adjust based on your 3D model</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Settings */}
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <h2 className="text-xl font-semibold text-luxury-black mb-6">Product Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => handleInputChange('featured', e.target.checked)}
                className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
              />
              <label htmlFor="featured" className="text-sm font-medium text-luxury-black">
                Featured Product
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="customCommission"
                checked={formData.customCommission}
                onChange={(e) => handleInputChange('customCommission', e.target.checked)}
                className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
              />
              <label htmlFor="customCommission" className="text-sm font-medium text-luxury-black">
                Available for Custom Commission
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="personalizable"
                checked={formData.personalizable}
                onChange={(e) => handleInputChange('personalizable', e.target.checked)}
                className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
              />
              <label htmlFor="personalizable" className="text-sm font-medium text-luxury-black">
                Personalizable (Custom Names/Text)
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="giftWrapping"
                checked={formData.giftWrapping}
                onChange={(e) => handleInputChange('giftWrapping', e.target.checked)}
                className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
              />
              <label htmlFor="giftWrapping" className="text-sm font-medium text-luxury-black">
                Gift Wrapping Available
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Product Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="input-luxury"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-luxury-black mb-2">
                Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => handleInputChange('visibility', e.target.value)}
                className="input-luxury"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="password-protected">Password Protected</option>
                <option value="catalog-only">Catalog Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-luxury-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-luxury-ghost"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleInputChange('status', 'draft')}
            className="btn-luxury-outline"
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="btn-luxury"
          >
            <Save className="h-4 w-4 mr-2" />
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewProductPage;