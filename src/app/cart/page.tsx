'use client';

import React from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();
  const vatRate = 0.2; // 20% VAT for UK
  const vatAmount = totalPrice * vatRate;
  const subtotal = totalPrice - vatAmount;
  const freeShippingThreshold = 100;
  const shippingCost = totalPrice >= freeShippingThreshold ? 0 : 8.99;
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        
        <MainContentWrapper>
          <div className="bg-luxury-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="w-24 h-24 bg-luxury-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag size={32} className="text-luxury-gray-400" />
                </div>
                <h1 className="font-playfair text-3xl font-bold text-luxury-black mb-4">
                  Your Cart is Empty
                </h1>
                <p className="text-luxury-gray-600 mb-8">
                  Discover our beautiful collection of Islamic art and calligraphy pieces
                </p>
                <Link
                  href="/shop"
                  className="btn-luxury inline-flex items-center"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </MainContentWrapper>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <MainContentWrapper>
        <div className="bg-luxury-gray-50 py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <Link
                href="/shop"
                className="inline-flex items-center text-luxury-gray-600 hover:text-luxury-gold transition-colors mb-4"
              >
                <ArrowLeft size={18} className="mr-2" />
                Continue Shopping
              </Link>
              <h1 className="font-playfair text-3xl font-bold text-luxury-black">
                Shopping Cart
              </h1>
              <p className="text-luxury-gray-600 mt-2">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-luxury-gray-200">
                    <div className="flex items-center justify-between">
                      <h2 className="font-playfair text-xl font-semibold text-luxury-black">
                        Cart Items
                      </h2>
                      <button
                        onClick={clearCart}
                        className="text-sm text-luxury-gray-500 hover:text-red-600 transition-colors"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-luxury-gray-200">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Product Image */}
                          <div className="w-20 h-20 bg-luxury-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 16 16" className="text-luxury-gold">
                                  <path d="M8 1l2.36 4.78L16 6.5l-3.82.56L11 12l-3-5.22L3 6.5l5.64-.72L8 1z" 
                                        fill="currentColor"/>
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h3 className="font-medium text-luxury-black text-lg mb-1">
                              {item.name}
                            </h3>
                            <p className="text-sm text-luxury-gray-600 mb-2">
                              {item.category}
                            </p>
                            
                            {/* Customizations */}
                            {item.customizations && (
                              <div className="mb-3">
                                {item.customizations.size && (
                                  <span className="inline-block bg-luxury-gray-100 text-luxury-gray-700 text-xs px-2 py-1 rounded mr-2">
                                    Size: {item.customizations.size}
                                  </span>
                                )}
                                {item.customizations.material && (
                                  <span className="inline-block bg-luxury-gray-100 text-luxury-gray-700 text-xs px-2 py-1 rounded mr-2">
                                    Material: {item.customizations.material}
                                  </span>
                                )}
                                {item.customizations.engraving && (
                                  <span className="inline-block bg-luxury-gray-100 text-luxury-gray-700 text-xs px-2 py-1 rounded">
                                    Engraving: {item.customizations.engraving}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Price and Quantity */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-luxury-gold text-lg">
                                  {formatPrice(item.price)}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="text-sm text-luxury-gray-500 line-through">
                                    {formatPrice(item.originalPrice)}
                                  </span>
                                )}
                              </div>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-luxury-gray-100 hover:bg-luxury-gray-200 rounded transition-colors"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="text-lg font-medium w-12 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center bg-luxury-gray-100 hover:bg-luxury-gray-200 rounded transition-colors"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                                
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="p-2 text-luxury-gray-400 hover:text-red-600 transition-colors"
                                  title="Remove item"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </div>
                            
                            {/* Item Total */}
                            <div className="mt-2 text-right">
                              <span className="text-sm text-luxury-gray-600">
                                Item total: {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-200 p-6 sticky top-4">
                  <h2 className="font-playfair text-xl font-semibold text-luxury-black mb-6">
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-luxury-gray-600">
                      <span>Subtotal (excl. VAT)</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    
                    <div className="flex justify-between text-luxury-gray-600">
                      <span>VAT (20%)</span>
                      <span>{formatPrice(vatAmount)}</span>
                    </div>
                    
                    <div className="flex justify-between text-luxury-gray-600">
                      <span>Shipping</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600 font-medium">Free</span>
                        ) : (
                          formatPrice(shippingCost)
                        )}
                      </span>
                    </div>
                    
                    <div className="border-t border-luxury-gray-200 pt-4">
                      <div className="flex justify-between font-playfair text-lg font-semibold text-luxury-black">
                        <span>Total</span>
                        <span className="text-luxury-gold">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Free Shipping Indicator */}
                  <div className="mt-6 p-4 bg-luxury-gray-50 rounded-lg">
                    {totalPrice >= freeShippingThreshold ? (
                      <div className="flex items-center text-green-600">
                        <ShieldCheck size={16} className="mr-2" />
                        <span className="text-sm font-medium">
                          You qualify for free shipping!
                        </span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm text-luxury-gray-600 mb-2">
                          Add {formatPrice(freeShippingThreshold - totalPrice)} more for free shipping
                        </p>
                        <div className="w-full bg-luxury-gray-200 rounded-full h-2">
                          <div 
                            className="bg-luxury-gold h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((totalPrice / freeShippingThreshold) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Checkout Button */}
                  <div className="mt-6 space-y-3">
                    <Link
                      href="/checkout"
                      className="w-full btn-luxury group"
                    >
                      Proceed to Checkout
                      <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    
                    <Link
                      href="/shop"
                      className="w-full btn-luxury-outline text-center"
                    >
                      Continue Shopping
                    </Link>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-luxury-gray-200">
                    <div className="flex items-center justify-center space-x-4 text-xs text-luxury-gray-500">
                      <div className="flex items-center">
                        <ShieldCheck size={14} className="mr-1" />
                        <span>Secure Checkout</span>
                      </div>
                      <div className="flex items-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" className="mr-1">
                          <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        <span>Free Returns</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainContentWrapper>
      
      <Footer />
    </div>
  );
}