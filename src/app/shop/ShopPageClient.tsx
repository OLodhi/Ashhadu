'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Search,
  Filter,
  Grid,
  List,
  Star,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronDown,
  Package,
  ArrowUpDown
} from 'lucide-react';
// Removed useProductStore - now using API calls
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { IslamicArtCategory } from '@/types/product';
import { toast } from 'react-hot-toast';
import WishlistButton from '@/components/ui/WishlistButton';

const ShopPageClient = () => {
  const { addToCart } = useCartStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<IslamicArtCategory | 'all'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating' | 'name'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const allMaterials = useMemo(() => {
    const materials = new Set<string>();
    products.forEach(product => 
      product.material?.forEach((material: string) => materials.add(material))
    );
    return Array.from(materials);
  }, [products]);

  const difficulties = ['Simple', 'Moderate', 'Complex', 'Master'];

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?status=published');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        } else {
          console.error('Failed to fetch products');
          toast.error('Failed to load products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories: { value: IslamicArtCategory | 'all'; label: string; count: number }[] = [
    { value: 'all', label: 'All Products', count: products.length },
    { value: 'calligraphy', label: 'Islamic Calligraphy', count: products.filter(p => p.islamicCategory === 'calligraphy').length },
    { value: 'architecture', label: 'Architecture Models', count: products.filter(p => p.islamicCategory === 'architecture').length },
    { value: 'geometric', label: 'Geometric Patterns', count: products.filter(p => p.islamicCategory === 'geometric').length },
    { value: 'decorative', label: 'Decorative Art', count: products.filter(p => p.islamicCategory === 'decorative').length },
    { value: 'custom', label: 'Custom Commissions', count: products.filter(p => p.islamicCategory === 'custom').length },
  ];

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.arabicName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || product.islamicCategory === selectedCategory;

      // Price filter
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      // Material filter
      const matchesMaterial = selectedMaterials.length === 0 || 
        selectedMaterials.some(material => product.material?.includes(material));

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty.length === 0 || 
        selectedDifficulty.includes(product.difficulty);

      return matchesSearch && matchesCategory && matchesPrice && matchesMaterial && matchesDifficulty;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, selectedMaterials, selectedDifficulty, sortBy]);

  const handleMaterialToggle = (material: string) => {
    setSelectedMaterials(prev => 
      prev.includes(material) 
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulty(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, 500]);
    setSelectedMaterials([]);
    setSelectedDifficulty([]);
  };

  const handleQuickAddToCart = (product: any) => {
    addToCart({
      ...product,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
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

  const ProductCard = ({ product }: { product: any }) => (
    <div className="bg-white rounded-lg shadow-luxury overflow-hidden group hover:shadow-luxury-hover transition-all duration-300">
      {/* Product Image */}
      <div className="relative aspect-square bg-luxury-gray-50 overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.featuredImage || '/images/products/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
          <div className="flex items-center">
            {getRatingStars(product.rating || 5)}
          </div>
          <span className="text-sm text-luxury-gray-600">({product.reviewCount || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-lg font-bold text-luxury-gold">
              {formatPrice(product.price)}
            </span>
            {product.onSale && product.regularPrice > product.price && (
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

  const ProductListItem = ({ product }: { product: any }) => (
    <div className="bg-white rounded-lg shadow-luxury p-6 flex items-center space-x-6">
      {/* Product Image */}
      <div className="relative w-24 h-24 bg-luxury-gray-50 rounded-lg overflow-hidden flex-shrink-0">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.featuredImage || '/images/products/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
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
            {getRatingStars(product.rating || 5)}
            <span className="text-sm text-luxury-gray-600 ml-2">({product.reviewCount || 0})</span>
          </div>
          <span className="text-sm text-luxury-gray-600">SKU: {product.sku}</span>
        </div>

        <p className="text-luxury-gray-600 line-clamp-2">{product.shortDescription}</p>
      </div>

      {/* Price and Actions */}
      <div className="flex flex-col items-end space-y-3">
        <div className="text-right">
          <div className="text-xl font-bold text-luxury-gold">
            {formatPrice(product.price)}
          </div>
          {product.onSale && product.regularPrice > product.price && (
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

  return (
    <div className="min-h-screen">
      <Header />
      
      <main id="main-content" className="pt-16 lg:pt-20 bg-luxury-gray-50">
        {/* Page Header */}
        <div className="bg-white border-b border-luxury-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-luxury-black mb-4">Islamic Art Collection</h1>
              <p className="text-lg text-luxury-gray-600 max-w-2xl mx-auto">
                Discover our carefully curated collection of authentic Islamic art pieces, 
                each crafted with reverence for tradition and attention to detail.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-lg shadow-luxury p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-luxury-black">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-luxury-gold hover:text-luxury-black transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-luxury-black mb-2">
                      Search Products
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gray-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2 w-full border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                      />
                    </div>
                  </div>

                  {/* Categories */}
                  <div>
                    <label className="block text-sm font-medium text-luxury-black mb-3">
                      Categories
                    </label>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category.value}
                          onClick={() => setSelectedCategory(category.value)}
                          className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                            selectedCategory === category.value
                              ? 'bg-luxury-gold text-white'
                              : 'text-luxury-gray-700 hover:bg-luxury-gray-50'
                          }`}
                        >
                          <span>{category.label}</span>
                          <span className="text-sm">({category.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-luxury-black mb-3">
                      Price Range
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          placeholder="Min"
                          className="w-20 px-2 py-1 border border-luxury-gray-200 rounded text-sm"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])}
                          placeholder="Max"
                          className="w-20 px-2 py-1 border border-luxury-gray-200 rounded text-sm"
                        />
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-luxury-gray-600">
                        <span>£0</span>
                        <span>£500+</span>
                      </div>
                    </div>
                  </div>

                  {/* Materials */}
                  {allMaterials.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-luxury-black mb-3">
                        Materials
                      </label>
                      <div className="space-y-2">
                        {allMaterials.map((material) => (
                          <label key={material} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedMaterials.includes(material)}
                              onChange={() => handleMaterialToggle(material)}
                              className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
                            />
                            <span className="text-sm text-luxury-gray-700">{material}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-luxury-black mb-3">
                      Difficulty Level
                    </label>
                    <div className="space-y-2">
                      {difficulties.map((difficulty) => (
                        <label key={difficulty} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedDifficulty.includes(difficulty)}
                            onChange={() => handleDifficultyToggle(difficulty)}
                            className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
                          />
                          <span className="text-sm text-luxury-gray-700">{difficulty}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-lg shadow-luxury p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <p className="text-luxury-gray-600">
                      Showing {filteredProducts.length} of {products.length} products
                    </p>
                    
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden btn-luxury-ghost"
                    >
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filters
                    </button>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Sort Dropdown */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold appearance-none pr-8"
                      >
                        <option value="newest">Newest First</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Highest Rated</option>
                        <option value="name">Name: A to Z</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gray-400 pointer-events-none" />
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex border border-luxury-gray-200 rounded-lg">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 ${
                          viewMode === 'grid' 
                            ? 'bg-luxury-gold text-white' 
                            : 'text-luxury-gray-600 hover:bg-luxury-gray-50'
                        }`}
                      >
                        <Grid className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 ${
                          viewMode === 'list' 
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

              {/* Products Grid/List */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-luxury p-6 animate-pulse">
                      <div className="bg-luxury-gray-200 h-48 rounded-lg mb-4"></div>
                      <div className="bg-luxury-gray-200 h-4 rounded mb-2"></div>
                      <div className="bg-luxury-gray-200 h-4 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }>
                  {filteredProducts.map((product) => 
                    viewMode === 'grid' ? (
                      <ProductCard key={product.id} product={product} />
                    ) : (
                      <ProductListItem key={product.id} product={product} />
                    )
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-luxury p-12 text-center">
                  <Package className="h-16 w-16 text-luxury-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-luxury-black mb-2">
                    No products found
                  </h3>
                  <p className="text-luxury-gray-600 mb-6">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="btn-luxury"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ShopPageClient;