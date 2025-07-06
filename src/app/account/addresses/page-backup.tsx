'use client';

import { AccountLayout } from '@/components/account/AccountLayout';

export default function AddressesPage() {
  return (
    <AccountLayout 
      title="Addresses" 
      description="Manage your billing and shipping addresses for faster checkout."
    >
      <div className="space-y-8">
        <h2 className="text-xl font-semibold text-gray-900">Test Page</h2>
        <p>This is a minimal test version to check if the basic page loads.</p>
      </div>
    </AccountLayout>
  );
}