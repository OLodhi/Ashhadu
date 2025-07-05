'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Package,
  Star,
  Calendar,
  Truck,
  DollarSign,
  Tag,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  X
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Product } from '@/types/product';

const ProductViewPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'analytics' | 'history'>('overview');

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-luxury-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-gray-50">
        <div className="text-center">
          <Package className="h-16 w-16 text-luxury-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-luxury-black mb-2">Product not found</h2>
          <p className="text-luxury-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/products')}
            className="btn-luxury"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </button>
        </div>
      </div>
    );
  }

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

  const handleToggleStatus = async () => {
    if (!product) return;
    
    try {
      const newStatus = product.status === 'published' ? 'draft' : 'published';
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          status: newStatus,
        }),
      });

      if (response.ok) {
        setProduct(prev => prev ? { ...prev, status: newStatus } : null);
        toast.success(`Product ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
      } else {
        toast.error('Failed to update product status');
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Error updating product status');
    }
  };

  const handleToggleFeatured = async () => {
    if (!product) return;
    
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          featured: !product.featured,
        }),
      });

      if (response.ok) {
        setProduct(prev => prev ? { ...prev, featured: !prev.featured } : null);
        toast.success(`Product ${product.featured ? 'removed from' : 'added to'} featured products!`);
      } else {
        toast.error('Failed to update featured status');
      }
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Error updating featured status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'scheduled':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'archived':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'disabled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStockStatusColor = (status: string, stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock <= (product.lowStockThreshold || 5)) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const calculateTotalTime = () => {
    return (product.printTime || 0) + (product.finishingTime || 0);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating 
            ? 'text-luxury-gold fill-current' 
            : 'text-luxury-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="p-2 text-luxury-gray-600 hover:text-luxury-black transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="heading-section text-luxury-black">{product.name}</h1>
            {product.arabicName && (
              <p className="text-lg text-luxury-gray-600 arabic-text mt-1">{product.arabicName}</p>
            )}
            <p className="text-body mt-1">SKU: {product.sku}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border ${getStatusColor(product.status)}`}>
            <span className="capitalize">{product.status}</span>
          </div>
          
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="btn-luxury"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Link>
          
          <div className="relative group">
            <button className="btn-luxury-ghost">
              <Package className="h-4 w-4 mr-2" />
              Actions
            </button>
            <div className="absolute right-0 top-full pt-2 hidden group-hover:block hover:block z-10 min-w-[160px]">
              <div className="bg-white shadow-luxury-hover rounded-lg border border-luxury-gray-100">
              <div className="py-1">
                <button
                  onClick={handleToggleStatus}
                  className="block w-full text-left px-4 py-2 text-sm text-luxury-black hover:bg-luxury-gray-50"
                >
                  {product.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={handleToggleFeatured}
                  className="block w-full text-left px-4 py-2 text-sm text-luxury-black hover:bg-luxury-gray-50"
                >
                  {product.featured ? 'Remove from Featured' : 'Add to Featured'}
                </button>
                <button
                  onClick={handleDuplicate}
                  className="block w-full text-left px-4 py-2 text-sm text-luxury-black hover:bg-luxury-gray-50"
                >
                  <Copy className="h-4 w-4 mr-2 inline" />
                  Duplicate
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2 inline" />
                  Delete
                </button>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-luxury-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'history', label: 'History', icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-luxury-gold text-luxury-gold'
                  : 'border-transparent text-luxury-gray-500 hover:text-luxury-black hover:border-luxury-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {activeTab === 'overview' && (
          <>
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Product Image and Info */}
              <div className="bg-white rounded-lg shadow-luxury p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Image */}
                  <div className="aspect-square bg-luxury-gray-50 rounded-lg overflow-hidden relative">
                    {product.featuredImage ? (
                      <Image
                        src={product.featuredImage}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-luxury-gray-400" />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 space-y-2">
                      {product.featured && (
                        <span className="px-3 py-1 bg-luxury-gold text-white text-sm font-medium rounded-full">
                          Featured
                        </span>
                      )}
                      {product.onSale && (
                        <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">
                          On Sale
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-luxury-black mb-2">Product Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-luxury-gray-600">Price:</span>
                          <div className="text-right">
                            <span className="text-lg font-bold text-luxury-gold">{formatPrice(product.price)}</span>
                            {product.onSale && product.regularPrice > product.price && (
                              <div className="text-sm text-luxury-gray-500 line-through">
                                {formatPrice(product.regularPrice)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-luxury-gray-600">Category:</span>
                          <span className="text-luxury-black">{product.category.replace('-', ' ')}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-luxury-gray-600">Islamic Category:</span>
                          <span className="text-luxury-black">{product.islamicCategory.replace('-', ' ')}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-luxury-gray-600">Difficulty:</span>
                          <span className="text-luxury-black">{product.difficulty}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-luxury-gray-600">Materials:</span>
                          <span className="text-luxury-black">{product.material?.join(', ') || 'N/A'}</span>
                        </div>
                        
                        {product.weight && (
                          <div className="flex justify-between">
                            <span className="text-luxury-gray-600">Weight:</span>
                            <span className="text-luxury-black">{product.weight}g</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div>
                      <h4 className="font-medium text-luxury-black mb-2">Customer Rating</h4>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {getRatingStars(product.rating || 5)}
                        </div>
                        <span className="text-sm text-luxury-gray-600">
                          {product.rating || 5.0} ({product.reviewCount || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg shadow-luxury p-6">
                <h3 className="text-lg font-semibold text-luxury-black mb-4">Description</h3>
                <div className="prose prose-luxury max-w-none">
                  <p className="text-luxury-gray-700">{product.description}</p>
                  
                  {product.shortDescription && (
                    <div className="mt-4 p-4 bg-luxury-gray-50 rounded-lg">
                      <p className="text-sm text-luxury-gray-600 font-medium">Short Description:</p>
                      <p className="text-luxury-gray-700">{product.shortDescription}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Islamic Content */}
              {(product.arabicText || product.transliteration || product.translation || product.historicalContext) && (
                <div className="bg-white rounded-lg shadow-luxury p-6">
                  <h3 className="text-lg font-semibold text-luxury-black mb-4">Islamic Content</h3>
                  
                  <div className="space-y-4">
                    {product.arabicText && (
                      <div>
                        <p className="text-sm font-medium text-luxury-gray-700 mb-2">Arabic Text:</p>
                        <p className="text-2xl arabic-text text-luxury-black mb-2">{product.arabicText}</p>
                      </div>
                    )}
                    
                    {product.transliteration && (
                      <div>
                        <p className="text-sm font-medium text-luxury-gray-700 mb-1">Transliteration:</p>
                        <p className="text-luxury-gray-600 italic">{product.transliteration}</p>
                      </div>
                    )}
                    
                    {product.translation && (
                      <div>
                        <p className="text-sm font-medium text-luxury-gray-700 mb-1">Translation:</p>
                        <p className="text-luxury-gray-700">"{product.translation}"</p>
                      </div>
                    )}
                    
                    {product.historicalContext && (
                      <div>
                        <p className="text-sm font-medium text-luxury-gray-700 mb-1">Historical Context:</p>
                        <p className="text-luxury-gray-700">{product.historicalContext}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stock Status */}
              <div className="bg-white rounded-lg shadow-luxury p-6">
                <h3 className="text-lg font-semibold text-luxury-black mb-4">Stock Status</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Current Stock:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-luxury-black">{product.stock}</span>
                      {product.stock <= (product.lowStockThreshold || 5) && product.stock > 0 && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      {product.stock === 0 && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Status:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(product.stockStatus, product.stock)}`}>
                      {product.stockStatus?.replace('-', ' ') || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Low Stock Alert:</span>
                    <span className="text-luxury-black">{product.lowStockThreshold || 5}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Manage Stock:</span>
                    <span className={`inline-flex items-center ${product.manageStock ? 'text-green-600' : 'text-gray-500'}`}>
                      {product.manageStock ? <CheckCircle className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </span>
                  </div>
                </div>
              </div>

              {/* Manufacturing Info */}
              <div className="bg-white rounded-lg shadow-luxury p-6">
                <h3 className="text-lg font-semibold text-luxury-black mb-4">Manufacturing</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Print Time:</span>
                    <span className="text-luxury-black">{product.printTime || 0}h</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Finishing Time:</span>
                    <span className="text-luxury-black">{product.finishingTime || 0}h</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Total Time:</span>
                    <span className="font-semibold text-luxury-gold">{calculateTotalTime()}h</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Difficulty:</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.difficulty === 'Simple' ? 'bg-green-50 text-green-600' :
                      product.difficulty === 'Moderate' ? 'bg-yellow-50 text-yellow-600' :
                      product.difficulty === 'Complex' ? 'bg-orange-50 text-orange-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {product.difficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Options */}
              <div className="bg-white rounded-lg shadow-luxury p-6">
                <h3 className="text-lg font-semibold text-luxury-black mb-4">Product Options</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Featured:</span>
                    <span className={`inline-flex items-center ${product.featured ? 'text-luxury-gold' : 'text-gray-500'}`}>
                      {product.featured ? <Star className="h-4 w-4 fill-current" /> : <Star className="h-4 w-4" />}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">On Sale:</span>
                    <span className={`inline-flex items-center ${product.onSale ? 'text-red-600' : 'text-gray-500'}`}>
                      {product.onSale ? <Tag className="h-4 w-4" /> : <Tag className="h-4 w-4" />}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Custom Commission:</span>
                    <span className={`inline-flex items-center ${product.customCommission ? 'text-blue-600' : 'text-gray-500'}`}>
                      {product.customCommission ? <Zap className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Personalizable:</span>
                    <span className={`inline-flex items-center ${product.personalizable ? 'text-purple-600' : 'text-gray-500'}`}>
                      {product.personalizable ? <CheckCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Gift Wrapping:</span>
                    <span className={`inline-flex items-center ${product.giftWrapping ? 'text-green-600' : 'text-gray-500'}`}>
                      {product.giftWrapping ? <CheckCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="bg-white rounded-lg shadow-luxury p-6">
                <h3 className="text-lg font-semibold text-luxury-black mb-4">Timeline</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Created:</span>
                    <span className="text-luxury-black text-sm">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-luxury-gray-600">Updated:</span>
                    <span className="text-luxury-black text-sm">
                      {new Date(product.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {product.publishedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-luxury-gray-600">Published:</span>
                      <span className="text-luxury-black text-sm">
                        {new Date(product.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'inventory' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-luxury p-6">
              <h3 className="text-lg font-semibold text-luxury-black mb-4">Inventory Management</h3>
              <p className="text-luxury-gray-600">Inventory management features will be implemented here.</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-luxury p-6">
              <h3 className="text-lg font-semibold text-luxury-black mb-4">Product Analytics</h3>
              <p className="text-luxury-gray-600">Analytics and performance metrics will be displayed here.</p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-luxury p-6">
              <h3 className="text-lg font-semibold text-luxury-black mb-4">Product History</h3>
              <p className="text-luxury-gray-600">Product change history and activity log will be shown here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductViewPage;