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

const IslamicCalligraphyPage = () => {
  const { addToCart } = useCartStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<{ [productId: string]: { averageRating: number; totalReviews: number } }>({});

  // Fetch calligraphy products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?status=published');
        if (response.ok) {
          const data = await response.json();
          // Filter for Islamic Calligraphy products only
          const calligraphyProducts = (data.data || []).filter(
            (product: any) => product.category === 'Islamic Calligraphy'
          );
          setProducts(calligraphyProducts);
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
          <div className="relative bg-gradient-to-br from-luxury-gold via-yellow-500 to-yellow-600 overflow-hidden min-h-[48vh]">
            {/* Animated Background Elements */}
            <div className="absolute inset-0">
              {/* Floating Islamic Geometric Shapes */}
              <div className="absolute top-20 left-20 w-32 h-32 opacity-10 animate-float">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                  <polygon points="50,5 90,25 90,75 50,95 10,75 10,25" fill="currentColor" />
                </svg>
              </div>
              <div className="absolute top-40 right-16 w-24 h-24 opacity-15 animate-float-delayed">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="15" fill="currentColor"/>
                </svg>
              </div>
              <div className="absolute bottom-32 left-32 w-20 h-20 opacity-10 animate-pulse">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                  <path d="M50 10 L70 30 L50 50 L30 30 Z M50 50 L70 70 L50 90 L30 70 Z" fill="currentColor"/>
                </svg>
              </div>
              
              {/* Flowing Lines */}
              <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <svg viewBox="0 0 1200 400" className="w-full h-full">
                  <path d="M0,200 Q300,100 600,200 T1200,200" stroke="white" strokeWidth="2" fill="none" opacity="0.3">
                    <animate attributeName="d" 
                      values="M0,200 Q300,100 600,200 T1200,200;M0,200 Q300,300 600,200 T1200,200;M0,200 Q300,100 600,200 T1200,200" 
                      dur="8s" repeatCount="indefinite"/>
                  </path>
                  <path d="M0,250 Q400,150 800,250 T1200,250" stroke="white" strokeWidth="1.5" fill="none" opacity="0.2">
                    <animate attributeName="d" 
                      values="M0,250 Q400,150 800,250 T1200,250;M0,250 Q400,350 800,250 T1200,250;M0,250 Q400,150 800,250 T1200,250" 
                      dur="10s" repeatCount="indefinite"/>
                  </path>
                </svg>
              </div>
            </div>

            {/* Islamic Pattern Overlay with Animation */}
            <div className="absolute inset-0 islamic-pattern-overlay opacity-20 animate-pulse-slow"></div>
            
            {/* Radial Gradient Overlay for Depth */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/20"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[48vh]">
              <div className="text-center text-white transform">
                {/* Decorative Top Element */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="w-24 h-1 bg-white/40 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white/60 rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* Main Title with Glow Effect */}
                <div className="relative mb-6">
                  <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-4 relative z-10 transform hover:scale-105 transition-transform duration-700 cursor-default">
                    <span className="relative inline-block">
                      <span className="absolute inset-0 text-white/20 blur-sm">Islamic Calligraphy</span>
                      <span className="relative text-white drop-shadow-2xl">Islamic Calligraphy</span>
                    </span>
                  </h1>
                  
                  {/* Animated Underline */}
                  <div className="flex justify-center">
                    <div className="h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full animate-expand" style={{width: '200px'}}></div>
                  </div>
                </div>

                {/* Arabic Text with Special Styling */}
                <div className="relative mb-8">
                  <p className="text-3xl md:text-4xl arabic-text font-bold opacity-95 transform hover:scale-110 transition-all duration-500 cursor-default">
                    <span className="relative inline-block">
                      <span className="absolute inset-0 text-white/30 blur-sm">الخط العربي</span>
                      <span className="relative text-white drop-shadow-lg">الخط العربي</span>
                    </span>
                  </p>
                  
                  {/* Decorative Elements Around Arabic Text */}
                  <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 w-8 h-8 opacity-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white animate-spin-slow">
                      <path d="M50,10 L60,40 L90,40 L68,58 L78,90 L50,72 L22,90 L32,58 L10,40 L40,40 Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 w-8 h-8 opacity-40">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white animate-spin-slow-reverse">
                      <path d="M50,10 L60,40 L90,40 L68,58 L78,90 L50,72 L22,90 L32,58 L10,40 L40,40 Z" fill="currentColor"/>
                    </svg>
                  </div>
                </div>

                {/* Description with Better Typography */}
                <div className="max-w-4xl mx-auto">
                  <p className="text-xl md:text-2xl leading-relaxed opacity-95 font-light tracking-wide transform hover:opacity-100 transition-opacity duration-500">
                    <em>Sacred verses and prayers beautifully rendered in authentic Arabic calligraphy.</em>
                  </p>
                  <p className="text-lg md:text-xl mt-4 leading-relaxed opacity-85 max-w-3xl mx-auto">
                    Each piece reflects centuries of artistic tradition and spiritual devotion, 
                    bringing divine beauty into your home with the timeless art of Islamic lettering.
                  </p>
                </div>

                {/* Bottom Decorative Element */}
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-0.5 bg-white/40 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-16 h-0.5 bg-white/40 rounded-full animate-pulse"></div>
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
                  No calligraphy pieces found
                </h3>
                <p className="text-luxury-gray-600 mb-6">
                  We're working on adding more beautiful Islamic calligraphy pieces to our collection.
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

export default IslamicCalligraphyPage;