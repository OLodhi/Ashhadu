'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Star,
  ShoppingCart,
  Package
} from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import WishlistButton from '@/components/ui/WishlistButton';
import HollowStarRating from '@/components/ui/HollowStarRating';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';

const HeritageCollectionsPage = () => {
  const { addToCart } = useCartStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<{ [productId: string]: { averageRating: number; totalReviews: number } }>({});

  // Fetch custom/heritage products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?status=published');
        if (response.ok) {
          const data = await response.json();
          // Filter for custom/heritage products only
          const heritageProducts = (data.data || []).filter(
            (product: any) => product.islamicCategory === 'custom'
          );
          setProducts(heritageProducts);
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

  // Fetch review statistics for all products
  useEffect(() => {
    const fetchReviewStats = async () => {
      if (products.length === 0) return;

      try {
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

  // Sort products by newest first (default)
  const sortedProducts = React.useMemo(() => {
    const sorted = [...products];
    sorted.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return sorted;
  }, [products]);

  const handleQuickAddToCart = (product: any) => {
    addToCart({
      ...product,
      quantity: 1,
    });
    toast.success(`${product.name} added to cart!`);
  };

  const ProductCard = ({ product }: { product: any }) => {
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
              <p className="text-sm text-luxury-gray-600 arabic-text mt-1 min-h-[1.25rem]">{product.arabicName}</p>
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
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <MainContentWrapper>
        <div className="bg-luxury-gray-50">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-br from-purple-600 via-violet-600 to-violet-700 overflow-hidden min-h-[48vh]">
            {/* Heritage & Cultural Background Elements */}
            <div className="absolute inset-0">
              {/* Ancient Islamic Manuscripts */}
              <div className="absolute top-16 left-16 opacity-12 animate-float">
                <svg width="140" height="100" viewBox="0 0 140 100" className="text-white">
                  <rect x="10" y="10" width="120" height="80" fill="currentColor" opacity="0.3" rx="5"/>
                  <rect x="15" y="15" width="110" height="70" fill="none" stroke="currentColor" strokeWidth="1" rx="3"/>
                  {/* Manuscript lines */}
                  <line x1="25" y1="30" x2="115" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                  <line x1="25" y1="40" x2="105" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                  <line x1="25" y1="50" x2="120" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                  <line x1="25" y1="60" x2="95" y2="60" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                  <line x1="25" y1="70" x2="110" y2="70" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                  {/* Decorative corner */}
                  <circle cx="25" cy="25" r="3" fill="currentColor" opacity="0.4"/>
                </svg>
              </div>

              {/* Heritage Scrolls */}
              <div className="absolute top-32 right-20 opacity-10 animate-float-delayed">
                <svg width="60" height="120" viewBox="0 0 60 120" className="text-white">
                  <ellipse cx="30" cy="15" rx="25" ry="10" fill="currentColor" opacity="0.4"/>
                  <rect x="15" y="15" width="30" height="90" fill="currentColor" opacity="0.3"/>
                  <ellipse cx="30" cy="105" rx="25" ry="10" fill="currentColor" opacity="0.4"/>
                  {/* Scroll decorations */}
                  <line x1="20" y1="30" x2="40" y2="30" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
                  <line x1="20" y1="40" x2="40" y2="40" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
                  <line x1="20" y1="50" x2="40" y2="50" stroke="currentColor" strokeWidth="0.5" opacity="0.6"/>
                </svg>
              </div>

              {/* Traditional Islamic Lamp */}
              <div className="absolute bottom-24 left-32 opacity-15 animate-pulse">
                <svg width="80" height="100" viewBox="0 0 80 100" className="text-white">
                  <ellipse cx="40" cy="20" rx="15" ry="8" fill="currentColor" opacity="0.3"/>
                  <path d="M25 20 L25 60 C25 70, 30 75, 40 75 C50 75, 55 70, 55 60 L55 20 Z" fill="currentColor" opacity="0.4"/>
                  <ellipse cx="40" cy="75" rx="20" ry="10" fill="currentColor" opacity="0.5"/>
                  <rect x="37" y="10" width="6" height="15" fill="currentColor" opacity="0.6"/>
                  <ellipse cx="40" cy="10" rx="8" ry="4" fill="currentColor" opacity="0.4"/>
                  {/* Decorative patterns on lamp */}
                  <circle cx="35" cy="40" r="2" fill="white" opacity="0.3"/>
                  <circle cx="45" cy="40" r="2" fill="white" opacity="0.3"/>
                  <circle cx="40" cy="50" r="2" fill="white" opacity="0.3"/>
                </svg>
              </div>

              {/* Ancient Calligraphy Tools */}
              <div className="absolute bottom-16 right-16 opacity-12 animate-float">
                <svg width="100" height="80" viewBox="0 0 100 80" className="text-white">
                  {/* Quill pen */}
                  <path d="M10 70 L15 10 C15 5, 20 5, 25 10 L30 70" fill="currentColor" opacity="0.4"/>
                  <path d="M15 60 L25 60" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
                  {/* Ink well */}
                  <ellipse cx="60" cy="65" rx="25" ry="10" fill="currentColor" opacity="0.4"/>
                  <ellipse cx="60" cy="55" rx="20" ry="8" fill="currentColor" opacity="0.3"/>
                  <circle cx="60" cy="55" r="3" fill="white" opacity="0.5"/>
                </svg>
              </div>

              {/* Heritage Pattern Background */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 opacity-6">
                <svg width="300" height="300" viewBox="0 0 300 300" className="text-white animate-spin-slow">
                  <g transform="translate(150,150)">
                    {/* Ornate heritage medallion */}
                    <circle cx="0" cy="0" r="120" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
                    <circle cx="0" cy="0" r="100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                    
                    {/* Traditional 12-pointed pattern */}
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => (
                      <g key={angle} transform={`rotate(${angle})`}>
                        <path d="M0,-90 L10,-70 L0,-50 L-10,-70 Z" fill="currentColor" opacity="0.4"/>
                        <line x1="0" y1="-90" x2="0" y2="-50" stroke="currentColor" strokeWidth="0.5" opacity="0.5"/>
                      </g>
                    ))}
                    
                    {/* Central heritage motif */}
                    <circle cx="0" cy="0" r="30" fill="currentColor" opacity="0.3"/>
                    <circle cx="0" cy="0" r="20" fill="none" stroke="white" strokeWidth="1" opacity="0.6"/>
                    <circle cx="0" cy="0" r="10" fill="white" opacity="0.4"/>
                  </g>
                </svg>
              </div>

              {/* Floating Heritage Elements */}
              <div className="absolute top-40 right-32 opacity-8 animate-float-delayed">
                <svg width="60" height="60" viewBox="0 0 60 60" className="text-white">
                  <g transform="translate(30,30)">
                    {/* Traditional Islamic star */}
                    <polygon points="0,-25 7,-8 25,-8 12,3 18,20 0,10 -18,20 -12,3 -25,-8 -7,-8" fill="currentColor" opacity="0.4"/>
                    <circle cx="0" cy="0" r="6" fill="white" opacity="0.6"/>
                  </g>
                </svg>
              </div>

              {/* Heritage Ornamental Border Elements */}
              <div className="absolute top-12 left-1/3 opacity-10">
                <svg width="200" height="40" viewBox="0 0 200 40" className="text-white">
                  <g>
                    {/* Repeating heritage border pattern */}
                    {[0, 40, 80, 120, 160].map(x => (
                      <g key={x} transform={`translate(${x},20)`}>
                        <circle cx="0" cy="0" r="8" fill="currentColor" opacity="0.3"/>
                        <path d="M-15,0 L-8,-8 L8,-8 L15,0 L8,8 L-8,8 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                      </g>
                    ))}
                  </g>
                </svg>
              </div>
            </div>

            {/* Textured Heritage Overlay */}
            <div className="absolute inset-0 opacity-15">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M40 0l40 40-40 40L0 40z' fill-opacity='0.1'/%3E%3Cpath d='M40 20l20 20-20 20-20-20z' fill-opacity='0.2'/%3E%3C/g%3E%3C/svg%3E")`,
                animation: 'pulse-slow 7s ease-in-out infinite'
              }}></div>
            </div>

            {/* Royal Purple Depth Gradient */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/35"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[48vh]">
              <div className="text-center text-white transform">
                {/* Heritage Crown Ornament */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <svg width="120" height="40" viewBox="0 0 120 40" className="text-white/60">
                      <g transform="translate(60,20)">
                        {/* Crown-like heritage ornament */}
                        <path d="M-50,15 L-30,0 L-15,10 L0,-5 L15,10 L30,0 L50,15 L50,20 L-50,20 Z" fill="currentColor" opacity="0.4"/>
                        <circle cx="-30" cy="0" r="4" fill="white" opacity="0.6"/>
                        <circle cx="0" cy="-5" r="5" fill="white" opacity="0.7"/>
                        <circle cx="30" cy="0" r="4" fill="white" opacity="0.6"/>
                        <path d="M-50,15 L50,15" stroke="white" strokeWidth="2" opacity="0.5"/>
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Main Title with Heritage Majesty */}
                <div className="relative mb-6">
                  <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-4 relative z-10 transform hover:scale-105 transition-transform duration-700 cursor-default">
                    <span className="relative inline-block">
                      <span className="absolute inset-0 text-white/25 blur-sm">Heritage Collections</span>
                      <span className="relative text-white drop-shadow-2xl">Heritage Collections</span>
                    </span>
                  </h1>
                  
                  {/* Ornate Heritage Underline */}
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 h-1 bg-white/40 rounded-full"></div>
                      <div className="w-8 h-4 bg-white/50 rounded-full opacity-60"></div>
                      <div className="w-6 h-6 bg-white/60 rounded-full animate-pulse"></div>
                      <div className="w-40 h-1 bg-gradient-to-r from-white/60 via-white/90 to-white/60 rounded-full animate-expand"></div>
                      <div className="w-6 h-6 bg-white/60 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                      <div className="w-8 h-4 bg-white/50 rounded-full opacity-60"></div>
                      <div className="w-12 h-1 bg-white/40 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Arabic Text with Heritage Elements */}
                <div className="relative mb-8">
                  <p className="text-3xl md:text-4xl arabic-text font-bold opacity-95 transform hover:scale-110 transition-all duration-500 cursor-default">
                    <span className="relative inline-block">
                      <span className="absolute inset-0 text-white/30 blur-sm">مجموعات التراث</span>
                      <span className="relative text-white drop-shadow-lg">مجموعات التراث</span>
                    </span>
                  </p>
                  
                  {/* Heritage Ornaments Around Arabic Text */}
                  <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 w-12 h-12 opacity-25">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white animate-pulse">
                      <g transform="translate(50,50)">
                        <polygon points="0,-35 10,-15 35,-15 18,0 25,25 0,12 -25,25 -18,0 -35,-15 -10,-15" fill="currentColor" opacity="0.4"/>
                        <circle cx="0" cy="0" r="8" fill="white" opacity="0.6"/>
                      </g>
                    </svg>
                  </div>
                  <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 w-10 h-10 opacity-25">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white animate-pulse" style={{animationDelay: '1s'}}>
                      <g transform="translate(50,50)">
                        <circle cx="0" cy="0" r="30" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
                        <circle cx="0" cy="0" r="20" fill="currentColor" opacity="0.3"/>
                        <circle cx="0" cy="0" r="8" fill="white" opacity="0.6"/>
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Description with Heritage Theme */}
                <div className="max-w-4xl mx-auto">
                  <p className="text-xl md:text-2xl leading-relaxed opacity-95 font-light tracking-wide transform hover:opacity-100 transition-opacity duration-500">
                    <em>Timeless treasures preserving centuries of Islamic artistic legacy.</em>
                  </p>
                  <p className="text-lg md:text-xl mt-4 leading-relaxed opacity-85 max-w-3xl mx-auto">
                    Each piece in our heritage collection tells a story of cultural preservation, 
                    carrying forward the artistic traditions that have enriched Islamic civilization for generations.
                  </p>
                </div>

                {/* Heritage Crown Bottom Ornament */}
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-6 bg-white/40 rounded-t-full animate-pulse"></div>
                    <div className="w-4 h-8 bg-white/50 rounded-t-full animate-bounce"></div>
                    <div className="w-5 h-10 bg-white/60 rounded-t-full animate-pulse" style={{animationDelay: '0.3s'}}></div>
                    <div className="w-6 h-12 bg-white/70 rounded-t-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-5 h-10 bg-white/60 rounded-t-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
                    <div className="w-4 h-8 bg-white/50 rounded-t-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    <div className="w-3 h-6 bg-white/40 rounded-t-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-luxury p-6 animate-pulse">
                    <div className="bg-luxury-gray-200 h-48 rounded-lg mb-4"></div>
                    <div className="bg-luxury-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-luxury-gray-200 h-4 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-luxury p-12 text-center">
                <Package className="h-16 w-16 text-luxury-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-luxury-black mb-2">
                  No heritage pieces found
                </h3>
                <p className="text-luxury-gray-600 mb-6">
                  We're working on adding more beautiful heritage collection pieces that celebrate Islamic artistic traditions.
                </p>
                <Link href="/shop" className="btn-luxury">
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </MainContentWrapper>
      
      <Footer />
    </div>
  );
};

export default HeritageCollectionsPage;