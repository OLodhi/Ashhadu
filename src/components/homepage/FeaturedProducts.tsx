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

const staticFeaturedProducts = [
  {
    id: 1,
    name: 'Ayat al-Kursi Calligraphy',
    arabicName: 'آية الكرسي',
    price: 89.99,
    originalPrice: 109.99,
    image: '/images/products/ayat-al-kursi.jpg',
    rating: 4.9,
    reviews: 127,
    badge: 'Best Seller',
    description: 'Exquisite 3D printed Arabic calligraphy featuring the Throne Verse',
    category: 'Islamic Calligraphy',
    isNew: false,
    isSale: true
  },
  {
    id: 2,
    name: 'Masjid al-Haram Model',
    arabicName: 'المسجد الحرام',
    price: 159.99,
    originalPrice: null,
    image: '/images/products/masjid-al-haram.jpg',
    rating: 4.8,
    reviews: 89,
    badge: 'Premium',
    description: 'Detailed architectural model of the Great Mosque of Mecca',
    category: 'Mosque Models',
    isNew: true,
    isSale: false
  },
  {
    id: 3,
    name: 'Bismillah Wall Art',
    arabicName: 'بسم الله',
    price: 64.99,
    originalPrice: null,
    image: '/images/products/bismillah-art.jpg',
    rating: 4.7,
    reviews: 203,
    badge: 'Popular',
    description: 'Beautiful Islamic geometric pattern with Bismillah inscription',
    category: 'Wall Art',
    isNew: false,
    isSale: false
  },
  {
    id: 4,
    name: 'Custom Arabic Name',
    arabicName: 'اسم مخصص',
    price: 95.99,
    originalPrice: null,
    image: '/images/products/custom-name.jpg',
    rating: 5.0,
    reviews: 45,
    badge: 'Custom',
    description: 'Personalized Arabic calligraphy with your name or message',
    category: 'Custom Art',
    isNew: false,
    isSale: false
  }
];

const FeaturedProducts = () => {
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
          {staticFeaturedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="card-luxury-product">
                {/* Product Image */}
                <div className="relative aspect-product bg-luxury-gray-50 rounded-lg overflow-hidden mb-4">
                  {/* Image Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/10 to-luxury-gold/5 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="w-16 h-16 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" className="text-luxury-gold">
                          <path d="M12 2l3.09 6.26L22 9l-6.91 1.01L12 22l-3.09-11.99L2 9l6.91-.74L12 2z" 
                                fill="currentColor"/>
                        </svg>
                      </div>
                      <div className="text-xs text-luxury-gray-600">
                        {product.category}
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col space-y-2">
                    {product.isNew && (
                      <span className="badge-new">New</span>
                    )}
                    {product.isSale && (
                      <span className="badge-sale">Sale</span>
                    )}
                    {product.badge && (
                      <span className="badge-featured">{product.badge}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <WishlistButton
                      productId={product.id.toString()}
                      size="small"
                      variant="icon"
                      className="shadow-sm"
                    />
                    <button className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm">
                      <ShoppingBag size={16} className="text-luxury-black hover:text-luxury-gold" />
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
                    <p className="arabic-text text-sm text-luxury-gray-600">
                      {product.arabicName}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={`${
                            star <= product.rating
                              ? 'text-luxury-gold fill-current'
                              : 'text-luxury-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-small">({product.reviews})</span>
                  </div>

                  {/* Description */}
                  <p className="text-small text-luxury-gray-600 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center space-x-2">
                    <span className="price-display">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="price-original">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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