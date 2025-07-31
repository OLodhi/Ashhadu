// Stripe Configuration for Ashhadu Islamic Art E-commerce
import Stripe from 'stripe';

// Validate environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is required in environment variables');
}

if (!stripePublishableKey) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required in environment variables');
}

// Initialize Stripe with UK-specific configuration
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-02-24.acacia', // Latest stable API version compatible with TypeScript
  typescript: true,
  appInfo: {
    name: 'Ashhadu Islamic Art',
    version: '1.0.0',
    url: 'https://ashhadu.co.uk',
  },
});

// UK-specific Stripe configuration
export const stripeConfig = {
  currency: 'gbp',
  country: 'GB',
  // UK payment methods
  paymentMethodTypes: [
    'card',
    'apple_pay',
    'google_pay',
    // 'paypal', // PayPal will be handled separately
  ],
  // Stripe Elements appearance for luxury Islamic design
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
      },
      '.Input:focus': {
        borderColor: '#d4af37',
        boxShadow: '0 0 0 3px rgba(212, 175, 55, 0.1)',
      },
      '.Label': {
        fontWeight: '500',
        color: '#374151',
        marginBottom: '8px',
      },
    },
  },
};

// Helper function to format Stripe amounts (Stripe uses smallest currency unit)
export const formatStripeAmount = (amount: number): number => {
  // Convert pounds to pence (multiply by 100)
  return Math.round(amount * 100);
};

// Helper function to format amounts from Stripe
export const formatAmountFromStripe = (amount: number): number => {
  // Convert pence to pounds (divide by 100)
  return amount / 100;
};

// Customer management functions
export const stripeCustomerHelpers = {
  // Create a new Stripe customer
  createCustomer: async (params: {
    email: string;
    name?: string;
    phone?: string;
    metadata?: Record<string, string>;
  }) => {
    try {
      const customer = await stripe.customers.create({
        email: params.email,
        name: params.name,
        phone: params.phone,
        metadata: {
          source: 'ashhadu_website',
          ...params.metadata,
        },
      });
      return { customer, error: null };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      return { customer: null, error: error as Stripe.StripeError };
    }
  },

  // Retrieve a Stripe customer
  getCustomer: async (customerId: string) => {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return { customer, error: null };
    } catch (error) {
      console.error('Error retrieving Stripe customer:', error);
      return { customer: null, error: error as Stripe.StripeError };
    }
  },

  // Update a Stripe customer
  updateCustomer: async (customerId: string, params: Stripe.CustomerUpdateParams) => {
    try {
      const customer = await stripe.customers.update(customerId, params);
      return { customer, error: null };
    } catch (error) {
      console.error('Error updating Stripe customer:', error);
      return { customer: null, error: error as Stripe.StripeError };
    }
  },

  // Delete a Stripe customer
  deleteCustomer: async (customerId: string) => {
    try {
      const deleted = await stripe.customers.del(customerId);
      return { deleted, error: null };
    } catch (error) {
      console.error('Error deleting Stripe customer:', error);
      return { deleted: null, error: error as Stripe.StripeError };
    }
  },
};

// Payment method management functions
export const stripePaymentMethodHelpers = {
  // Create a setup intent for adding payment methods
  createSetupIntent: async (params: {
    customerId: string;
    paymentMethodTypes?: string[];
    metadata?: Record<string, string>;
  }) => {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: params.customerId,
        payment_method_types: params.paymentMethodTypes || ['card'],
        usage: 'off_session', // For future payments
        metadata: {
          source: 'ashhadu_payment_methods',
          ...params.metadata,
        },
      });
      return { setupIntent, error: null };
    } catch (error) {
      console.error('Error creating setup intent:', error);
      return { setupIntent: null, error: error as Stripe.StripeError };
    }
  },

  // Attach a payment method to a customer
  attachPaymentMethod: async (paymentMethodId: string, customerId: string) => {
    try {
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      return { paymentMethod, error: null };
    } catch (error) {
      console.error('Error attaching payment method:', error);
      return { paymentMethod: null, error: error as Stripe.StripeError };
    }
  },

  // Detach a payment method from a customer
  detachPaymentMethod: async (paymentMethodId: string) => {
    try {
      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
      return { paymentMethod, error: null };
    } catch (error) {
      console.error('Error detaching payment method:', error);
      return { paymentMethod: null, error: error as Stripe.StripeError };
    }
  },

  // List customer's payment methods
  listPaymentMethods: async (customerId: string, type: 'card' | 'paypal' = 'card') => {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: type,
      });
      return { paymentMethods: paymentMethods.data, error: null };
    } catch (error) {
      console.error('Error listing payment methods:', error);
      return { paymentMethods: [], error: error as Stripe.StripeError };
    }
  },

  // Get payment method details
  getPaymentMethod: async (paymentMethodId: string) => {
    try {
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      return { paymentMethod, error: null };
    } catch (error) {
      console.error('Error retrieving payment method:', error);
      return { paymentMethod: null, error: error as Stripe.StripeError };
    }
  },
};

// Payment intent functions (for checkout)
export const stripePaymentHelpers = {
  // Create a payment intent for checkout
  createPaymentIntent: async (params: {
    amount: number; // in pounds
    currency?: string;
    customerId: string;
    paymentMethodId?: string;
    automaticPaymentMethods?: boolean;
    metadata?: Record<string, string>;
    returnUrl?: string;
  }) => {
    try {
      const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
        amount: formatStripeAmount(params.amount),
        currency: params.currency || 'gbp',
        customer: params.customerId,
        payment_method: params.paymentMethodId,
        metadata: {
          source: 'ashhadu_checkout',
          ...params.metadata,
        },
      };

      // If we have a specific payment method, don't use automatic payment methods
      if (params.paymentMethodId) {
        paymentIntentParams.payment_method_types = ['card'];
        paymentIntentParams.confirm = true;
        paymentIntentParams.return_url = params.returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/confirmation`;
      } else if (params.automaticPaymentMethods) {
        paymentIntentParams.automatic_payment_methods = {
          enabled: true,
          allow_redirects: 'never',
        };
      }

      const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);
      return { paymentIntent, error: null };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      return { paymentIntent: null, error: error as Stripe.StripeError };
    }
  },

  // Confirm a payment intent
  confirmPaymentIntent: async (paymentIntentId: string, params?: Stripe.PaymentIntentConfirmParams) => {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, params);
      return { paymentIntent, error: null };
    } catch (error) {
      console.error('Error confirming payment intent:', error);
      return { paymentIntent: null, error: error as Stripe.StripeError };
    }
  },

  // Retrieve a payment intent
  getPaymentIntent: async (paymentIntentId: string) => {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return { paymentIntent, error: null };
    } catch (error) {
      console.error('Error retrieving payment intent:', error);
      return { paymentIntent: null, error: error as Stripe.StripeError };
    }
  },
};

// Webhook verification
export const verifyStripeWebhook = (payload: string | Buffer, signature: string): Stripe.Event | null => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return null;
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error('Error verifying Stripe webhook:', error);
    return null;
  }
};

// Export the publishable key for client-side use
export const getStripePublishableKey = () => {
  return stripePublishableKey;
};

// Export Stripe instance for direct use when needed
export { stripe as stripeInstance };
export default stripe;