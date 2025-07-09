'use client';

import React from 'react';
import { 
  CreditCard, 
  Star, 
  MoreVertical, 
  Trash2, 
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { AnyPaymentMethod, CardPaymentMethod, PayPalPaymentMethod } from '@/types/payment';
import { stripeClientHelpers } from '@/lib/stripe-client';

interface PaymentMethodCardProps {
  paymentMethod: AnyPaymentMethod;
  onSetDefault: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onSetDefault,
  onDelete,
  isDeleting = false
}) => {
  
  // Get card brand icon
  const getCardIcon = (brand?: string) => {
    if (!brand) return <CreditCard className="h-6 w-4 text-gray-400" />;
    
    const brandColors: Record<string, string> = {
      visa: 'from-blue-600 to-blue-700',
      mastercard: 'from-red-500 to-orange-500', 
      amex: 'from-blue-500 to-green-500',
      discover: 'from-orange-400 to-orange-600',
      diners: 'from-gray-600 to-gray-700',
      jcb: 'from-green-600 to-blue-600',
    };

    const bgClass = brandColors[brand.toLowerCase()] || 'from-gray-400 to-gray-500';
    
    return (
      <div className={`w-10 h-6 bg-gradient-to-r ${bgClass} rounded text-white text-xs flex items-center justify-center font-bold`}>
        {brand.toUpperCase().slice(0, 4)}
      </div>
    );
  };

  // Get PayPal icon
  const getPayPalIcon = () => (
    <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">
      PP
    </div>
  );

  // Get Apple Pay icon
  const getApplePayIcon = () => (
    <div className="w-10 h-6 bg-black rounded text-white text-xs flex items-center justify-center">
      🍎
    </div>
  );

  // Get Google Pay icon
  const getGooglePayIcon = () => (
    <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-green-500 rounded text-white text-xs flex items-center justify-center font-bold">
      G
    </div>
  );

  // Format display information based on payment method type
  const getDisplayInfo = () => {
    switch (paymentMethod.type) {
      case 'card':
        const cardMethod = paymentMethod as CardPaymentMethod;
        const isExpired = stripeClientHelpers.isCardExpired(cardMethod.expMonth, cardMethod.expYear);
        
        return {
          icon: getCardIcon(cardMethod.brand),
          title: paymentMethod.displayName || `${stripeClientHelpers.formatCardBrand(cardMethod.brand)} ending in ${cardMethod.lastFour}`,
          subtitle: `Expires ${stripeClientHelpers.formatExpiryDate(cardMethod.expMonth, cardMethod.expYear)}`,
          isExpired,
          canDelete: true,
        };
        
      case 'paypal':
        const paypalMethod = paymentMethod as PayPalPaymentMethod;
        return {
          icon: getPayPalIcon(),
          title: 'PayPal',
          subtitle: paypalMethod.paypalEmail,
          isExpired: false,
          canDelete: true,
        };
        
      case 'apple_pay':
        return {
          icon: getApplePayIcon(),
          title: 'Apple Pay',
          subtitle: 'Touch ID or Face ID',
          isExpired: false,
          canDelete: true,
        };
        
      case 'google_pay':
        return {
          icon: getGooglePayIcon(),
          title: 'Google Pay',
          subtitle: 'Saved to Google account',
          isExpired: false,
          canDelete: true,
        };
        
      default:
        return {
          icon: <CreditCard className="h-6 w-4 text-gray-400" />,
          title: 'Payment Method',
          subtitle: 'Unknown type',
          isExpired: false,
          canDelete: true,
        };
    }
  };

  const displayInfo = getDisplayInfo();

  return (
    <div className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${
      paymentMethod.isDefault 
        ? 'border-luxury-gold ring-2 ring-luxury-gold ring-opacity-20' 
        : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {displayInfo.icon}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium text-gray-900">{displayInfo.title}</h3>
                {paymentMethod.isDefault && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-luxury-gold bg-opacity-10 text-luxury-gold">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Default
                  </span>
                )}
                {displayInfo.isExpired && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Expired
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{displayInfo.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-3">
            {!paymentMethod.isDefault && (
              <button
                onClick={onSetDefault}
                className="text-sm text-luxury-gold hover:text-luxury-gold/80 font-medium transition-colors"
              >
                Set as Default
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {displayInfo.canDelete && (
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Expiry Warning */}
        {displayInfo.isExpired && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-red-800 font-medium">Payment method expired</p>
                <p className="text-red-700 mt-1">
                  This card has expired and cannot be used for payments. Please add a new payment method or update this one.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodCard;