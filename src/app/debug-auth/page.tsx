'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function DebugAuthPage() {
  const { user, profile, customer, loading } = useAuth();
  const [manualCheck, setManualCheck] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkAuthChain();
    }
  }, [user]);

  const checkAuthChain = async () => {
    if (!user) return;

    try {
      console.log('🔍 Starting auth chain check for user:', user.id);

      // Check profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      console.log('📋 Profile check:', { profileData, profileError });

      // Check customer by email if profile exists
      let customerData = null;
      let customerError = null;
      if (profileData?.email) {
        const customerResult = await supabase
          .from('customers')
          .select('*')
          .eq('email', profileData.email)
          .single();
        
        customerData = customerResult.data;
        customerError = customerResult.error;
        console.log('👤 Customer check:', { customerData, customerError });
      }

      // Test address query permissions
      let addressTest = null;
      let addressError = null;
      if (customerData?.id) {
        const addressResult = await supabase
          .from('addresses')
          .select('*')
          .eq('customer_id', customerData.id)
          .limit(1);
        
        addressTest = addressResult.data;
        addressError = addressResult.error;
        console.log('🏠 Address permission test:', { addressTest, addressError });
      }

      setManualCheck({
        user: { id: user.id, email: user.email },
        profile: { data: profileData, error: profileError },
        customer: { data: customerData, error: customerError },
        addressTest: { data: addressTest, error: addressError }
      });

    } catch (error) {
      console.error('❌ Auth chain check failed:', error);
      setManualCheck({ error: error.message });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Authentication Debug Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>AuthContext State:</h2>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify({
            user: user ? { id: user.id, email: user.email } : null,
            profile: profile ? { id: profile.id, email: profile.email, role: profile.role } : null,
            customer: customer ? { id: customer.id, email: customer.email } : null,
            loading
          }, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Manual Database Check:</h2>
        <button onClick={checkAuthChain} style={{ padding: '10px', marginBottom: '10px' }}>
          Test Auth Chain
        </button>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          {JSON.stringify(manualCheck, null, 2)}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Next Steps:</h2>
        <ul>
          <li>✅ User should exist (from Supabase auth)</li>
          <li>✅ Profile should exist and link to user_id</li>
          <li>✅ Customer should exist and link to profile email</li>
          <li>✅ Address query should work without RLS errors</li>
        </ul>
      </div>
    </div>
  );
}