'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  isGooglePayAvailable,
  loadGooglePayScript,
  getGooglePaymentsClient,
  createGooglePayPaymentRequest,
  processGooglePayPayment,
  formatGooglePayMethod,
  googlePayButtonConfig
} from '@/lib/google-pay';
import { Smartphone, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface GooglePayPaymentMethodProps {
  customerId: string;
  onSuccess: (paymentMethod: any) => void;
  onError: (error: string) => void;
}

export default function GooglePayPaymentMethod({ customerId, onSuccess, onError }: GooglePayPaymentMethodProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const paymentsClientRef = useRef<any>(null); // google.payments.api.PaymentsClient

  useEffect(() => {
    const initializeGooglePay = async () => {
      try {
        setIsLoading(true);

        // Load Google Pay script
        await loadGooglePayScript();
        setScriptLoaded(true);

        // Check if Google Pay is available
        const available = await isGooglePayAvailable();
        setIsSupported(available);

        if (available) {
          // Create payments client
          paymentsClientRef.current = getGooglePaymentsClient();
          
          // Create and render Google Pay button
          if (buttonContainerRef.current && paymentsClientRef.current) {
            // Clear any existing button
            buttonContainerRef.current.innerHTML = '';
            
            const button = paymentsClientRef.current.createButton({
              ...googlePayButtonConfig,
              onClick: handleGooglePayClick
            });
            
            buttonContainerRef.current.appendChild(button);
          }
        }
      } catch (error) {
        console.error('Error initializing Google Pay:', error);
        setIsSupported(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeGooglePay();

    // Cleanup function
    return () => {
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  const handleGooglePayClick = async () => {
    if (!paymentsClientRef.current || !isSupported) {
      onError('Google Pay is not available.');
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment request for payment method setup
      const paymentRequest = createGooglePayPaymentRequest(0.01); // Minimal amount for setup

      // Request payment data
      const paymentData = await paymentsClientRef.current.loadPaymentData(paymentRequest);
      
      console.log('Google Pay payment data received:', paymentData);

      // Process the payment for payment method setup
      const result = await processGooglePayPayment(paymentData, customerId);
      
      if (result.success) {
        // Format the payment method for the parent component
        const formattedPaymentMethod = formatGooglePayMethod(paymentData);
        
        onSuccess({
          ...formattedPaymentMethod,
          id: `google_pay_${Date.now()}`,
          customerId,
          provider: 'google_pay',
          isDefault: false
        });
      } else {
        onError(result.error || 'Failed to set up Google Pay payment method');
      }
    } catch (error: any) {
      console.error('Google Pay payment error:', error);
      
      // Handle user cancellation gracefully
      if (error.statusCode === 'CANCELED') {
        console.log('Google Pay cancelled by user');
        // Don't show error for user cancellation
      } else {
        onError('Google Pay setup failed. Please try again.');
      }
    } finally {
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

  if (!scriptLoaded) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Google Pay</h3>
        <p className="text-gray-600">
          Please wait while we load Google Pay...
        </p>
      </div>
    );
  }

  if (!isSupported) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Google Pay Not Available</h3>
        <p className="text-gray-600 mb-4">
          Google Pay is not supported on this device or browser, or you don't have any cards set up.
        </p>
        <p className="text-sm text-gray-500">
          To use Google Pay, please ensure you have cards saved in your Google account and are using a supported browser.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Information - Moved to top */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-start">
          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Secure Payment</p>
            <p className="text-sm text-gray-600">
              Your payment information is processed securely through Google Pay. Your card details are never shared with merchants.
            </p>
          </div>
        </div>
      </div>

      {/* Google Pay Button Container */}
      <div className="flex justify-center">
        <div className="relative">
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg z-10">
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-sm font-medium">Processing...</span>
              </div>
            </div>
          )}
          <div 
            ref={buttonContainerRef}
            className={`transition-opacity duration-200 ${isProcessing ? 'opacity-50' : ''}`}
          />
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