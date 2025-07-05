'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const popularSearches = [
  'Ayat al-Kursi',
  'Bismillah',
  'Mosque models',
  'Custom calligraphy',
  'Islamic geometric art',
  'Surah Al-Fatiha'
];

const suggestedProducts = [
  {
    id: 1,
    name: 'Ayat al-Kursi Calligraphy',
    price: 89.99,
    image: '/images/products/ayat-al-kursi.jpg',
    category: 'Islamic Calligraphy'
  },
  {
    id: 2,
    name: 'Bismillah Wall Art',
    price: 64.99,
    image: '/images/products/bismillah-art.jpg',
    category: 'Wall Art'
  },
  {
    id: 3,
    name: 'Masjid al-Haram Model',
    price: 159.99,
    image: '/images/products/masjid-al-haram.jpg',
    category: 'Mosque Models'
  }
];

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.length > 2) {
      setIsSearching(true);
      
      // Simulate API search
      const timer = setTimeout(() => {
        const filtered = suggestedProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to search results page
      window.location.href = `/search?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div className="container-luxury pt-20">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-luxury-gray-100">
                <h2 className="font-playfair text-xl font-semibold text-luxury-black">
                  Search Islamic Art
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-luxury-gray-50 rounded-full transition-colors"
                >
                  <X size={20} className="text-luxury-black" />
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="p-6 border-b border-luxury-gray-100">
                <div className="relative">
                  <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-luxury-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for Islamic art, calligraphy, or mosque models..."
                    className="w-full pl-12 pr-4 py-3 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold text-luxury-black placeholder-luxury-gray-400"
                    autoFocus
                  />
                </div>
              </form>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {searchTerm.length > 2 ? (
                  <div className="p-6">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-4">
                        <h3 className="font-medium text-luxury-black mb-4">
                          Search Results ({searchResults.length})
                        </h3>
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="flex items-center space-x-4 p-3 hover:bg-luxury-gray-50 rounded-lg transition-colors"
                            onClick={handleClose}
                          >
                            <div className="w-12 h-12 bg-luxury-gray-100 rounded-lg flex items-center justify-center">
                              <Search size={16} className="text-luxury-gold" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-luxury-black">{product.name}</h4>
                              <p className="text-sm text-luxury-gray-600">{product.category}</p>
                            </div>
                            <div className="text-luxury-gold font-semibold">
                              {formatPrice(product.price)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-luxury-gray-600">
                          No results found for "{searchTerm}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 space-y-6">
                    {/* Popular Searches */}
                    <div>
                      <h3 className="flex items-center space-x-2 font-medium text-luxury-black mb-4">
                        <TrendingUp size={16} />
                        <span>Popular Searches</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((search) => (
                          <button
                            key={search}
                            onClick={() => setSearchTerm(search)}
                            className="px-3 py-1 bg-luxury-gray-50 text-luxury-black rounded-full text-sm hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Products */}
                    <div>
                      <h3 className="flex items-center space-x-2 font-medium text-luxury-black mb-4">
                        <Clock size={16} />
                        <span>Suggested Products</span>
                      </h3>
                      <div className="space-y-3">
                        {suggestedProducts.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="flex items-center space-x-4 p-3 hover:bg-luxury-gray-50 rounded-lg transition-colors"
                            onClick={handleClose}
                          >
                            <div className="w-12 h-12 bg-luxury-gray-100 rounded-lg flex items-center justify-center">
                              <Search size={16} className="text-luxury-gold" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-luxury-black">{product.name}</h4>
                              <p className="text-sm text-luxury-gray-600">{product.category}</p>
                            </div>
                            <div className="text-luxury-gold font-semibold">
                              {formatPrice(product.price)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;