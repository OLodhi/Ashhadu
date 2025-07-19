'use client';

import React, { useState, useEffect } from 'react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const PaymentMethodsPageSimplified = () => {
  // Always call all hooks
  const { user, customer } = useAuth();
  const [loading, setLoading] = useState(true);

  // Simple useEffect
  useEffect(() => {
    if (customer?.id) {
      setLoading(false);
    }
  }, [customer?.id]);

  // Debug
  console.log('Simple page - User:', !!user);
  console.log('Simple page - Customer:', !!customer);

  return (
    <AccountLayout 
      title="Payment Methods" 
      description="Manage your saved payment methods for faster checkout"
    >
      <div className="text-center py-12">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
          <Loader2 className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Testing hooks - User: {user ? 'Yes' : 'No'}, Customer: {customer ? 'Yes' : 'No'}
        </h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          This is a simplified version to test hooks.
        </p>
      </div>
    </AccountLayout>
  );
};

export default PaymentMethodsPageSimplified;