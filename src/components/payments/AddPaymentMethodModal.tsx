'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { 
  X, 
  CreditCard, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Lock,
  Smartphone
} from 'lucide-react';
import { stripeElementsOptions } from '@/lib/stripe-client';
import PayPalPaymentMethod from './PayPalPaymentMethod';
import ApplePayPaymentMethod from './ApplePayPaymentMethod';
import GooglePayPaymentMethod from './GooglePayPaymentMethod';
import { toast } from 'react-hot-toast';
import { useSettings } from '@/contexts/SettingsContext';

// Get Stripe instance
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customerId: string;
}

// Card Form Component (inside Elements provider)
const CardForm: React.FC<{
  onSuccess: () => void;
  onError: (error: string) => void;
  customerId: string;
  onClose: () => void;
}> = ({ onSuccess, onError, customerId, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [setupIntent, setSetupIntent] = useState<any>(null);
  const [setAsDefault, setSetAsDefault] = useState(false);

  // Create setup intent when component mounts
  useEffect(() => {
    const createSetupIntent = async () => {
      try {
        // Validate customerId first
        if (!customerId) {
          console.error('No customer ID provided to AddPaymentMethodModal');
          onError('Customer information is required to add payment methods.');
          return;
        }

        // First, get customer details from our database
        console.log('Fetching customer details for ID:', customerId);
        const customerDetailsResponse = await fetch(`/api/customers/${customerId}`);
        
        console.log('Customer details response status:', customerDetailsResponse.status);
        
        if (!customerDetailsResponse.ok) {
          const errorText = await customerDetailsResponse.text();
          console.error('Customer fetch failed:', errorText);
          throw new Error(`Failed to fetch customer details: ${customerDetailsResponse.status} - ${errorText}`);
        }
        
        const customerDetails = await customerDetailsResponse.json();
        const customer = customerDetails.data;
        
        // Then ensure customer has a Stripe customer ID
        const customerResponse = await fetch('/api/stripe/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId,
            email: customer.email,
            firstName: customer.firstName || customer.first_name,
            lastName: customer.lastName || customer.last_name,
            phone: customer.phone,
          }),
        });

        if (!customerResponse.ok) {
          const errorData = await customerResponse.json();
          console.error('Stripe customer creation failed:', errorData);
          throw new Error(errorData.error || 'Failed to create Stripe customer');
        }

        const customerData = await customerResponse.json();
        const stripeCustomerId = customerData.data.stripeCustomerId;

        // Create setup intent
        const setupResponse = await fetch('/api/stripe/setup-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerId: stripeCustomerId,
          }),
        });

        if (!setupResponse.ok) {
          throw new Error('Failed to create setup intent');
        }

        const setupData = await setupResponse.json();
        console.log('Setup intent response:', setupData);
        setSetupIntent(setupData.data);
      } catch (error) {
        console.error('Error creating setup intent:', error);
        onError('Failed to initialize payment form. Please try again.');
      }
    };

    createSetupIntent();
  }, [customerId, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !setupIntent) {
      onError('Payment form not ready. Please try again.');
      return;
    }

    setIsProcessing(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm the setup intent
      const { error, setupIntent: confirmedSetupIntent } = await stripe.confirmCardSetup(
        setupIntent.client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // Billing details will be handled separately via address management
            },
          },
        }
      );

      if (error) {
        throw new Error(error.message || 'Failed to save payment method');
      }

      if (confirmedSetupIntent?.payment_method) {
        console.log('Confirmed setup intent:', confirmedSetupIntent);
        
        // Handle both cases: payment_method can be either a string ID or an object
        const paymentMethodIdOrObject = confirmedSetupIntent.payment_method;
        let paymentMethodId: string;
        let paymentMethod: any;
        
        if (typeof paymentMethodIdOrObject === 'string') {
          // If it's a string, we need to fetch the payment method details from Stripe
          paymentMethodId = paymentMethodIdOrObject;
          console.log('Payment method is a string ID:', paymentMethodId);
          
          // Fetch payment method details from our API
          const pmResponse = await fetch(`/api/stripe/payment-method/${paymentMethodId}`);
          if (!pmResponse.ok) {
            throw new Error('Failed to fetch payment method details');
          }
          
          const pmData = await pmResponse.json();
          paymentMethod = pmData.data;
          console.log('Fetched payment method details:', paymentMethod);
        } else {
          // If it's an object, use it directly
          paymentMethod = paymentMethodIdOrObject;
          paymentMethodId = paymentMethod.id;
          console.log('Payment method is an object:', paymentMethod);
        }

        console.log('Final payment method ID:', paymentMethodId);
        console.log('Final payment method object:', paymentMethod);
        
        const card = paymentMethod.card;

        const paymentMethodData = {
          customerId,
          type: 'card',
          provider: 'stripe',
          providerPaymentMethodId: paymentMethodId,
          providerCustomerId: confirmedSetupIntent.customer || paymentMethod.customer,
          displayName: `${card?.brand?.charAt(0).toUpperCase()}${card?.brand?.slice(1)} ending in ${card?.last4}`,
          brand: card?.brand,
          lastFour: card?.last4,
          expMonth: card?.exp_month,
          expYear: card?.exp_year,
          setAsDefault,
        };

        console.log('Saving payment method with data:', paymentMethodData);

        const saveResponse = await fetch('/api/payment-methods', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentMethodData),
        });

        if (!saveResponse.ok) {
          const errorText = await saveResponse.text();
          console.error('Failed to save payment method:', {
            status: saveResponse.status,
            statusText: saveResponse.statusText,
            error: errorText
          });
          throw new Error(`Failed to save payment method: ${saveResponse.status} - ${errorText}`);
        }

        onSuccess();
      } else {
        throw new Error('Payment method not confirmed');
      }
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      onError(error.message || 'Failed to add payment method. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1a1a1a',
        fontFamily: 'Inter, system-ui, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
        padding: '12px 16px',
      },
      invalid: {
        color: '#dc2626',
      },
    },
    hidePostalCode: true, // We'll handle address separately
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Security Notice - Moved to top */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex items-start space-x-2">
          <Lock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Secure Payment Processing</p>
            <p className="mt-1">
              Your payment information is processed securely by Stripe and encrypted using industry-standard security.
            </p>
          </div>
        </div>
      </div>

      {/* Card Input */}
      <div>
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-md p-3 focus-within:ring-2 focus-within:ring-luxury-gold focus-within:border-luxury-gold">
          <CardElement 
            id="card-element"
            options={cardElementOptions}
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Your card information is encrypted and secure. We never store your full card details.
        </p>
      </div>

      {/* Set as Default */}
      <div className="flex items-center">
        <input
          id="set-as-default"
          type="checkbox"
          checked={setAsDefault}
          onChange={(e) => setSetAsDefault(e.target.checked)}
          className="h-4 w-4 text-luxury-gold focus:ring-luxury-gold border-gray-300 rounded"
        />
        <label htmlFor="set-as-default" className="ml-2 block text-sm text-gray-900">
          Set as default payment method
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing || !setupIntent}
          className="inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Add Payment Method</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Main Modal Component
