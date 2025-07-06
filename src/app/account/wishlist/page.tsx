'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  ShoppingBag,
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Trash2,
  Share2,
  ArrowUpDown,
  Tag,
  Calendar,
  Package,
  ChevronDown
} from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { WishlistFilters, WISHLIST_CONFIG } from '@/types/wishlist';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { user, customer, loading: authLoading } = useAuth();
  const router = useRouter();
  const { 
    wishlistItems, 
    loading, 
    wishlistCount, 
    totalValue, 
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    shareWishlist 
  } = useWishlist();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<WishlistFilters>({
    category: [],
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectTo=/account/wishlist');
    }
  }, [authLoading, user, router]);

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleFilterChange = (key: keyof WishlistFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-');
    setFilters(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc'
    }));
  };

  const toggleItemSelection = (productId: string) => {
    setSelectedItems(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const selectAllItems = () => {
    setSelectedItems(filteredItems.map(item => item.product_id));
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const handleBulkRemove = async () => {
    if (selectedItems.length === 0) return;
    
    if (confirm(`Remove ${selectedItems.length} items from your wishlist?`)) {
      const removePromises = selectedItems.map(productId => removeFromWishlist(productId));
      await Promise.all(removePromises);
      setSelectedItems([]);
      toast.success(`Removed ${selectedItems.length} items from wishlist`);
    }
  };

  const handleBulkAddToCart = async () => {
    if (selectedItems.length === 0) return;
    
    // TODO: Implement bulk add to cart
    toast.success('Bulk add to cart functionality coming soon!');
  };

  // Filter and sort items
  const filteredItems = wishlistItems
    .filter(item => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesName = item.product.name.toLowerCase().includes(searchTerm);
        const matchesArabic = item.product.arabic_name?.toLowerCase().includes(searchTerm);
        const matchesCategory = item.product.category?.toLowerCase().includes(searchTerm);
        
        if (!matchesName && !matchesArabic && !matchesCategory) {
          return false;
        }
      }
      
      // Category filter
      if (filters.category && filters.category.length > 0) {
        if (!item.product.category || !filters.category.includes(item.product.category)) {
          return false;
        }
      }
      
      return true;
    })
    .sort((a, b) => {
      const { sortBy, sortOrder } = filters;
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.product.name.localeCompare(b.product.name);
          break;
        case 'price':
          const priceA = a.product.price;
          const priceB = b.product.price;
          comparison = priceA - priceB;
          break;
        case 'category':
          const categoryA = a.product.category || '';
          const categoryB = b.product.category || '';
          comparison = categoryA.localeCompare(categoryB);
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // Get unique categories for filter
  const availableCategories = Array.from(
    new Set(wishlistItems.map(item => item.product.category).filter(Boolean))
  );

  if (authLoading || loading) {
    return (
      <AccountLayout 
        title="My Wishlist" 
        description="Loading your saved Islamic art pieces..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
        </div>
      </AccountLayout>
    );
  }

  if (!user) {
    return (
      <AccountLayout 
        title="My Wishlist" 
        description="Please log in to view your wishlist"
      >
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Required</h3>
            <p className="mt-2 text-gray-600">Please log in to view your saved Islamic art pieces.</p>
            <Link
              href="/login"
              className="mt-4 inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout 
      title="My Wishlist" 
      description={wishlistCount > 0 ? `${wishlistCount} saved items worth ${formatCurrency(totalValue)}` : "Save your favorite Islamic art pieces"}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search wishlist..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
              />
            </div>

            {/* Filter Toggle */}
            {availableCategories.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                  showFilters ? 'bg-gray-50' : ''
                }`}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${
                  showFilters ? 'rotate-180' : ''
                }`} />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Sort */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
            >
              {WISHLIST_CONFIG.sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Mode */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-luxury-gold text-luxury-black' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-luxury-gold text-luxury-black' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Share Wishlist */}
            {wishlistCount > 0 && (
              <button
                onClick={shareWishlist}
                className="inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && availableCategories.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={() => setFilters({ ...filters, category: [] })}
                className="text-sm text-luxury-gold hover:text-yellow-600"
              >
                Clear Filters
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Islamic Categories
              </label>
              <div className="space-y-2">
                {availableCategories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.category?.includes(category) || false}
                      onChange={(e) => {
                        const currentCategories = filters.category || [];
                        const newCategories = e.target.checked
                          ? [...currentCategories, category]
                          : currentCategories.filter(c => c !== category);
                        handleFilterChange('category', newCategories);
                      }}
                      className="h-4 w-4 text-luxury-gold focus:ring-luxury-gold border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedItems.length > 0 && (
          <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBulkAddToCart}
                  className="inline-flex items-center px-3 py-1 text-sm bg-luxury-gold text-luxury-black font-medium rounded hover:bg-yellow-400 transition-colors"
                >
                  <ShoppingBag className="mr-1 h-4 w-4" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBulkRemove}
                  className="inline-flex items-center px-3 py-1 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Remove
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Items */}
        {filteredItems.length > 0 ? (
          <>
            {/* Grid/List Toggle Buttons */}
            {filteredItems.length > 3 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Showing {filteredItems.length} of {wishlistCount} items
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAllItems}
                    className="text-sm text-luxury-gold hover:text-yellow-600"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}

            {/* Items Display */}
            <div className={
              viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }>
              {filteredItems.map((item) => {
                const currentPrice = item.product.price;
                const isSelected = selectedItems.includes(item.product_id);
                
                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border-2 transition-all ${
                      isSelected ? 'border-luxury-gold' : 'border-gray-200 hover:border-gray-300'
                    } ${viewMode === 'list' ? 'flex items-center p-4' : 'p-6'}`}
                  >
                    {/* Selection Checkbox */}
                    <div className={`${viewMode === 'list' ? 'mr-4' : 'mb-4'} flex items-center`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(item.product_id)}
                        className="h-4 w-4 text-luxury-gold focus:ring-luxury-gold border-gray-300 rounded"
                      />
                    </div>

                    {/* Product Image */}
                    <div className={`${viewMode === 'list' ? 'w-20 h-20 mr-4' : 'w-full h-48 mb-4'} relative`}>
                      {item.product.featured_image ? (
                        <img
                          src={item.product.featured_image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Sale Badge - removed since no sale_price field */}
                    </div>

                    {/* Product Info */}
                    <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <Link
                        href={`/products/${item.product.slug}`}
                        className="block group"
                      >
                        <h3 className="font-medium text-gray-900 group-hover:text-luxury-gold transition-colors line-clamp-2">
                          {item.product.name}
                        </h3>
                        {item.product.arabic_name && (
                          <p className="text-sm text-gray-600 font-amiri mt-1">
                            {item.product.arabic_name}
                          </p>
                        )}
                      </Link>

                      {item.product.category && (
                        <p className="text-sm text-luxury-gold mt-2">
                          {item.product.category}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(currentPrice, item.product.currency)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Added {formatDate(item.created_at)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className={`${viewMode === 'list' ? 'flex items-center space-x-2 mt-0' : 'space-y-2 mt-4'}`}>
                        <button
                          onClick={() => moveToCart(item.product_id)}
                          className={`${
                            viewMode === 'list' 
                              ? 'px-3 py-1 text-sm' 
                              : 'w-full px-4 py-2'
                          } bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors`}
                        >
                          <ShoppingBag className={`${viewMode === 'list' ? 'mr-1 h-4 w-4' : 'mr-2 h-4 w-4'} inline`} />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.product_id)}
                          className={`${
                            viewMode === 'list' 
                              ? 'px-3 py-1 text-sm' 
                              : 'w-full px-4 py-2'
                          } border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors`}
                        >
                          <Trash2 className={`${viewMode === 'list' ? 'mr-1 h-4 w-4' : 'mr-2 h-4 w-4'} inline`} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {filters.search || (filters.category && filters.category.length > 0)
                  ? 'No items match your filters'
                  : 'Your wishlist is empty'
                }
              </h3>
              <p className="mt-2 text-gray-600">
                {filters.search || (filters.category && filters.category.length > 0)
                  ? 'Try adjusting your search criteria or browse our Islamic art collection.'
                  : 'Start browsing our beautiful Islamic art collection and save your favorite pieces.'
                }
              </p>
              <div className="mt-6 space-x-3">
                {(filters.search || (filters.category && filters.category.length > 0)) && (
                  <button
                    onClick={() => setFilters({ search: '', category: [], sortBy: 'created_at', sortOrder: 'desc' })}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  href="/shop"
                  className="inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Shop Islamic Art
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Actions */}
        {wishlistCount > 0 && (
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Wishlist Summary</h3>
                <p className="text-gray-600">
                  {wishlistCount} items • Total value: {formatCurrency(totalValue)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your entire wishlist?')) {
                      clearWishlist();
                    }
                  }}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Clear Wishlist
                </button>
                <Link
                  href="/shop"
                  className="px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}