'use client';

import React, { useState } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  {
    id: 1,
    name: 'Amina Hassan',
    location: 'London, UK',
    rating: 5,
    text: 'The Ayat al-Kursi piece I ordered is absolutely breathtaking. The attention to detail and the quality of the 3D printing is exceptional. It has become the centerpiece of our living room.',
    product: 'Ayat al-Kursi Calligraphy',
    image: '/images/testimonials/amina.jpg',
    verified: true
  },
  {
    id: 2,
    name: 'Omar Al-Rashid',
    location: 'Manchester, UK',
    rating: 5,
    text: 'I commissioned a custom piece with my children\'s names in Arabic calligraphy. The result exceeded all expectations. The craftsmanship is truly divine.',
    product: 'Custom Arabic Calligraphy',
    image: '/images/testimonials/omar.jpg',
    verified: true
  },
  {
    id: 3,
    name: 'Fatima Ahmed',
    location: 'Birmingham, UK',
    rating: 5,
    text: 'The mosque model I purchased is incredibly detailed and beautifully crafted. It\'s not just art, it\'s a connection to our heritage and faith.',
    product: 'Masjid an-Nabawi Model',
    image: '/images/testimonials/fatima.jpg',
    verified: true
  },
  {
    id: 4,
    name: 'Ibrahim Khan',
    location: 'Leeds, UK',
    rating: 5,
    text: 'Outstanding quality and fast delivery. The Islamic geometric art piece is perfect for our mosque\'s prayer hall. Highly recommended!',
    product: 'Islamic Geometric Art',
    image: '/images/testimonials/ibrahim.jpg',
    verified: true
  },
  {
    id: 5,
    name: 'Khadija Malik',
    location: 'Edinburgh, UK',
    rating: 5,
    text: 'The customer service was exceptional, and the final product was even more beautiful than I imagined. Perfect for our new home.',
    product: 'Bismillah Wall Art',
    image: '/images/testimonials/khadija.jpg',
    verified: true
  }
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

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
              What Our Customers Say
            </h2>
            <p className="text-body max-w-2xl mx-auto">
              Read stories from our satisfied customers who have brought the beauty 
              of Islamic art into their homes and sacred spaces.
            </p>
          </motion.div>
        </div>

        {/* Main Testimonial */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
              className="bg-white card-luxury p-8 lg:p-12 rounded-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                {/* Quote Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center space-x-4">
                    <Quote size={40} className="text-luxury-gold flex-shrink-0" />
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={`${
                            star <= currentTestimonial.rating
                              ? 'text-luxury-gold fill-current'
                              : 'text-luxury-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <blockquote className="text-lg lg:text-xl text-luxury-black leading-relaxed">
                    "{currentTestimonial.text}"
                  </blockquote>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-playfair text-lg font-semibold text-luxury-black">
                        {currentTestimonial.name}
                      </span>
                      {currentTestimonial.verified && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm3.707 5.293L7 10.586 4.293 7.879l1.414-1.414L7 7.758l3.293-3.293 1.414 1.414z"/>
                          </svg>
                          <span className="text-sm">Verified Purchase</span>
                        </div>
                      )}
                    </div>
                    <p className="text-luxury-gray-600">{currentTestimonial.location}</p>
                    <p className="text-small text-luxury-gold font-medium">
                      Purchased: {currentTestimonial.product}
                    </p>
                  </div>
                </div>

                {/* Customer Image */}
                <div className="lg:col-span-1">
                  <div className="relative aspect-square max-w-xs mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/5 rounded-2xl flex items-center justify-center">
                      <div className="w-24 h-24 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                        <svg width="40" height="40" viewBox="0 0 40 40" className="text-luxury-gold">
                          <path d="M20 2l5.878 12.122L38 16l-12.122 1.878L24 30l-4-12.122L8 16l12.122-1.878L20 2z" 
                                fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevTestimonial}
              className="flex items-center space-x-2 px-4 py-2 text-luxury-black hover:text-luxury-gold transition-colors"
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            {/* Indicators */}
            <div className="flex items-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-luxury-gold' : 'bg-luxury-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="flex items-center space-x-2 px-4 py-2 text-luxury-black hover:text-luxury-gold transition-colors"
            >
              <span>Next</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { label: 'Trusted Reviews', value: '4.9/5' },
            { label: 'Happy Customers', value: '500+' },
            { label: 'Years Experience', value: '5+' },
            { label: 'Satisfaction Rate', value: '99%' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-luxury-gold mb-2">
                {stat.value}
              </div>
              <div className="text-luxury-gray-600 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;