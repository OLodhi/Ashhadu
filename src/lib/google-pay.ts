// Google Pay Configuration for Ashhadu Islamic Art E-commerce

// Google Pay Web API requires merchant configuration and domain registration
// This configuration handles Google Pay setup for UK market

export interface GooglePayConfig {
  environment: 'TEST' | 'PRODUCTION';
  merchantInfo: {
    merchantId: string;
    merchantName: string;
  };
  allowedPaymentMethods: any[];
  allowedCardNetworks: any[];
  allowedCardAuthMethods: any[];
}

// Google Pay configuration for UK market
export const googlePayConfig: GooglePayConfig = {
  environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
  merchantInfo: {
    merchantId: process.env.GOOGLE_PAY_MERCHANT_ID || 'BCR2DN4T2H27AB3P', // Test merchant ID
    merchantName: 'Ashhadu Islamic Art'
  },
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'stripe',
          'stripe:version': '2018-10-31',
          'stripe:publishableKey': process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
        }
      }
    }
  ],
  allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'],
  allowedCardAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS']
};

// Base payment request configuration
export const baseRequest: any = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: googlePayConfig.allowedPaymentMethods
};

// Check if Google Pay is available
export const isGooglePayAvailable = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.google?.payments?.api) {
      resolve(false);
      return;
    }

    try {
      const paymentsClient = getGooglePaymentsClient();
      paymentsClient.isReadyToPay(baseRequest)
        .then((response: any) => {
          resolve(response.result === true);
        })
        .catch(() => {
          resolve(false);
        });
    } catch (error) {
      console.error('Error checking Google Pay availability:', error);
      resolve(false);
    }
  });
};

// Get Google Pay payments client
export const getGooglePaymentsClient = (): any => {
  if (typeof window === 'undefined' || !window.google?.payments?.api) {
    throw new Error('Google Pay API not available');
  }

  return new (window as any).google.payments.api.PaymentsClient({
    environment: googlePayConfig.environment,
    merchantInfo: googlePayConfig.merchantInfo,
    paymentDataCallbacks: {
      onPaymentAuthorized: (paymentData: any) => {
        console.log('Payment authorized:', paymentData);
        return { transactionState: 'SUCCESS' as any };
      }
    }
  });
};

// Create payment request for payment method setup
export const createGooglePayPaymentRequest = (amount: number = 0.01): any => {
  return {
    ...baseRequest,
    merchantInfo: googlePayConfig.merchantInfo,
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: amount.toFixed(2),
      currencyCode: 'GBP',
      countryCode: 'GB'
    },
    callbackIntents: ['PAYMENT_AUTHORIZATION']
  };
};

// Process Google Pay payment for payment method setup
export const processGooglePayPayment = async (
  paymentData: any,
  customerId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/google-pay/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentData,
        customerId,
        type: 'setup' // Indicates this is for payment method setup
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Payment processing failed');
    }

    const result = await response.json();
    return { success: true, ...result };
  } catch (error: any) {
    console.error('Google Pay payment processing error:', error);
    return { success: false, error: error.message || 'Payment processing failed' };
  }
};

// Helper to format Google Pay payment method for display
export const formatGooglePayMethod = (paymentData: any) => {
  const paymentMethodData = paymentData.paymentMethodData;
  const info = paymentMethodData.info;
  
  return {
    type: 'google_pay' as const,
    displayName: `Google Pay (${info?.cardNetwork || 'Card'})`,
    network: info?.cardNetwork?.toLowerCase(),
    cardDetails: info?.cardDetails,
    paymentMethodToken: paymentMethodData.tokenizationData?.token
  };
};

// Environment validation
export const validateGooglePayEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!process.env.GOOGLE_PAY_MERCHANT_ID) {
    errors.push('GOOGLE_PAY_MERCHANT_ID environment variable is required for production');
  }
  
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Load Google Pay API script
export const loadGooglePayScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window object not available'));
      return;
    }

    // Check if already loaded
    if (window.google?.payments?.api) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    script.onload = () => {
      if (window.google?.payments?.api) {
        resolve();
      } else {
        reject(new Error('Google Pay API failed to load'));
      }
    };
    script.onerror = () => {
      reject(new Error('Failed to load Google Pay script'));
    };

    document.head.appendChild(script);
  });
};

// Clean up function for component unmount
export const cleanupGooglePay = () => {
  // Remove script if needed
  const script = document.querySelector('script[src="https://pay.google.com/gp/p/js/pay.js"]');
  if (script) {
    script.remove();
  }
};

// Google Pay button configuration
export const googlePayButtonConfig = {
  onClick: () => {}, // Will be overridden by component
  allowedPaymentMethods: googlePayConfig.allowedPaymentMethods,
  buttonColor: 'black' as any,
  buttonType: 'plain' as any,
  buttonSizeMode: 'static' as any
};

// TypeScript declarations for Google Pay API
declare global {
  interface Window {
    google?: {
      payments?: {
        api?: {
          PaymentsClient: new (config: any) => any;
        };
      };
    };
  }
}

// Google Pay namespace declarations removed - using any types for SSR compatibility