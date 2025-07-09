// Apple Pay Configuration for Ashhadu Islamic Art E-commerce

// Apple Pay Web requires merchant verification and domain registration
// This configuration handles Apple Pay setup for UK market

export interface ApplePayConfig {
  merchantIdentifier: string;
  displayName: string;
  domainName: string;
  countryCode: string;
  currencyCode: string;
  supportedNetworks: string[];
  merchantCapabilities: string[];
}

// Apple Pay configuration for UK market
export const applePayConfig: ApplePayConfig = {
  merchantIdentifier: process.env.APPLE_PAY_MERCHANT_ID || 'merchant.com.ashhadu.islamicart',
  displayName: 'Ashhadu Islamic Art',
  domainName: process.env.NEXT_PUBLIC_SITE_URL?.replace('http://', '').replace('https://', '') || 'localhost:3000',
  countryCode: 'GB', // United Kingdom
  currencyCode: 'GBP', // British Pounds
  supportedNetworks: [
    'visa',
    'masterCard',
    'amex',
    'discover',
    'maestro'
  ],
  merchantCapabilities: [
    'supports3DS',
    'supportsCredit',
    'supportsDebit'
  ]
};

// Check if Apple Pay is available
export const isApplePayAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if Apple Pay is supported in this browser
  if (!window.ApplePaySession) {
    return false;
  }
  
  // Check if Apple Pay can make payments
  return ApplePaySession.canMakePayments();
};

// Check if Apple Pay is available with active cards
export const isApplePayAvailableWithActiveCard = async (): Promise<boolean> => {
  if (!isApplePayAvailable()) return false;
  
  try {
    return await ApplePaySession.canMakePaymentsWithActiveCard(applePayConfig.merchantIdentifier);
  } catch (error) {
    console.error('Error checking Apple Pay active card:', error);
    return false;
  }
};

// Create Apple Pay payment request
export const createApplePayPaymentRequest = (amount: number = 0.01): ApplePayJS.ApplePayPaymentRequest => {
  return {
    countryCode: applePayConfig.countryCode,
    currencyCode: applePayConfig.currencyCode,
    supportedNetworks: applePayConfig.supportedNetworks as ApplePayJS.ApplePayPaymentNetwork[],
    merchantCapabilities: applePayConfig.merchantCapabilities as ApplePayJS.ApplePayMerchantCapability[],
    total: {
      label: applePayConfig.displayName,
      amount: amount.toFixed(2),
      type: 'final'
    },
    // For payment method setup, we use a minimal amount
    lineItems: [
      {
        label: 'Payment Method Setup',
        amount: amount.toFixed(2),
        type: 'final'
      }
    ],
    requiredBillingContactFields: ['postalAddress', 'name'],
    requiredShippingContactFields: [],
  };
};

// Apple Pay session event handlers
export interface ApplePayHandlers {
  onValidateMerchant: (event: ApplePayJS.ApplePayValidateMerchantEvent) => void;
  onPaymentMethodSelected?: (event: ApplePayJS.ApplePayPaymentMethodSelectedEvent) => void;
  onPaymentAuthorized: (event: ApplePayJS.ApplePayPaymentAuthorizedEvent) => void;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

// Start Apple Pay session
export const startApplePaySession = (
  paymentRequest: ApplePayJS.ApplePayPaymentRequest,
  handlers: ApplePayHandlers
): ApplePaySession | null => {
  if (!isApplePayAvailable()) {
    console.error('Apple Pay is not available');
    return null;
  }

  try {
    const session = new ApplePaySession(3, paymentRequest); // Version 3 for latest features

    // Set up event handlers
    session.onvalidatemerchant = handlers.onValidateMerchant;
    session.onpaymentmethodselected = handlers.onPaymentMethodSelected || (() => {
      session.completePaymentMethodSelection({
        newTotal: paymentRequest.total,
        newLineItems: paymentRequest.lineItems
      });
    });
    session.onpaymentauthorized = handlers.onPaymentAuthorized;
    session.oncancel = handlers.onCancel || (() => {
      console.log('Apple Pay cancelled by user');
    });

    // Start the session
    session.begin();
    return session;
  } catch (error) {
    console.error('Error starting Apple Pay session:', error);
    if (handlers.onError) {
      handlers.onError(error);
    }
    return null;
  }
};

// Apple Pay merchant validation (server-side)
export const validateApplePayMerchant = async (validationURL: string): Promise<any> => {
  try {
    const response = await fetch('/api/apple-pay/validate-merchant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        validationURL,
        domainName: applePayConfig.domainName,
        displayName: applePayConfig.displayName,
        merchantIdentifier: applePayConfig.merchantIdentifier
      }),
    });

    if (!response.ok) {
      throw new Error(`Merchant validation failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Apple Pay merchant validation error:', error);
    throw error;
  }
};

// Process Apple Pay payment (for payment method setup)
export const processApplePayPayment = async (
  payment: ApplePayJS.ApplePayPayment,
  customerId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/apple-pay/process-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment,
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
    console.error('Apple Pay payment processing error:', error);
    return { success: false, error: error.message || 'Payment processing failed' };
  }
};

// Helper to format Apple Pay payment method for display
export const formatApplePayMethod = (payment: ApplePayJS.ApplePayPayment) => {
  const paymentMethod = payment.paymentMethod;
  const billingContact = payment.billingContact;
  
  return {
    type: 'apple_pay' as const,
    displayName: `Apple Pay (${paymentMethod.displayName || 'Card'})`,
    network: paymentMethod.network,
    billingContact: {
      name: billingContact?.givenName && billingContact?.familyName 
        ? `${billingContact.givenName} ${billingContact.familyName}`
        : undefined,
      postalCode: billingContact?.postalCode,
    }
  };
};

// Environment validation
export const validateApplePayEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!process.env.APPLE_PAY_MERCHANT_ID) {
    errors.push('APPLE_PAY_MERCHANT_ID environment variable is required');
  }
  
  if (!process.env.APPLE_PAY_MERCHANT_CERT) {
    errors.push('APPLE_PAY_MERCHANT_CERT environment variable is required');
  }
  
  if (!process.env.APPLE_PAY_MERCHANT_KEY) {
    errors.push('APPLE_PAY_MERCHANT_KEY environment variable is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};