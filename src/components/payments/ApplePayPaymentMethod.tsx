'use client';

import { useState, useEffect } from 'react';
import { 
  isApplePayAvailable, 
  isApplePayAvailableWithActiveCard,
  createApplePayPaymentRequest,
  startApplePaySession,
  validateApplePayMerchant,
  processApplePayPayment,
  formatApplePayMethod
} from '@/lib/apple-pay';
import { Smartphone, AlertCircle, CheckCircle } from 'lucide-react';

interface ApplePayPaymentMethodProps {
  customerId: string;
  onSuccess: (paymentMethod: any) => void;
  onError: (error: string) => void;
}

export default function ApplePayPaymentMethod({ customerId, onSuccess, onError }: ApplePayPaymentMethodProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [hasActiveCard, setHasActiveCard] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkApplePaySupport = async () => {
      try {
        const supported = isApplePayAvailable();
        setIsSupported(supported);
        
        if (supported) {
          const activeCard = await isApplePayAvailableWithActiveCard();
          setHasActiveCard(activeCard);
        }
      } catch (error) {
        console.error('Error checking Apple Pay support:', error);
        setIsSupported(false);
        setHasActiveCard(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkApplePaySupport();
  }, []);

  const handleApplePayClick = async () => {
    if (!isSupported || !hasActiveCard) {
      onError('Apple Pay is not available on this device.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment request for payment method setup
      const paymentRequest = createApplePayPaymentRequest(0.01); // Minimal amount for setup

      // Start Apple Pay session
      const session = startApplePaySession(paymentRequest, {
        onValidateMerchant: async (event) => {
          try {
            const merchantValidation = await validateApplePayMerchant(event.validationURL);
            
            if (merchantValidation.success) {
              session?.completeMerchantValidation(merchantValidation.merchantSession);
            } else {
              throw new Error('Merchant validation failed');
            }
          } catch (error) {
            console.error('Merchant validation error:', error);
            session?.abort();
            onError('Apple Pay setup failed. Please try again.');
            setIsProcessing(false);
          }
        },
        onPaymentAuthorized: async (event) => {
          try {
            // Process the payment for payment method setup
            const result = await processApplePayPayment(event.payment, customerId);
            
            if (result.success) {
              // Complete the payment
              session?.completePayment(1); // ApplePaySession.STATUS_SUCCESS
              
              // Format the payment method for the parent component
              const formattedPaymentMethod = formatApplePayMethod(event.payment);
              
              onSuccess({
                ...formattedPaymentMethod,
                id: `apple_pay_${Date.now()}`,
                customerId,
                provider: 'apple_pay',
                isDefault: false
              });
            } else {
              session?.completePayment(0);
              onError(result.error || 'Failed to set up Apple Pay payment method');
            }
          } catch (error) {
            console.error('Payment processing error:', error);
            session?.completePayment(0);
            onError('Payment processing failed. Please try again.');
          } finally {
            setIsProcessing(false);
          }
        },
        onCancel: () => {
          console.log('Apple Pay cancelled by user');
          setIsProcessing(false);
        },
        onError: (error) => {
          console.error('Apple Pay session error:', error);
          onError('Apple Pay setup failed. Please try again.');
          setIsProcessing(false);
        }
      });

      if (!session) {
        throw new Error('Failed to start Apple Pay session');
      }
    } catch (error) {
      console.error('Apple Pay setup error:', error);
      onError('Apple Pay setup failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Apple Pay Not Available</h3>
        <p className="text-gray-600">
          Apple Pay is not supported on this device or browser.
        </p>
      </div>
    );
  }

  if (!hasActiveCard) {
    return (
      <div className="text-center p-8">
        <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Apple Pay Cards</h3>
        <p className="text-gray-600 mb-4">
          You need to add a payment card to your Apple Wallet to use Apple Pay.
        </p>
        <p className="text-sm text-gray-500">
          Open the Wallet app on your device to add a card.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Apple Pay Description */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Smartphone className="h-8 w-8 text-luxury-gold mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Apple Pay</h3>
        </div>
        <p className="text-gray-600 mb-4">
          Use Touch ID, Face ID, or your passcode to add your Apple Pay card as a payment method.
        </p>
      </div>

      {/* Apple Pay Button */}
      <div className="flex justify-center">
        <button
          onClick={handleApplePayClick}
          disabled={isProcessing}
          className={`
            relative overflow-hidden
            bg-black text-white
            px-8 py-4 rounded-lg
            font-medium text-lg
            transition-all duration-200
            ${isProcessing 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-800 active:bg-gray-900 hover:shadow-lg'
            }
          `}
          style={{
            background: 'linear-gradient(135deg, #000 0%, #1a1a1a 100%)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        >
          {isProcessing ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Setting up Apple Pay...
            </div>
          ) : (
            <div className="flex items-center">
              <svg 
                className="h-6 w-6 mr-2" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Pay with Apple Pay
            </div>
          )}
        </button>
      </div>

      {/* Security Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Secure Payment</p>
            <p className="text-sm text-gray-600">
              Your payment information is processed securely. Apple Pay uses tokenization to protect your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Help Information */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          By adding this payment method, you agree to save it for future purchases. 
          You can remove it at any time from your account settings.
        </p>
      </div>
    </div>
  );
}