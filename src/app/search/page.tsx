'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, Grid, List, Star, ShoppingCart, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import WishlistButton from '@/components/ui/WishlistButton';
import HollowStarRating from '@/components/ui/HollowStarRating';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  arabicName?: string;
  price: number;
  regularPrice?: number;
  featuredImage: string;
  category: string;
  description: string;
  shortDescription?: string;
  rating?: number;
  reviewCount?: number;
  onSale?: boolean;
  originalPrice?: number;
  stock: number;
  featured?: boolean;
  sku: string;
  createdAt?: string;
}

const categories = [
  'All Categories',
  'Islamic Calligraphy',
  'Mosque Models',
  'Geometric Art',
  'Wall Art',
  'Custom Commission'
];

const sortOptions = [
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'created_at-asc', label: 'Oldest First' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'price-asc', label: 'Price Low to High' },
  { value: 'price-desc', label: 'Price High to Low' }
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { addToCart } = useCartStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('created_at-desc');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [totalResults, setTotalResults] = useState(0);
  const [reviewStats, setReviewStats] = useState<{ [productId: string]: { averageRating: number; totalReviews: number } }>({});

  useEffect(() => {
    setSearchTerm(query);
    // Only fetch results on initial load if there's a query from URL
    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  useEffect(() => {
    fetchSearchResults();
  }, [selectedCategory, sortBy]);

  // Fetch review statistics for all products
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (products.length === 0) return;

      try {
        // Fetch review stats for all products in parallel
        const statsPromises = products.map(async (product) => {
          try {
            const response = await fetch(`/api/products/${product.id}/reviews`);
            if (response.ok) {
              const data = await response.json();
              return {
                productId: product.id,
                stats: {
                  averageRating: data.data.statistics.averageRating || 0,
                  totalReviews: data.data.statistics.totalReviews || 0
                }
              };
            }
          } catch (error) {
            console.error(`Error fetching reviews for product ${product.id}:`, error);
          }
          return {
            productId: product.id,
            stats: { averageRating: 0, totalReviews: 0 }
          };
        });

        const statsResults = await Promise.all(statsPromises);
        
        // Convert to object for easy lookup
        const statsObject = statsResults.reduce((acc, { productId, stats }) => {
          acc[productId] = stats;
          return acc;
        }, {} as { [productId: string]: { averageRating: number; totalReviews: number } });

        setReviewStats(statsObject);
      } catch (error) {
        console.error('Error fetching review statistics:', error);
      }
    };

    fetchReviewStats();
  }, [products]);

  const fetchSearchResults = async () => {
    // Don't search if there's no search term (unless filters are applied)
    if (!searchTerm.trim() && selectedCategory === 'All Categories') {
      setProducts([]);
      setTotalResults(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: 'published',
      });
      
      if (searchTerm.trim()) {
        params.append('search', searchTerm);
      }
      
      if (selectedCategory !== 'All Categories') {
        params.append('category', selectedCategory);
      }
      
      // Handle sorting
      const [field, direction] = sortBy.split('-');
      // Note: The API uses created_at ordering by default, so we'll handle other sorts on frontend
      
      const response = await fetch(`/api/products?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        let sortedProducts = data.data || [];
        
        // Apply sorting
        sortedProducts.sort((a: Product, b: Product) => {
          switch (sortBy) {
            case 'name-asc':
              return a.name.localeCompare(b.name);
            case 'name-desc':
              return b.name.localeCompare(a.name);
            case 'price-asc':
              return a.price - b.price;
            case 'price-desc':
              return b.price - a.price;
            case 'created_at-asc':
              return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
            case 'created_at-desc':
            default:
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          }
        });
        
        setProducts(sortedProducts);
        setTotalResults(sortedProducts.length);
      }
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
      setTotalResults(0);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Update URL and trigger search
      const newUrl = `/search?q=${encodeURIComponent(searchTerm)}`;
      window.history.pushState({}, '', newUrl);
      fetchSearchResults();
    }
  };

  const handleQuickAddToCart = (product: Product) => {
    addToCart({
      ...product,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const ProductCard = ({ product }: { product: Product }) => {
    const productReviewStats = reviewStats[product.id] || { averageRating: 0, totalReviews: 0 };
    
    return (
    <div className="bg-white rounded-lg shadow-luxury overflow-hidden group hover:shadow-luxury-hover transition-all duration-300">
      {/* Product Image */}
      <div className="relative aspect-square bg-luxury-gray-50 overflow-hidden">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <Image
            src={product.featuredImage || '/images/products/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
            unoptimized={product.featuredImage?.startsWith('data:')}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 space-y-1">
          {product.onSale && (
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
              Sale
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-1 bg-luxury-gold text-white text-xs font-medium rounded">
              Featured
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton
            productId={product.id.toString()}
            size="small"
            variant="icon"
          />
          <button 
            onClick={() => handleQuickAddToCart(product)}
            className="p-2 bg-white/90 text-luxury-gray-600 rounded-full hover:bg-white hover:text-luxury-gold transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <Link 
            href={`/products/${product.id}`}
            className="font-semibold text-luxury-black hover:text-luxury-gold transition-colors line-clamp-2"
          >
            {product.name}
          </Link>
          {product.arabicName && (
            <p className="text-sm text-luxury-gray-600 arabic-text mt-1">{product.arabicName}</p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-2">
          <HollowStarRating 
            rating={productReviewStats.averageRating} 
            size="small"
          />
          <span className="text-sm text-luxury-gray-600">({productReviewStats.totalReviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-luxury-gold">
              {formatPrice(product.price)}
            </span>
            {product.onSale && product.regularPrice && product.regularPrice > product.price && (
              <span className="text-sm text-luxury-gray-500 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>
          
          <span className={`text-xs px-2 py-1 rounded-full ${
            product.stock > 10 
              ? 'bg-green-100 text-green-800' 
              : product.stock > 0 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
          </span>
        </div>
      </div>
    </div>
    );
  };

  const ProductListItem = ({ product }: { product: Product }) => {
    const productReviewStats = reviewStats[product.id] || { averageRating: 0, totalReviews: 0 };
    
    return (
    <div className="bg-white rounded-lg shadow-luxury p-6 flex items-center space-x-6">
      {/* Product Image */}
      <div className="relative w-24 h-24 bg-luxury-gray-50 rounded-lg overflow-hidden flex-shrink-0">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <Image
            src={product.featuredImage || '/images/products/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
            priority={false}
            unoptimized={product.featuredImage?.startsWith('data:')}
          />
        </Link>
      </div>

      {/* Product Info */}
      <div className="flex-1 space-y-2">
        <div>
          <Link 
            href={`/products/${product.id}`}
            className="text-lg font-semibold text-luxury-black hover:text-luxury-gold transition-colors"
          >
            {product.name}
          </Link>
          {product.arabicName && (
            <p className="text-sm text-luxury-gray-600 arabic-text">{product.arabicName}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <HollowStarRating 
              rating={productReviewStats.averageRating} 
              size="small"
            />
            <span className="text-sm text-luxury-gray-600 ml-2">({productReviewStats.totalReviews})</span>
          </div>
          {product.sku && (
            <span className="text-sm text-luxury-gray-600">SKU: {product.sku}</span>
          )}
        </div>

        <p className="text-luxury-gray-600 line-clamp-2">{product.shortDescription || product.description}</p>
      </div>

      {/* Price and Actions */}
      <div className="flex flex-col items-end space-y-3">
        <div className="text-right">
          <div className="text-xl font-bold text-luxury-gold">
            {formatPrice(product.price)}
          </div>
          {product.onSale && product.regularPrice && product.regularPrice > product.price && (
            <div className="text-sm text-luxury-gray-500 line-through">
              {formatPrice(product.regularPrice)}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <WishlistButton
            productId={product.id.toString()}
            size="small"
            variant="icon"
          />
          <button 
            onClick={() => handleQuickAddToCart(product)}
            className="btn-luxury text-sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <MainContentWrapper>
        {/* Search Header */}
        <section className="pt-12 pb-8 md:pt-16 md:pb-12 lg:pt-20 lg:pb-16 bg-luxury-gray-50">
          <div className="container-luxury">
            <div className="text-center mb-8">
              <h1 className="heading-section mb-4">
                {query ? `Search Results for "${query}"` : 'Search Islamic Art'}
              </h1>
              <p className="text-body text-luxury-gray-600">
                {totalResults > 0 
                  ? `Found ${totalResults} ${totalResults === 1 ? 'product' : 'products'}`
                  : 'No products found'
                }
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxury-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for Islamic art, calligraphy, or mosque models..."
                  className="w-full pl-12 pr-4 py-4 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-black placeholder-luxury-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-luxury-gold hover:bg-luxury-dark-gold text-luxury-black font-semibold px-6 py-2 rounded transition-colors duration-200"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Filters and Results */}
        <section className="bg-luxury-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-luxury p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <p className="text-luxury-gray-600">
                    {query ? `Search results for "${query}"` : 'All products'} - Showing {totalResults} products
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold appearance-none pr-8"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  {/* Sort Options */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold appearance-none pr-8"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {/* View Mode Toggle */}
                  <div className="flex border border-luxury-gray-200 rounded-lg">
                    <button
                      onClick={() => setViewType('grid')}
                      className={`p-2 ${
                        viewType === 'grid' 
                          ? 'bg-luxury-gold text-white' 
                          : 'text-luxury-gray-600 hover:bg-luxury-gray-50'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewType('list')}
                      className={`p-2 ${
                        viewType === 'list' 
                          ? 'bg-luxury-gold text-white' 
                          : 'text-luxury-gray-600 hover:bg-luxury-gray-50'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className={
                viewType === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-luxury p-6 animate-pulse">
                    <div className="bg-luxury-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="bg-luxury-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-luxury-gray-200 h-4 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              /* Results Grid/List */
              <div className={
                viewType === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {products.map((product, index) => 
                  viewType === 'grid' ? (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <ProductListItem product={product} />
                    </motion.div>
                  )
                )}
              </div>
            ) : (
              /* No Results */
              <div className="bg-white rounded-lg shadow-luxury p-12 text-center">
                <Package className="h-16 w-16 text-luxury-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-luxury-black mb-2">
                  No products found
                </h3>
                <p className="text-luxury-gray-600 mb-6">
                  Try adjusting your search terms or browse our collections.
                </p>
                <Link href="/shop" className="btn-luxury">
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        </section>
      </MainContentWrapper>
      
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen">
        <Header />
        
        <MainContentWrapper>
          {/* Search Header Loading */}
          <section className="pt-12 pb-8 md:pt-16 md:pb-12 lg:pt-20 lg:pb-16 bg-luxury-gray-50">
            <div className="container-luxury">
              <div className="text-center mb-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-luxury-gray-200 rounded w-64 mx-auto mb-4"></div>
                  <div className="h-4 bg-luxury-gray-200 rounded w-48 mx-auto"></div>
                </div>
              </div>

              {/* Search Form Loading */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="relative animate-pulse">
                  <div className="h-16 bg-luxury-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Filters and Results Loading */}
          <section className="bg-luxury-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Toolbar Loading */}
              <div className="bg-white rounded-lg shadow-luxury p-4 mb-6 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-luxury-gray-200 rounded w-48"></div>
                  <div className="flex space-x-4">
                    <div className="h-10 bg-luxury-gray-200 rounded w-32"></div>
                    <div className="h-10 bg-luxury-gray-200 rounded w-32"></div>
                    <div className="h-10 bg-luxury-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>

              {/* Loading Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-luxury p-6 animate-pulse">
                    <div className="bg-luxury-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="bg-luxury-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-luxury-gray-200 h-4 rounded w-3/4 mb-2"></div>
                    <div className="bg-luxury-gray-200 h-6 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </MainContentWrapper>
        
        <Footer />
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}