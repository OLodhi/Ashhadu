'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useCartStore } from '@/store/cartStore';

function PayPalSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCartStore();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing PayPal payment...');
  const [orderNumber, setOrderNumber] = useState<string>('');

  useEffect(() => {
    const processPayPalReturn = async () => {
      try {
        const token = searchParams.get('token'); // PayPal order ID
        const payerId = searchParams.get('PayerID');
        
        // Check if we're in a popup window
        const isPopup = window.opener && window.opener !== window;
        
        if (!token) {
          setStatus('error');
          setMessage('Missing PayPal order information');
          return;
        }

        console.log('Processing PayPal return with token:', token);
        
        // The order ID should be in the PayPal order reference_id
        // We need to get the order details first to find our internal order ID
        const paypalOrderResponse = await fetch('/api/paypal/get-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paypalOrderId: token
          }),
        });

        const paypalOrderResult = await paypalOrderResponse.json();
        
        if (!paypalOrderResult.success) {
          setStatus('error');
          setMessage('Failed to retrieve PayPal order details');
          return;
        }

        const orderId = paypalOrderResult.data.referenceId;
        
        if (!orderId) {
          setStatus('error');
          setMessage('Order reference not found');
          return;
        }

        // Now capture the PayPal payment
        const captureResponse = await fetch('/api/payments/process', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId: orderId,
            paymentMethod: 'paypal',
            paymentData: {
              paypalOrderId: token,
              payerId: payerId
            }
          }),
        });

        const captureResult = await captureResponse.json();
        
        if (captureResult.success) {
          setStatus('success');
          setMessage('PayPal payment completed successfully!');
          setOrderNumber(captureResult.data.orderNumber);
          
          // Clear the cart since payment was successful
          clearCart();
          
          if (isPopup) {
            // If we're in a popup, close it and let the parent handle the redirect
            setMessage('Payment successful! Closing window...');
            setTimeout(() => {
              window.close();
            }, 1000);
          } else {
            // If we're not in a popup, redirect normally
            setTimeout(() => {
              router.push(`/checkout/confirmation?order=${captureResult.data.orderNumber}`);
            }, 2000);
          }
        } else {
          setStatus('error');
          setMessage(captureResult.error || 'PayPal payment processing failed');
        }
      } catch (error) {
        console.error('Error processing PayPal return:', error);
        setStatus('error');
        setMessage('An error occurred while processing your payment');
      }
    };

    processPayPalReturn();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-luxury-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <Logo className="w-16 h-16 mx-auto mb-4" />
            <h1 className="font-playfair text-2xl font-bold text-luxury-black mb-2">
              PayPal Payment
            </h1>
          </div>

          {status === 'processing' && (
            <div className="text-center">
              <Loader2 size={48} className="mx-auto mb-4 text-luxury-gold animate-spin" />
              <p className="text-luxury-gray-600 mb-4">{message}</p>
              <p className="text-sm text-luxury-gray-500">
                Please wait while we process your payment...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-600" />
              <h2 className="text-xl font-semibold text-luxury-black mb-2">
                Payment Successful!
              </h2>
              <p className="text-luxury-gray-600 mb-4">{message}</p>
              {orderNumber && (
                <p className="text-sm text-luxury-gray-500 mb-4">
                  Order Number: <span className="font-medium">{orderNumber}</span>
                </p>
              )}
              <p className="text-sm text-luxury-gray-500">
                Redirecting to confirmation page...
              </p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircle size={48} className="mx-auto mb-4 text-red-600" />
              <h2 className="text-xl font-semibold text-luxury-black mb-2">
                Payment Failed
              </h2>
              <p className="text-luxury-gray-600 mb-6">{message}</p>
              <button
                onClick={() => router.push('/checkout')}
                className="px-6 py-3 bg-luxury-gold text-luxury-black rounded-md hover:bg-luxury-gold/90 transition-colors font-medium"
              >
                Return to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PayPalSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-luxury-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <Logo className="w-16 h-16 mx-auto mb-4" />
              <h1 className="font-playfair text-2xl font-bold text-luxury-black mb-2">
                PayPal Payment
              </h1>
            </div>
            <div className="text-center">
              <Loader2 size={48} className="mx-auto mb-4 text-luxury-gold animate-spin" />
              <p className="text-luxury-gray-600 mb-4">Processing PayPal payment...</p>
              <p className="text-sm text-luxury-gray-500">
                Please wait while we process your payment...
              </p>
            </div>
          </div>
        </div>
      </div>
    }>
      <PayPalSuccessContent />
    </Suspense>
  );
}