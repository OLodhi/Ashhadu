import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Supabase configuration with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check for required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window === 'undefined') {
    // Server-side: Log error but don't throw during build
    console.error('Missing required Supabase environment variables:', {
      supabaseUrl: !!supabaseUrl,
      supabaseAnonKey: !!supabaseAnonKey,
    });
  } else {
    // Client-side: Show user-friendly error
    console.error('Supabase configuration error. Please check environment variables.');
  }
  
  // Provide fallback values to prevent crashes during build
  const fallbackUrl = supabaseUrl || 'https://placeholder.supabase.co';
  const fallbackKey = supabaseAnonKey || 'placeholder-key';
  
  // Still export clients but they won't work without real credentials
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using fallback Supabase configuration. Database operations will fail.');
  }
}

// Get configuration values with fallbacks
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co';
const finalAnonKey = supabaseAnonKey || 'placeholder-key';
const finalServiceKey = supabaseServiceKey || finalAnonKey;

// Create Supabase client for browser usage (client-side)
export const supabase = createClient<Database>(finalUrl, finalAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Create Supabase client for server-side operations (admin)
export const supabaseAdmin = createClient<Database>(
  finalUrl, 
  finalServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): never {
  console.error('Supabase error:', error);
  
  // Check if we're using fallback configuration
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Database not configured. Please check your Supabase environment variables.');
  }
  
  // Handle specific Supabase error types
  if (error.code === 'PGRST116') {
    throw new Error('Resource not found');
  } else if (error.code === 'PGRST301') {
    throw new Error('Unauthorized access');
  } else if (error.message?.includes('JWT')) {
    throw new Error('Authentication token invalid or expired');
  } else if (error.message?.includes('rate limit')) {
    throw new Error('Too many requests. Please try again later.');
  }
  
  throw new Error(error.message || 'Database operation failed');
}

// Upload file to Supabase storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  options?: { upsert?: boolean; contentType?: string }
) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: options?.upsert || false,
        contentType: options?.contentType || (file instanceof File ? file.type : 'application/octet-stream')
      });

    if (error) handleSupabaseError(error);
    return data;
  } catch (error) {
    handleSupabaseError(error);
  }
}

// Get public URL for uploaded file
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

// Delete file from Supabase storage
export async function deleteFile(bucket: string, paths: string[]) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove(paths);

    if (error) handleSupabaseError(error);
    return true;
  } catch (error) {
    handleSupabaseError(error);
  }
}

// Type-safe database operations
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
    insert: (data: any) => supabase.from('orders').insert(data).select().single(),
    update: (id: string, data: any) => supabase.from('orders').update(data).eq('id', id).select().single(),
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
  }
};

export default supabase;