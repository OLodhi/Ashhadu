'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] lg:min-h-[90vh] bg-luxury-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 islamic-pattern-overlay opacity-10"></div>
      
      {/* Content */}
      <div className="relative z-10 container-luxury h-full flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh] lg:min-h-[90vh]">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-luxury-gold/20 border border-luxury-gold rounded-full">
              <span className="text-luxury-gold font-medium text-sm">
                ✨ Premium 3D Printed Islamic Art
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="heading-display text-white">
              Exquisite Islamic
              <span className="block text-luxury-gold">
                Calligraphy & Art
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
              Discover our collection of meticulously crafted 3D printed Islamic art pieces. 
              Each creation celebrates the divine beauty of Arabic calligraphy and architectural heritage.
            </p>

            {/* Features */}
            <div className="space-y-3">
              {[
                'Ayat al-Kursi & Quranic Verses',
                'Architectural Mosque Models',
                'Custom Arabic Calligraphy',
                'Premium Materials & Craftsmanship'
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-2 h-2 bg-luxury-gold rounded-full"></div>
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/shop" className="btn-luxury group">
                Explore Collection
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="btn-luxury-outline group">
                <Play size={18} className="mr-2" />
                Watch Our Story
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8 pt-8 border-t border-white/20">
              <div>
                <div className="text-2xl font-bold text-luxury-gold">500+</div>
                <div className="text-sm text-gray-400">Happy Customers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-luxury-gold">50+</div>
                <div className="text-sm text-gray-400">Unique Designs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-luxury-gold">UK</div>
                <div className="text-sm text-gray-400">Based Studio</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Main Product Image Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/5 rounded-2xl border border-luxury-gold/30 backdrop-blur-sm">
                <div className="absolute inset-4 bg-white/10 rounded-xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 mx-auto bg-luxury-gold/30 rounded-full flex items-center justify-center">
                      <svg width="60" height="60" viewBox="0 0 60 60" className="text-luxury-gold">
                        <path d="M30 5l8.817 18.183L57 25l-18.183 1.817L37 45l-7-18.183L12 25l18.183-1.817L30 5z" 
                              fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-playfair text-white">Ayat al-Kursi</h3>
                      <p className="text-luxury-gold text-sm">Premium 3D Calligraphy</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-20 h-20 bg-luxury-gold/20 rounded-full border border-luxury-gold/40 flex items-center justify-center"
              >
                <span className="text-luxury-gold font-playfair text-sm">3D</span>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full border border-white/20 flex items-center justify-center"
              >
                <span className="text-white text-xs">UK</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-gray-400 text-sm">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-luxury-gold rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-luxury-gold rounded-full mt-2"></div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;