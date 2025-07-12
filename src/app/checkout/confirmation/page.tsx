'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, Package, CreditCard, Truck, ArrowRight, Download, Share2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import SafeLink from '@/components/ui/SafeLink';

interface OrderDetails {
  orderNumber: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  total: number;
  paymentMethod: string;
  status: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  shipping: {
    address: string;
    city: string;
    postcode: string;
    country: string;
  };
  estimatedDelivery: string;
}

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching order details
    const fetchOrderDetails = async () => {
      // In a real app, you would fetch from your API
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockOrderDetails: OrderDetails = {
        orderNumber: orderNumber || 'ASH-123456',
        orderDate: new Date().toISOString(),
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        total: 249.97,
        paymentMethod: 'Credit Card',
        status: 'confirmed',
        items: [
          {
            id: '1',
            name: 'Ayat al-Kursi Calligraphy Model',
            quantity: 1,
            price: 89.99
          },
          {
            id: '2',
            name: 'Masjid al-Haram Scale Model',
            quantity: 1,
            price: 159.99
          }
        ],
        shipping: {
          address: '123 Main Street',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'United Kingdom'
        },
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setOrderDetails(mockOrderDetails);
      setIsLoading(false);
    };

    fetchOrderDetails();
  }, [orderNumber]);

  const handleShareOrder = async () => {
    if (navigator.share && orderDetails) {
      try {
        await navigator.share({
          title: 'Ashhadu Islamic Art Order',
          text: `I just ordered from Ashhadu Islamic Art! Order #${orderDetails.orderNumber}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-center">
                <SafeLink href="/" className="inline-block">
                  <Logo className="w-12 h-12" />
                </SafeLink>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold mx-auto mb-4"></div>
            <p className="text-luxury-gray-600">Loading your order confirmation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-luxury-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-center">
                <SafeLink href="/" className="inline-block">
                  <Logo className="w-12 h-12" />
                </SafeLink>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <p className="text-luxury-gray-600">Order not found</p>
            <Link href="/shop" className="btn-luxury mt-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center">
              <SafeLink href="/" className="inline-block">
                <Logo className="w-12 h-12" />
              </SafeLink>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="font-playfair text-3xl font-bold text-luxury-black mb-2">
            Order Confirmed!
          </h1>
          <p className="text-luxury-gray-600 mb-4">
            Thank you for your order. We've received your payment and will begin processing your items shortly.
          </p>
          <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-200 p-4 inline-block">
            <p className="text-sm text-luxury-gray-600">Order Number</p>
            <p className="font-playfair text-xl font-semibold text-luxury-gold">
              {orderDetails.orderNumber}
            </p>
          </div>
        </motion.div>

        {/* Order Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-200 p-6">
            <h2 className="font-playfair text-xl font-semibold text-luxury-black mb-6">
              Order Timeline
            </h2>
            
            <div className="space-y-6">
              {/* Order Placed */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={16} className="text-white" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-luxury-black">Order Placed</p>
                  <p className="text-sm text-luxury-gray-600">
                    {new Date(orderDetails.orderDate).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Processing */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center">
                  <Package size={16} className="text-luxury-black" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-luxury-black">Processing</p>
                  <p className="text-sm text-luxury-gray-600">
                    Your order is being prepared for shipping
                  </p>
                </div>
              </div>

              {/* Shipping */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-luxury-gray-300 rounded-full flex items-center justify-center">
                  <Truck size={16} className="text-luxury-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="font-medium text-luxury-gray-600">Shipping</p>
                  <p className="text-sm text-luxury-gray-600">
                    Estimated delivery: {new Date(orderDetails.estimatedDelivery).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-200 p-6">
              <h2 className="font-playfair text-xl font-semibold text-luxury-black mb-6">
                Order Details
              </h2>
              
              <div className="space-y-4">
                {orderDetails.items.map((item, index) => (
                  <div key={item.id} className="flex items-center space-x-4 p-3 bg-luxury-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-luxury-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 16 16" className="text-luxury-gold">
                          <path d="M8 1l2.36 4.78L16 6.5l-3.82.56L11 12l-3-5.22L3 6.5l5.64-.72L8 1z" 
                                fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-luxury-black">{item.name}</p>
                      <p className="text-sm text-luxury-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-luxury-gold">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-luxury-gray-200">
                <div className="flex justify-between font-playfair text-lg font-semibold text-luxury-black">
                  <span>Total</span>
                  <span className="text-luxury-gold">{formatPrice(orderDetails.total)}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipping & Payment Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-200 p-6">
              <h3 className="font-playfair text-lg font-semibold text-luxury-black mb-4">
                Shipping Address
              </h3>
              <div className="text-luxury-gray-700">
                <p>{orderDetails.customerName}</p>
                <p>{orderDetails.shipping.address}</p>
                <p>{orderDetails.shipping.city}, {orderDetails.shipping.postcode}</p>
                <p>{orderDetails.shipping.country}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-200 p-6">
              <h3 className="font-playfair text-lg font-semibold text-luxury-black mb-4">
                Payment Method
              </h3>
              <div className="flex items-center">
                <CreditCard size={20} className="text-luxury-gold mr-3" />
                <span className="text-luxury-gray-700">{orderDetails.paymentMethod}</span>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-200 p-6">
              <h3 className="font-playfair text-lg font-semibold text-luxury-black mb-4">
                Estimated Delivery
              </h3>
              <div className="flex items-center">
                <Calendar size={20} className="text-luxury-gold mr-3" />
                <span className="text-luxury-gray-700">
                  {new Date(orderDetails.estimatedDelivery).toLocaleDateString('en-GB', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/account/orders"
            className="btn-luxury-outline flex items-center justify-center"
          >
            <Package size={18} className="mr-2" />
            View All Orders
          </Link>
          
          <button
            onClick={handleShareOrder}
            className="btn-luxury-outline flex items-center justify-center"
          >
            <Share2 size={18} className="mr-2" />
            Share Order
          </button>
          
          <Link
            href="/shop"
            className="btn-luxury flex items-center justify-center"
          >
            Continue Shopping
            <ArrowRight size={18} className="ml-2" />
          </Link>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 bg-white rounded-lg shadow-sm border border-luxury-gray-200 p-6 text-center"
        >
          <h3 className="font-playfair text-lg font-semibold text-luxury-black mb-4">
            Need Help?
          </h3>
          <p className="text-luxury-gray-600 mb-4">
            If you have any questions about your order, please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:orders@ashhadu.co.uk"
              className="text-luxury-gold hover:text-luxury-gold/80 transition-colors"
            >
              orders@ashhadu.co.uk
            </a>
            <a
              href="tel:+447700900123"
              className="text-luxury-gold hover:text-luxury-gold/80 transition-colors"
            >
              +44 7700 900 123
            </a>
          </div>
        </motion.div>

        {/* Email Confirmation Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
        >
          <p className="text-sm text-blue-700">
            📧 A confirmation email has been sent to <strong>{orderDetails.customerEmail}</strong>
          </p>
        </motion.div>
        </div>
      </div>
    </div>
  );
}