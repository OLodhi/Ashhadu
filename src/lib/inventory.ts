import { createServerSupabaseClient } from '@/lib/auth-utils-server';
import { sendAdminLowStockNotification } from '@/lib/email';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface StockMovement {
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  reference?: string;
  performedBy: string;
}

export interface StockCheckResult {
  available: boolean;
  currentStock: number;
  requestedQuantity: number;
  productId: string;
  productName: string;
}

export interface StockValidationResult {
  isValid: boolean;
  errors: StockCheckResult[];
  availableItems: StockCheckResult[];
}

/**
 * Check if products are available in requested quantities
 */
export async function checkStockAvailability(
  items: Array<{ productId: string; quantity: number }>,
  adminClient?: SupabaseClient
): Promise<StockValidationResult> {
  const supabase = adminClient || await createServerSupabaseClient();
  
  const productIds = items.map(item => item.productId);
  
  // Get current stock levels for all products
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, stock, manage_stock, stock_status')
    .in('id', productIds);

  if (error) {
    throw new Error(`Failed to check stock: ${error.message}`);
  }

  const results: StockCheckResult[] = [];
  let allAvailable = true;

  for (const item of items) {
    const product = products?.find(p => p.id === item.productId);
    
    if (!product) {
      allAvailable = false;
      results.push({
        available: false,
        currentStock: 0,
        requestedQuantity: item.quantity,
        productId: item.productId,
        productName: 'Unknown Product'
      });
      continue;
    }

    // If stock management is disabled, consider it always available
    const isAvailable = !product.manage_stock || 
                       product.stock >= item.quantity;

    if (!isAvailable) {
      allAvailable = false;
    }

    results.push({
      available: isAvailable,
      currentStock: product.stock,
      requestedQuantity: item.quantity,
      productId: item.productId,
      productName: product.name
    });
  }

  return {
    isValid: allAvailable,
    errors: results.filter(r => !r.available),
    availableItems: results.filter(r => r.available)
  };
}

/**
 * Deduct stock for multiple products (used in order processing)
 */
export async function deductStock(
  items: Array<{ productId: string; quantity: number }>,
  reason: string,
  reference: string,
  performedBy: string,
  adminClient?: SupabaseClient
): Promise<void> {
  const supabase = adminClient || await createServerSupabaseClient();

  // First validate stock availability
  const stockCheck = await checkStockAvailability(items, adminClient);
  
  if (!stockCheck.isValid) {
    const errors = stockCheck.errors.map(e => 
      `${e.productName}: requested ${e.requestedQuantity}, available ${e.currentStock}`
    ).join('; ');
    throw new Error(`Insufficient stock: ${errors}`);
  }

  // Process each item in a transaction-like manner
  for (const item of items) {
    await processStockMovement({
      productId: item.productId,
      type: 'out',
      quantity: item.quantity,
      reason,
      reference,
      performedBy
    }, adminClient);
  }
}

/**
 * Add stock back (used for cancellations, refunds, returns)
 */
export async function addStock(
  items: Array<{ productId: string; quantity: number }>,
  reason: string,
  reference: string,
  performedBy: string,
  adminClient?: SupabaseClient
): Promise<void> {
  // Process each item
  for (const item of items) {
    await processStockMovement({
      productId: item.productId,
      type: 'in',
      quantity: item.quantity,
      reason,
      reference,
      performedBy
    }, adminClient);
  }
}

/**
 * Manually adjust stock (admin function)
 */
export async function adjustStock(
  productId: string,
  newQuantity: number,
  reason: string,
  performedBy: string,
  adminClient?: SupabaseClient
): Promise<void> {
  const supabase = adminClient || await createServerSupabaseClient();

  // Get current stock
  const { data: product, error: fetchError } = await supabase
    .from('products')
    .select('stock, name')
    .eq('id', productId)
    .single();

  if (fetchError || !product) {
    throw new Error(`Product not found: ${productId}`);
  }

  const difference = newQuantity - product.stock;
  
  if (difference !== 0) {
    await processStockMovement({
      productId,
      type: 'adjustment',
      quantity: Math.abs(difference),
      reason: `${reason} (${difference > 0 ? '+' : '-'}${Math.abs(difference)})`,
      reference: `adjustment-${Date.now()}`,
      performedBy
    }, adminClient);
  }
}

/**
 * Core function to process a single stock movement
 */
