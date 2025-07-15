// PayPal Configuration for Ashhadu Islamic Art E-commerce

// Validate environment variables
const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;
const paypalEnvironment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';

if (!paypalClientId) {
  console.warn('NEXT_PUBLIC_PAYPAL_CLIENT_ID is not configured - PayPal features will be disabled');
}

// PayPal SDK options for React
export const paypalOptions = {
  "client-id": paypalClientId || "",
  currency: "GBP", // UK currency
  intent: "subscription", // For saving payment methods
  "data-client-token": "", // Will be generated server-side
  components: "buttons,payment-fields",
  "enable-funding": "venmo,paylater",
  "disable-funding": ""
};

// PayPal styling to match luxury Islamic design
export const paypalButtonStyle = {
  layout: "horizontal" as const,
  color: "gold" as const, // Matches luxury gold theme
  shape: "rect" as const,
  label: "paypal" as const,
  height: 45,
  tagline: false
};

// PayPal configuration for different payment types
export const paypalConfig = {
  environment: paypalEnvironment,
  currency: 'GBP',
  country: 'GB',
  
  // Styling options
  style: {
    layout: 'horizontal',
    color: 'gold', // Matches luxury design
    shape: 'rect',
    label: 'paypal',
    height: 45,
    tagline: false
  },
  
  // UK-specific PayPal features
  features: {
    payLater: true, // Pay in 3 available in UK
    venmo: false, // Not available in UK
    credit: true, // PayPal Credit available in UK
  }
};

// Helper function to check if PayPal is configured
export const isPayPalConfigured = (): boolean => {
  return !!paypalClientId && paypalClientId !== 'REPLACE_WITH_PAYPAL_CLIENT_ID';
};

// Helper function to format PayPal amounts (PayPal uses decimal amounts)
export const formatPayPalAmount = (amount: number): string => {
  return amount.toFixed(2);
};

