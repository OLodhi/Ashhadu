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

const IslamicArchitecturePage = () => {
  const { addToCart } = useCartStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<{ [productId: string]: { averageRating: number; totalReviews: number } }>({});

  // Fetch architecture products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?status=published');
        if (response.ok) {
          const data = await response.json();
          // Filter for architecture products only
          const architectureProducts = (data.data || []).filter(
            (product: any) => product.islamicCategory === 'architecture'
          );
          setProducts(architectureProducts);
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
          <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-emerald-700 overflow-hidden min-h-[48vh]">
            {/* Architectural Background Elements */}
            <div className="absolute inset-0">
              {/* Dome Silhouettes */}
              <div className="absolute top-12 left-16 opacity-15">
                <svg width="160" height="120" viewBox="0 0 160 120" className="text-white">
                  <path d="M80 20 C100 20, 120 40, 120 60 L120 100 L40 100 L40 60 C40 40, 60 20, 80 20 Z" fill="currentColor"/>
                  <circle cx="80" cy="15" r="8" fill="currentColor"/>
                  <rect x="76" y="5" width="8" height="15" fill="currentColor"/>
                </svg>
              </div>
              
              {/* Minaret Silhouettes */}
              <div className="absolute top-8 right-20 opacity-12">
                <svg width="60" height="140" viewBox="0 0 60 140" className="text-white">
                  <rect x="20" y="20" width="20" height="100" fill="currentColor"/>
                  <rect x="15" y="115" width="30" height="8" fill="currentColor"/>
                  <rect x="10" y="123" width="40" height="8" fill="currentColor"/>
                  <rect x="5" y="131" width="50" height="8" fill="currentColor"/>
                  <circle cx="30" cy="20" r="12" fill="currentColor"/>
                  <rect x="27" y="5" width="6" height="20" fill="currentColor"/>
                  <circle cx="30" cy="5" r="4" fill="currentColor"/>
                </svg>
              </div>

              {/* Arch Elements */}
              <div className="absolute bottom-20 left-32 opacity-10 animate-float">
                <svg width="100" height="80" viewBox="0 0 100 80" className="text-white">
                  <path d="M10 70 L10 40 C10 20, 30 10, 50 10 C70 10, 90 20, 90 40 L90 70 Z" fill="none" stroke="currentColor" strokeWidth="3"/>
                  <path d="M20 70 L20 45 C20 30, 35 20, 50 20 C65 20, 80 30, 80 45 L80 70" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>

              <div className="absolute top-32 right-12 opacity-8 animate-float-delayed">
                <svg width="80" height="60" viewBox="0 0 80 60" className="text-white">
                  <path d="M10 50 L10 30 C10 15, 25 5, 40 5 C55 5, 70 15, 70 30 L70 50 Z" fill="currentColor"/>
                </svg>
              </div>

              {/* Geometric Islamic Patterns */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 opacity-8">
                <svg width="200" height="200" viewBox="0 0 200 200" className="text-white animate-spin-slow">
                  <g transform="translate(100,100)">
                    <polygon points="0,-60 52,-18 32,48 -32,48 -52,-18" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <polygon points="0,-40 35,-12 21,32 -21,32 -35,-12" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="0" cy="0" r="8" fill="currentColor"/>
                  </g>
                </svg>
              </div>

              {/* Floating Architectural Elements */}
              <div className="absolute bottom-32 right-16 opacity-12 animate-pulse">
                <svg width="120" height="90" viewBox="0 0 120 90" className="text-white">
                  <rect x="10" y="60" width="100" height="20" fill="currentColor"/>
                  <rect x="20" y="40" width="80" height="20" fill="currentColor"/>
                  <rect x="30" y="20" width="60" height="20" fill="currentColor"/>
                  <polygon points="60,5 90,20 30,20" fill="currentColor"/>
                  <circle cx="60" cy="0" r="5" fill="currentColor"/>
                </svg>
              </div>
            </div>

            {/* Animated Overlay Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.3'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                animation: 'pulse-slow 6s ease-in-out infinite'
              }}></div>
            </div>

            {/* Depth Gradient */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/30"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[48vh]">
              <div className="text-center text-white transform">
                {/* Architectural Top Ornament */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <svg width="80" height="40" viewBox="0 0 80 40" className="text-white/60">
                      <path d="M5 35 L5 20 C5 10, 15 5, 25 5 L55 5 C65 5, 75 10, 75 20 L75 35 Z" fill="currentColor"/>
                      <path d="M40 5 L40 0" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="40" cy="0" r="3" fill="currentColor"/>
                    </svg>
                  </div>
                </div>

                {/* Main Title with Architectural Effect */}
                <div className="relative mb-6">
                  <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-4 relative z-10 transform hover:scale-105 transition-transform duration-700 cursor-default">
                    <span className="relative inline-block">
                      <span className="absolute inset-0 text-white/25 blur-sm">Islamic Architecture</span>
                      <span className="relative text-white drop-shadow-2xl tracking-wide">Islamic Architecture</span>
                    </span>
                  </h1>
                  
                  {/* Architectural Inspired Underline */}
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-1 bg-white/40 rounded-full"></div>
                      <div className="w-6 h-3 bg-white/50 rounded-t-full"></div>
                      <div className="w-32 h-1 bg-gradient-to-r from-white/60 via-white/80 to-white/60 rounded-full animate-expand"></div>
                      <div className="w-6 h-3 bg-white/50 rounded-t-full"></div>
                      <div className="w-8 h-1 bg-white/40 rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Arabic Text with Dome Elements */}
                <div className="relative mb-8">
                  <p className="text-3xl md:text-4xl arabic-text font-bold opacity-95 transform hover:scale-110 transition-all duration-500 cursor-default">
                    <span className="relative inline-block">
                      <span className="absolute inset-0 text-white/30 blur-sm">العمارة الإسلامية</span>
                      <span className="relative text-white drop-shadow-lg">العمارة الإسلامية</span>
                    </span>
                  </p>
                  
                  {/* Dome Silhouettes Around Arabic Text */}
                  <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 w-12 h-12 opacity-30">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white animate-pulse">
                      <path d="M50 20 C65 20, 80 35, 80 50 L80 80 L20 80 L20 50 C20 35, 35 20, 50 20 Z" fill="currentColor"/>
                      <circle cx="50" cy="15" r="4" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="absolute -right-16 top-1/2 transform -translate-y-1/2 w-10 h-10 opacity-30">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white animate-pulse" style={{animationDelay: '1s'}}>
                      <rect x="35" y="30" width="30" height="50" fill="currentColor"/>
                      <circle cx="50" cy="30" r="15" fill="currentColor"/>
                      <rect x="47" y="15" width="6" height="20" fill="currentColor"/>
                    </svg>
                  </div>
                </div>

                {/* Description with Architectural Theme */}
                <div className="max-w-4xl mx-auto">
                  <p className="text-xl md:text-2xl leading-relaxed opacity-95 font-light tracking-wide transform hover:opacity-100 transition-opacity duration-500">
                    <em>Sacred spaces recreated in stunning architectural detail.</em>
                  </p>
                  <p className="text-lg md:text-xl mt-4 leading-relaxed opacity-85 max-w-3xl mx-auto">
                    From the soaring minarets of the Blue Mosque to the intricate arches of the Alhambra, 
                    each model captures the divine geometry and spiritual essence of Islamic architecture.
                  </p>
                </div>

                {/* Architectural Bottom Ornament */}
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-6 bg-white/40 rounded-t-full animate-pulse"></div>
                    <div className="w-2 h-4 bg-white/50 rounded-t-full animate-bounce"></div>
                    <div className="w-6 h-8 bg-white/60 rounded-t-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-2 h-4 bg-white/50 rounded-t-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-4 h-6 bg-white/40 rounded-t-full animate-pulse" style={{animationDelay: '1s'}}></div>
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
                  No architecture pieces found
                </h3>
                <p className="text-luxury-gray-600 mb-6">
                  We're working on adding more stunning Islamic architecture models to our collection.
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

export default IslamicArchitecturePage;