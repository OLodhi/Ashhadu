// Quick debug script to check if orders exist in the database
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wqdcwlizdhttortnxhzw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxZGN3bGl6ZGh0dG9ydG54aHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTU1ODE4MiwiZXhwIjoyMDY3MTM0MTgyfQ.DDx0NBzQ71CDWCkodIvUP0c603r5w9PIH0njIofSCQM'
);

async function checkOrders() {
  console.log('🔍 Checking orders in database...');
  
  // Check orders table
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (ordersError) {
    console.error('❌ Error fetching orders:', ordersError);
    return;
  }
  
  console.log(`📦 Found ${orders.length} orders in database`);
  
  if (orders.length > 0) {
    console.log('\n📋 Recent orders:');
    orders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.id}:`);
      console.log(`   Status: ${order.status} | Payment: ${order.payment_status}`);
      console.log(`   Total: £${order.total} | Customer ID: ${order.customer_id}`);
      console.log(`   Created: ${order.created_at}`);
      console.log(`   Payment Method: ${order.payment_method}`);
      console.log(`   Stripe Intent: ${order.stripe_payment_intent_id || 'none'}`);
      if (order.notes) {
        console.log(`   Notes: ${order.notes.substring(0, 100)}${order.notes.length > 100 ? '...' : ''}`);
      }
      console.log('');
    });
    
    // Check for paid orders specifically
    const paidOrders = orders.filter(order => order.payment_status === 'paid');
    console.log(`💰 Found ${paidOrders.length} paid orders`);
    
    // Check for orders with Stripe payment intents
    const stripeOrders = orders.filter(order => order.stripe_payment_intent_id);
    console.log(`💳 Found ${stripeOrders.length} orders with Stripe payment intent IDs`);
  }
  
  // Check customers table
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (customersError) {
    console.error('❌ Error fetching customers:', customersError);
    return;
  }
  
  console.log(`👥 Found ${customers.length} customers in database`);
  
  if (customers.length > 0) {
    console.log('\n👤 Recent customers:');
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.first_name} ${customer.last_name} (${customer.email})`);
      console.log(`   ID: ${customer.id} | Created: ${customer.created_at}`);
      console.log('');
    });
  }
}

checkOrders().catch(console.error);