// PayPal API helpers (server-side only)
export const paypalHelpers = {
  // Get PayPal access token
  getAccessToken: async (): Promise<{ token: string | null; error: string | null }> => {
    if (!paypalClientId || !paypalClientSecret) {
      return { token: null, error: 'PayPal credentials not configured' };
    }

    try {
      const response = await fetch(`https://api-m.${paypalEnvironment}.paypal.com/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        return { token: null, error: `PayPal auth failed: ${response.status}` };
      }

      const data = await response.json();
      return { token: data.access_token, error: null };
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      return { token: null, error: 'Failed to get PayPal access token' };
    }
  },

  // Create PayPal subscription for saving payment method
  createSubscription: async (customerId: string): Promise<{ subscription: any; error: string | null }> => {
    const { token, error: tokenError } = await paypalHelpers.getAccessToken();
    
    if (tokenError || !token) {
      return { subscription: null, error: tokenError || 'No access token' };
    }

    try {
      const response = await fetch(`https://api-m.${paypalEnvironment}.paypal.com/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          plan_id: 'ASHHADU_PAYMENT_METHOD_PLAN', // We'll need to create this
          custom_id: customerId,
          application_context: {
            brand_name: 'Ashhadu Islamic Art',
            shipping_preference: 'NO_SHIPPING',
            user_action: 'SUBSCRIBE_NOW',
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account/payments?paypal=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account/payments?paypal=cancelled`
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        return { subscription: null, error: `PayPal subscription creation failed: ${errorData}` };
      }

      const subscription = await response.json();
      return { subscription, error: null };
    } catch (error) {
      console.error('Error creating PayPal subscription:', error);
      return { subscription: null, error: 'Failed to create PayPal subscription' };
    }
  },

  // Get subscription details
  getSubscription: async (subscriptionId: string): Promise<{ subscription: any; error: string | null }> => {
    const { token, error: tokenError } = await paypalHelpers.getAccessToken();
    
    if (tokenError || !token) {
      return { subscription: null, error: tokenError || 'No access token' };
    }

    try {
      const response = await fetch(`https://api-m.${paypalEnvironment}.paypal.com/v1/billing/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return { subscription: null, error: `Failed to get subscription: ${response.status}` };
      }

      const subscription = await response.json();
      return { subscription, error: null };
    } catch (error) {
      console.error('Error getting PayPal subscription:', error);
      return { subscription: null, error: 'Failed to get PayPal subscription' };
    }
  },

  // Create PayPal order for one-time payment
  createOrder: async (orderData: {
    amount: number;
    currency: string;
    orderId: string;
    description?: string;
    payerEmail?: string;
    items?: Array<{
      name: string;
      quantity: number;
      unitAmount: number;
      description?: string;
    }>;
  }): Promise<{ order: any; error: string | null }> => {
    const { token, error: tokenError } = await paypalHelpers.getAccessToken();
    
    if (tokenError || !token) {
      return { order: null, error: tokenError || 'No access token' };
    }

    try {
      const paypalOrder: any = {
        intent: 'CAPTURE',
        application_context: {
          brand_name: 'Ashhadu Islamic Art',
          landing_page: 'BILLING',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/paypal/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/paypal/cancel`
        },
        purchase_units: [{
          reference_id: orderData.orderId,
          description: orderData.description || 'Islamic Art Purchase',
          amount: {
            currency_code: orderData.currency.toUpperCase(),
            value: formatPayPalAmount(orderData.amount),
            breakdown: {
              item_total: {
                currency_code: orderData.currency.toUpperCase(),
                value: formatPayPalAmount(orderData.amount)
              }
            }
          },
          items: orderData.items?.map(item => ({
            name: item.name,
            quantity: item.quantity.toString(),
            unit_amount: {
              currency_code: orderData.currency.toUpperCase(),
              value: formatPayPalAmount(item.unitAmount)
            },
            description: item.description || ''
          })) || [{
            name: 'Islamic Art Purchase',
            quantity: '1',
            unit_amount: {
              currency_code: orderData.currency.toUpperCase(),
              value: formatPayPalAmount(orderData.amount)
            }
          }]
        }]
      };

      // Add email pre-fill if provided
      if (orderData.payerEmail) {
        paypalOrder.payment_source = {
          paypal: {
            email_address: orderData.payerEmail,
            experience_context: {
              return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/paypal/success`,
              cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/paypal/cancel`
            }
          }
        };
      }

      const response = await fetch(`https://api-m.${paypalEnvironment}.paypal.com/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(paypalOrder)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('PayPal order creation failed:', errorData);
        return { order: null, error: `PayPal order creation failed: ${response.status}` };
      }

      const order = await response.json();
      return { order, error: null };
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      return { order: null, error: 'Failed to create PayPal order' };
    }
  },

  // Capture PayPal order after user approval
  captureOrder: async (paypalOrderId: string): Promise<{ order: any; error: string | null }> => {
    const { token, error: tokenError } = await paypalHelpers.getAccessToken();
    
    if (tokenError || !token) {
      return { order: null, error: tokenError || 'No access token' };
    }

    try {
      const response = await fetch(`https://api-m.${paypalEnvironment}.paypal.com/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('PayPal order capture failed:', errorData);
        return { order: null, error: `PayPal order capture failed: ${response.status}` };
      }

      const order = await response.json();
      return { order, error: null };
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      return { order: null, error: 'Failed to capture PayPal order' };
    }
  },

  // Get order details
  getOrder: async (paypalOrderId: string): Promise<{ order: any; error: string | null }> => {
    const { token, error: tokenError } = await paypalHelpers.getAccessToken();
    
    if (tokenError || !token) {
      return { order: null, error: tokenError || 'No access token' };
    }

    try {
      const response = await fetch(`https://api-m.${paypalEnvironment}.paypal.com/v2/checkout/orders/${paypalOrderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        return { order: null, error: `Failed to get order: ${response.status}` };
      }

      const order = await response.json();
      return { order, error: null };
    } catch (error) {
      console.error('Error getting PayPal order:', error);
      return { order: null, error: 'Failed to get PayPal order' };
    }
  }
};

// Export configuration values
export const getPayPalClientId = () => paypalClientId;
export const getPayPalEnvironment = () => paypalEnvironment;