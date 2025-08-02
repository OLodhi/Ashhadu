'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Save, 
  X, 
  Plus, 
  ArrowLeft,
  Trash2,
  Copy
} from 'lucide-react';
import { ProductCategory, IslamicArtCategory, Product, ProductImage, Product3DModel, ProductHDRI } from '@/types/product';
import ImageUpload from '@/components/ui/ImageUpload';
import Model3DUpload from '@/components/ui/Model3DUpload';
import HDRIUpload from '@/components/ui/HDRIUpload';
import toast from 'react-hot-toast';

const EditProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [mounted, setMounted] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState('');
  const [models, setModels] = useState<Product3DModel[]>([]);
  const [featuredModel, setFeaturedModelState] = useState('');
  const [hdriFiles, setHdriFiles] = useState<ProductHDRI[]>([]);
  const [defaultHdri, setDefaultHdri] = useState('');
  const [backgroundBlur, setBackgroundBlur] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    arabicName: '',
    description: '',
    shortDescription: '',
    price: 0,
    regularPrice: 0,
    currency: 'GBP' as const,
    vatIncluded: true,
    category: 'islamic-calligraphy' as ProductCategory,
    subcategory: '',
    tags: [] as string[],
    sku: '',
    stock: 0,
    stockStatus: 'in-stock' as const,
    manageStock: true,
    lowStockThreshold: 5,
    weight: 0,
    material: [] as string[],
    islamicCategory: 'ayat-al-kursi' as IslamicArtCategory,
    arabicText: '',
    transliteration: '',
    translation: '',
    historicalContext: '',
    printTime: 0,
    finishingTime: 0,
    difficulty: 'Simple' as const,
    featured: false,
    onSale: false,
    status: 'draft' as any,
    visibility: 'public' as any,
    customCommission: false,
    personalizable: false,
    giftWrapping: true,
    has3dModel: false,
  });

  const [currentTag, setCurrentTag] = useState('');
  const [currentMaterial, setCurrentMaterial] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data.data);
        } else {
          console.error('Failed to fetch product');
          toast.error('Failed to load product');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Error loading product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Load product data into form
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        arabicName: product.arabicName || '',
        description: product.description || '',
        shortDescription: product.shortDescription || '',
        price: product.price || 0,
        regularPrice: product.regularPrice || 0,
        currency: product.currency as any || 'GBP',
        vatIncluded: product.vatIncluded ?? true,
        category: product.category as any || 'islamic-calligraphy',
        subcategory: product.subcategory || '',
        tags: product.tags || [],
        sku: product.sku || '',
        stock: product.stock || 0,
        stockStatus: product.stockStatus as any || 'in-stock',
        manageStock: product.manageStock ?? true,
        lowStockThreshold: product.lowStockThreshold || 5,
        weight: product.weight || 0,
        material: product.material || [],
        islamicCategory: product.islamicCategory as any || 'ayat-al-kursi',
        arabicText: product.arabicText || '',
        transliteration: product.transliteration || '',
        translation: product.translation || '',
        historicalContext: product.historicalContext || '',
        printTime: product.printTime || 0,
        finishingTime: product.finishingTime || 0,
        difficulty: product.difficulty as any || 'Simple',
        featured: product.featured || false,
        onSale: product.onSale || false,
        status: product.status || 'draft',
        visibility: product.visibility || 'public',
        customCommission: product.customCommission || false,
        personalizable: product.personalizable || false,
        giftWrapping: product.giftWrapping ?? true,
        has3dModel: (product.models && product.models.length > 0) || false,
      });
      setImageUrls(product.images?.map(img => img.url) || []);
      setFeaturedImage(product.featuredImage || '');
      setModels(product.models || []);
      setFeaturedModelState(product.featuredModel || '');
      setHdriFiles(product.hdriFiles || []);
      setDefaultHdri(product.defaultHdriUrl || '');
      setBackgroundBlur(product.backgroundBlurEnabled ? (product.backgroundBlurIntensity || 0) : 0);
    }
  }, [product]);

  if (!mounted || loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Loading...</h2>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Product not found</h2>
          <button 
            onClick={() => router.push('/admin/products')} 
            className="btn-luxury"
            style={{ marginTop: '16px' }}
          >
            <ArrowLeft size={16} style={{ marginRight: '8px' }} />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!formData.name || !formData.description || formData.regularPrice <= 0) {
      toast.error('Please fill in all required fields (name, description, regular price)');
      setIsLoading(false);
      return;
    }

    try {
      const updatedProduct = {
        ...formData,
        images: imageUrls.map((url, index) => ({
          id: `temp_${Date.now()}_${index}`,
          url,
          alt: `${formData.name} - Image ${index + 1}`,
          title: formData.name,
          featured: url === featuredImage,
          sortOrder: index
        })),
        featuredImage,
        models,
        featuredModel,
        has3dModel: models.length > 0,
        hdriFiles,
        defaultHdri,
        backgroundBlur,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        price: formData.price || formData.regularPrice,
        onSale: formData.price > 0 && formData.price < formData.regularPrice,
      };

      const response = await fetch(`/api/products/${product?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        toast.success('Product updated successfully!');
        router.push('/admin/products');
      } else {
        toast.error('Failed to update product');
      }
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    
    if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/products/${product.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Product deleted successfully!');
          router.push('/admin/products');
        } else {
          toast.error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Error deleting product');
      }
    }
  };

  const handleDuplicate = async () => {
    if (!product) return;
    
    try {
      const duplicatedProduct = {
        ...product,
        name: `${product.name} (Copy)`,
        sku: `${product.sku}-copy-${Date.now()}`,
        slug: `${product.slug}-copy-${Date.now()}`,
        status: 'draft',
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedProduct),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Product duplicated successfully!');
        router.push(`/admin/products/${result.data.id}/edit`);
      } else {
        toast.error('Failed to duplicate product');
      }
    } catch (error) {
      console.error('Error duplicating product:', error);
      toast.error('Error duplicating product');
    }
  };

  const categories = [
    { value: 'Islamic Calligraphy', label: 'Islamic Calligraphy' },
    { value: 'Islamic Architecture', label: 'Islamic Architecture' },
    { value: 'Geometric Art', label: 'Geometric Art' },
    { value: 'Heritage Collections', label: 'Heritage Collections' },
  ];


  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="p-2 text-luxury-gray-600 hover:text-luxury-black transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-luxury-black">Edit Product</h1>
            <p className="text-luxury-gray-600 mt-1">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={handleDuplicate} className="btn-luxury-ghost">
            <Copy size={16} style={{ marginRight: '8px' }} />
            Duplicate
          </button>
          <button onClick={handleDelete} className="btn-luxury-ghost text-red-600">
            <Trash2 size={16} style={{ marginRight: '8px' }} />
            Delete
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
                <span className="text-xs text-luxury-gray-500 ml-1">(Optional)</span>
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
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <h2 className="text-xl font-semibold text-luxury-black mb-6">Categories</h2>
          
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
                value={formData.subcategory || ''}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                className="input-luxury"
                placeholder="e.g., Ayat al-Kursi, Bismillah"
              />
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <input
                  type="text"
                  value={formData.translation}
                  onChange={(e) => handleInputChange('translation', e.target.value)}
                  className="input-luxury"
                  placeholder="English translation..."
                />
              </div>
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
                <Plus size={16} />
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
                    <X size={12} />
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
            images={imageUrls}
            onImagesChange={setImageUrls}
            featuredImage={featuredImage}
            onFeaturedImageChange={setFeaturedImage}
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
              models={models}
              onModelsChange={setModels}
              featuredModel={featuredModel}
              onFeaturedModelChange={setFeaturedModelState}
              maxModels={1}
              showFeaturedToggle={true}
            />
          </div>

          {/* HDRI Environment Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-luxury-black mb-4">HDRI Environment Lighting</h3>
            
            <HDRIUpload
              value={hdriFiles?.[0] || null}
              onChange={(hdri) => {
                if (hdri) {
                  setHdriFiles([hdri]);
                } else {
                  setHdriFiles([]);
                }
              }}
              maxFiles={1}
              showPreview={true}
            />

            {/* HDRI Controls */}
            {hdriFiles.length > 0 && (
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
                        value={hdriFiles[0]?.intensity || 1.0}
                        onChange={(e) => {
                          const intensity = parseFloat(e.target.value);
                          if (hdriFiles[0]) {
                            const updatedHdri = { ...hdriFiles[0], intensity };
                            setHdriFiles([updatedHdri]);
                          }
                        }}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-luxury-gray-500">
                        <span>0.0 (Dark)</span>
                        <span className="font-medium text-luxury-black">
                          {hdriFiles[0]?.intensity?.toFixed(1) || '1.0'}
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
                        value={backgroundBlur}
                        onChange={(e) => setBackgroundBlur(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-luxury-gray-500">
                        <span>0 (Sharp)</span>
                        <span className="font-medium text-luxury-black">
                          {backgroundBlur}
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
            onClick={() => router.push('/admin/products')}
            className="btn-luxury-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-luxury"
          >
            <Save size={16} style={{ marginRight: '8px' }} />
            {isLoading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;