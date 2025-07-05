'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const collections = [
  {
    id: 1,
    name: 'Islamic Calligraphy',
    arabicName: 'الخط العربي',
    description: 'Sacred verses and prayers in beautiful Arabic calligraphy',
    productCount: 24,
    href: '/collections/calligraphy',
    image: '/images/collections/calligraphy.jpg',
    color: 'from-luxury-gold to-yellow-600',
    featured: true
  },
  {
    id: 2,
    name: 'Mosque Architecture',
    arabicName: 'عمارة المساجد',
    description: 'Detailed models of famous mosques and Islamic architecture',
    productCount: 12,
    href: '/collections/mosque-models',
    image: '/images/collections/mosques.jpg',
    color: 'from-green-600 to-emerald-700',
    featured: false
  },
  {
    id: 3,
    name: 'Geometric Art',
    arabicName: 'الفن الهندسي',
    description: 'Traditional Islamic geometric patterns and designs',
    productCount: 18,
    href: '/collections/geometric-art',
    image: '/images/collections/geometric.jpg',
    color: 'from-blue-600 to-indigo-700',
    featured: false
  },
  {
    id: 4,
    name: 'Custom Commissions',
    arabicName: 'أعمال مخصصة',
    description: 'Personalized Islamic art pieces made to your specifications',
    productCount: 8,
    href: '/collections/custom',
    image: '/images/collections/custom.jpg',
    color: 'from-purple-600 to-violet-700',
    featured: false
  }
];

const CollectionsPreview = () => {
  return (
    <section className="section-padding bg-luxury-gray-50">
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
              Our Collections
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              Explore our curated collections of Islamic art, each telling a unique story 
              of faith, beauty, and cultural heritage.
            </p>
          </motion.div>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group ${collection.featured ? 'lg:col-span-2' : ''}`}
            >
              <Link href={collection.href} className="block">
                <div className={`
                  relative overflow-hidden rounded-2xl 
                  ${collection.featured ? 'aspect-[2/1]' : 'aspect-[4/3]'}
                  bg-gradient-to-br ${collection.color}
                  hover:shadow-luxury-hover transition-all duration-500
                  group-hover:scale-[1.02]
                `}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 islamic-pattern-overlay opacity-20"></div>
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between p-8 lg:p-12">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        {collection.featured && (
                          <div className="flex items-center space-x-2">
                            <Sparkles size={16} className="text-yellow-300" />
                            <span className="text-yellow-300 text-sm font-medium">
                              Featured Collection
                            </span>
                          </div>
                        )}
                        <h3 className={`
                          font-playfair font-semibold text-white
                          ${collection.featured ? 'text-3xl lg:text-4xl' : 'text-2xl lg:text-3xl'}
                        `}>
                          {collection.name}
                        </h3>
                        <p className="arabic-text text-white/80 text-lg">
                          {collection.arabicName}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white/80 text-sm">
                          {collection.productCount} Products
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-6">
                      <p className={`
                        text-white/90 leading-relaxed
                        ${collection.featured ? 'text-lg max-w-2xl' : 'text-base'}
                      `}>
                        {collection.description}
                      </p>
                      
                      {/* CTA */}
                      <div className="flex items-center space-x-2 text-white group-hover:text-yellow-300 transition-colors">
                        <span className="font-medium">Explore Collection</span>
                        <ArrowRight 
                          size={20} 
                          className="group-hover:translate-x-1 transition-transform" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-8 right-8 w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg width="32" height="32" viewBox="0 0 32 32" className="text-white">
                      <path 
                        d="M16 2l4.944 9.888L32 13l-11.056 1.612L19 26l-3-11.388L5 13l11.056-1.112L16 2z" 
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Collections Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link href="/collections" className="btn-luxury group">
            View All Collections
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CollectionsPreview;