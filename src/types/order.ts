// Order Management Types

export interface Order {
  id: string;
  orderNumber: string;
  
  // Customer Information
  customer: Customer;
  billing: BillingAddress;
  shipping: ShippingAddress;
  
  // Order Items
  items: OrderItem[];
  
  // Pricing
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  vatAmount: number;
  discountAmount: number;
  total: number;
  currency: 'GBP' | 'USD' | 'EUR';
  
  // Order Status
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  
  // Payment Information
  paymentMethod: PaymentMethod;
  paymentProvider: 'stripe' | 'paypal' | 'bank-transfer' | 'cash' | 'manual';
  paymentId?: string;
  transactionId?: string;
  
  // Shipping
  shippingMethod: ShippingMethod;
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  
  // Additional Information
  notes: string;
  internalNotes: string;
  source: OrderSource;
  tags: string[];
  priority: OrderPriority;
  
  // UK Specific
  vatNumber?: string;
  businessOrder: boolean;
  invoiceRequired: boolean;
  
  // Islamic Art Specific
  customizations: OrderCustomization[];
  giftMessage?: string;
  giftWrapping: boolean;
  
  // Manufacturing
  productionStatus: ProductionStatus;
  estimatedProductionTime: number; // in hours
  actualProductionTime?: number;
  printingNotes?: string;
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
  productId: string;
  variantId?: string;
  
  // Product Details (snapshot at time of order)
  name: string;
  arabicName?: string;
  sku: string;
  image: string;
  
  // Pricing
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  originalPrice?: number;
  discountAmount?: number;
  
  // Customizations
  customizations: ItemCustomization[];
  personalizations: ItemPersonalization[];
  
  // Manufacturing
  printStatus: PrintStatus;
  printTime: number;
  finishingTime: number;
  materialUsed: string;
  printNotes?: string;
  
  // Fulfillment
  fulfilled: boolean;
  fulfilledAt?: string;
  serialNumber?: string;
  qualityChecked: boolean;
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

export type OrderStatus = 
  | 'pending'           // Order placed, awaiting payment
  | 'confirmed'         // Payment confirmed, ready for production
  | 'processing'        // In production
  | 'ready'            // Ready for shipping
  | 'shipped'          // Shipped to customer
  | 'delivered'        // Delivered successfully
  | 'cancelled'        // Order cancelled
  | 'refunded'         // Order refunded
  | 'on-hold'          // On hold for review
  | 'failed';          // Payment failed

export type PaymentStatus =
  | 'pending'          // Payment not yet processed
  | 'authorized'       // Payment authorized but not captured
  | 'paid'            // Payment completed
  | 'partially-paid'   // Partial payment received
  | 'failed'          // Payment failed
  | 'cancelled'       // Payment cancelled
  | 'refunded'        // Payment refunded
  | 'disputed';       // Payment disputed/chargeback

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
  paymentStatus?: PaymentStatus[];
  fulfillmentStatus?: FulfillmentStatus[];
  productionStatus?: ProductionStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  customerType?: ('registered' | 'guest')[];
  orderSource?: OrderSource[];
  priority?: OrderPriority[];
  search?: string;
  minAmount?: number;
  maxAmount?: number;
  shippingMethod?: string[];
  country?: string[];
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