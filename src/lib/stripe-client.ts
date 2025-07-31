// Client-side Stripe configuration for Ashhadu Islamic Art
'use client';

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Get the publishable key from environment variables with fallback for build time
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder_key_for_build';

// Runtime validation function for client-side Stripe usage
export function validateStripeClientConfig(): { isValid: boolean; error?: string } {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return {
      isValid: false,
      error: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required in environment variables'
    };
  }
  
  return { isValid: true };
}

// Cache the Stripe promise to avoid recreating it
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey, {
      // UK-specific locale
      locale: 'en-GB',
      // API version
      apiVersion: '2024-06-20',
    });
  }
  return stripePromise;
};

// Stripe Elements options for luxury Islamic design
export const stripeElementsOptions = {
  appearance: {
    theme: 'flat' as const,
    variables: {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSizeBase: '16px',
      colorPrimary: '#d4af37', // Luxury gold
      colorBackground: '#ffffff',
      colorText: '#1a1a1a',
      colorDanger: '#dc2626',
      borderRadius: '8px',
      spacingUnit: '4px',
    },
    rules: {
      '.Input': {
        borderColor: '#e5e7eb',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        padding: '12px 16px',
        fontSize: '16px',
      },
      '.Input:focus': {
        borderColor: '#d4af37',
        boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.1)',
        outline: 'none',
      },
      '.Input--invalid': {
        borderColor: '#dc2626',
        boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)',
      },
      '.Label': {
        fontWeight: '500',
        color: '#374151',
        marginBottom: '8px',
        fontSize: '14px',
      },
      '.Error': {
        color: '#dc2626',
        fontSize: '14px',
        marginTop: '4px',
      },
      '.Tab': {
        borderColor: '#e5e7eb',
        color: '#6b7280',
      },
      '.Tab:hover': {
        borderColor: '#d4af37',
        color: '#1a1a1a',
      },
      '.Tab--selected': {
        borderColor: '#d4af37',
        color: '#d4af37',
        backgroundColor: '#fefce8',
      },
    },
  },
  loader: 'auto' as const,
};

// Payment Element options
export const paymentElementOptions = {
  layout: 'tabs' as const,
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
        country: 'never' as const, // We'll handle address separately
      },
    },
  },
  terms: {
    card: 'never' as const, // We'll show our own terms
  },
};

// Setup Intent options for saving payment methods
export const setupElementOptions = {
  mode: 'setup' as const,
  currency: 'gbp',
  setupFutureUsage: 'off_session' as const,
  paymentMethodCreation: 'manual' as const,
};

// Payment Request options for Apple Pay / Google Pay
export const getPaymentRequestOptions = (amount: number, label: string = 'Ashhadu Islamic Art') => ({
  country: 'GB',
  currency: 'gbp',
  total: {
    label: label,
    amount: Math.round(amount * 100), // Convert to pence
  },
  requestPayerName: true,
  requestPayerEmail: true,
  requestPayerPhone: false,
  requestShipping: false,
});

// Utility functions for client-side Stripe operations
export const stripeClientHelpers = {
  // Format card brand for display
  formatCardBrand: (brand: string): string => {
    const brandMap: Record<string, string> = {
      'visa': 'Visa',
      'mastercard': 'Mastercard',
      'amex': 'American Express',
      'discover': 'Discover',
      'diners': 'Diners Club',
      'jcb': 'JCB',
      'unionpay': 'UnionPay',
      'unknown': 'Card',
    };
    return brandMap[brand] || 'Card';
  },

  // Format expiry date
  formatExpiryDate: (month: number, year: number): string => {
    const monthStr = month.toString().padStart(2, '0');
    const yearStr = year.toString().slice(-2);
    return `${monthStr}/${yearStr}`;
  },

  // Check if card is expired
  isCardExpired: (month: number, year: number): boolean => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11

    return year < currentYear || (year === currentYear && month < currentMonth);
  },

  // Get card brand icon class
  getCardBrandIcon: (brand: string): string => {
    const iconMap: Record<string, string> = {
      'visa': 'fab fa-cc-visa',
      'mastercard': 'fab fa-cc-mastercard',
      'amex': 'fab fa-cc-amex',
      'discover': 'fab fa-cc-discover',
      'diners': 'fab fa-cc-diners-club',
      'jcb': 'fab fa-cc-jcb',
      'unknown': 'fas fa-credit-card',
    };
    return iconMap[brand] || 'fas fa-credit-card';
  },

  // Validate card number using Luhn algorithm (basic validation)
  validateCardNumber: (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;
    
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },

  // Format card number for display (mask all but last 4)
  formatCardNumber: (lastFour: string): string => {
    return `•••• •••• •••• ${lastFour}`;
  },

  // Get payment method type from payment method object
  getPaymentMethodType: (paymentMethod: any): string => {
    if (paymentMethod.card) return 'card';
    if (paymentMethod.paypal) return 'paypal';
    if (paymentMethod.apple_pay) return 'apple_pay';
    if (paymentMethod.google_pay) return 'google_pay';
    return 'unknown';
  },
};

// Error handling for Stripe
export const handleStripeError = (error: any): string => {
  if (error?.type === 'card_error') {
    return error.message || 'Your card was declined.';
  } else if (error?.type === 'validation_error') {
    return error.message || 'Please check your payment information.';
  } else if (error?.type === 'api_error') {
    return 'We encountered an error processing your payment. Please try again.';
  } else if (error?.type === 'authentication_error') {
    return 'Authentication with payment provider failed. Please try again.';
  } else if (error?.type === 'rate_limit_error') {
    return 'Too many requests. Please wait a moment and try again.';
  } else if (error?.type === 'invalid_request_error') {
    return 'Invalid payment request. Please check your information.';
  } else {
    return error?.message || 'An unexpected error occurred. Please try again.';
  }
};

export default getStripe;