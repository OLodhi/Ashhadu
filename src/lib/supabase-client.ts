'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

// Client-side Supabase client for SSR compatibility
let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClientSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    );
  }
  return supabaseClient;
}

export const supabase = createClientSupabaseClient();

// Type-safe database operations (client-side)
export const db = {
  // Products
  products: {
    select: () => supabase.from('products').select('*'),
    selectById: (id: string) => supabase.from('products').select('*').eq('id', id).single(),
    insert: (data: any) => supabase.from('products').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('products').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('products').delete().eq('id', id),
  },
  
  // Product Images
  productImages: {
    select: () => supabase.from('product_images').select('*'),
    selectByProductId: (productId: string) => supabase.from('product_images').select('*').eq('product_id', productId),
    insert: (data: any) => supabase.from('product_images').insert(data).select().single(),
    delete: (id: string) => supabase.from('product_images').delete().eq('id', id),
  },
  
  // Orders
  orders: {
    select: () => supabase.from('orders').select('*'),
    selectById: (id: string) => supabase.from('orders').select('*').eq('id', id).single(),
    selectByCustomerId: (customerId: string) => supabase.from('orders').select('*').eq('customer_id', customerId),
    selectWithItems: (customerId: string) => supabase.from('orders').select(`
      *,
      order_items (
        *,
        product:products (
          id,
          name,
          featured_image,
          slug,
          islamic_category,
          arabic_name
        )
      )
    `).eq('customer_id', customerId),
    insert: (data: any) => supabase.from('orders').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('orders').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('orders').delete().eq('id', id),
  },
  
  // Order Items
  orderItems: {
    selectByOrderId: (orderId: string) => supabase.from('order_items').select('*').eq('order_id', orderId),
    insert: (data: any) => supabase.from('order_items').insert(data).select(),
  },
  
  // Customers
  customers: {
    select: () => supabase.from('customers').select('*'),
    selectById: (id: string) => supabase.from('customers').select('*').eq('id', id).single(),
    insert: (data: any) => supabase.from('customers').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('customers').update(data).eq('id', id).select().single(),
  },

  // Addresses
  addresses: {
    select: () => supabase.from('addresses').select('*'),
    selectByCustomerId: (customerId: string) => supabase.from('addresses').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }),
    selectByType: (customerId: string, type: 'billing' | 'shipping') => supabase.from('addresses').select('*').eq('customer_id', customerId).eq('type', type),
    selectDefault: (customerId: string, type: 'billing' | 'shipping') => supabase.from('addresses').select('*').eq('customer_id', customerId).eq('type', type).eq('is_default', true).single(),
    insert: (data: any) => supabase.from('addresses').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('addresses').update(data).eq('id', id).select().single(),
    delete: (id: string) => supabase.from('addresses').delete().eq('id', id),
  },
  
  // Reviews
  reviews: {
    selectByProductId: (productId: string) => supabase.from('reviews').select('*').eq('product_id', productId),
    insert: (data: any) => supabase.from('reviews').insert(data).select().single(),
  },
  
  // Wishlists
  wishlists: {
    select: () => supabase.from('wishlists').select('*'),
    selectByCustomerId: (customerId: string) => supabase.from('wishlists').select(`
      *,
      product:products (
        id,
        name,
        arabic_name,
        slug,
        description,
        short_description,
        price,
        regular_price,
        currency,
        featured_image,
        category,
        stock_status,
        status,
        created_at
      )
    `).eq('customer_id', customerId).order('created_at', { ascending: false }),
    selectWithProduct: (customerId: string, productId: string) => supabase.from('wishlists').select('*').eq('customer_id', customerId).eq('product_id', productId).single(),
    insert: (data: any) => supabase.from('wishlists').insert(data).select().single(),
    delete: (customerId: string, productId: string) => supabase.from('wishlists').delete().eq('customer_id', customerId).eq('product_id', productId),
    deleteById: (id: string) => supabase.from('wishlists').delete().eq('id', id),
    count: (customerId: string) => supabase.from('wishlists').select('id', { count: 'exact', head: true }).eq('customer_id', customerId),
    checkExists: (customerId: string, productId: string) => supabase.from('wishlists').select('id').eq('customer_id', customerId).eq('product_id', productId).single(),
  }
};

export default supabase;