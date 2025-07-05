'use client';

import React, { useState } from 'react';
import { Mail, Gift, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const NewsletterCTA = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const benefits = [
    'Early access to new collections',
    'Exclusive Islamic art insights',
    '10% off your first purchase',
    'Custom commission updates'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubscribed(true);
      toast.success('Welcome to our community! Check your email for your discount code.');
      setEmail('');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="section-padding bg-luxury-black">
        <div className="container-luxury">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check size={40} className="text-white" />
              </div>
              
              <h2 className="heading-section text-white mb-4">
                Welcome to Our Community!
              </h2>
              
              <p className="text-lg text-gray-300 mb-8">
                Thank you for subscribing! Your 10% discount code is on its way to your inbox. 
                You'll be the first to know about new collections and exclusive Islamic art pieces.
              </p>
              
              <div className="flex items-center justify-center space-x-2 text-luxury-gold">
                <Gift size={20} />
                <span className="font-medium">Check your email for your discount code</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-luxury-black islamic-pattern-overlay">
      <div className="container-luxury">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-center space-x-2">
                <Sparkles size={24} className="text-luxury-gold" />
                <span className="text-luxury-gold font-medium">
                  Join Our Community
                </span>
              </div>
              
              <h2 className="heading-section text-white">
                Stay Connected with 
                <span className="text-luxury-gold"> Islamic Art</span>
              </h2>
              
              <p className="text-lg text-gray-300 leading-relaxed">
                Subscribe to our newsletter and become part of a community that celebrates 
                the beauty of Islamic art and culture. Be the first to discover new collections, 
                exclusive pieces, and stories behind each artwork.
              </p>

              {/* Benefits */}
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-luxury-gold rounded-full flex-shrink-0"></div>
                    <span className="text-gray-300">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20"
            >
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <Mail size={32} className="text-luxury-gold mx-auto" />
                  <h3 className="font-playfair text-2xl font-semibold text-white">
                    Get 10% Off Your First Order
                  </h3>
                  <p className="text-gray-300">
                    Plus exclusive access to new collections and Islamic art stories
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full btn-luxury group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4" 
                            fill="none"
                          />
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Subscribing...</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2">
                        <Gift size={20} />
                        <span>Get My 10% Discount</span>
                      </span>
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    By subscribing, you agree to our Privacy Policy and Terms of Service. 
                    Unsubscribe at any time.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterCTA;