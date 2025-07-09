'use client';

import React, { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { getPayPalClientId, paypalButtonStyle, isPayPalConfigured } from '@/lib/paypal';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PayPalPaymentMethodProps {
  customerId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PayPalPaymentMethod: React.FC<PayPalPaymentMethodProps> = ({
  customerId,
  onSuccess,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Check if PayPal is configured
  if (!isPayPalConfigured()) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">PayPal Configuration Required</p>
            <p className="mt-1">
              PayPal credentials need to be configured to enable PayPal payment methods.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleApprove = async (data: any, actions: any) => {
    setIsProcessing(true);
    
    try {
      console.log('PayPal payment approved:', data);
      
      // Get the order details from PayPal
      const details = await actions.order.get();
      console.log('PayPal order details:', details);
      
      // Extract payer information
      const payer = details.payer;
      const paypalEmail = payer?.email_address || 'PayPal Account';
      const payerId = payer?.payer_id || data.orderID;
      
      // Save the PayPal payment method to our database
      const saveResponse = await fetch('/api/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          type: 'paypal',
          provider: 'paypal',
          providerPaymentMethodId: data.orderID,
          providerCustomerId: payerId,
          displayName: `PayPal (${paypalEmail})`,
          paypalEmail: paypalEmail,
          setAsDefault: false, // Let user choose
        }),
      });

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(`Failed to save PayPal payment method: ${errorText}`);
      }

      console.log('PayPal payment method saved successfully');
      toast.success('PayPal account connected successfully!');
      onSuccess();
      
    } catch (error: any) {
      console.error('Error saving PayPal payment method:', error);
      onError(error.message || 'Failed to save PayPal payment method');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = (data: any) => {
    console.log('PayPal payment cancelled:', data);
    toast.error('PayPal setup was cancelled');
  };

  const handleError = (err: any) => {
    console.error('PayPal error:', err);
    onError('PayPal encountered an error. Please try again.');
  };

  const createOrder = async (data: any, actions: any) => {
    try {
      // Create a minimal order for validation (we'll capture the payment method but not charge)
      return actions.order.create({
        purchase_units: [{
          amount: {
            currency_code: 'GBP',
            value: '0.01' // Minimal amount for validation
          },
          description: 'PayPal Payment Method Setup - Ashhadu Islamic Art'
        }],
        intent: 'AUTHORIZE', // Authorize but don't capture
        application_context: {
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW'
        }
      });
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      {/* PayPal Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <div className="flex items-start space-x-2">
          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Connect Your PayPal Account</p>
            <p className="mt-1">
              Click the PayPal button below to securely connect your PayPal account for future payments.
            </p>
          </div>
        </div>
      </div>

      {/* PayPal Button */}
      <div className="relative">
        {isProcessing && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-md">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-luxury-gold"></div>
              <span className="text-sm text-gray-600">Connecting PayPal...</span>
            </div>
          </div>
        )}
        
        <PayPalScriptProvider
          options={{
            "client-id": getPayPalClientId() || "",
            components: "buttons",
            intent: "authorize",
            currency: "GBP"
          }}
        >
          <PayPalButtons
            style={paypalButtonStyle}
            createOrder={createOrder}
            onApprove={handleApprove}
            onCancel={handleCancel}
            onError={handleError}
            disabled={isProcessing}
          />
        </PayPalScriptProvider>
      </div>

      {/* PayPal Features */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Your PayPal account will be securely connected</p>
        <p>• No charges will be made during setup</p>
        <p>• You can disconnect at any time</p>
        <p>• UK PayPal features supported including Pay in 3</p>
      </div>
    </div>
  );
};

export default PayPalPaymentMethod;