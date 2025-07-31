'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { CheckCircle, Package, CreditCard, Truck, ArrowRight, Download, Share2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import SafeLink from '@/components/ui/SafeLink';

interface OrderDetails {
  id: string;
  orderNumber: string;
  orderDate: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  stripePaymentIntentId?: string;
  total: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  currency: string;
  notes?: string;
  estimatedDelivery: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  } | null;
  billingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
    phone?: string;
  };
  shippingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    productId: string;
    name: string;
    arabicName?: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
    islamicCategory?: string;
    slug?: string;
  }>;
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderNumber) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/orders/confirmation/${orderNumber}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch order details');
        }

        if (result.success && result.data) {
          setOrderDetails(result.data);
        } else {
          throw new Error('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
        setOrderDetails(null);
      } finally {
        setIsLoading(false);
      }
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
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 16 16" className="text-luxury-gold">
                            <path d="M8 1l2.36 4.78L16 6.5l-3.82.56L11 12l-3-5.22L3 6.5l5.64-.72L8 1z" 
                                  fill="currentColor"/>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-luxury-black">{item.name}</p>
                      {item.arabicName && (
                        <p className="text-sm text-luxury-gray-500 font-amiri">{item.arabicName}</p>
                      )}
                      <p className="text-sm text-luxury-gray-600">
                        Quantity: {item.quantity} | SKU: {item.sku}
                      </p>
                      {item.islamicCategory && (
                        <p className="text-xs text-luxury-gold">{item.islamicCategory}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-luxury-gold">
                        {formatPrice(item.total)}
                      </p>
                      <p className="text-sm text-luxury-gray-600">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-luxury-gray-200 space-y-2">
                <div className="flex justify-between text-sm text-luxury-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(orderDetails.subtotal)}</span>
                </div>
                {orderDetails.taxAmount > 0 && (
                  <div className="flex justify-between text-sm text-luxury-gray-600">
                    <span>VAT (20%)</span>
                    <span>{formatPrice(orderDetails.taxAmount)}</span>
                  </div>
                )}
                {orderDetails.shippingAmount > 0 && (
                  <div className="flex justify-between text-sm text-luxury-gray-600">
                    <span>Shipping</span>
                    <span>{formatPrice(orderDetails.shippingAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-playfair text-lg font-semibold text-luxury-black pt-2 border-t border-luxury-gray-200">
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
                {orderDetails.shippingAddress ? (
                  <>
                    <p className="font-medium">
                      {orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}
                    </p>
                    {orderDetails.shippingAddress.company && (
                      <p>{orderDetails.shippingAddress.company}</p>
                    )}
                    <p>{orderDetails.shippingAddress.addressLine1}</p>
                    {orderDetails.shippingAddress.addressLine2 && (
                      <p>{orderDetails.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {orderDetails.shippingAddress.city}
                      {orderDetails.shippingAddress.county && `, ${orderDetails.shippingAddress.county}`}
                    </p>
                    <p>{orderDetails.shippingAddress.postcode}</p>
                    <p>{orderDetails.shippingAddress.country}</p>
                    {orderDetails.shippingAddress.phone && (
                      <p className="text-sm text-luxury-gray-600 mt-2">
                        Phone: {orderDetails.shippingAddress.phone}
                      </p>
                    )}
                  </>
                ) : orderDetails.customer ? (
                  <p>{orderDetails.customer.firstName} {orderDetails.customer.lastName}</p>
                ) : (
                  <p>Address not available</p>
                )}
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
            📧 A confirmation email has been sent to <strong>{orderDetails.customer?.email}</strong>
          </p>
        </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
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
    }>
      <OrderConfirmationContent />
    </Suspense>
  );
}