const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customerId
}) => {
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'card' | 'paypal' | 'apple_pay' | 'google_pay'>('card');
  const { isStripeEnabled, isPayPalEnabled, isApplePayEnabled, isGooglePayEnabled, loading: settingsLoading } = useSettings();
  
  // Debug settings values
  console.log('AddPaymentMethodModal settings:');
  console.log('  isStripeEnabled:', isStripeEnabled);
  console.log('  isPayPalEnabled:', isPayPalEnabled);
  console.log('  isApplePayEnabled:', isApplePayEnabled);
  console.log('  isGooglePayEnabled:', isGooglePayEnabled);
  console.log('  settingsLoading:', settingsLoading);

  // Set initial selected type to first available payment method
  useEffect(() => {
    if (!isOpen || settingsLoading) return; // Don't update if modal is closed or settings are loading
    
    if (!isStripeEnabled && isPayPalEnabled) {
      setSelectedType('paypal');
    } else if (!isStripeEnabled && !isPayPalEnabled && isApplePayEnabled) {
      setSelectedType('apple_pay');
    } else if (!isStripeEnabled && !isPayPalEnabled && !isApplePayEnabled && isGooglePayEnabled) {
      setSelectedType('google_pay');
    } else if (isStripeEnabled) {
      setSelectedType('card');
    }
  }, [isOpen, settingsLoading, isStripeEnabled, isPayPalEnabled, isApplePayEnabled, isGooglePayEnabled]);

  if (!isOpen) return null;
  
  // Don't render until settings are loaded to prevent hooks error
  if (settingsLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div>
              <span className="ml-3 text-gray-600">Loading payment options...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSuccess = () => {
    setError(null);
    onSuccess();
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const elementsOptions: StripeElementsOptions = {
    ...stripeElementsOptions,
    mode: 'setup',
    currency: 'gbp',
    setupFutureUsage: 'off_session',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">Add Payment Method</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Payment Method Type Selection */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Choose Payment Method Type</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {isStripeEnabled && (
                <button
                  type="button"
                  onClick={() => setSelectedType('card')}
                  className={`p-3 border-2 rounded-lg flex flex-col items-center justify-center space-y-1 transition-colors ${
                    selectedType === 'card'
                      ? 'border-luxury-gold bg-luxury-gold bg-opacity-10 text-luxury-black'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span className="font-medium text-sm">Card</span>
                </button>
              )}
              {isPayPalEnabled && (
                <button
                  type="button"
                  onClick={() => setSelectedType('paypal')}
                  className={`p-4 border-2 rounded-lg flex items-center justify-center transition-colors ${
                    selectedType === 'paypal'
                      ? 'border-luxury-gold bg-luxury-gold bg-opacity-10 text-luxury-black'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {/* Official PayPal Logo */}
                  <div className="flex items-center justify-center">
                    <img 
                      src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-200px.png" 
                      alt="PayPal Logo" 
                      className="h-6 w-auto object-contain"
                      style={{ maxWidth: '80px' }}
                    />
                  </div>
                </button>
              )}
              {isApplePayEnabled && (
                <button
                  type="button"
                  onClick={() => setSelectedType('apple_pay')}
                  className={`p-4 border-2 rounded-lg flex items-center justify-center transition-colors ${
                    selectedType === 'apple_pay'
                      ? 'border-luxury-gold bg-luxury-gold bg-opacity-10 text-luxury-black'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {/* Apple Logo SVG */}
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                </button>
              )}
              {isGooglePayEnabled && (
                <button
                  type="button"
                  onClick={() => setSelectedType('google_pay')}
                  className={`p-4 border-2 rounded-lg flex items-center justify-center transition-colors ${
                    selectedType === 'google_pay'
                      ? 'border-luxury-gold bg-luxury-gold bg-opacity-10 text-luxury-black'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {/* Google "G" Logo - Clean and Simple */}
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Conditional Payment Method Forms */}
          {selectedType === 'card' ? (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <CardForm
                onSuccess={handleSuccess}
                onError={handleError}
                customerId={customerId}
                onClose={handleClose}
              />
            </Elements>
          ) : selectedType === 'paypal' ? (
            <PayPalPaymentMethod
              customerId={customerId}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          ) : selectedType === 'apple_pay' ? (
            <ApplePayPaymentMethod
              customerId={customerId}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          ) : (
            <GooglePayPaymentMethod
              customerId={customerId}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddPaymentMethodModal;