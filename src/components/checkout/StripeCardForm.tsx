'use client';

import React, { useState, useEffect } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { stripeElementsOptions, handleStripeError } from '@/lib/stripe-client';

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeCardFormProps {
  amount: number;
  currency?: string;
  orderId?: string;
  onSuccess: (result: { paymentIntentId: string; status: string }) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

interface PaymentFormProps {
  onSuccess: (result: { paymentIntentId: string; status: string }) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  amount: number;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

// Inner form component that uses Stripe hooks
function PaymentForm({ onSuccess, onError, disabled, amount, billingDetails }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('StripeCardForm submit handler called');

    if (!stripe || !elements || disabled) {
      console.log('Stripe not ready or form disabled:', { stripe: !!stripe, elements: !!elements, disabled });
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      console.log('Confirming payment with billing details:', billingDetails);
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required', // Handle success/failure in the same page
        confirmParams: {
          return_url: `${window.location.origin}/checkout/confirmation`,
          payment_method_data: {
            billing_details: billingDetails || {}
          }
        },
      });

      if (error) {
        console.error('Stripe payment error:', error);
        const friendlyError = handleStripeError(error);
        setErrorMessage(friendlyError);
        onError(friendlyError);
      } else if (paymentIntent) {
        console.log('Payment succeeded:', paymentIntent.id, 'Status:', paymentIntent.status);
        onSuccess({
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status
        });
      }
    } catch (err: any) {
      console.error('Stripe payment exception:', err);
      const errorMessage = err?.message || 'An unexpected error occurred during payment.';
      setErrorMessage(errorMessage);
      onError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Listen for changes to the PaymentElement
  const handleElementChange = (event: any) => {
    setIsComplete(event.complete);
    if (event.error) {
      setErrorMessage(handleStripeError(event.error));
    } else {
      setErrorMessage(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Element */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard size={20} className="text-luxury-gold" />
          <h3 className="font-medium text-luxury-black">Card Details</h3>
        </div>
        
        <div className="relative">
          <PaymentElement 
            onChange={handleElementChange}
            options={{
              layout: 'tabs',
              defaultValues: {
                billingDetails: {
                  address: {
                    country: 'GB', // Default to UK
                  },
                },
              },
              fields: {
                billingDetails: {
                  address: {
                    country: 'never', // We handle address separately
                  },
                },
              },
              terms: {
                card: 'never', // We show our own terms
              },
            }}
          />
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Success Indicator */}
      {isComplete && !errorMessage && (
        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">Card details are complete</p>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div className="flex items-center space-x-2 p-3 bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg">
          <Loader2 size={16} className="text-luxury-gold animate-spin flex-shrink-0" />
          <p className="text-sm text-luxury-black">Processing your payment...</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="text-xs text-luxury-gray-500 bg-luxury-gray-50 p-3 rounded-lg">
        <div className="flex items-center space-x-1 mb-1">
          <svg width="12" height="12" viewBox="0 0 24 24" className="text-green-600">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span className="font-medium">Secure Payment</span>
        </div>
        <p>Your payment information is encrypted and secure. We never store your card details.</p>
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-luxury-gray-200">
        <button
          type="submit"
          disabled={!stripe || !elements || isProcessing || disabled}
          className="w-full px-6 py-3 bg-luxury-gold text-luxury-black rounded-md hover:bg-luxury-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
        >
          {isProcessing ? (
            <>
              <Loader2 size={18} className="mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard size={18} className="mr-2" />
              Pay £{amount.toFixed(2)}
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// Main component
export default function StripeCardForm({
  amount,
  currency = 'gbp',
  orderId,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  billingDetails
}: StripeCardFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  // Create Payment Intent on component mount
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        console.log('Creating payment intent for amount:', amount, 'currency:', currency);
        setIsLoading(true);
        setInitError(null);

        const response = await fetch('/api/stripe/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount,
            currency,
            orderId,
            metadata: {
              checkout_source: 'stripe_card_form'
            }
          }),
        });

        const result = await response.json();
        console.log('Payment Intent API response:', result);

        if (!result.success) {
          throw new Error(result.error || 'Failed to initialize payment');
        }

        setClientSecret(result.data.clientSecret);
        console.log('Payment Intent created successfully with client secret');
      } catch (error: any) {
        console.error('Error creating payment intent:', error);
        const errorMessage = error?.message || 'Failed to initialize payment. Please try again.';
        setInitError(errorMessage);
        onError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (amount > 0) {
      console.log('StripeCardForm useEffect triggered for amount:', amount);
      createPaymentIntent();
    } else {
      console.log('StripeCardForm useEffect: amount is 0, not creating payment intent');
    }
  }, [amount, currency, orderId, onError]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-luxury-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3 py-8">
          <Loader2 size={20} className="text-luxury-gold animate-spin" />
          <span className="text-luxury-gray-600">Initializing secure payment...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (initError || !clientSecret) {
    return (
      <div className={`bg-white rounded-lg border border-red-200 p-6 ${className}`}>
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle size={20} />
          <div>
            <h3 className="font-medium">Payment Initialization Failed</h3>
            <p className="text-sm text-red-700 mt-1">
              {initError || 'Unable to initialize payment. Please refresh and try again.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Stripe Elements options
  const options = {
    clientSecret,
    appearance: stripeElementsOptions.appearance,
    loader: 'auto' as const,
  };

  return (
    <div className={`bg-white rounded-lg border border-luxury-gray-200 p-6 ${className}`}>
      <Elements stripe={stripePromise} options={options}>
        <PaymentForm 
          onSuccess={onSuccess}
          onError={onError}
          disabled={disabled}
          amount={amount}
          billingDetails={billingDetails}
        />
      </Elements>
    </div>
  );
}