async function processStockMovement(movement: StockMovement, adminClient?: SupabaseClient): Promise<void> {
  const supabase = adminClient || await createServerSupabaseClient();

  try {
    // Start transaction by getting current product data
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, name, stock, manage_stock, low_stock_threshold')
      .eq('id', movement.productId)
      .single();

    if (fetchError || !product) {
      throw new Error(`Product not found: ${movement.productId}`);
    }

    // Skip stock management if disabled for this product
    if (!product.manage_stock) {
      console.log(`Stock management disabled for product ${product.name}, skipping movement`);
      return;
    }

    // Calculate new stock level
    let newStock = product.stock;
    
    switch (movement.type) {
      case 'out':
        newStock = product.stock - movement.quantity;
        break;
      case 'in':
        newStock = product.stock + movement.quantity;
        break;
      case 'adjustment':
        // For adjustments, we need to determine direction from the reason
        const isIncrease = movement.reason.includes('+');
        newStock = isIncrease 
          ? product.stock + movement.quantity 
          : product.stock - movement.quantity;
        break;
    }

    // Ensure stock doesn't go negative
    newStock = Math.max(0, newStock);

    // Determine new stock status
    const newStockStatus = determineStockStatus(newStock, product.low_stock_threshold || 5);

    // Update product stock
    const { error: updateError } = await supabase
      .from('products')
      .update({
        stock: newStock,
        stock_status: newStockStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', movement.productId);

    if (updateError) {
      throw new Error(`Failed to update product stock: ${updateError.message}`);
    }

    // Create inventory movement record
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: movement.productId,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        reference: movement.reference,
        performed_by: movement.performedBy,
        created_at: new Date().toISOString()
      });

    if (movementError) {
      throw new Error(`Failed to create inventory movement: ${movementError.message}`);
    }

    console.log(`Stock movement processed: ${product.name} ${movement.type} ${movement.quantity} (${product.stock} → ${newStock})`);

    // Check for low stock or out of stock alerts
    await checkStockAlerts(movement.productId, product.name, product.stock, newStock, product.low_stock_threshold || 5);

  } catch (error) {
    console.error('Error processing stock movement:', error);
    throw error;
  }
}

/**
 * Determine stock status based on quantity and threshold
 */
function determineStockStatus(stock: number, lowStockThreshold: number): string {
  if (stock <= 0) {
    return 'out-of-stock';
  } else if (stock <= lowStockThreshold) {
    return 'low-stock';
  } else {
    return 'in-stock';
  }
}

/**
 * Get inventory movements for a product
 */
export async function getInventoryMovements(
  productId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<any[]> {
  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('inventory_movements')
    .select(`
      *,
      product:products(id, name, sku)
    `)
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  if (limit) {
    query = query.range(offset, offset + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch inventory movements: ${error.message}`);
  }

  return data || [];
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(): Promise<any[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('products')
    .select('id, name, sku, stock, low_stock_threshold, stock_status')
    .eq('manage_stock', true)
    .in('stock_status', ['low-stock', 'out-of-stock'])
    .eq('status', 'published')
    .order('stock', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch low stock products: ${error.message}`);
  }

  return data || [];
}

/**
 * Get stock summary for dashboard
 */
export async function getStockSummary(): Promise<{
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalStockValue: number;
}> {
  const supabase = await createServerSupabaseClient();

  const { data: products, error } = await supabase
    .from('products')
    .select('stock, stock_status, price, manage_stock, status')
    .eq('status', 'published')
    .eq('manage_stock', true);

  if (error) {
    throw new Error(`Failed to fetch stock summary: ${error.message}`);
  }

  const summary = {
    totalProducts: products?.length || 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalStockValue: 0
  };

  products?.forEach(product => {
    switch (product.stock_status) {
      case 'in-stock':
        summary.inStock++;
        break;
      case 'low-stock':
        summary.lowStock++;
        break;
      case 'out-of-stock':
        summary.outOfStock++;
        break;
    }
    
    summary.totalStockValue += (product.stock * product.price);
  });

  return summary;
}

/**
 * Check for stock alerts and send email notifications if needed
 */
async function checkStockAlerts(
  productId: string,
  productName: string,
  previousStock: number,
  currentStock: number,
  threshold: number
): Promise<void> {
  try {
    // Check if we crossed a threshold that warrants an alert
    const wasInStock = previousStock > threshold;
    const wasLowStock = previousStock > 0 && previousStock <= threshold;
    const isNowOutOfStock = currentStock <= 0;
    const isNowLowStock = currentStock > 0 && currentStock <= threshold;

    let shouldSendAlert = false;
    let alertType = '';

    // Send alert if:
    // 1. Product went from in-stock to low-stock
    // 2. Product went out of stock
    // 3. Product went from any state to low-stock (if not already low)
    if (wasInStock && isNowLowStock) {
      shouldSendAlert = true;
      alertType = 'low-stock';
    } else if (currentStock <= 0 && previousStock > 0) {
      shouldSendAlert = true;
      alertType = 'out-of-stock';
    }

    if (!shouldSendAlert) {
      return;
    }

    console.log(`📧 Stock alert triggered for ${productName}: ${alertType} (${previousStock} → ${currentStock})`);

    // Get admin emails from site settings
    const supabase = await createServerSupabaseClient();
    const { data: adminEmailsSetting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'admin_notification_emails')
      .single();

    const adminEmails = adminEmailsSetting?.value || ['admin@ashhadu.co.uk'];

    // Send low stock notification email
    const emailResult = await sendAdminLowStockNotification(
      Array.isArray(adminEmails) ? adminEmails : [adminEmails],
      productName,
      currentStock,
      threshold
    );

    if (emailResult.success) {
      console.log('✅ Stock alert email sent successfully');
    } else {
      console.error('❌ Failed to send stock alert email:', emailResult.error);
    }

  } catch (error) {
    console.error('❌ Error checking stock alerts:', error);
    // Don't throw error as this shouldn't fail stock operations
  }
}