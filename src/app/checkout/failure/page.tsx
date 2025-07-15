'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, CreditCard, RefreshCw, ArrowLeft, Mail, Phone, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Logo from '@/components/ui/Logo';
import SafeLink from '@/components/ui/SafeLink';

type FailureReason = 
  | 'payment_failed' 
  | 'payment_declined' 
  | 'order_failed' 
  | 'network_error' 
  | 'validation_error' 
  | 'stripe_error'
  | 'unknown';

interface FailureDetails {
  reason: FailureReason;
  message?: string;
  orderNumber?: string;
  errorCode?: string;
  canRetry?: boolean;
  contactSupport?: boolean;
}

const getFailureConfig = (reason: FailureReason): {
  title: string;
  description: string;
  icon: React.ReactNode;
  canRetry: boolean;
  contactSupport: boolean;
  suggestions: string[];
} => {
  switch (reason) {
    case 'payment_declined':
      return {
        title: 'Payment Declined',
        description: 'Your payment was declined by your bank or card issuer.',
        icon: <CreditCard size={32} className="text-red-600" />,
        canRetry: true,
        contactSupport: false,
        suggestions: [
          'Check that your card details are correct',
          'Ensure you have sufficient funds',
          'Try a different payment method',
          'Contact your bank if the issue persists'
        ]
      };
    
    case 'payment_failed':
      return {
        title: 'Payment Processing Failed',
        description: 'There was an issue processing your payment.',
        icon: <AlertCircle size={32} className="text-red-600" />,
        canRetry: true,
        contactSupport: true,
        suggestions: [
          'Check your internet connection',
          'Try again with the same payment method',
          'Use a different payment method',
          'Clear your browser cache and try again'
        ]
      };
    
    case 'stripe_error':
      return {
        title: 'Payment System Error',
        description: 'There was a technical issue with the payment system.',
        icon: <AlertCircle size={32} className="text-red-600" />,
        canRetry: true,
        contactSupport: true,
        suggestions: [
          'Please try again in a few minutes',
          'Check your payment details are correct',
          'Try a different payment method',
          'Contact support if the problem continues'
        ]
      };
    
    case 'order_failed':
      return {
        title: 'Order Creation Failed',
        description: 'We couldn\'t create your order due to a technical issue.',
        icon: <AlertCircle size={32} className="text-orange-600" />,
        canRetry: true,
        contactSupport: true,
        suggestions: [
          'Please try placing your order again',
          'Check that all required fields are filled',
          'Ensure your items are still in stock',
          'Contact support if you continue to have issues'
        ]
      };
    
    case 'network_error':
      return {
        title: 'Connection Problem',
        description: 'There was a network issue while processing your order.',
        icon: <RefreshCw size={32} className="text-blue-600" />,
        canRetry: true,
        contactSupport: false,
        suggestions: [
          'Check your internet connection',
          'Try refreshing the page',
          'Wait a moment and try again',
          'Try using a different device or network'
        ]
      };
    
    case 'validation_error':
      return {
        title: 'Invalid Information',
        description: 'Some of the information provided was invalid.',
        icon: <AlertCircle size={32} className="text-yellow-600" />,
        canRetry: true,
        contactSupport: false,
        suggestions: [
          'Check your shipping address is correct',
          'Verify your payment information',
          'Ensure all required fields are completed',
          'Try again with correct information'
        ]
      };
    
    default:
      return {
        title: 'Something Went Wrong',
        description: 'We encountered an unexpected issue while processing your order.',
        icon: <AlertCircle size={32} className="text-red-600" />,
        canRetry: true,
        contactSupport: true,
        suggestions: [
          'Please try again',
          'Check that your information is correct',
          'Try using a different payment method',
          'Contact our support team for assistance'
        ]
      };
  }
};

export default function OrderFailurePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [failureDetails, setFailureDetails] = useState<FailureDetails>({
    reason: 'unknown',
    canRetry: true,
    contactSupport: true
  });

  useEffect(() => {
    const reason = (searchParams.get('reason') as FailureReason) || 'unknown';
    const message = searchParams.get('message') || '';
    const orderNumber = searchParams.get('order') || '';
    const errorCode = searchParams.get('code') || '';

    setFailureDetails({
      reason,
      message,
      orderNumber,
      errorCode,
      canRetry: true,
      contactSupport: true
    });
  }, [searchParams]);

  const config = getFailureConfig(failureDetails.reason);

  const handleRetryCheckout = () => {
    // Redirect back to checkout page
    router.push('/checkout');
  };

  const handleContactSupport = () => {
    // Scroll to contact section
    document.getElementById('contact-support')?.scrollIntoView({ behavior: 'smooth' });
  };

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
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Failure Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {config.icon}
            </div>
            <h1 className="font-playfair text-3xl font-bold text-luxury-black mb-2">
              {config.title}
            </h1>
            <p className="text-luxury-gray-600 mb-4">
              {config.description}
            </p>
            
            {/* Error Details */}
            {(failureDetails.message || failureDetails.errorCode || failureDetails.orderNumber) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-left max-w-md mx-auto">
                {failureDetails.orderNumber && (
                  <p className="text-sm text-luxury-gray-600 mb-2">
                    <span className="font-medium">Order:</span> {failureDetails.orderNumber}
                  </p>
                )}
                {failureDetails.message && (
                  <p className="text-sm text-luxury-gray-600 mb-2">
                    <span className="font-medium">Error:</span> {failureDetails.message}
                  </p>
                )}
                {failureDetails.errorCode && (
                  <p className="text-sm text-luxury-gray-600">
                    <span className="font-medium">Code:</span> {failureDetails.errorCode}
                  </p>
                )}
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            {config.canRetry && (
              <button
                onClick={handleRetryCheckout}
                className="btn-luxury flex items-center justify-center"
              >
                <RefreshCw size={18} className="mr-2" />
                Try Again
              </button>
            )}
            
            <Link
              href="/cart"
              className="btn-luxury-outline flex items-center justify-center"
            >
              <ShoppingCart size={18} className="mr-2" />
              View Cart
            </Link>
            
            <Link
              href="/shop"
              className="btn-luxury-outline flex items-center justify-center"
            >
              Continue Shopping
            </Link>
          </motion.div>

          {/* Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8"
          >
            <h2 className="font-playfair text-xl font-semibold text-luxury-black mb-4">
              What you can do:
            </h2>
            <ul className="space-y-2">
              {config.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-luxury-gold rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="text-luxury-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Support */}
          {config.contactSupport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              id="contact-support"
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center"
            >
              <h3 className="font-playfair text-lg font-semibold text-luxury-black mb-4">
                Need Help?
              </h3>
              <p className="text-luxury-gray-600 mb-4">
                Our support team is here to help you complete your order.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@ashhadu.co.uk"
                  className="flex items-center justify-center text-luxury-gold hover:text-luxury-gold/80 transition-colors"
                >
                  <Mail size={18} className="mr-2" />
                  support@ashhadu.co.uk
                </a>
                <a
                  href="tel:+447700900123"
                  className="flex items-center justify-center text-luxury-gold hover:text-luxury-gold/80 transition-colors"
                >
                  <Phone size={18} className="mr-2" />
                  +44 7700 900 123
                </a>
              </div>
              <p className="text-sm text-luxury-gray-500 mt-4">
                Available Monday-Friday, 9am-5pm GMT
              </p>
            </motion.div>
          )}

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-8"
          >
            <Link
              href="/"
              className="inline-flex items-center text-luxury-gray-600 hover:text-luxury-gold transition-colors"
            >
              <ArrowLeft size={18} className="mr-2" />
              Back to Homepage
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}