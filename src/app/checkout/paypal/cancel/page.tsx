'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { XCircle } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function PayPalCancelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Check if we're in a popup window
  const isPopup = typeof window !== 'undefined' && window.opener && window.opener !== window;

  useEffect(() => {
    // Get the order ID from URL parameters
    const orderId = searchParams.get('orderId');
    
    if (orderId) {
      // Cancel the order when the component loads
      cancelOrder(orderId);
    }
  }, [searchParams]);

  const cancelOrder = async (orderId: string) => {
    try {
      setIsProcessing(true);
      
      // Cancel the order in the database
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
          payment_status: 'failed',
          notes: 'Order cancelled due to PayPal payment cancellation'
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        console.error('Failed to cancel order:', result.error);
        setError(`Failed to cancel order: ${result.error}. Please contact support.`);
      } else {
        console.log('Order cancelled successfully:', orderId);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError(`Error cancelling order: ${error instanceof Error ? error.message : 'Network error'}. Please contact support.`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReturnToCheckout = () => {
    if (isPopup) {
      window.close();
    } else {
      router.push('/checkout');
    }
  };

  const handleReturnToCart = () => {
    if (isPopup) {
      window.close();
    } else {
      router.push('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <Logo className="w-16 h-16 mx-auto mb-4" />
            <h1 className="font-playfair text-2xl font-bold text-luxury-black mb-2">
              Payment Cancelled
            </h1>
          </div>

          <div className="text-center">
            <XCircle size={48} className="mx-auto mb-4 text-orange-500" />
            <h2 className="text-xl font-semibold text-luxury-black mb-2">
              PayPal Payment Cancelled
            </h2>
            <p className="text-luxury-gray-600 mb-6">
              Your PayPal payment was cancelled. No charges have been made to your account.
              {isProcessing && " We're cancelling your order..."}
              {error && (
                <span className="block text-red-600 mt-2 text-sm">{error}</span>
              )}
              {!isProcessing && !error && (
                <span className="block text-green-600 mt-2 text-sm">Your order has been cancelled successfully.</span>
              )}
            </p>
            <div className="space-y-3">
              <button
                onClick={handleReturnToCheckout}
                className="w-full px-6 py-3 bg-luxury-gold text-luxury-black rounded-md hover:bg-luxury-gold/90 transition-colors font-medium"
              >
                {isPopup ? 'Close Window' : 'Return to Checkout'}
              </button>
              <button
                onClick={handleReturnToCart}
                className="w-full px-6 py-3 bg-white text-luxury-gray-700 border border-luxury-gray-300 rounded-md hover:bg-luxury-gray-50 transition-colors font-medium"
              >
                {isPopup ? 'Close Window' : 'Return to Cart'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}