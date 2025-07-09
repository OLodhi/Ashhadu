// Payment Method Types for Ashhadu Islamic Art E-commerce

export type PaymentMethodType = 'card' | 'paypal' | 'apple_pay' | 'google_pay';

export type PaymentProvider = 'stripe' | 'paypal' | 'apple_pay';

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'unionpay' | 'unknown';

// Base payment method interface
export interface PaymentMethod {
  id: string;
  customerId: string;
  type: PaymentMethodType;
  provider: PaymentProvider;
  providerPaymentMethodId: string;
  providerCustomerId?: string;
  displayName?: string;
  isDefault: boolean;
  isActive: boolean;
  billingAddressId?: string;
  createdAt: string;
  updatedAt: string;
}

// Card-specific payment method
export interface CardPaymentMethod extends PaymentMethod {
  type: 'card';
  provider: 'stripe';
  brand: CardBrand;
  lastFour: string;
  expMonth: number;
  expYear: number;
}

// PayPal-specific payment method
export interface PayPalPaymentMethod extends PaymentMethod {
  type: 'paypal';
  provider: 'paypal';
  paypalEmail: string;
}

// Apple Pay payment method
export interface ApplePayPaymentMethod extends PaymentMethod {
  type: 'apple_pay';
  provider: 'apple_pay';
}

// Google Pay payment method
export interface GooglePayPaymentMethod extends PaymentMethod {
  type: 'google_pay';
  provider: 'stripe';
}

// Union type for all payment method types
export type AnyPaymentMethod = 
  | CardPaymentMethod 
  | PayPalPaymentMethod 
  | ApplePayPaymentMethod 
  | GooglePayPaymentMethod;

// Form data for creating new payment methods
export interface AddCardFormData {
  type: 'card';
  // Note: We never store actual card details in forms
  // Stripe Elements will handle secure tokenization
  billingAddressId?: string;
  setAsDefault?: boolean;
}

export interface AddPayPalFormData {
  type: 'paypal';
  // PayPal OAuth flow will handle account linking
  setAsDefault?: boolean;
}

export interface AddWalletPaymentFormData {
  type: 'apple_pay' | 'google_pay';
  // Wallet payments are handled by Stripe Payment Request API
  setAsDefault?: boolean;
}

export type AddPaymentMethodFormData = 
  | AddCardFormData 
  | AddPayPalFormData 
  | AddWalletPaymentFormData;

// Payment method display utilities
export interface PaymentMethodDisplay {
  id: string;
  type: PaymentMethodType;
  title: string;
  subtitle: string;
  icon: string;
  isDefault: boolean;
  isExpired?: boolean;
  canDelete: boolean;
}

// Stripe-specific types for integration
export interface StripePaymentMethodData {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details?: {
    address?: {
      city?: string;
      country?: string;
      line1?: string;
      line2?: string;
      postal_code?: string;
      state?: string;
    };
    email?: string;
    name?: string;
    phone?: string;
  };
}

// PayPal-specific types
export interface PayPalPaymentMethodData {
  payer_id: string;
  email_address: string;
  name?: {
    given_name?: string;
    surname?: string;
  };
}

// API response types
export interface PaymentMethodsResponse {
  success: boolean;
  data: AnyPaymentMethod[];
  message?: string;
}

export interface PaymentMethodResponse {
  success: boolean;
  data: AnyPaymentMethod;
  message?: string;
}

export interface DeletePaymentMethodResponse {
  success: boolean;
  message?: string;
}

// Error types
export interface PaymentMethodError {
  code: string;
  message: string;
  details?: any;
}

// Payment intent types (for checkout)
export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  customerId: string;
  orderId?: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret?: string;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  paymentMethodId?: string;
  customerId: string;
  orderId?: string;
  useDefaultPaymentMethod?: boolean;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId?: string;
}

// Utility functions type definitions
export type FormatCardBrand = (brand: CardBrand) => string;
export type FormatExpiryDate = (month: number, year: number) => string;
export type IsCardExpired = (month: number, year: number) => boolean;
export type GetPaymentMethodIcon = (type: PaymentMethodType, brand?: CardBrand) => string;
export type FormatPaymentMethodTitle = (paymentMethod: AnyPaymentMethod) => string;
export type FormatPaymentMethodSubtitle = (paymentMethod: AnyPaymentMethod) => string;