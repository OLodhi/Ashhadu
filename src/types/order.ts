// Order Management Types - Compatible with Supabase Schema

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  
  // Pricing
  total: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  currency: string;
  
  // Payment
  payment_status: PaymentStatus;
  payment_method?: string;
  stripe_payment_intent_id?: string;
  
  // Additional info
  notes?: string;
  
  // Timestamps
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at: string;
  
  // Related data (when included)
  order_items?: OrderItem[];
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  
  // Account Status
  isRegistered: boolean;
  isGuest: boolean;
  accountCreated?: string;
  
  // Preferences
  language: 'en' | 'ar';
  newsletterSubscribed: boolean;
  marketingOptIn: boolean;
  
  // Business Information
  company?: string;
  vatNumber?: string;
  businessType?: 'individual' | 'business' | 'charity' | 'education';
  
  // Order History
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  customerSince?: string;
  
  // Notes
  notes: string;
  tags: string[];
}

export interface BillingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface ShippingAddress extends BillingAddress {
  instructions?: string;
  isCommercial: boolean;
  isSameAsBilling: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  product_name: string;
  product_sku: string;
  created_at: string;
  
  // Related data (when included)
  product?: {
    id: string;
    name: string;
    featured_image?: string;
    slug: string;
    islamic_category?: string;
  };
}

export interface ItemCustomization {
  type: 'size' | 'material' | 'color' | 'finish' | 'mounting';
  name: string;
  value: string;
  additionalCost: number;
}

export interface ItemPersonalization {
  type: 'text' | 'name' | 'date' | 'message';
  field: string;
  value: string;
  arabicText?: string;
  font?: string;
  position?: string;
}

export interface OrderCustomization {
  type: 'gift-message' | 'special-instructions' | 'delivery-preference';
  value: string;
  additionalCost?: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

// Order status display configuration
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Order received and being processed'
  },
  processing: {
    label: 'Processing',
    color: 'bg-blue-100 text-blue-800',
    description: 'Order is being prepared'
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-800',
    description: 'Order has been shipped'
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    description: 'Order has been delivered'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    description: 'Order has been cancelled'
  }
} as const;

// Payment status display configuration
export const PAYMENT_STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800'
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800'
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800'
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-gray-100 text-gray-800'
  }
} as const;

export type FulfillmentStatus =
  | 'pending'          // Not yet fulfilled
  | 'in-production'    // Items being manufactured
  | 'ready-to-ship'    // Ready for shipment
  | 'partially-shipped' // Some items shipped
  | 'shipped'          // All items shipped
  | 'delivered'        // Order delivered
  | 'returned'         // Order returned
  | 'exchanged';       // Order exchanged

export type ProductionStatus =
  | 'not-started'      // Production not started
  | 'queued'          // In production queue
  | 'printing'        // Currently printing
  | 'post-processing' // Finishing/cleaning
  | 'quality-check'   // Quality control
  | 'packaging'       // Being packaged
  | 'completed'       // Production completed
  | 'on-hold'         // Production paused
  | 'failed';         // Production failed

export type PrintStatus =
  | 'pending'         // Not yet printed
  | 'queued'         // In print queue
  | 'printing'       // Currently printing
  | 'completed'      // Print completed
  | 'failed'         // Print failed
  | 'cancelled';     // Print cancelled

export type OrderSource =
  | 'website'         // Direct website order
  | 'admin'          // Admin created order
  | 'phone'          // Phone order
  | 'email'          // Email order
  | 'marketplace'    // Third-party marketplace
  | 'wholesale'      // Wholesale order
  | 'exhibition'     // Exhibition/event order
  | 'referral';      // Referral order

export type OrderPriority =
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'
  | 'rush';          // Rush order with expedited production

export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'paypal' | 'cash' | 'cheque';
  provider: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
  trackingIncluded: boolean;
  insuranceIncluded: boolean;
  signatureRequired: boolean;
}

// Order Management & Analytics
export interface OrderStats {
  // Summary
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  
  // Status Distribution
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  
  // Production
  ordersInProduction: number;
  productionBacklog: number;
  averageProductionTime: number;
  
  // Financial
  paidOrders: number;
  unpaidOrders: number;
  refundedOrders: number;
  
  // Time Periods
  todayOrders: number;
  weekOrders: number;
  monthOrders: number;
  
  // Top Products
  topSellingProducts: Array<{
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  
  // Customer Metrics
  newCustomers: number;
  returningCustomers: number;
  
  // Geographic
  ordersByCountry: Record<string, number>;
  ordersByRegion: Record<string, number>;
}

export interface OrderFilters {
  status?: OrderStatus[];
  payment_status?: PaymentStatus[];
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
}

export interface OrderSearchParams {
  query?: string;
  status?: string;
  sortBy?: OrderSortOption;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  filters?: OrderFilters;
}

export type OrderSortOption =
  | 'order_number'
  | 'created_at'
  | 'updated_at'
  | 'total'
  | 'customer_name'
  | 'status'
  | 'payment_status';

// Order Actions & Events
export interface OrderAction {
  id: string;
  orderId: string;
  type: OrderActionType;
  description: string;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, any>;
}

export type OrderActionType =
  | 'created'
  | 'payment_received'
  | 'payment_failed'
  | 'confirmed'
  | 'production_started'
  | 'production_completed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'note_added'
  | 'status_changed'
  | 'address_updated'
  | 'items_modified';

// Notifications
export interface OrderNotification {
  id: string;
  orderId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  createdAt: string;
  actionRequired?: boolean;
  actionUrl?: string;
}

export type NotificationType =
  | 'new_order'
  | 'payment_received'
  | 'payment_failed'
  | 'low_stock'
  | 'production_delay'
  | 'shipping_update'
  | 'customer_message'
  | 'system_alert';

// Reports
export interface OrderReport {
  id: string;
  name: string;
  type: ReportType;
  dateRange: {
    start: string;
    end: string;
  };
  filters: OrderFilters;
  data: any;
  generatedAt: string;
  generatedBy: string;
}

export type ReportType =
  | 'sales_summary'
  | 'order_details'
  | 'customer_analysis'
  | 'product_performance'
  | 'production_report'
  | 'financial_summary'
  | 'tax_report';