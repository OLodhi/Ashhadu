'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function DebugRLSPage() {
  const { user, profile, customer, loading } = useAuth();
  const [debugResults, setDebugResults] = useState<any>(null);
  const [testingAddressInsert, setTestingAddressInsert] = useState(false);

  useEffect(() => {
    if (user) {
      runDebugChecks();
    }
  }, [user]);

  const runDebugChecks = async () => {
    if (!user) return;

    try {
      console.log('🔍 Starting RLS debug for user:', user.id);
      
      const results: any = {
        userInfo: { id: user.id, email: user.email },
        steps: []
      };

      // Step 1: Check auth user
      results.steps.push({
        step: 1,
        name: 'Auth User Check',
        status: 'success',
        data: { id: user.id, email: user.email }
      });

      // Step 2: Check profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      results.steps.push({
        step: 2,
        name: 'Profile Check',
        status: profileError ? 'error' : 'success',
        data: profileData,
        error: profileError?.message
      });

      // Step 3: Check customer
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
      }

      results.steps.push({
        step: 3,
        name: 'Customer Check',
        status: customerError ? 'error' : 'success',
        data: customerData,
        error: customerError?.message
      });

      // Step 4: Test address permissions
      let addressPermissionTest = null;
      let addressPermissionError = null;
      
      if (customerData?.id) {
        const addressResult = await supabase
          .from('addresses')
          .select('*')
          .eq('customer_id', customerData.id)
          .limit(1);
        
        addressPermissionTest = addressResult.data;
        addressPermissionError = addressResult.error;
      }

      results.steps.push({
        step: 4,
        name: 'Address Permission Test',
        status: addressPermissionError ? 'error' : 'success',
        data: addressPermissionTest,
        error: addressPermissionError?.message
      });

      // Step 5: Test actual address insert (dry run)
      if (customerData?.id) {
        try {
          const testAddress = {
            customer_id: customerData.id,
            type: 'shipping',
            first_name: 'Test',
            last_name: 'User',
            address_line_1: '123 Test Street',
            city: 'London',
            postcode: 'SW1A 1AA',
            country: 'United Kingdom',
            is_default: false
          };

          // Try to insert (this will likely fail, but we want to see the exact error)
          const { data: insertData, error: insertError } = await supabase
            .from('addresses')
            .insert(testAddress)
            .select()
            .single();

          results.steps.push({
            step: 5,
            name: 'Address Insert Test',
            status: insertError ? 'error' : 'success',
            data: insertData,
            error: insertError?.message,
            testData: testAddress
          });

          // If it succeeded, delete the test record
          if (insertData?.id) {
            await supabase
              .from('addresses')
              .delete()
              .eq('id', insertData.id);
          }
        } catch (error: any) {
          results.steps.push({
            step: 5,
            name: 'Address Insert Test',
            status: 'error',
            error: error.message
          });
        }
      } else {
        results.steps.push({
          step: 5,
          name: 'Address Insert Test',
          status: 'skipped',
          error: 'No customer ID available'
        });
      }

      setDebugResults(results);

    } catch (error: any) {
      console.error('❌ Debug check failed:', error);
      setDebugResults({ error: error.message });
    }
  };

  const testAddressInsert = async () => {
    if (!customer?.id) {
      alert('No customer ID available');
      return;
    }

    setTestingAddressInsert(true);
    
    try {
      const testAddress = {
        customer_id: customer.id,
        type: 'shipping' as const,
        first_name: 'Debug',
        last_name: 'Test',
        address_line_1: '456 Debug Avenue',
        city: 'London',
        postcode: 'W1A 1AA',
        country: 'United Kingdom',
        is_default: false
      };

      console.log('🧪 Testing address insert with data:', testAddress);

      const { data, error } = await supabase
        .from('addresses')
        .insert(testAddress)
        .select()
        .single();

      if (error) {
        console.error('❌ Address insert failed:', error);
        alert(`Insert failed: ${error.message}`);
      } else {
        console.log('✅ Address insert succeeded:', data);
        alert('✅ Address insert succeeded! Cleaning up...');
        
        // Clean up the test record
        await supabase
          .from('addresses')
          .delete()
          .eq('id', data.id);
      }

    } catch (error: any) {
      console.error('❌ Test failed:', error);
      alert(`Test failed: ${error.message}`);
    } finally {
      setTestingAddressInsert(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#1a1a1a', marginBottom: '20px' }}>
        🔍 RLS Policy Debug Tool
      </h1>
      
      {!user ? (
        <div style={{ 
          background: '#fee', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #fcc'
        }}>
          <h3>❌ Not Authenticated</h3>
          <p>Please log in to test the RLS policies.</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h2>AuthContext State:</h2>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '8px',
              overflow: 'auto'
            }}>
              {JSON.stringify({
                user: user ? { id: user.id, email: user.email } : null,
                profile: profile ? { id: profile.id, email: profile.email, role: profile.role } : null,
                customer: customer ? { id: customer.id, email: customer.email } : null,
                loading
              }, null, 2)}
            </pre>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={runDebugChecks}
              style={{ 
                padding: '12px 20px', 
                marginBottom: '15px',
                marginRight: '10px',
                background: '#1a1a1a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔄 Run Debug Checks
            </button>
            
            <button 
              onClick={testAddressInsert}
              disabled={testingAddressInsert || !customer}
              style={{ 
                padding: '12px 20px', 
                marginBottom: '15px',
                background: testingAddressInsert ? '#ccc' : '#d4af37',
                color: testingAddressInsert ? '#666' : '#1a1a1a',
                border: 'none',
                borderRadius: '6px',
                cursor: testingAddressInsert ? 'not-allowed' : 'pointer'
              }}
            >
              {testingAddressInsert ? '🧪 Testing...' : '🧪 Test Address Insert'}
            </button>
          </div>

          {debugResults && (
            <div>
              <h2>Debug Results:</h2>
              <div style={{ 
                background: '#f5f5f5', 
                padding: '15px', 
                borderRadius: '8px',
                overflow: 'auto'
              }}>
                {debugResults.error ? (
                  <div style={{ color: 'red' }}>
                    <strong>Error:</strong> {debugResults.error}
                  </div>
                ) : (
                  <div>
                    <div style={{ marginBottom: '15px' }}>
                      <strong>User:</strong> {debugResults.userInfo?.email} 
                      ({debugResults.userInfo?.id})
                    </div>
                    
                    {debugResults.steps?.map((step: any, index: number) => (
                      <div 
                        key={index}
                        style={{ 
                          marginBottom: '15px',
                          padding: '10px',
                          border: `2px solid ${
                            step.status === 'success' ? '#4caf50' : 
                            step.status === 'error' ? '#f44336' : '#ff9800'
                          }`,
                          borderRadius: '6px',
                          background: step.status === 'success' ? '#e8f5e8' : 
                                    step.status === 'error' ? '#ffeaea' : '#fff3e0'
                        }}
                      >
                        <h4 style={{ margin: '0 0 10px 0' }}>
                          Step {step.step}: {step.name} 
                          <span style={{ 
                            marginLeft: '10px',
                            color: step.status === 'success' ? '#4caf50' : 
                                  step.status === 'error' ? '#f44336' : '#ff9800'
                          }}>
                            {step.status === 'success' ? '✅' : 
                             step.status === 'error' ? '❌' : '⚠️'}
                          </span>
                        </h4>
                        
                        {step.error && (
                          <div style={{ color: '#f44336', marginBottom: '10px' }}>
                            <strong>Error:</strong> {step.error}
                          </div>
                        )}
                        
                        {step.data && (
                          <pre style={{ 
                            background: 'white', 
                            padding: '8px', 
                            borderRadius: '4px',
                            fontSize: '12px',
                            overflow: 'auto'
                          }}>
                            {JSON.stringify(step.data, null, 2)}
                          </pre>
                        )}
                        
                        {step.testData && (
                          <div>
                            <strong>Test Data Used:</strong>
                            <pre style={{ 
                              background: 'white', 
                              padding: '8px', 
                              borderRadius: '4px',
                              fontSize: '12px',
                              marginTop: '5px'
                            }}>
                              {JSON.stringify(step.testData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}