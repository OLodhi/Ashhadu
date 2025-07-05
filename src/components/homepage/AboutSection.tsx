'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Award, Heart, Sparkles, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutSection = () => {
  const stats = [
    {
      icon: Users,
      value: '500+',
      label: 'Happy Customers',
      color: 'text-luxury-gold'
    },
    {
      icon: Award,
      value: '50+',
      label: 'Unique Designs',
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      value: '5+',
      label: 'Years Experience',
      color: 'text-red-600'
    },
    {
      icon: Sparkles,
      value: '100%',
      label: 'Handcrafted',
      color: 'text-purple-600'
    }
  ];

  const features = [
    {
      title: 'Authentic Islamic Art',
      description: 'Each piece is created with deep respect for Islamic traditions and artistic heritage.',
      icon: '🕌'
    },
    {
      title: 'Premium Materials',
      description: 'We use only the finest 3D printing materials to ensure durability and beauty.',
      icon: '✨'
    },
    {
      title: 'Custom Commissions',
      description: 'Work with our artists to create personalized pieces for your home or mosque.',
      icon: '🎨'
    },
    {
      title: 'UK Craftsmanship',
      description: 'Proudly designed and manufactured in the United Kingdom with attention to detail.',
      icon: '🇬🇧'
    }
  ];

  return (
    <section className="section-padding bg-white">
      <div className="container-luxury">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="heading-section luxury-accent-left mb-6">
                Crafting Sacred Art with 
                <span className="text-luxury-gold"> Modern Innovation</span>
              </h2>
              <p className="text-body mb-6">
                At Ashhadu Islamic Art, we bridge the timeless beauty of Islamic calligraphy 
                and architecture with cutting-edge 3D printing technology. Each piece in our 
                collection is a testament to the divine beauty found in Islamic art.
              </p>
              <p className="text-body">
                Our journey began with a simple mission: to make authentic Islamic art 
                accessible to every home, mosque, and heart that seeks to connect with 
                the divine through beauty.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-3"
                >
                  <div className="text-2xl">{feature.icon}</div>
                  <h3 className="font-playfair text-lg font-semibold text-luxury-black">
                    {feature.title}
                  </h3>
                  <p className="text-small text-luxury-gray-600">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Link href="/about" className="btn-luxury-outline group">
                Learn More About Us
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column - Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Main Image Placeholder */}
            <div className="relative aspect-[4/5] bg-gradient-to-br from-luxury-gold/10 to-luxury-gold/5 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 islamic-pattern-overlay opacity-20"></div>
              
              {/* Content */}
              <div className="relative h-full flex flex-col justify-center items-center p-8 text-center">
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center">
                    <svg width="48" height="48" viewBox="0 0 48 48" className="text-luxury-gold">
                      <path d="M24 2l7.09 14.26L46 18l-14.91 2.17L28 44l-4-21.83L9 18l14.91-2.17L24 2z" 
                            fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-playfair text-2xl font-semibold text-luxury-black">
                      Handcrafted Excellence
                    </h3>
                    <p className="text-luxury-gray-600">
                      Every piece tells a story of faith and artistry
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overlay */}
            <div className="absolute -bottom-6 -left-6 bg-white card-luxury p-6 rounded-xl">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <stat.icon size={24} className={`mx-auto mb-2 ${stat.color}`} />
                    <div className="font-playfair text-lg font-bold text-luxury-black">
                      {stat.value}
                    </div>
                    <div className="text-xs text-luxury-gray-600">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;