// Google Pay Configuration for Ashhadu Islamic Art E-commerce

// Google Pay Web API requires merchant configuration and domain registration
// This configuration handles Google Pay setup for UK market

export interface GooglePayConfig {
  environment: 'TEST' | 'PRODUCTION';
  merchantInfo: {
    merchantId: string;
    merchantName: string;
  };
  allowedPaymentMethods: google.payments.api.PaymentMethodSpecification[];
  allowedCardNetworks: google.payments.api.CardNetwork[];
  allowedCardAuthMethods: google.payments.api.CardAuthMethod[];
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
export const baseRequest: google.payments.api.PaymentDataRequest = {
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
        .then((response: google.payments.api.IsReadyToPayResponse) => {
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
export const getGooglePaymentsClient = (): google.payments.api.PaymentsClient => {
  if (typeof window === 'undefined' || !window.google?.payments?.api) {
    throw new Error('Google Pay API not available');
  }

  return new google.payments.api.PaymentsClient({
    environment: googlePayConfig.environment,
    merchantInfo: googlePayConfig.merchantInfo,
    paymentDataCallbacks: {
      onPaymentAuthorized: (paymentData) => {
        console.log('Payment authorized:', paymentData);
        return { transactionState: 'SUCCESS' as google.payments.api.TransactionState };
      }
    }
  });
};

// Create payment request for payment method setup
export const createGooglePayPaymentRequest = (amount: number = 0.01): google.payments.api.PaymentDataRequest => {
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
  paymentData: google.payments.api.PaymentData,
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
export const formatGooglePayMethod = (paymentData: google.payments.api.PaymentData) => {
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
  buttonColor: 'black' as google.payments.api.ButtonColor,
  buttonType: 'plain' as google.payments.api.ButtonType,
  buttonSizeMode: 'static' as google.payments.api.ButtonSizeMode
};

// TypeScript declarations for Google Pay API
declare global {
  interface Window {
    google?: {
      payments?: {
        api?: {
          PaymentsClient: new (config: google.payments.api.PaymentsClientConfig) => google.payments.api.PaymentsClient;
        };
      };
    };
  }
}

declare namespace google {
  namespace payments {
    namespace api {
      interface PaymentsClientConfig {
        environment: 'TEST' | 'PRODUCTION';
        merchantInfo?: MerchantInfo;
        paymentDataCallbacks?: PaymentDataCallbacks;
      }

      interface PaymentsClient {
        isReadyToPay(request: IsReadyToPayRequest): Promise<IsReadyToPayResponse>;
        loadPaymentData(request: PaymentDataRequest): Promise<PaymentData>;
        createButton(config: ButtonConfig): HTMLElement;
        prefetchPaymentData(request: PaymentDataRequest): void;
      }

      interface MerchantInfo {
        merchantId: string;
        merchantName: string;
      }

      interface IsReadyToPayRequest {
        apiVersion: number;
        apiVersionMinor: number;
        allowedPaymentMethods: PaymentMethodSpecification[];
      }

      interface IsReadyToPayResponse {
        result: boolean;
      }

      interface PaymentDataRequest extends IsReadyToPayRequest {
        merchantInfo?: MerchantInfo;
        transactionInfo: TransactionInfo;
        callbackIntents?: CallbackIntent[];
      }

      interface PaymentMethodSpecification {
        type: 'CARD';
        parameters: PaymentMethodParameters;
        tokenizationSpecification: TokenizationSpecification;
      }

      interface PaymentMethodParameters {
        allowedAuthMethods: CardAuthMethod[];
        allowedCardNetworks: CardNetwork[];
      }

      interface TokenizationSpecification {
        type: 'PAYMENT_GATEWAY';
        parameters: TokenizationParameters;
      }

      interface TokenizationParameters {
        gateway: string;
        [key: string]: string;
      }

      interface TransactionInfo {
        totalPriceStatus: 'FINAL' | 'ESTIMATED';
        totalPrice: string;
        currencyCode: string;
        countryCode: string;
      }

      interface PaymentData {
        paymentMethodData: PaymentMethodData;
      }

      interface PaymentMethodData {
        type: string;
        info: PaymentMethodInfo;
        tokenizationData: TokenizationData;
      }

      interface PaymentMethodInfo {
        cardNetwork?: string;
        cardDetails?: string;
      }

      interface TokenizationData {
        type: string;
        token: string;
      }

      interface PaymentDataCallbacks {
        onPaymentAuthorized: (paymentData: PaymentData) => PaymentAuthorizationResult;
      }

      interface PaymentAuthorizationResult {
        transactionState: TransactionState;
      }

      interface ButtonConfig {
        onClick: () => void;
        allowedPaymentMethods: PaymentMethodSpecification[];
        buttonColor?: ButtonColor;
        buttonType?: ButtonType;
        buttonSizeMode?: ButtonSizeMode;
      }

      type CardNetwork = 'AMEX' | 'DISCOVER' | 'INTERAC' | 'JCB' | 'MASTERCARD' | 'VISA';
      type CardAuthMethod = 'PAN_ONLY' | 'CRYPTOGRAM_3DS';
      type CallbackIntent = 'PAYMENT_AUTHORIZATION';
      type TransactionState = 'SUCCESS' | 'ERROR';
      type ButtonColor = 'default' | 'black' | 'white';
      type ButtonType = 'book' | 'buy' | 'checkout' | 'donate' | 'order' | 'pay' | 'plain' | 'subscribe';
      type ButtonSizeMode = 'static' | 'fill';
    }
  }
}