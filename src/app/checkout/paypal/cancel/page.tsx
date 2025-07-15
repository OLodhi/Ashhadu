'use client';

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function PayPalCancelPage() {
  const router = useRouter();

  // Check if we're in a popup window
  const isPopup = typeof window !== 'undefined' && window.opener && window.opener !== window;

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