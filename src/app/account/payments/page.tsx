'use client';

import React, { useState, useEffect } from 'react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit, 
  Star,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AnyPaymentMethod } from '@/types/payment';
import PaymentMethodCard from '@/components/payments/PaymentMethodCard';
import AddPaymentMethodModal from '@/components/payments/AddPaymentMethodModal';
import { toast } from 'react-hot-toast';

const PaymentMethodsPage = () => {
  const { user, customer, refreshProfile } = useAuth();
  
  // Debug customer data
  console.log('Customer data in payments page:', customer);
  console.log('User data in payments page:', user);
  console.log('Customer ID being passed to modal:', customer?.id);
  
  // Auto-create customer record if user is authenticated but no customer record exists
  useEffect(() => {
    const createCustomerIfNeeded = async () => {
      if (user && !customer?.id) {
        try {
          console.log('User exists but no customer record. Creating customer record...');
          console.log('User email:', user.email);
          console.log('User metadata:', user.user_metadata);
          
          // Create customer record
          const response = await fetch('/api/customers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              firstName: user.user_metadata?.first_name || 'Customer',
              lastName: user.user_metadata?.last_name || 'User',
              phone: user.user_metadata?.phone || null,
              marketingConsent: user.user_metadata?.marketing_consent || false,
            }),
          });

          if (response.ok) {
            console.log('Customer record created successfully');
            // Refresh auth data to load the new customer record
            await refreshProfile();
          } else {
            console.error('Failed to create customer record:', await response.text());
          }
        } catch (error) {
          console.error('Error creating customer record:', error);
        }
      }
    };

    createCustomerIfNeeded();
  }, [user, customer]);

  // If no customer data and we have a user, show loading while we create the customer record
  if (user && !customer?.id) {
    return (
      <AccountLayout 
        title="Payment Methods" 
        description="Manage your saved payment methods for faster checkout"
      >
        <div className="text-center py-12">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Setting up your account...</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            We're preparing your payment methods section.
          </p>
        </div>
      </AccountLayout>
    );
  }
  const [paymentMethods, setPaymentMethods] = useState<AnyPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    if (!customer?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/payment-methods?customerId=${customer.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.data || []);
      } else {
        console.error('Failed to fetch payment methods');
        toast.error('Failed to load payment methods');
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Failed to load payment methods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [customer?.id]);

  // Handle setting default payment method
  const handleSetDefault = async (paymentMethodId: string) => {
    try {
      const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setAsDefault: true,
        }),
      });

      if (response.ok) {
        await fetchPaymentMethods(); // Refresh the list
        toast.success('Default payment method updated');
      } else {
        toast.error('Failed to update default payment method');
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      toast.error('Failed to update default payment method');
    }
  };

  // Handle deleting payment method
  const handleDelete = async (paymentMethodId: string) => {
    if (!confirm('Are you sure you want to remove this payment method?')) {
      return;
    }

    try {
      setDeletingId(paymentMethodId);
      const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchPaymentMethods(); // Refresh the list
        toast.success('Payment method removed');
      } else {
        toast.error('Failed to remove payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast.error('Failed to remove payment method');
    } finally {
      setDeletingId(null);
    }
  };

  // Handle successful payment method addition
  const handlePaymentMethodAdded = () => {
    setShowAddModal(false);
    fetchPaymentMethods(); // Refresh the list
    toast.success('Payment method added successfully');
  };

  return (
    <AccountLayout 
      title="Payment Methods" 
      description="Manage your saved payment methods for faster checkout"
    >
      <div className="space-y-6">
        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-1">Secure Payment Processing</h4>
              <p className="text-blue-700">
                Your payment information is encrypted and securely stored by our payment partners. 
                We never store your complete card details on our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Saved Payment Methods</h2>
            <p className="text-sm text-gray-600 mt-1">
              Add and manage your payment methods for secure, convenient checkout
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </button>
        </div>

        {/* Payment Methods List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-32 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : paymentMethods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((paymentMethod) => (
              <PaymentMethodCard
                key={paymentMethod.id}
                paymentMethod={paymentMethod}
                onSetDefault={() => handleSetDefault(paymentMethod.id)}
                onDelete={() => handleDelete(paymentMethod.id)}
                isDeleting={deletingId === paymentMethod.id}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                Add a payment method to make checkout faster and more convenient for future orders.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Payment Method
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        customer?.id ? (
          <AddPaymentMethodModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={handlePaymentMethodAdded}
            customerId={customer.id}
          />
        ) : (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg">
              <p>Customer data is not available. Please refresh the page.</p>
              <button 
                onClick={() => setShowAddModal(false)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )
      )}
    </AccountLayout>
  );
};

export default PaymentMethodsPage;