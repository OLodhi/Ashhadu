'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Package,
  AlertTriangle,
  Star,
  Grid,
  List
} from 'lucide-react';
import { Product, ProductCategory } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import toast from 'react-hot-toast';

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: [] as ProductCategory[],
    status: [] as any[],
    stockStatus: [] as any[],
    featured: undefined as boolean | undefined,
  });

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        } else {
          console.error('Failed to fetch products');
          toast.error('Failed to load products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Error loading products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products
  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = !filters.search || 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.sku.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = filters.category.length === 0 || filters.category.includes(product.category);
      const matchesStatus = filters.status.length === 0 || filters.status.includes(product.status);
      const matchesStockStatus = filters.stockStatus.length === 0 || filters.stockStatus.includes(product.stockStatus);
      const matchesFeatured = filters.featured === undefined || product.featured === filters.featured;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesStockStatus && matchesFeatured;
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: [],
      status: [],
      stockStatus: [],
      featured: undefined,
    });
  };

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = getFilteredProducts();

  // Product action functions
  const toggleProductFeatured = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const response = await fetch(`/api/products/${productId}`, {
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
        setProducts(prev => 
          prev.map(p => 
            p.id === productId 
              ? { ...p, featured: !p.featured }
              : p
          )
        );
        toast.success(`Product ${product.featured ? 'removed from' : 'added to'} featured collection`);
      } else {
        toast.error('Failed to update product featured status');
      }
    } catch (error) {
      console.error('Error toggling product featured status:', error);
      toast.error('Error updating product featured status');
    }
  };

  const duplicateProduct = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

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
        setProducts(prev => [result.data, ...prev]);
        toast.success('Product duplicated successfully');
      } else {
        toast.error('Failed to duplicate product');
      }
    } catch (error) {
      console.error('Error duplicating product:', error);
      toast.error('Error duplicating product');
    }
  };

  const deleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (!confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        setSelectedProducts(prev => prev.filter(id => id !== productId));
        toast.success('Product deleted successfully');
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, search: term }));
  };

  const handleCategoryFilter = (category: ProductCategory | '') => {
    if (category === '') {
      setFilters(prev => ({ ...prev, category: [] }));
    } else {
      setFilters(prev => ({ ...prev, category: [category] }));
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(p => p.id));
    }
  };

  const handleToggleFilters = () => {
    if (showFilters) {
      // If hiding filters, clear all applied filters
      clearFilters();
      setSearchTerm('');
    }
    setShowFilters(!showFilters);
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'text-green-600 bg-green-50';
      case 'low-stock':
        return 'text-yellow-600 bg-yellow-50';
      case 'out-of-stock':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-lg shadow-luxury p-6 hover:shadow-luxury-hover transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={selectedProducts.includes(product.id)}
            onChange={() => handleSelectProduct(product.id)}
            className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
          />
          <div className="w-12 h-12 bg-luxury-gray-100 rounded-lg flex items-center justify-center">
            <Package className="h-6 w-6 text-luxury-gold" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {product.featured && (
            <Star className="h-4 w-4 text-luxury-gold fill-current" />
          )}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(product.stockStatus)}`}>
            {product.stockStatus?.replace('-', ' ') || 'Unknown'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="font-semibold">
            <Link 
              href={`/products/${product.id}`}
              className="text-luxury-black hover:text-luxury-gold transition-colors"
              title="View product on frontend"
            >
              {product.name}
            </Link>
          </h3>
          {product.arabicName && (
            <p className="text-sm text-luxury-gray-600 arabic-text">{product.arabicName}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-luxury-gold">{formatPrice(product.price)}</p>
            <p className="text-sm text-luxury-gray-600">Stock: {product.stock}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-luxury-gray-600">{product.category}</p>
            <p className="text-xs text-luxury-gray-500">{product.status}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-luxury-gray-100">
          <span className="text-xs text-luxury-gray-500">
            SKU: {product.sku}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleProductFeatured(product.id)}
              className="p-1 text-luxury-gray-400 hover:text-luxury-gold transition-colors"
              title="Toggle Featured"
            >
              <Star className="h-4 w-4" />
            </button>
            <Link
              href={`/admin/products/${product.id}/edit`}
              className="p-1 text-luxury-gray-400 hover:text-blue-600 transition-colors"
              title="Edit Product"
            >
              <Edit className="h-4 w-4" />
            </Link>
            <button
              onClick={() => duplicateProduct(product.id)}
              className="p-1 text-luxury-gray-400 hover:text-green-600 transition-colors"
              title="Duplicate Product"
            >
              <Copy className="h-4 w-4" />
            </button>
            <button
              onClick={() => deleteProduct(product.id)}
              className="p-1 text-luxury-gray-400 hover:text-red-600 transition-colors"
              title="Delete Product"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ProductRow = ({ product }: { product: Product }) => (
    <tr className="hover:bg-luxury-gray-50">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selectedProducts.includes(product.id)}
          onChange={() => handleSelectProduct(product.id)}
          className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-luxury-gray-100 rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-luxury-gold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Link 
                href={`/products/${product.id}`}
                className="font-medium text-luxury-black hover:text-luxury-gold transition-colors"
                title="View product on frontend"
              >
                {product.name}
              </Link>
              {product.featured && (
                <Star className="h-4 w-4 text-luxury-gold fill-current" />
              )}
            </div>
            {product.arabicName && (
              <p className="text-sm text-luxury-gray-600 arabic-text">{product.arabicName}</p>
            )}
            <p className="text-xs text-luxury-gray-500">SKU: {product.sku}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-luxury-gray-600">{product.category}</span>
      </td>
      <td className="px-6 py-4">
        <span className="font-semibold text-luxury-gold">{formatPrice(product.price)}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-luxury-black">{product.stock}</span>
          {product.stock <= (product.lowStockThreshold || 5) && (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStockStatusColor(product.stockStatus)}`}>
          {product.stockStatus?.replace('-', ' ') || 'Unknown'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          product.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
        }`}>
          {product.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/products/${product.id}`}
            className="p-1 text-luxury-gray-400 hover:text-luxury-gold transition-colors"
            title="View Product"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/products/${product.id}/edit`}
            className="p-1 text-luxury-gray-400 hover:text-blue-600 transition-colors"
            title="Edit Product"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => duplicateProduct(product.id)}
            className="p-1 text-luxury-gray-400 hover:text-green-600 transition-colors"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteProduct(product.id)}
            className="p-1 text-luxury-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-section text-luxury-black">Products</h1>
          <p className="text-body mt-2">
            Manage your Islamic art product catalog
          </p>
        </div>
        <Link href="/admin/products/new" className="btn-luxury">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-luxury p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
            />
          </div>

          {/* Filters and View Controls */}
          <div className="flex items-center space-x-4">
            <select
              onChange={(e) => handleCategoryFilter(e.target.value as ProductCategory | '')}
              value={filters.category?.[0] || ''}
              className="px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
            >
              <option value="">All Categories</option>
              <option value="islamic-calligraphy">Islamic Calligraphy</option>
              <option value="mosque-models">Mosque Models</option>
              <option value="geometric-art">Geometric Art</option>
              <option value="arabic-text">Arabic Text</option>
              <option value="decorative-art">Decorative Art</option>
              <option value="custom-commissions">Custom Commissions</option>
            </select>

            <button
              onClick={handleToggleFilters}
              className="btn-luxury-ghost"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>

            <div className="flex items-center space-x-2 border border-luxury-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-luxury-gold text-luxury-black' : 'text-luxury-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-luxury-gold text-luxury-black' : 'text-luxury-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Additional Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-luxury-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Stock Status
                </label>
                <select 
                  onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value ? [e.target.value as any] : [] }))}
                  value={filters.stockStatus?.[0] || ''}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                >
                  <option value="">All Stock Levels</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Product Status
                </label>
                <select 
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value ? [e.target.value as any] : [] }))}
                  value={filters.status?.[0] || ''}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Featured
                </label>
                <select 
                  onChange={(e) => {
                    if (e.target.value === 'featured') {
                      setFilters(prev => ({ ...prev, featured: true }));
                    } else if (e.target.value === 'not-featured') {
                      setFilters(prev => ({ ...prev, featured: false }));
                    } else {
                      setFilters(prev => ({ ...prev, featured: undefined }));
                    }
                  }}
                  value={filters.featured === true ? 'featured' : filters.featured === false ? 'not-featured' : ''}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                >
                  <option value="">All Products</option>
                  <option value="featured">Featured Only</option>
                  <option value="not-featured">Not Featured</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-luxury-black">
              {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button className="btn-luxury-ghost text-sm">
                Bulk Edit
              </button>
              <button className="btn-luxury-ghost text-sm">
                Export
              </button>
              <button className="btn-luxury-ghost text-sm text-red-600">
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Display */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-luxury p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-luxury-gray-600">Loading products...</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-luxury overflow-hidden">
          <table className="min-w-full divide-y divide-luxury-gray-200">
            <thead className="bg-luxury-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                  Visibility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-luxury-gray-200">
              {filteredProducts.map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-lg shadow-luxury p-12 text-center">
          <Package className="h-16 w-16 text-luxury-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-luxury-black mb-2">
            No products found
          </h3>
          <p className="text-luxury-gray-600 mb-6">
            {products.length === 0 
              ? "Get started by adding your first Islamic art product"
              : "Try adjusting your search criteria or filters"
            }
          </p>
          {products.length === 0 && (
            <Link href="/admin/products/new" className="btn-luxury">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;