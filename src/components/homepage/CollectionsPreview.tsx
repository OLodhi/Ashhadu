'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const collections = [
  {
    id: 1,
    name: 'Islamic Calligraphy',
    arabicName: 'الخط العربي',
    description: 'Sacred verses and prayers in beautiful Arabic calligraphy',
    productCount: 3,
    href: '/collections/calligraphy',
    image: '/images/collections/calligraphy.jpg',
    color: 'from-luxury-gold to-yellow-600',
    featured: false
  },
  {
    id: 2,
    name: 'Islamic Architecture',
    arabicName: 'العمارة الإسلامية',
    description: 'Detailed models of famous mosques and Islamic architecture',
    productCount: 1,
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
    productCount: 1,
    href: '/collections/geometric-art',
    image: '/images/collections/geometric.jpg',
    color: 'from-blue-600 to-indigo-700',
    featured: false
  },
  {
    id: 4,
    name: 'Heritage Collections',
    arabicName: 'مجموعات التراث',
    description: 'Timeless Islamic art celebrating our rich cultural heritage and traditions',
    productCount: 4,
    href: '/collections/custom',
    image: '/images/collections/custom.jpg',
    color: 'from-purple-600 to-violet-700',
    featured: false
  }
];

const CollectionsPreview = () => {
  return (
    <section id="collections" className="section-padding bg-luxury-gray-50">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <Link href={collection.href} className="block">
                <div className={`
                  relative overflow-hidden rounded-2xl 
                  aspect-[4/3]
                  bg-gradient-to-br ${collection.color}
                  hover:shadow-luxury-hover transition-all duration-500
                  group-hover:scale-[1.02]
                `}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 islamic-pattern-overlay opacity-20"></div>
                  
                  {/* Islamic Calligraphy Enhanced Overlay */}
                  {collection.id === 1 && (
                    <div 
                      className="absolute inset-0 bg-cover bg-no-repeat opacity-45 transition-all duration-700 group-hover:opacity-70 group-hover:scale-105"
                      style={{
                        backgroundImage: 'url(/images/collections/calligraphy-overlay.png?v=3)',
                        backgroundPosition: 'bottom right',
                        backgroundSize: '120%',
                        backgroundBlendMode: 'overlay',
                        maskImage: 'radial-gradient(ellipse at bottom right, black 50%, rgba(0,0,0,0.7) 70%, transparent 90%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 50%, rgba(0,0,0,0.7) 70%, transparent 90%)',
                        filter: 'contrast(1.1) saturate(1.2)'
                      }}
                    />
                  )}
                  
                  {/* Geometric Art Enhanced Overlay */}
                  {collection.id === 3 && (
                    <div 
                      className="absolute inset-0 bg-cover bg-no-repeat opacity-45 transition-all duration-700 group-hover:opacity-70 group-hover:scale-105"
                      style={{
                        backgroundImage: 'url(/images/collections/geometric-overlay.png)',
                        backgroundPosition: 'bottom right',
                        backgroundSize: '120%',
                        backgroundBlendMode: 'overlay',
                        maskImage: 'radial-gradient(ellipse at bottom right, black 50%, rgba(0,0,0,0.7) 70%, transparent 90%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 50%, rgba(0,0,0,0.7) 70%, transparent 90%)',
                        filter: 'contrast(1.1) saturate(1.2)'
                      }}
                    />
                  )}
                  
                  {/* Mosque Architecture Enhanced Overlay */}
                  {collection.id === 2 && (
                    <div 
                      className="absolute inset-0 bg-cover bg-no-repeat opacity-40 transition-all duration-700 group-hover:opacity-65 group-hover:scale-105"
                      style={{
                        backgroundImage: 'url(/images/collections/mosque-overlay.png)',
                        backgroundPosition: 'bottom right',
                        backgroundSize: '130%',
                        backgroundBlendMode: 'overlay',
                        maskImage: 'radial-gradient(ellipse at bottom right, black 45%, rgba(0,0,0,0.8) 65%, transparent 85%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 45%, rgba(0,0,0,0.8) 65%, transparent 85%)',
                        filter: 'contrast(1.2) saturate(1.3)'
                      }}
                    />
                  )}
                  
                  {/* Custom Commissions Enhanced Overlay */}
                  {collection.id === 4 && (
                    <div 
                      className="absolute inset-0 bg-cover bg-no-repeat opacity-45 transition-all duration-700 group-hover:opacity-70 group-hover:scale-105"
                      style={{
                        backgroundImage: 'url(/images/collections/custom-overlay.png?v=2)',
                        backgroundPosition: 'bottom right',
                        backgroundSize: '120%',
                        backgroundBlendMode: 'overlay',
                        maskImage: 'radial-gradient(ellipse at bottom right, black 50%, rgba(0,0,0,0.7) 70%, transparent 90%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at bottom right, black 50%, rgba(0,0,0,0.7) 70%, transparent 90%)',
                        filter: 'contrast(1.1) saturate(1.2)'
                      }}
                    />
                  )}
                  
                  {/* Content */}
                  <div className="relative h-full flex flex-col justify-between p-8 lg:p-12">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="font-playfair font-semibold text-white text-2xl lg:text-3xl">
                          {collection.name}
                        </h3>
                        <p className="arabic-text text-white/80 text-lg">
                          {collection.arabicName}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-6">
                      <p className="text-white/90 leading-relaxed text-base">
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

                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CollectionsPreview;