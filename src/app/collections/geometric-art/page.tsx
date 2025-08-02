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

const GeometricArtPage = () => {
  const { addToCart } = useCartStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewStats, setReviewStats] = useState<{ [productId: string]: { averageRating: number; totalReviews: number } }>({});

  // Fetch geometric art products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?status=published');
        if (response.ok) {
          const data = await response.json();
          // Filter for Geometric Art products only
          const geometricProducts = (data.data || []).filter(
            (product: any) => product.category === 'Geometric Art'
          );
          setProducts(geometricProducts);
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
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 overflow-hidden min-h-[48vh]">
            {/* Complex Geometric Background Elements */}
            <div className="absolute inset-0">
              {/* Large Central Mandala */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-8">
                <svg width="400" height="400" viewBox="0 0 400 400" className="text-white animate-spin-slow">
                  <g transform="translate(200,200)">
                    {/* Outer Ring */}
                    <circle cx="0" cy="0" r="180" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
                    <circle cx="0" cy="0" r="160" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
                    
                    {/* 8-pointed Star */}
                    <g opacity="0.5">
                      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
                        <g key={angle} transform={`rotate(${angle})`}>
                          <polygon points="0,-140 20,-100 0,-80 -20,-100" fill="currentColor"/>
                          <polygon points="0,-100 15,-70 0,-50 -15,-70" fill="none" stroke="currentColor" strokeWidth="1"/>
                        </g>
                      ))}
                    </g>
                    
                    {/* Inner Geometric Pattern */}
                    <g opacity="0.6">
                      {[0, 60, 120, 180, 240, 300].map(angle => (
                        <g key={angle} transform={`rotate(${angle})`}>
                          <polygon points="0,-80 25,-50 0,-30 -25,-50" fill="currentColor"/>
                        </g>
                      ))}
                    </g>
                    
                    {/* Center Circle */}
                    <circle cx="0" cy="0" r="25" fill="currentColor" opacity="0.7"/>
                    <circle cx="0" cy="0" r="15" fill="none" stroke="white" strokeWidth="2" opacity="0.9"/>
                  </g>
                </svg>
              </div>

              {/* Floating Geometric Shapes */}
              <div className="absolute top-16 left-20 opacity-12 animate-float">
                <svg width="120" height="120" viewBox="0 0 120 120" className="text-white">
                  <g transform="translate(60,60)">
                    <polygon points="0,-50 43,-25 43,25 0,50 -43,25 -43,-25" fill="none" stroke="currentColor" strokeWidth="2"/>
                    <polygon points="0,-35 30,-17 30,17 0,35 -30,17 -30,-17" fill="currentColor" opacity="0.3"/>
                    <circle cx="0" cy="0" r="12" fill="currentColor"/>
                  </g>
                </svg>
              </div>

              <div className="absolute top-32 right-24 opacity-15 animate-float-delayed">
                <svg width="100" height="100" viewBox="0 0 100 100" className="text-white">
                  <g transform="translate(50,50)">
                    {[0, 72, 144, 216, 288].map(angle => (
                      <g key={angle} transform={`rotate(${angle})`}>
                        <polygon points="0,-35 12,-12 0,0 -12,-12" fill="currentColor" opacity="0.4"/>
                      </g>
                    ))}
                    <circle cx="0" cy="0" r="8" fill="currentColor"/>
                  </g>
                </svg>
              </div>

              <div className="absolute bottom-24 left-32 opacity-10 animate-pulse">
                <svg width="80" height="80" viewBox="0 0 80 80" className="text-white">
                  <g transform="translate(40,40)">
                    <rect x="-25" y="-25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(45)"/>
                    <rect x="-15" y="-15" width="30" height="30" fill="currentColor" opacity="0.3" transform="rotate(45)"/>
                    <circle cx="0" cy="0" r="6" fill="currentColor"/>
                  </g>
                </svg>
              </div>

              <div className="absolute bottom-16 right-20 opacity-12 animate-spin-slow-reverse">
                <svg width="90" height="90" viewBox="0 0 90 90" className="text-white">
                  <g transform="translate(45,45)">
                    {[0, 40, 80, 120, 160, 200, 240, 280, 320].map(angle => (
                      <g key={angle} transform={`rotate(${angle})`}>
                        <line x1="0" y1="0" x2="0" y2="-35" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
                        <polygon points="0,-35 5,-25 -5,-25" fill="currentColor" opacity="0.5"/>
                      </g>
                    ))}
                  </g>
                </svg>
              </div>

              {/* Complex Tessellation Pattern */}
              <div className="absolute top-20 right-16 opacity-8">
                <svg width="150" height="150" viewBox="0 0 150 150" className="text-white">
                  <defs>
                    <pattern id="tessellation" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                      <polygon points="15,0 30,15 15,30 0,15" fill="currentColor" opacity="0.2"/>
                      <polygon points="15,5 25,15 15,25 5,15" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="150" height="150" fill="url(#tessellation)"/>
                </svg>
              </div>
            </div>

            {/* Animated Geometric Overlay */}
            <div className="absolute inset-0 opacity-15">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpolygon points='20,0 40,20 20,40 0,20'/%3E%3C/g%3E%3C/svg%3E")`,
                animation: 'pulse-slow 5s ease-in-out infinite'
              }}></div>
            </div>

            {/* Deep Blue Gradient for Depth */}
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/40"></div>
            
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[48vh]">
              <div className="text-center text-white transform">
                {/* Geometric Top Ornament */}
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <svg width="100" height="30" viewBox="0 0 100 30" className="text-white/60">
                      <g transform="translate(50,15)">
                        <polygon points="0,-12 10,-8 15,0 10,8 0,12 -10,8 -15,0 -10,-8" fill="currentColor"/>
                        <polygon points="0,-8 6,-5 10,0 6,5 0,8 -6,5 -10,0 -6,-5" fill="none" stroke="white" strokeWidth="1"/>
                        <circle cx="0" cy="0" r="3" fill="white"/>
                      </g>
                    </svg>
                  </div>
                </div>

                {/* Main Title with Geometric Precision */}
                <div className="relative mb-6">
                  <h1 className="text-5xl md:text-7xl font-playfair font-bold mb-4 relative z-10 transform hover:scale-105 transition-transform duration-700 cursor-default">
                    <span className="relative inline-block">
                      <span className="absolute inset-0 text-white/25 blur-sm">Geometric Art</span>
                      <span className="relative text-white drop-shadow-2xl">Geometric Art</span>
                    </span>
                  </h1>
                  
                  {/* Geometric Underline Pattern */}
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-white/40 transform rotate-45"></div>
                      <div className="w-20 h-0.5 bg-white/50"></div>
                      <div className="w-6 h-6 bg-white/60 transform rotate-45 animate-spin-slow"></div>
                      <div className="w-32 h-1 bg-gradient-to-r from-white/60 via-white/90 to-white/60 rounded-full animate-expand"></div>
                      <div className="w-6 h-6 bg-white/60 transform rotate-45 animate-spin-slow-reverse"></div>
                      <div className="w-20 h-0.5 bg-white/50"></div>
                      <div className="w-4 h-4 bg-white/40 transform rotate-45"></div>
                    </div>
                  </div>
                </div>

                {/* Arabic Text with Geometric Elements */}
                <div className="relative mb-8">
                  <p className="text-3xl md:text-4xl arabic-text font-bold opacity-95 transform hover:scale-110 transition-all duration-500 cursor-default">
                    <span className="relative inline-block">
                      <span className="absolute inset-0 text-white/30 blur-sm">الفن الهندسي</span>
                      <span className="relative text-white drop-shadow-lg">الفن الهندسي</span>
                    </span>
                  </p>
                  
                  {/* Geometric Ornaments Around Arabic Text */}
                  <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 w-12 h-12 opacity-25">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white animate-spin-slow">
                      <polygon points="50,10 71,29 90,50 71,71 50,90 29,71 10,50 29,29" fill="none" stroke="currentColor" strokeWidth="2"/>
                      <polygon points="50,25 65,35 75,50 65,65 50,75 35,65 25,50 35,35" fill="currentColor" opacity="0.3"/>
                    </svg>
                  </div>
                  <div className="absolute -right-20 top-1/2 transform -translate-y-1/2 w-10 h-10 opacity-25">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-white animate-spin-slow-reverse">
                      <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="2" transform="rotate(45 50 50)"/>
                      <rect x="35" y="35" width="30" height="30" fill="currentColor" opacity="0.4" transform="rotate(45 50 50)"/>
                    </svg>
                  </div>
                </div>

                {/* Description with Mathematical Precision */}
                <div className="max-w-4xl mx-auto">
                  <p className="text-xl md:text-2xl leading-relaxed opacity-95 font-light tracking-wide transform hover:opacity-100 transition-opacity duration-500">
                    <em>Sacred mathematics expressed through divine geometric harmony.</em>
                  </p>
                  <p className="text-lg md:text-xl mt-4 leading-relaxed opacity-85 max-w-3xl mx-auto">
                    From intricate tessellations to mystical mandalas, each piece reveals the mathematical 
                    principles that underpin creation, celebrating the infinite beauty of Islamic geometric tradition.
                  </p>
                </div>

                {/* Complex Geometric Bottom Ornament */}
                <div className="flex justify-center mt-12">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-white/40 transform rotate-45 animate-pulse"></div>
                    <div className="w-4 h-4 bg-white/50 rounded-full animate-bounce"></div>
                    <div className="w-5 h-5 bg-white/60 transform rotate-45 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-6 h-6 bg-white/70 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-5 h-5 bg-white/60 transform rotate-45 animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="w-4 h-4 bg-white/50 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    <div className="w-3 h-3 bg-white/40 transform rotate-45 animate-pulse" style={{animationDelay: '0.6s'}}></div>
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
                  No geometric art pieces found
                </h3>
                <p className="text-luxury-gray-600 mb-6">
                  We're working on adding more beautiful Islamic geometric art pieces to our collection.
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

export default GeometricArtPage;