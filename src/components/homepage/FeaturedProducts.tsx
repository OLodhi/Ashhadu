'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import WishlistButton from '@/components/ui/WishlistButton';

interface FeaturedProduct {
  id: string;
  name: string;
  arabicName?: string;
  price: number;
  originalPrice?: number;
  regularPrice?: number;
  onSale: boolean;
  rating: number;
  reviewCount: number;
  description: string;
  category: string;
  slug: string;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    featured: boolean;
  }>;
  createdAt: string;
  // Add review stats
  reviewStats?: {
    totalReviews: number;
    averageRating: number;
  };
}

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCartStore();

  // Fetch review stats for a product
  const fetchProductReviews = async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        return {
          totalReviews: data.data?.statistics?.totalReviews || 0,
          averageRating: data.data?.statistics?.averageRating || 0
        };
      }
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
    }
    return { totalReviews: 0, averageRating: 0 };
  };

  // Fetch featured products from API
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products?featured=true&status=published&limit=4');
        
        if (!response.ok) {
          throw new Error('Failed to fetch featured products');
        }
        
        const data = await response.json();
        
        if (data.success) {
          const products = data.data || [];
          
          // Fetch review stats for each product
          const productsWithReviews = await Promise.all(
            products.map(async (product: FeaturedProduct) => {
              const reviewStats = await fetchProductReviews(product.id);
              return {
                ...product,
                reviewStats
              };
            })
          );
          
          setFeaturedProducts(productsWithReviews);
        } else {
          throw new Error(data.error || 'Failed to load featured products');
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Helper functions for product display
  const getFeaturedImage = (product: FeaturedProduct) => {
    return product.images?.find(img => img.featured) || product.images?.[0];
  };

  const getProductBadge = (product: FeaturedProduct) => {
    if (product.onSale) return 'Sale';
    if (product.rating >= 4.8) return 'Premium';  
    if (product.reviewCount > 100) return 'Popular';
    
    // Check if product is new (created within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const productDate = new Date(product.createdAt);
    if (productDate > thirtyDaysAgo) return 'New';
    
    return null;
  };

  const isProductNew = (product: FeaturedProduct) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(product.createdAt) > thirtyDaysAgo;
  };

  // Handle add to cart functionality
  const handleAddToCart = (product: FeaturedProduct, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation(); // Stop event bubbling
    
    const featuredImage = getFeaturedImage(product);
    
    addToCart({
      ...product,
      featuredImage: featuredImage?.url || '',
      quantity: 1,
      regularPrice: product.originalPrice || product.regularPrice
    });
    
    toast.success(`${product.name} added to cart!`);
  };

  // Show loading state
  if (loading) {
    return (
      <section className="section-padding bg-white">
        <div className="container-luxury">
          <div className="text-center mb-16">
            <h2 className="heading-section luxury-accent mb-6">
              Featured Islamic Art
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              Loading our featured products...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-product bg-luxury-gray-200 rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-luxury-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-luxury-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="section-padding bg-white">
        <div className="container-luxury">
          <div className="text-center">
            <h2 className="heading-section luxury-accent mb-6">
              Featured Islamic Art
            </h2>
            <p className="text-body text-red-600 max-w-2xl mx-auto">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Show empty state if no featured products
  if (featuredProducts.length === 0) {
    return (
      <section className="section-padding bg-white">
        <div className="container-luxury">
          <div className="text-center">
            <h2 className="heading-section luxury-accent mb-6">
              Featured Islamic Art
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              No featured products available at this time.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-luxury">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-section luxury-accent mb-6">
              Featured Islamic Art
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              Discover our most beloved pieces, carefully crafted to bring the beauty 
              of Islamic art and calligraphy into your home.
            </p>
          </motion.div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product, index) => {
            const featuredImage = getFeaturedImage(product);
            const badge = getProductBadge(product);
            const isNew = isProductNew(product);
            
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group"
              >
                <Link href={`/products/${product.id}`}>
                  <div className="card-luxury-product">
                    {/* Product Image */}
                    <div className="relative aspect-product bg-luxury-gray-50 rounded-lg overflow-hidden mb-4">
                      {featuredImage ? (
                        <Image
                          src={featuredImage.url}
                          alt={featuredImage.alt || product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        /* Fallback placeholder */
                        <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/10 to-luxury-gold/5 flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <div className="w-16 h-16 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center">
                              <svg width="24" height="24" viewBox="0 0 24 24" className="text-luxury-gold">
                                <path d="M12 2l3.09 6.26L22 9l-6.91 1.01L12 22l-3.09-11.99L2 9l6.91-.74L12 2z" 
                                      fill="currentColor"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      )}


                      {/* Actions */}
                      <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <WishlistButton
                          productId={product.id}
                          size="small"
                          variant="icon"
                          className="shadow-sm"
                        />
                        <button 
                          className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors duration-200"
                          onClick={(e) => handleAddToCart(product, e)}
                          title="Add to Cart"
                          aria-label="Add to Cart"
                        >
                          <ShoppingBag size={16} className="text-luxury-black hover:text-luxury-gold transition-colors duration-200" />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-3">
                      {/* Category */}
                      <div className="text-small text-luxury-gold font-medium">
                        {product.category}
                      </div>

                      {/* Product Name */}
                      <div>
                        <h3 className="font-playfair text-lg font-semibold text-luxury-black mb-1 group-hover:text-luxury-gold transition-colors">
                          {product.name}
                        </h3>
                        <p className="arabic-text text-sm text-luxury-gray-600 min-h-[1.25rem]">
                          {product.arabicName || ''}
                        </p>
                      </div>

                      {/* Rating */}
                      {product.reviewStats && product.reviewStats.totalReviews > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={14}
                                className={`${
                                  star <= Math.floor(product.reviewStats!.averageRating)
                                    ? 'text-luxury-gold fill-current'
                                    : 'text-luxury-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-small">({product.reviewStats.totalReviews})</span>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-small text-luxury-gray-600 line-clamp-2">
                        {product.description}
                      </p>

                      {/* Price */}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-luxury-black">
                          {formatPrice(product.price)}
                        </span>
                        {(product.originalPrice || product.regularPrice) && product.onSale && (
                          <span className="text-sm text-luxury-gray-500 line-through">
                            {formatPrice(product.originalPrice || product.regularPrice || 0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/shop" className="btn-luxury-outline group">
            View All Products
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;