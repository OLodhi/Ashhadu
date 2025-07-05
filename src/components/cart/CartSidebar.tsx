'use client';

import React, { useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore();

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

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-luxury-gray-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag size={20} className="text-luxury-gold" />
                <h2 className="font-playfair text-xl font-semibold text-luxury-black">
                  Shopping Cart
                </h2>
                {totalItems > 0 && (
                  <span className="bg-luxury-gold text-luxury-black text-sm font-medium px-2 py-1 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-luxury-gray-50 rounded-full transition-colors"
              >
                <X size={20} className="text-luxury-black" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-16 h-16 bg-luxury-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={24} className="text-luxury-gray-400" />
                  </div>
                  <h3 className="font-playfair text-lg font-semibold text-luxury-black mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-luxury-gray-600 mb-6">
                    Discover our beautiful Islamic art collection
                  </p>
                  <Link
                    href="/shop"
                    onClick={onClose}
                    className="btn-luxury"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 p-4 border border-luxury-gray-100 rounded-lg">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-luxury-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <div className="w-8 h-8 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 16 16" className="text-luxury-gold">
                            <path d="M8 1l2.36 4.78L16 6.5l-3.82.56L11 12l-3-5.22L3 6.5l5.64-.72L8 1z" 
                                  fill="currentColor"/>
                          </svg>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium text-luxury-black text-sm">
                          {item.name}
                        </h4>
                        <p className="text-xs text-luxury-gray-600">
                          {item.category}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <span className="font-semibold text-luxury-gold text-sm">
                              {formatPrice(item.price)}
                            </span>
                            {item.originalPrice && (
                              <span className="text-xs text-luxury-gray-500 line-through">
                                {formatPrice(item.originalPrice)}
                              </span>
                            )}
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center bg-luxury-gray-100 hover:bg-luxury-gray-200 rounded transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center bg-luxury-gray-100 hover:bg-luxury-gray-200 rounded transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs text-red-600 hover:text-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-luxury-gray-100 p-6 space-y-4">
                {/* Total */}
                <div className="flex items-center justify-between">
                  <span className="font-playfair text-lg font-semibold text-luxury-black">
                    Total
                  </span>
                  <span className="font-playfair text-xl font-bold text-luxury-gold">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {/* Free Shipping Indicator */}
                <div className="text-center">
                  {totalPrice >= 100 ? (
                    <p className="text-sm text-green-600 font-medium">
                      🎉 You qualify for free shipping!
                    </p>
                  ) : (
                    <p className="text-sm text-luxury-gray-600">
                      Add {formatPrice(100 - totalPrice)} more for free shipping
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="w-full btn-luxury-outline"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="w-full btn-luxury group"
                  >
                    Checkout
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                {/* Security Badge */}
                <div className="text-center pt-2">
                  <p className="text-xs text-luxury-gray-500">
                    🔒 Secure checkout with SSL encryption
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;