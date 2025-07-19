'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Smartphone, ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { formatPrice } from '@/lib/utils';
import { PaymentMethodType } from '@/types/payment';
import Logo from '@/components/ui/Logo';
import SafeLink from '@/components/ui/SafeLink';
import AddressFormModal from '@/components/checkout/AddressFormModal';
import AddPaymentMethodModal from '@/components/payments/AddPaymentMethodModal';
import StripeCardForm from '@/components/checkout/StripeCardForm';

interface CheckoutFormData {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  billing: {
    address: string;
    address2: string;
    city: string;
    postcode: string;
    country: string;
  };
  shipping: {
    sameAsBilling: boolean;
    address: string;
    address2: string;
    city: string;
    postcode: string;
    country: string;
  };
  payment: {
    method: PaymentMethodType | '';
    saveCard: boolean;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, customer, isLoading } = useAuth();
  const { isStripeEnabled, isPayPalEnabled, isApplePayEnabled, isGooglePayEnabled } = useSettings();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [defaultAddress, setDefaultAddress] = useState<any>(null);
  const [allAddresses, setAllAddresses] = useState<any[]>([]);
  const [showAddressSelection, setShowAddressSelection] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<any>(null);
  const [allPaymentMethods, setAllPaymentMethods] = useState<any[]>([]);
  const [showPaymentSelection, setShowPaymentSelection] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stripePaymentResult, setStripePaymentResult] = useState<any>(null);
  const [showStripeForm, setShowStripeForm] = useState(false);
  const [orderCompleting, setOrderCompleting] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    customer: {
      firstName: user?.user_metadata?.first_name || '',
      lastName: user?.user_metadata?.last_name || '',
      email: user?.email || '',
      phone: '',
    },
    billing: {
      address: '',
      address2: '',
      city: '',
      postcode: '',
      country: 'GB',
    },
    shipping: {
      sameAsBilling: true,
      address: '',
      address2: '',
      city: '',
      postcode: '',
      country: 'GB',
    },
    payment: {
      method: '',
      saveCard: false,
    },
  });

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const vatRate = 0.2;
  const vatAmount = totalPrice * vatRate;
  const subtotal = totalPrice - vatAmount;
  const freeShippingThreshold = 100;
  const shippingCost = totalPrice >= freeShippingThreshold ? 0 : 8.99;
  const finalTotal = totalPrice + shippingCost;

  // Debug state changes
  useEffect(() => {
    console.log('Checkout state updated:', {
      showStripeForm,
      isProcessing,
      orderCompleting,
      paymentMethod: formData.payment.method,
      isLoggedIn: !!user
    });
  }, [showStripeForm, isProcessing, orderCompleting, formData.payment.method, user]);

  // Redirect to cart if empty (but not during order completion)
  useEffect(() => {
    if (!isLoading && items.length === 0 && !orderCompleting) {
      router.push('/cart');
    }
  }, [items.length, isLoading, orderCompleting, router]);

  // Update form data when user is loaded and fetch default address
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || '',
        }
      }));
      
      // Fetch default address and payment method if user is logged in
      fetchDefaultAddress();
      fetchDefaultPaymentMethod();
    } else {
      // If not logged in, show address form
      setShowAddressForm(true);
    }
  }, [user, customer]);

  const fetchDefaultAddress = async () => {
    try {
      const response = await fetch('/api/addresses');
      if (!response.ok) {
        throw new Error('Failed to fetch addresses');
      }
      
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        // Store all addresses
        setAllAddresses(result.data);
        
        // Find the default address, or use the first one
        const defaultAddr = result.data.find((addr: any) => addr.isDefault) || result.data[0];
        
        // Transform to match checkout form structure
        const transformedAddress = {
          id: defaultAddr.id,
          firstName: defaultAddr.firstName,
          lastName: defaultAddr.lastName,
          address: defaultAddr.addressLine1,
          address2: defaultAddr.addressLine2 || '',
          city: defaultAddr.city,
          postcode: defaultAddr.postcode,
          country: defaultAddr.country === 'United Kingdom' ? 'GB' : defaultAddr.country,
          phone: defaultAddr.phone || ''
        };
        
        setDefaultAddress(transformedAddress);
      } else {
        // No addresses found, show address form
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error('Error fetching default address:', error);
      setShowAddressForm(true);
    }
  };

  const fetchDefaultPaymentMethod = async () => {
    try {
      if (!customer?.id) {
        console.warn('No customer ID available for loading payment methods');
        return;
      }

      const response = await fetch(`/api/payment-methods?customerId=${customer.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      
      const result = await response.json();
      if (result.data && result.data.length > 0) {
        // Store all payment methods
        setAllPaymentMethods(result.data);
        
        // Find the default payment method, or use the first one
        const defaultPM = result.data.find((pm: any) => pm.isDefault) || result.data[0];
        console.log('Default payment method loaded:', defaultPM);
        console.log('Customer data:', customer);
        setDefaultPaymentMethod(defaultPM);
        
        // Update form data with default payment method
        setFormData(prev => ({
          ...prev,
          payment: {
            ...prev.payment,
            method: defaultPM.type,
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching default payment method:', error);
      // Don't show error toast for payment methods - it's optional
    }
  };

  const handleAddressSelection = (address: any) => {
    const transformedAddress = {
      id: address.id,
      firstName: address.firstName,
      lastName: address.lastName,
      address: address.addressLine1,
      address2: address.addressLine2 || '',
      city: address.city,
      postcode: address.postcode,
      country: address.country === 'United Kingdom' ? 'GB' : address.country,
      phone: address.phone || ''
    };
    
    setDefaultAddress(transformedAddress);
    setShowAddressSelection(false);
  };

  const handleShowAddressSelection = () => {
    setShowAddressSelection(true);
  };

  const handleAddNewAddress = () => {
    setShowAddressSelection(false);
    setShowAddressModal(true);
  };

  const handleAddressAdded = async () => {
    // Refresh addresses after adding a new one
    await fetchDefaultAddress();
    // Show address selection again
    setShowAddressSelection(true);
  };

  const handlePaymentMethodSelection = (paymentMethod: any) => {
    setDefaultPaymentMethod(paymentMethod);
    setShowPaymentSelection(false);
    
    // Update form data with selected payment method
    setFormData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        method: paymentMethod.type,
      }
    }));
  };

  const handleShowPaymentSelection = () => {
    setShowPaymentSelection(true);
  };

  const handleAddNewPaymentMethod = () => {
    setShowPaymentSelection(false);
    setShowPaymentModal(true);
  };

  const handlePaymentMethodAdded = async () => {
    // Refresh payment methods after adding a new one
    await fetchDefaultPaymentMethod();
    // Show payment selection again
    setShowPaymentSelection(true);
  };

  const handleStripePaymentSuccess = (result: { paymentIntentId: string; status: string }) => {
    console.log('Stripe payment successful:', result);
    setStripePaymentResult(result);
    // Complete the order with the successful payment
    completeOrderWithStripePayment(result);
  };

  const handleStripePaymentError = (error: string) => {
    console.error('Stripe payment error:', error);
    
    // Reset form states to show the button again
    setShowStripeForm(false);
    setIsProcessing(false);
    setOrderCompleting(false);
    setProcessingMessage('');
    
    // Set error message to display to user
    setErrors(prev => ({ ...prev, general: error }));
  };

  const completeOrderWithStripePayment = async (paymentResult: { paymentIntentId: string; status: string }) => {
    try {
      console.log('Completing order with Stripe payment:', paymentResult);
      setOrderCompleting(true);
      setProcessingMessage('Completing your order...');
      
      // Create order with payment confirmation
      const orderData = {
        customer: formData.customer,
        userId: user?.id || null, // Include user ID to distinguish guest vs registered
        billing: showAddressForm || !defaultAddress ? formData.billing : {
          // Use existing address ID to prevent duplication
          existingAddressId: defaultAddress.id,
          address: defaultAddress.address,
          address2: defaultAddress.address2,
          city: defaultAddress.city,
          postcode: defaultAddress.postcode,
          country: defaultAddress.country,
        },
        shipping: formData.shipping.sameAsBilling ? 
          (showAddressForm || !defaultAddress ? formData.billing : {
            // Use existing address ID to prevent duplication
            existingAddressId: defaultAddress.id,
            address: defaultAddress.address,
            address2: defaultAddress.address2,
            city: defaultAddress.city,
            postcode: defaultAddress.postcode,
            country: defaultAddress.country,
          }) : formData.shipping,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal,
        vatAmount,
        shippingAmount: shippingCost,
        total: finalTotal,
        currency: 'GBP',
        paymentMethod: 'card',
        paymentIntentId: paymentResult.paymentIntentId,
        paymentStatus: 'paid',
      };

      console.log('Creating order with data:', orderData);

      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const orderResult = await orderResponse.json();
      console.log('Order creation response:', orderResult);

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      // Success - clear cart and redirect
      setProcessingMessage('Order completed successfully!');
      clearCart();
      console.log('Redirecting to confirmation page with order:', orderResult.data.orderNumber);
      router.push(`/checkout/confirmation?order=${orderResult.data.orderNumber}`);
      
    } catch (error: any) {
      console.error('Error completing order:', error);
      
      // Reset form states to show the button again
      setShowStripeForm(false);
      setOrderCompleting(false);
      setIsProcessing(false);
      setProcessingMessage('');
      
      // Set error message instead of redirecting
      setErrors(prev => ({ ...prev, general: 'Payment successful, but failed to complete order. Please contact support with your payment ID: ' + paymentResult.paymentIntentId }));
    }
  };

  const updateFormData = (section: keyof CheckoutFormData, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    // Clear error when user starts typing
    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`${section}.${field}`]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate customer information
    if (!formData.customer.firstName.trim()) {
      newErrors['customer.firstName'] = 'First name is required';
    }
    if (!formData.customer.lastName.trim()) {
      newErrors['customer.lastName'] = 'Last name is required';
    }
    if (!formData.customer.email.trim()) {
      newErrors['customer.email'] = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer.email)) {
      newErrors['customer.email'] = 'Please enter a valid email address';
    }

    // Validate address (if showing address form or no default address)
    if (showAddressForm || !defaultAddress) {
      if (!formData.billing.address.trim()) {
        newErrors['billing.address'] = 'Address is required';
      }
      if (!formData.billing.city.trim()) {
        newErrors['billing.city'] = 'City is required';
      }
      if (!formData.billing.postcode.trim()) {
        newErrors['billing.postcode'] = 'Postcode is required';
      }
      if (!formData.billing.country.trim()) {
        newErrors['billing.country'] = 'Country is required';
      }
    }

    // Validate payment method
    if (!formData.payment.method) {
      newErrors['payment.method'] = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async () => {
    console.log('handleSubmitOrder called with payment method:', formData.payment.method);
    
    // Clear any previous errors
    setErrors(prev => ({ ...prev, general: '' }));
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    // For card payments - different flow for logged-in vs guest users
    if (formData.payment.method === 'card') {
      // For logged-in customers with saved payment method, process directly
      if (user && defaultPaymentMethod?.type === 'card') {
        console.log('Logged-in user with saved card: processing payment directly');
        await processStripePaymentWithSavedMethod();
        return;
      } else {
        // For guest users or users without saved method, show Stripe form
        console.log('Guest user or no saved method: showing Stripe form for card payment');
        setShowStripeForm(true);
        return;
      }
    }

    // For non-card payment methods, process the order
    setOrderCompleting(true);
    setIsProcessing(true);
    setProcessingMessage('Processing your order...');

    try {
      // Prepare order data for non-card payment methods
      const orderData = {
        customer: formData.customer,
        userId: user?.id || null, // Include user ID to distinguish guest vs registered
        billing: showAddressForm || !defaultAddress ? formData.billing : {
          // Use existing address ID to prevent duplication
          existingAddressId: defaultAddress.id,
          address: defaultAddress.address,
          address2: defaultAddress.address2,
          city: defaultAddress.city,
          postcode: defaultAddress.postcode,
          country: defaultAddress.country,
        },
        shipping: formData.shipping.sameAsBilling ? 
          (showAddressForm || !defaultAddress ? formData.billing : {
            // Use existing address ID to prevent duplication
            existingAddressId: defaultAddress.id,
            address: defaultAddress.address,
            address2: defaultAddress.address2,
            city: defaultAddress.city,
            postcode: defaultAddress.postcode,
            country: defaultAddress.country,
          }) : formData.shipping,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal,
        vatAmount,
        shippingAmount: shippingCost,
        total: finalTotal,
        currency: 'GBP',
        paymentMethod: formData.payment.method,
      };

      console.log('Processing order with payment method:', formData.payment.method);

      // Process payment based on method (non-card methods)
      if (formData.payment.method === 'paypal') {
        setProcessingMessage('Redirecting to PayPal...');
        await processPayPalPayment(orderData);
      } else if (formData.payment.method === 'apple_pay') {
        setProcessingMessage('Processing Apple Pay...');
        await processApplePayPayment(orderData);
      } else if (formData.payment.method === 'google_pay') {
        setProcessingMessage('Processing Google Pay...');
        await processGooglePayPayment(orderData);
      } else {
        throw new Error('Invalid payment method selected');
      }

    } catch (error: any) {
      console.error('Order processing error:', error);
      
      // Set general error instead of redirecting immediately
      setErrors(prev => ({ ...prev, general: error?.message || 'Failed to process order. Please try again.' }));
      
      setOrderCompleting(false);
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const processStripePaymentWithSavedMethod = async () => {
    let orderResult: any = null;
    
    try {
      setOrderCompleting(true);
      setIsProcessing(true);
      setProcessingMessage('Processing payment with saved card...');

      // Prepare order data
      const orderData = {
        customer: formData.customer,
        userId: user?.id || null, // Include user ID to distinguish guest vs registered
        billing: showAddressForm || !defaultAddress ? formData.billing : {
          // Use existing address ID to prevent duplication
          existingAddressId: defaultAddress.id,
          address: defaultAddress.address,
          address2: defaultAddress.address2,
          city: defaultAddress.city,
          postcode: defaultAddress.postcode,
          country: defaultAddress.country,
        },
        shipping: formData.shipping.sameAsBilling ? 
          (showAddressForm || !defaultAddress ? formData.billing : {
            // Use existing address ID to prevent duplication
            existingAddressId: defaultAddress.id,
            address: defaultAddress.address,
            address2: defaultAddress.address2,
            city: defaultAddress.city,
            postcode: defaultAddress.postcode,
            country: defaultAddress.country,
          }) : formData.shipping,
        items: items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
        })),
        subtotal,
        vatAmount,
        shippingAmount: shippingCost,
        total: finalTotal,
        currency: 'GBP',
        paymentMethod: 'card',
        paymentMethodId: defaultPaymentMethod?.providerPaymentMethodId, // Use saved payment method
      };

      console.log('Processing order with saved payment method:', orderData);

      // Create order first
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      orderResult = await orderResponse.json();
      console.log('Order creation result:', orderResult);

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      // Process payment with saved payment method
      setProcessingMessage('Processing payment...');
      
      const paymentData = {
        orderId: orderResult.data.orderId,
        paymentMethodId: defaultPaymentMethod?.providerPaymentMethodId,
        amount: finalTotal,
        currency: 'gbp',
        customerId: defaultPaymentMethod?.providerCustomerId,
      };

      console.log('Sending payment data:', paymentData);
      console.log('Default payment method:', defaultPaymentMethod);
      console.log('Customer data:', customer);

      // Validate required fields before sending request
      if (!paymentData.orderId) {
        throw new Error('Order ID is missing');
      }
      if (!paymentData.paymentMethodId) {
        throw new Error('Payment method ID is missing');
      }
      if (!paymentData.amount || paymentData.amount <= 0) {
        throw new Error('Valid amount is required');
      }
      if (!paymentData.customerId) {
        throw new Error('Customer ID is missing');
      }

      const paymentResponse = await fetch('/api/stripe/process-saved-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const paymentResult = await paymentResponse.json();
      console.log('Payment result:', paymentResult);

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Success - clear cart and redirect
      setProcessingMessage('Order completed successfully!');
      clearCart();
      console.log('Redirecting to confirmation page with order:', orderResult.data.orderNumber);
      router.push(`/checkout/confirmation?order=${orderResult.data.orderNumber}`);
      
    } catch (error: any) {
      console.error('Error processing payment with saved method:', error);
      
      // Cancel the order if it was created but payment failed
      if (orderResult?.data?.orderId) {
        await cancelOrderDueToPaymentFailure(orderResult.data.orderId, 'Stripe payment with saved method failed');
      }
      
      // Reset form states
      setOrderCompleting(false);
      setIsProcessing(false);
      setProcessingMessage('');
      
      // Set error message
      setErrors(prev => ({ ...prev, general: error?.message || 'Payment failed. Please try again.' }));
    }
  };

  const processStripePayment = async (orderData: any) => {
    await processPaymentMethod(orderData, 'card');
  };

  const processPayPalPayment = async (orderData: any) => {
    await processPaymentMethod(orderData, 'paypal');
  };

  const processApplePayPayment = async (orderData: any) => {
    await processPaymentMethod(orderData, 'apple_pay');
  };

  const processGooglePayPayment = async (orderData: any) => {
    await processPaymentMethod(orderData, 'google_pay');
  };

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success && result.data.paymentStatus === 'paid') {
        // Payment was completed successfully
        setProcessingMessage('Payment completed successfully!');
        clearCart();
        router.push(`/checkout/confirmation?order=${result.data.orderNumber}`);
      } else if (result.success && result.data.orderStatus === 'cancelled') {
        // Order was cancelled (e.g., via PayPal cancel page)
        setProcessingMessage('Payment was cancelled. Your order has been cancelled.');
        setOrderCompleting(false);
        setIsProcessing(false);
        setTimeout(() => setProcessingMessage(''), 3000);
      } else {
        // Payment not completed - reset form
        setProcessingMessage('Payment was not completed. Please try again.');
        setOrderCompleting(false);
        setIsProcessing(false);
        setTimeout(() => setProcessingMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setProcessingMessage('Error checking payment status. Please contact support.');
      setOrderCompleting(false);
      setIsProcessing(false);
    }
  };

  const cancelOrderDueToPaymentFailure = async (orderId: string, reason: string) => {
    try {
      console.log(`Cancelling order ${orderId} due to payment failure: ${reason}`);
      
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'cancelled',
          payment_status: 'failed',
          notes: `Order cancelled due to payment failure: ${reason}`
        }),
      });

      const result = await response.json();
      
      if (!result.success) {
        console.error('Failed to cancel order:', result.error);
      } else {
        console.log('Order cancelled successfully:', orderId);
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const processPaymentMethod = async (orderData: any, paymentMethod: PaymentMethodType) => {
    let orderResult: any = null;
    
    try {
      setProcessingMessage('Creating your order...');
      
      // Step 1: Create the order
      const orderResponse = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      orderResult = await orderResponse.json();

      if (!orderResult.success) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      setProcessingMessage('Processing payment...');
      
      // Step 2: Process payment
      const paymentData: any = {
        amount: orderData.total,
        currency: orderData.currency,
      };

      // Add saved PayPal email for pre-fill if using PayPal
      if (paymentMethod === 'paypal' && defaultPaymentMethod?.type === 'paypal' && defaultPaymentMethod?.details?.email) {
        paymentData.payerEmail = defaultPaymentMethod.details.email;
      }

      const paymentResponse = await fetch('/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderResult.data.orderId,
          paymentMethod: paymentMethod,
          paymentData: paymentData
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        // Payment completed successfully
        setProcessingMessage('Order completed successfully!');
        clearCart();
        router.push(`/checkout/confirmation?order=${paymentResult.data.orderNumber}`);
      } else if (paymentResult.requiresApproval) {
        // PayPal requires user approval - open PayPal in popup
        setProcessingMessage('Opening PayPal window...');
        
        // Open PayPal in a popup window - perfectly centered
        const popupWidth = 450;
        const popupHeight = 600;
        
        // Calculate center position considering available screen space
        const screenWidth = window.screen.availWidth || window.screen.width;
        const screenHeight = window.screen.availHeight || window.screen.height;
        const left = Math.max(0, (screenWidth / 2) - (popupWidth / 2));
        const top = Math.max(0, (screenHeight / 2) - (popupHeight / 2));
        
        const popup = window.open(
          paymentResult.approvalUrl,
          'paypal-checkout',
          `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes,status=no,menubar=no,toolbar=no,location=no`
        );
        
        if (popup) {
          // Monitor popup for completion
          const checkClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkClosed);
              setProcessingMessage('Checking payment status...');
              
              // Check if payment was completed by polling our API
              setTimeout(() => {
                checkPaymentStatus(paymentResult.orderId);
              }, 1000);
            }
          }, 1000);
        } else {
          // Fallback to redirect if popup was blocked
          window.location.href = paymentResult.approvalUrl;
        }
      } else {
        // Payment failed
        throw new Error(paymentResult.error || 'Payment failed');
      }
      
    } catch (error: any) {
      console.error('Payment processing error:', error);
      
      // Cancel the order if it was created but payment failed
      if (orderResult?.data?.orderId) {
        await cancelOrderDueToPaymentFailure(orderResult.data.orderId, `${paymentMethod} payment failed`);
      }
      
      // Route to failure page for payment processing issues
      const errorMessage = error?.message || 'Payment processing failed. Please try again.';
      if (errorMessage.includes('declined') || errorMessage.includes('insufficient')) {
        router.push(`/checkout/failure?reason=payment_declined&message=${encodeURIComponent(errorMessage)}`);
      } else {
        router.push(`/checkout/failure?reason=payment_failed&message=${encodeURIComponent(errorMessage)}`);
      }
      
      setOrderCompleting(false);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-gray-50">
        {/* Checkout Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-4">
            <div className="w-full max-w-md mx-auto">
              <div className="flex justify-center">
                <SafeLink href="/" className="inline-block">
                  <Logo className="w-12 h-12" />
                </SafeLink>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderCompleting) {
    return null; // Will redirect to cart
  }

  return (
    <div className="min-h-screen bg-luxury-gray-50">
      {/* Checkout Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="w-full max-w-md mx-auto">
            <div className="flex justify-center">
              <SafeLink href="/" className="inline-block">
                <Logo className="w-12 h-12" />
              </SafeLink>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold text-luxury-black">
            Checkout
          </h1>
          <p className="text-luxury-gray-600 mt-2">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} • {formatPrice(finalTotal)}
          </p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* Customer Information Section */}
              <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-200 p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="font-playfair text-xl font-semibold text-luxury-black">
                    Customer Information
                  </h2>
                </div>

                {user && !showAddressForm ? (
                  /* Logged in with default address */
                  <div className="space-y-4">
                    {!showAddressSelection ? (
                      /* Show selected address */
                      <div>
                        <h3 className="font-medium text-luxury-black mb-2">Delivering to {defaultAddress?.firstName} {defaultAddress?.lastName}</h3>
                        <div className="bg-luxury-gray-50 rounded-lg p-4 relative">
                          <button
                            onClick={handleShowAddressSelection}
                            className="absolute top-4 right-4 text-sm text-luxury-gold hover:text-luxury-gold/80 transition-colors"
                          >
                            Change
                          </button>
                          <div className="pr-16">
                            <p className="text-luxury-gray-700">{defaultAddress?.address}</p>
                            {defaultAddress?.address2 && (
                              <p className="text-luxury-gray-700">{defaultAddress?.address2}</p>
                            )}
                            <p className="text-luxury-gray-700">{defaultAddress?.city}, {defaultAddress?.postcode}</p>
                            <p className="text-luxury-gray-700">{defaultAddress?.country === 'GB' ? 'United Kingdom' : defaultAddress?.country}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Show address selection tiles */
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-luxury-black">Choose delivery address</h3>
                          <button
                            onClick={() => setShowAddressSelection(false)}
                            className="text-sm text-luxury-gray-500 hover:text-luxury-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {allAddresses.map((address) => (
                            <div
                              key={address.id}
                              onClick={() => handleAddressSelection(address)}
                              className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-luxury-gold/50 ${
                                defaultAddress?.id === address.id 
                                  ? 'border-luxury-gold bg-luxury-gold/5' 
                                  : 'border-luxury-gray-200'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <p className="font-medium text-luxury-black">
                                    {address.firstName} {address.lastName}
                                  </p>
                                  {address.label && (
                                    <span className="text-xs text-luxury-gray-500 bg-luxury-gray-100 px-2 py-1 rounded">
                                      {address.label}
                                    </span>
                                  )}
                                </div>
                                {address.isDefault && (
                                  <span className="text-xs text-luxury-gold bg-luxury-gold/10 px-2 py-1 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                              
                              <div className="text-sm text-luxury-gray-600">
                                <p>{address.addressLine1}</p>
                                {address.addressLine2 && <p>{address.addressLine2}</p>}
                                <p>{address.city}, {address.postcode}</p>
                                <p>{address.country === 'United Kingdom' ? 'United Kingdom' : address.country}</p>
                              </div>
                              
                              {defaultAddress?.id === address.id && (
                                <div className="mt-2 flex items-center text-luxury-gold">
                                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm">Selected</span>
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {/* Add New Address Tile */}
                          <div
                            onClick={handleAddNewAddress}
                            className="p-4 border-2 border-dashed border-luxury-gray-300 rounded-lg cursor-pointer transition-all hover:border-luxury-gold/50 hover:bg-luxury-gold/5 flex flex-col items-center justify-center min-h-[120px]"
                          >
                            <div className="w-8 h-8 bg-luxury-gold/10 rounded-full flex items-center justify-center mb-2">
                              <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                            <p className="text-sm font-medium text-luxury-black">Add New Address</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Not logged in or showing address form */
                  <div className="space-y-6">
                    {user && allAddresses.length > 0 && (
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-luxury-black">Add New Address</h3>
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setShowAddressSelection(true);
                          }}
                          className="text-sm text-luxury-gold hover:text-luxury-gold/80 transition-colors"
                        >
                          Back to addresses
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-luxury-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={formData.customer.firstName}
                          onChange={(e) => updateFormData('customer', 'firstName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold ${
                            errors['customer.firstName'] ? 'border-red-500' : 'border-luxury-gray-300'
                          }`}
                          placeholder="Enter your first name"
                        />
                        {errors['customer.firstName'] && (
                          <p className="mt-1 text-sm text-red-600">{errors['customer.firstName']}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-luxury-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={formData.customer.lastName}
                          onChange={(e) => updateFormData('customer', 'lastName', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold ${
                            errors['customer.lastName'] ? 'border-red-500' : 'border-luxury-gray-300'
                          }`}
                          placeholder="Enter your last name"
                        />
                        {errors['customer.lastName'] && (
                          <p className="mt-1 text-sm text-red-600">{errors['customer.lastName']}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-luxury-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={formData.customer.email}
                        onChange={(e) => updateFormData('customer', 'email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold ${
                          errors['customer.email'] ? 'border-red-500' : 'border-luxury-gray-300'
                        }`}
                        placeholder="Enter your email address"
                      />
                      {errors['customer.email'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['customer.email']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-luxury-gray-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        value={formData.customer.phone}
                        onChange={(e) => updateFormData('customer', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-luxury-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    {/* Shipping Address */}
                    <div className="pt-6 border-t border-luxury-gray-200">
                      <h3 className="font-medium text-luxury-black mb-4">Shipping Address</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-luxury-gray-700 mb-2">
                            Address *
                          </label>
                          <input
                            type="text"
                            value={formData.billing.address}
                            onChange={(e) => updateFormData('billing', 'address', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold ${
                              errors['billing.address'] ? 'border-red-500' : 'border-luxury-gray-300'
                            }`}
                            placeholder="Enter your address"
                          />
                          {errors['billing.address'] && (
                            <p className="mt-1 text-sm text-red-600">{errors['billing.address']}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-luxury-gray-700 mb-2">
                            Address Line 2 (Optional)
                          </label>
                          <input
                            type="text"
                            value={formData.billing.address2}
                            onChange={(e) => updateFormData('billing', 'address2', e.target.value)}
                            className="w-full px-3 py-2 border border-luxury-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                            placeholder="Apartment, suite, etc."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-luxury-gray-700 mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              value={formData.billing.city}
                              onChange={(e) => updateFormData('billing', 'city', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold ${
                                errors['billing.city'] ? 'border-red-500' : 'border-luxury-gray-300'
                              }`}
                              placeholder="Enter your city"
                            />
                            {errors['billing.city'] && (
                              <p className="mt-1 text-sm text-red-600">{errors['billing.city']}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-luxury-gray-700 mb-2">
                              Postcode *
                            </label>
                            <input
                              type="text"
                              value={formData.billing.postcode}
                              onChange={(e) => updateFormData('billing', 'postcode', e.target.value)}
                              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold ${
                                errors['billing.postcode'] ? 'border-red-500' : 'border-luxury-gray-300'
                              }`}
                              placeholder="Enter your postcode"
                            />
                            {errors['billing.postcode'] && (
                              <p className="mt-1 text-sm text-red-600">{errors['billing.postcode']}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-luxury-gray-700 mb-2">
                            Country *
                          </label>
                          <select
                            value={formData.billing.country}
                            onChange={(e) => updateFormData('billing', 'country', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold ${
                              errors['billing.country'] ? 'border-red-500' : 'border-luxury-gray-300'
                            }`}
                          >
                            <option value="GB">United Kingdom</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="AU">Australia</option>
                          </select>
                          {errors['billing.country'] && (
                            <p className="mt-1 text-sm text-red-600">{errors['billing.country']}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Section */}
              <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-200 p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="font-playfair text-xl font-semibold text-luxury-black">
                    Payment Method
                  </h2>
                </div>

                {user && defaultPaymentMethod && !showPaymentSelection ? (
                  /* Logged in with default payment method */
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-luxury-black mb-2">Paying with {defaultPaymentMethod.displayName}</h3>
                      <div className="bg-luxury-gray-50 rounded-lg p-4 relative">
                        <button
                          onClick={handleShowPaymentSelection}
                          className="absolute top-4 right-4 text-sm text-luxury-gold hover:text-luxury-gold/80 transition-colors"
                        >
                          Change
                        </button>
                        <div className="pr-16 flex items-center">
                          <CreditCard size={20} className="text-luxury-gold mr-3" />
                          <div>
                            <p className="text-luxury-gray-700 font-medium">{defaultPaymentMethod.displayName}</p>
                            {defaultPaymentMethod.type === 'card' && (
                              <p className="text-luxury-gray-600 text-sm">
                                Expires {defaultPaymentMethod.expMonth?.toString().padStart(2, '0')}/{defaultPaymentMethod.expYear}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stripe Card Form for logged-in users */}
                    {defaultPaymentMethod?.type === 'card' && showStripeForm && (
                      <div className="mt-6 pt-6 border-t border-luxury-gray-200">
                        <h3 className="font-medium text-luxury-black mb-4">Complete Payment</h3>
                        <StripeCardForm
                          amount={finalTotal}
                          currency="gbp"
                          onSuccess={handleStripePaymentSuccess}
                          onError={handleStripePaymentError}
                          disabled={isProcessing}
                          className="border-0 p-0 bg-transparent"
                          billingDetails={{
                            name: `${formData.customer.firstName} ${formData.customer.lastName}`.trim(),
                            email: formData.customer.email,
                            phone: formData.customer.phone || undefined,
                            address: {
                              line1: showAddressForm || !defaultAddress ? formData.billing.address : defaultAddress.address,
                              line2: showAddressForm || !defaultAddress ? formData.billing.address2 || undefined : defaultAddress.address2 || undefined,
                              city: showAddressForm || !defaultAddress ? formData.billing.city : defaultAddress.city,
                              postal_code: showAddressForm || !defaultAddress ? formData.billing.postcode : defaultAddress.postcode,
                              country: showAddressForm || !defaultAddress ? formData.billing.country : defaultAddress.country,
                            }
                          }}
                        />
                        <div className="mt-4 flex space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowStripeForm(false)}
                            className="px-4 py-2 text-sm font-medium text-luxury-gray-700 bg-white border border-luxury-gray-300 rounded-md hover:bg-luxury-gray-50 transition-colors"
                          >
                            Back to Payment Methods
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ) : showPaymentSelection ? (
                  /* Show payment method selection tiles */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-luxury-black">Choose payment method</h3>
                      <button
                        onClick={() => setShowPaymentSelection(false)}
                        className="text-sm text-luxury-gray-500 hover:text-luxury-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {allPaymentMethods.map((paymentMethod) => (
                        <div
                          key={paymentMethod.id}
                          onClick={() => handlePaymentMethodSelection(paymentMethod)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-luxury-gold/50 ${
                            defaultPaymentMethod?.id === paymentMethod.id 
                              ? 'border-luxury-gold bg-luxury-gold/5' 
                              : 'border-luxury-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <CreditCard size={16} className="text-luxury-gold mr-2" />
                              <div>
                                <p className="font-medium text-luxury-black text-sm">
                                  {paymentMethod.displayName}
                                </p>
                                {paymentMethod.isDefault && (
                                  <span className="text-xs text-luxury-gold bg-luxury-gold/10 px-2 py-1 rounded">
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {paymentMethod.type === 'card' && (
                            <div className="text-sm text-luxury-gray-600">
                              <p>Expires {paymentMethod.expMonth?.toString().padStart(2, '0')}/{paymentMethod.expYear}</p>
                            </div>
                          )}
                          
                          {defaultPaymentMethod?.id === paymentMethod.id && (
                            <div className="mt-2 flex items-center text-luxury-gold">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm">Selected</span>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Add New Payment Method Tile */}
                      <div
                        onClick={handleAddNewPaymentMethod}
                        className="p-4 border-2 border-dashed border-luxury-gray-300 rounded-lg cursor-pointer transition-all hover:border-luxury-gold/50 hover:bg-luxury-gold/5 flex flex-col items-center justify-center min-h-[120px]"
                      >
                        <div className="w-8 h-8 bg-luxury-gold/10 rounded-full flex items-center justify-center mb-2">
                          <svg className="w-4 h-4 text-luxury-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-luxury-black">Add Payment Method</p>
                      </div>
                    </div>

                  </div>
                ) : (
                  /* Default payment method selection for non-logged in users or no saved methods */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {isStripeEnabled && (
                        <div
                          onClick={() => updateFormData('payment', 'method', 'card')}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.payment.method === 'card' 
                              ? 'border-luxury-gold bg-luxury-gold/5' 
                              : 'border-luxury-gray-200 hover:border-luxury-gold/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <CreditCard size={20} className="text-luxury-gold mr-3" />
                              <div>
                                <p className="font-medium text-luxury-black">Credit Card</p>
                                <p className="text-sm text-luxury-gray-600">Visa, Mastercard, Amex</p>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                              formData.payment.method === 'card' 
                                ? 'border-luxury-gold bg-luxury-gold' 
                                : 'border-luxury-gray-300'
                            }`} />
                          </div>
                        </div>
                      )}

                      {isPayPalEnabled && (
                        <div
                          onClick={() => updateFormData('payment', 'method', 'paypal')}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.payment.method === 'paypal' 
                              ? 'border-luxury-gold bg-luxury-gold/5' 
                              : 'border-luxury-gray-200 hover:border-luxury-gold/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-5 h-5 bg-blue-600 rounded mr-3 flex items-center justify-center">
                                <span className="text-white text-xs font-bold">P</span>
                              </div>
                              <div>
                                <p className="font-medium text-luxury-black">PayPal</p>
                                <p className="text-sm text-luxury-gray-600">Pay with PayPal</p>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                              formData.payment.method === 'paypal' 
                                ? 'border-luxury-gold bg-luxury-gold' 
                                : 'border-luxury-gray-300'
                            }`} />
                          </div>
                        </div>
                      )}

                      {isApplePayEnabled && (
                        <div
                          onClick={() => updateFormData('payment', 'method', 'apple_pay')}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.payment.method === 'apple_pay' 
                              ? 'border-luxury-gold bg-luxury-gold/5' 
                              : 'border-luxury-gray-200 hover:border-luxury-gold/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Smartphone size={20} className="text-luxury-gold mr-3" />
                              <div>
                                <p className="font-medium text-luxury-black">Apple Pay</p>
                                <p className="text-sm text-luxury-gray-600">Pay with Touch ID</p>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                              formData.payment.method === 'apple_pay' 
                                ? 'border-luxury-gold bg-luxury-gold' 
                                : 'border-luxury-gray-300'
                            }`} />
                          </div>
                        </div>
                      )}

                      {isGooglePayEnabled && (
                        <div
                          onClick={() => updateFormData('payment', 'method', 'google_pay')}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            formData.payment.method === 'google_pay' 
                              ? 'border-luxury-gold bg-luxury-gold/5' 
                              : 'border-luxury-gray-200 hover:border-luxury-gold/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Smartphone size={20} className="text-luxury-gold mr-3" />
                              <div>
                                <p className="font-medium text-luxury-black">Google Pay</p>
                                <p className="text-sm text-luxury-gray-600">Pay with Google</p>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                              formData.payment.method === 'google_pay' 
                                ? 'border-luxury-gold bg-luxury-gold' 
                                : 'border-luxury-gray-300'
                            }`} />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Stripe Card Form */}
                    {formData.payment.method === 'card' && showStripeForm && (
                      <div className="mt-6">
                        <StripeCardForm
                          amount={finalTotal}
                          currency="gbp"
                          onSuccess={handleStripePaymentSuccess}
                          onError={handleStripePaymentError}
                          disabled={isProcessing}
                          className="border-0 p-0 bg-transparent"
                          billingDetails={{
                            name: `${formData.customer.firstName} ${formData.customer.lastName}`.trim(),
                            email: formData.customer.email,
                            phone: formData.customer.phone || undefined,
                            address: {
                              line1: showAddressForm || !defaultAddress ? formData.billing.address : defaultAddress.address,
                              line2: showAddressForm || !defaultAddress ? formData.billing.address2 || undefined : defaultAddress.address2 || undefined,
                              city: showAddressForm || !defaultAddress ? formData.billing.city : defaultAddress.city,
                              postal_code: showAddressForm || !defaultAddress ? formData.billing.postcode : defaultAddress.postcode,
                              country: showAddressForm || !defaultAddress ? formData.billing.country : defaultAddress.country,
                            }
                          }}
                        />
                        <div className="mt-4 flex space-x-3">
                          <button
                            type="button"
                            onClick={() => setShowStripeForm(false)}
                            className="px-4 py-2 text-sm font-medium text-luxury-gray-700 bg-white border border-luxury-gray-300 rounded-md hover:bg-luxury-gray-50 transition-colors"
                          >
                            Back to Payment Methods
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Error Messages */}
                    {errors.general && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center">
                          <AlertCircle size={16} className="text-red-600 mr-2" />
                          <span className="text-sm text-red-700">{errors.general}</span>
                        </div>
                      </div>
                    )}

                    {/* Validation Errors */}
                    {errors['payment.method'] && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center">
                          <AlertCircle size={16} className="text-red-600 mr-2" />
                          <span className="text-sm text-red-700">{errors['payment.method']}</span>
                        </div>
                      </div>
                    )}

                    {/* Save Card Option */}
                    {formData.payment.method === 'card' && !showStripeForm && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="saveCard"
                          checked={formData.payment.saveCard}
                          onChange={(e) => updateFormData('payment', 'saveCard', e.target.checked)}
                          className="h-4 w-4 text-luxury-gold focus:ring-luxury-gold border-luxury-gray-300 rounded"
                        />
                        <label htmlFor="saveCard" className="ml-2 block text-sm text-luxury-gray-700">
                          Save this card for future purchases
                        </label>
                      </div>
                    )}

                  </div>
                )}

                {/* Error Messages */}
                {errors.general && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle size={16} className="text-red-600 mr-2" />
                      <span className="text-sm text-red-700">{errors.general}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button - Always show unless Stripe form is active */}
                {!showStripeForm && (
                  <div className="mt-8 pt-6 border-t border-luxury-gray-200">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log('Button clicked! State:', {
                          paymentMethod: formData.payment.method,
                          isLoggedIn: !!user,
                          showStripeForm,
                          isProcessing,
                          orderCompleting
                        });
                        handleSubmitOrder();
                      }}
                      disabled={isProcessing || orderCompleting}
                      className="w-full px-6 py-3 bg-luxury-gold text-luxury-black rounded-md hover:bg-luxury-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isProcessing || orderCompleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-luxury-black mr-2"></div>
                          {processingMessage || 'Processing...'}
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={18} className="mr-2" />
                          {formData.payment.method === 'card' ? 
                            (user ? `Pay ${formatPrice(finalTotal)}` : 'Continue to Payment') : 
                            'Place Order'}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-200 p-6 sticky top-4">
              <h2 className="font-playfair text-xl font-semibold text-luxury-black mb-6">
                Order Summary
              </h2>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-luxury-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-luxury-gold/20 rounded-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 16 16" className="text-luxury-gold">
                          <path d="M8 1l2.36 4.78L16 6.5l-3.82.56L11 12l-3-5.22L3 6.5l5.64-.72L8 1z" 
                                fill="currentColor"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-luxury-black text-sm">{item.name}</p>
                      <p className="text-xs text-luxury-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-luxury-gold text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Pricing Breakdown */}
              <div className="space-y-3 border-t border-luxury-gray-200 pt-4">
                <div className="flex justify-between text-luxury-gray-600">
                  <span>Subtotal (excl. VAT)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between text-luxury-gray-600">
                  <span>VAT (20%)</span>
                  <span>{formatPrice(vatAmount)}</span>
                </div>
                
                <div className="flex justify-between text-luxury-gray-600">
                  <span>Shipping</span>
                  <span>
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-medium">Free</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                
                <div className="border-t border-luxury-gray-200 pt-3">
                  <div className="flex justify-between font-playfair text-lg font-semibold text-luxury-black">
                    <span>Total</span>
                    <span className="text-luxury-gold">{formatPrice(finalTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-luxury-gray-200">
                <div className="flex items-center justify-center space-x-4 text-xs text-luxury-gray-500">
                  <div className="flex items-center">
                    <ShieldCheck size={14} className="mr-1" />
                    <span>SSL Secure</span>
                  </div>
                  <div className="flex items-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" className="mr-1">
                      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Money Back</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onAddressAdded={handleAddressAdded}
      />

      {/* Payment Method Modal */}
      {showPaymentModal && customer?.id && (
        <AddPaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentMethodAdded}
          customerId={customer.id}
        />
      )}
    </div>
  );
}