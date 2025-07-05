import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateUUID } from '@/lib/uuid';
import { 
  Order, 
  OrderFilters, 
  OrderSearchParams, 
  OrderStats, 
  OrderAction, 
  OrderNotification,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  ProductionStatus,
  OrderPriority 
} from '@/types/order';

interface OrderStore {
  // Order Data
  orders: Order[];
  orderActions: OrderAction[];
  notifications: OrderNotification[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  selectedOrder: Order | null;
  
  // Filters and Search
  filters: OrderFilters;
  searchParams: OrderSearchParams;
  
  // Actions - Order Management
  createOrder: (order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => string;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  duplicateOrder: (id: string) => void;
  
  // Actions - Order Status Management
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
  updatePaymentStatus: (orderId: string, status: PaymentStatus, transactionId?: string) => void;
  updateFulfillmentStatus: (orderId: string, status: FulfillmentStatus) => void;
  updateProductionStatus: (orderId: string, status: ProductionStatus) => void;
  
  // Actions - Order Operations
  cancelOrder: (orderId: string, reason: string) => void;
  refundOrder: (orderId: string, amount?: number, reason?: string) => void;
  markAsPaid: (orderId: string, paymentMethod: string, transactionId?: string) => void;
  markAsShipped: (orderId: string, trackingNumber: string, shippingMethod: string) => void;
  markAsDelivered: (orderId: string, deliveryDate?: string) => void;
  
  // Actions - Production Management
  startProduction: (orderId: string) => void;
  completeProduction: (orderId: string, notes?: string) => void;
  addProductionNote: (orderId: string, itemId: string, note: string) => void;
  updateProductionTime: (orderId: string, itemId: string, actualTime: number) => void;
  
  // Actions - Customer Communication
  addOrderNote: (orderId: string, note: string, isInternal: boolean) => void;
  sendOrderUpdate: (orderId: string, template: string) => void;
  createNotification: (notification: Omit<OrderNotification, 'id' | 'createdAt'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  
  // Actions - Search and Filtering
  setFilters: (filters: Partial<OrderFilters>) => void;
  clearFilters: () => void;
  setSearchParams: (params: Partial<OrderSearchParams>) => void;
  
  // Getters
  getOrder: (id: string) => Order | undefined;
  getOrderByNumber: (orderNumber: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByCustomer: (customerId: string) => Order[];
  getPendingOrders: () => Order[];
  getProcessingOrders: () => Order[];
  getOverdueOrders: () => Order[];
  getFilteredOrders: () => Order[];
  getOrderStats: () => OrderStats;
  getUnreadNotifications: () => OrderNotification[];
  
  // Production Management
  getProductionQueue: () => Order[];
  getOrdersInProduction: () => Order[];
  getProductionBacklog: () => Order[];
  estimateProductionTime: (orderId: string) => number;
  
  // Financial
  calculateOrderTotal: (orderId: string) => number;
  calculateTax: (orderId: string) => number;
  calculateShipping: (orderId: string) => number;
  getTotalRevenue: (dateRange?: { start: string; end: string }) => number;
  
  // Reports
  generateSalesReport: (dateRange: { start: string; end: string }) => any;
  generateProductionReport: (dateRange: { start: string; end: string }) => any;
  exportOrders: (orderIds?: string[]) => Order[];
  
  // Bulk Operations
  bulkUpdateStatus: (orderIds: string[], status: OrderStatus) => void;
  bulkCancel: (orderIds: string[], reason: string) => void;
  bulkExport: (orderIds: string[]) => void;
  
  // Utility
  generateOrderNumber: () => string;
  addOrderAction: (action: Omit<OrderAction, 'id' | 'performedAt'>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedOrder: (order: Order | null) => void;
  clearSelectedOrder: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      // Initial State
      orders: [],
      orderActions: [],
      notifications: [],
      isLoading: false,
      error: null,
      selectedOrder: null,
      filters: {},
      searchParams: { page: 1, limit: 20, sortBy: 'created_at', sortOrder: 'desc' },

      // Order Management
      createOrder: (orderData) => {
        const orderNumber = get().generateOrderNumber();
        const newOrder: Order = {
          ...orderData,
          id: generateUUID(),
          orderNumber,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          orders: [...state.orders, newOrder],
        }));

        // Create order action
        get().addOrderAction({
          orderId: newOrder.id,
          type: 'created',
          description: `Order ${orderNumber} created`,
          performedBy: 'System',
        });

        // Create notification
        get().createNotification({
          orderId: newOrder.id,
          type: 'new_order',
          title: 'New Order Received',
          message: `Order ${orderNumber} for ${newOrder.customer.firstName} ${newOrder.customer.lastName}`,
          priority: 'medium',
          read: false,
          actionRequired: true,
          actionUrl: `/admin/orders/${newOrder.id}`,
        });

        return newOrder.id;
      },

      updateOrder: (id, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id
              ? { ...order, ...updates, updatedAt: new Date().toISOString() }
              : order
          ),
        }));
      },

      deleteOrder: (id) => {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
          orderActions: state.orderActions.filter((action) => action.orderId !== id),
          notifications: state.notifications.filter((notification) => notification.orderId !== id),
        }));
      },

      duplicateOrder: (id) => {
        const originalOrder = get().getOrder(id);
        if (!originalOrder) return;

        const duplicatedOrder = {
          ...originalOrder,
          customer: { ...originalOrder.customer },
          billing: { ...originalOrder.billing },
          shipping: { ...originalOrder.shipping },
          items: originalOrder.items.map(item => ({ ...item, id: generateUUID() })),
          status: 'pending' as OrderStatus,
          paymentStatus: 'pending' as PaymentStatus,
          fulfillmentStatus: 'pending' as FulfillmentStatus,
          productionStatus: 'not-started' as ProductionStatus,
          notes: 'Duplicated order',
          paidAt: undefined,
          shippedAt: undefined,
          deliveredAt: undefined,
        };

        get().createOrder(duplicatedOrder);
      },

      // Status Management
      updateOrderStatus: (orderId, status, notes) => {
        const order = get().getOrder(orderId);
        if (!order) return;

        get().updateOrder(orderId, { status });
        
        get().addOrderAction({
          orderId,
          type: 'status_changed',
          description: `Order status changed to ${status}${notes ? `: ${notes}` : ''}`,
          performedBy: 'Admin',
          metadata: { previousStatus: order.status, newStatus: status, notes },
        });

        // Auto-update related statuses
        if (status === 'confirmed' && order.productionStatus === 'not-started') {
          get().updateProductionStatus(orderId, 'queued');
        }
      },

      updatePaymentStatus: (orderId, status, transactionId) => {
        const updates: Partial<Order> = { paymentStatus: status };
        
        if (status === 'paid') {
          updates.paidAt = new Date().toISOString();
          if (transactionId) {
            updates.transactionId = transactionId;
          }
        }

        get().updateOrder(orderId, updates);
        
        get().addOrderAction({
          orderId,
          type: status === 'paid' ? 'payment_received' : 'payment_failed',
          description: `Payment status: ${status}${transactionId ? ` (${transactionId})` : ''}`,
          performedBy: 'System',
          metadata: { transactionId },
        });

        // Auto-confirm order if payment received
        const order = get().getOrder(orderId);
        if (status === 'paid' && order?.status === 'pending') {
          get().updateOrderStatus(orderId, 'confirmed');
        }
      },

      updateFulfillmentStatus: (orderId, status) => {
        get().updateOrder(orderId, { fulfillmentStatus: status });
        
        get().addOrderAction({
          orderId,
          type: 'status_changed',
          description: `Fulfillment status: ${status}`,
          performedBy: 'Admin',
        });
      },

      updateProductionStatus: (orderId, status) => {
        get().updateOrder(orderId, { productionStatus: status });
        
        get().addOrderAction({
          orderId,
          type: status === 'completed' ? 'production_completed' : 'status_changed',
          description: `Production status: ${status}`,
          performedBy: 'Admin',
        });

        // Auto-update fulfillment status when production completes
        if (status === 'completed') {
          get().updateFulfillmentStatus(orderId, 'ready-to-ship');
        }
      },

      // Order Operations
      cancelOrder: (orderId, reason) => {
        get().updateOrder(orderId, { 
          status: 'cancelled',
          notes: `Cancelled: ${reason}`
        });
        
        get().addOrderAction({
          orderId,
          type: 'cancelled',
          description: `Order cancelled: ${reason}`,
          performedBy: 'Admin',
          metadata: { reason },
        });
      },

      refundOrder: (orderId, amount, reason) => {
        const order = get().getOrder(orderId);
        if (!order) return;

        const refundAmount = amount || order.total;
        
        get().updateOrder(orderId, { 
          status: 'refunded',
          paymentStatus: 'refunded',
          notes: `Refunded ${refundAmount}: ${reason || 'Customer request'}`
        });
        
        get().addOrderAction({
          orderId,
          type: 'refunded',
          description: `Refund processed: £${refundAmount}${reason ? ` - ${reason}` : ''}`,
          performedBy: 'Admin',
          metadata: { amount: refundAmount, reason },
        });
      },

      markAsPaid: (orderId, paymentMethod, transactionId) => {
        get().updatePaymentStatus(orderId, 'paid', transactionId);
        
        if (paymentMethod) {
          get().updateOrder(orderId, { 
            paymentMethod: { type: paymentMethod as any, provider: paymentMethod }
          });
        }
      },

      markAsShipped: (orderId, trackingNumber, shippingMethod) => {
        get().updateOrder(orderId, { 
          status: 'shipped',
          fulfillmentStatus: 'shipped',
          trackingNumber,
          shippedAt: new Date().toISOString(),
        });
        
        get().addOrderAction({
          orderId,
          type: 'shipped',
          description: `Order shipped via ${shippingMethod}. Tracking: ${trackingNumber}`,
          performedBy: 'Admin',
          metadata: { trackingNumber, shippingMethod },
        });
      },

      markAsDelivered: (orderId, deliveryDate) => {
        get().updateOrder(orderId, { 
          status: 'delivered',
          fulfillmentStatus: 'delivered',
          deliveredAt: deliveryDate || new Date().toISOString(),
        });
        
        get().addOrderAction({
          orderId,
          type: 'delivered',
          description: `Order delivered successfully`,
          performedBy: 'System',
          metadata: { deliveryDate },
        });
      },

      // Production Management
      startProduction: (orderId) => {
        get().updateProductionStatus(orderId, 'printing');
        get().updateOrderStatus(orderId, 'processing');
        
        get().addOrderAction({
          orderId,
          type: 'production_started',
          description: 'Production started',
          performedBy: 'Production Team',
        });
      },

      completeProduction: (orderId, notes) => {
        get().updateProductionStatus(orderId, 'completed');
        
        if (notes) {
          get().addOrderNote(orderId, notes, true);
        }
      },

      addProductionNote: (orderId, itemId, note) => {
        const order = get().getOrder(orderId);
        if (!order) return;

        const updatedItems = order.items.map(item =>
          item.id === itemId
            ? { ...item, printNotes: (item.printNotes || '') + '\n' + note }
            : item
        );

        get().updateOrder(orderId, { items: updatedItems });
      },

      updateProductionTime: (orderId, itemId, actualTime) => {
        const order = get().getOrder(orderId);
        if (!order) return;

        const updatedItems = order.items.map(item =>
          item.id === itemId
            ? { ...item, actualProductionTime: actualTime }
            : item
        );

        get().updateOrder(orderId, { items: updatedItems });
      },

      // Communication
      addOrderNote: (orderId, note, isInternal) => {
        const order = get().getOrder(orderId);
        if (!order) return;

        const currentNotes = isInternal ? order.internalNotes : order.notes;
        const timestamp = new Date().toISOString();
        const newNote = `[${timestamp}] ${note}`;
        
        get().updateOrder(orderId, {
          [isInternal ? 'internalNotes' : 'notes']: 
            currentNotes ? `${currentNotes}\n${newNote}` : newNote
        });
        
        get().addOrderAction({
          orderId,
          type: 'note_added',
          description: `${isInternal ? 'Internal note' : 'Note'} added`,
          performedBy: 'Admin',
          metadata: { note, isInternal },
        });
      },

      sendOrderUpdate: (orderId, template) => {
        // This would integrate with email service
        get().addOrderAction({
          orderId,
          type: 'status_changed',
          description: `Customer notification sent: ${template}`,
          performedBy: 'System',
          metadata: { template },
        });
      },

      createNotification: (notificationData) => {
        const notification: OrderNotification = {
          ...notificationData,
          id: generateUUID(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          notifications: [...state.notifications, notification],
        }));
      },

      markNotificationAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          ),
        }));
      },

      // Search and Filtering
      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }));
      },

      clearFilters: () => {
        set({ filters: {} });
      },

      setSearchParams: (params) => {
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        }));
      },

      // Getters
      getOrder: (id) => {
        return get().orders.find((order) => order.id === id);
      },

      getOrderByNumber: (orderNumber) => {
        return get().orders.find((order) => order.orderNumber === orderNumber);
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter((order) => order.status === status);
      },

      getOrdersByCustomer: (customerId) => {
        return get().orders.filter((order) => order.customer.id === customerId);
      },

      getPendingOrders: () => {
        return get().orders.filter((order) => order.status === 'pending');
      },

      getProcessingOrders: () => {
        return get().orders.filter((order) => order.status === 'processing');
      },

      getOverdueOrders: () => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        return get().orders.filter((order) => 
          ['pending', 'confirmed'].includes(order.status) &&
          new Date(order.createdAt) < threeDaysAgo
        );
      },

      getFilteredOrders: () => {
        const { orders, filters } = get();
        let filtered = [...orders];

        if (filters.status && filters.status.length > 0) {
          filtered = filtered.filter((order) => filters.status!.includes(order.status));
        }

        if (filters.paymentStatus && filters.paymentStatus.length > 0) {
          filtered = filtered.filter((order) => filters.paymentStatus!.includes(order.paymentStatus));
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filtered = filtered.filter(
            (order) =>
              order.orderNumber.toLowerCase().includes(searchTerm) ||
              order.customer.email.toLowerCase().includes(searchTerm) ||
              `${order.customer.firstName} ${order.customer.lastName}`.toLowerCase().includes(searchTerm)
          );
        }

        if (filters.dateRange) {
          const start = new Date(filters.dateRange.start);
          const end = new Date(filters.dateRange.end);
          filtered = filtered.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end;
          });
        }

        if (filters.minAmount || filters.maxAmount) {
          filtered = filtered.filter((order) => {
            const total = order.total;
            const min = filters.minAmount || 0;
            const max = filters.maxAmount || Infinity;
            return total >= min && total <= max;
          });
        }

        return filtered;
      },

      getOrderStats: () => {
        const orders = get().orders;
        const total = orders.length;
        
        return {
          totalOrders: total,
          totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
          averageOrderValue: total > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / total : 0,
          
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          processingOrders: orders.filter(o => o.status === 'processing').length,
          shippedOrders: orders.filter(o => o.status === 'shipped').length,
          deliveredOrders: orders.filter(o => o.status === 'delivered').length,
          cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
          
          ordersInProduction: orders.filter(o => ['printing', 'post-processing', 'quality-check'].includes(o.productionStatus)).length,
          productionBacklog: orders.filter(o => o.productionStatus === 'queued').length,
          averageProductionTime: 0, // Would be calculated from completed orders
          
          paidOrders: orders.filter(o => o.paymentStatus === 'paid').length,
          unpaidOrders: orders.filter(o => o.paymentStatus === 'pending').length,
          refundedOrders: orders.filter(o => o.paymentStatus === 'refunded').length,
          
          todayOrders: orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length,
          weekOrders: orders.filter(o => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(o.createdAt) >= weekAgo;
          }).length,
          monthOrders: orders.filter(o => {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return new Date(o.createdAt) >= monthAgo;
          }).length,
          
          topSellingProducts: [], // Would be calculated from order items
          newCustomers: 0,
          returningCustomers: 0,
          ordersByCountry: {},
          ordersByRegion: {},
        };
      },

      getUnreadNotifications: () => {
        return get().notifications.filter(notification => !notification.read);
      },

      // Production
      getProductionQueue: () => {
        return get().orders.filter(order => order.productionStatus === 'queued');
      },

      getOrdersInProduction: () => {
        return get().orders.filter(order => 
          ['printing', 'post-processing', 'quality-check', 'packaging'].includes(order.productionStatus)
        );
      },

      getProductionBacklog: () => {
        return get().orders.filter(order => 
          order.status === 'confirmed' && order.productionStatus === 'not-started'
        );
      },

      estimateProductionTime: (orderId) => {
        const order = get().getOrder(orderId);
        if (!order) return 0;
        
        return order.items.reduce((total, item) => total + item.printTime + item.finishingTime, 0);
      },

      // Financial
      calculateOrderTotal: (orderId) => {
        const order = get().getOrder(orderId);
        if (!order) return 0;
        
        return order.subtotal + order.shippingCost + order.taxAmount - order.discountAmount;
      },

      calculateTax: (orderId) => {
        const order = get().getOrder(orderId);
        if (!order) return 0;
        
        // UK VAT calculation (20%)
        return order.subtotal * 0.2;
      },

      calculateShipping: (orderId) => {
        const order = get().getOrder(orderId);
        if (!order) return 0;
        
        return order.shippingCost;
      },

      getTotalRevenue: (dateRange) => {
        let orders = get().orders.filter(order => order.paymentStatus === 'paid');
        
        if (dateRange) {
          const start = new Date(dateRange.start);
          const end = new Date(dateRange.end);
          orders = orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end;
          });
        }
        
        return orders.reduce((sum, order) => sum + order.total, 0);
      },

      // Reports
      generateSalesReport: (dateRange) => {
        const orders = get().orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= new Date(dateRange.start) && orderDate <= new Date(dateRange.end);
        });
        
        return {
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
          averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
          orders: orders,
        };
      },

      generateProductionReport: (dateRange) => {
        const orders = get().orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= new Date(dateRange.start) && orderDate <= new Date(dateRange.end);
        });
        
        return {
          totalItems: orders.reduce((sum, order) => sum + order.items.length, 0),
          completedOrders: orders.filter(o => o.productionStatus === 'completed').length,
          averageProductionTime: 0, // Calculate from actual production times
          orders: orders,
        };
      },

      exportOrders: (orderIds) => {
        if (orderIds) {
          return get().orders.filter(order => orderIds.includes(order.id));
        }
        return get().orders;
      },

      // Bulk Operations
      bulkUpdateStatus: (orderIds, status) => {
        orderIds.forEach(orderId => {
          get().updateOrderStatus(orderId, status);
        });
      },

      bulkCancel: (orderIds, reason) => {
        orderIds.forEach(orderId => {
          get().cancelOrder(orderId, reason);
        });
      },

      bulkExport: (orderIds) => {
        const orders = get().exportOrders(orderIds);
        // This would trigger a CSV/Excel download
        console.log('Exporting orders:', orders);
      },

      // Utility
      generateOrderNumber: () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        return `ASH-${timestamp}-${random}`;
      },

      addOrderAction: (actionData) => {
        const action: OrderAction = {
          ...actionData,
          id: generateUUID(),
          performedAt: new Date().toISOString(),
        };

        set((state) => ({
          orderActions: [...state.orderActions, action],
        }));
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      setSelectedOrder: (order) => {
        set({ selectedOrder: order });
      },

      clearSelectedOrder: () => {
        set({ selectedOrder: null });
      },
    }),
    {
      name: 'order-storage',
      // Only persist orders and actions, not UI state
      partialize: (state) => ({
        orders: state.orders,
        orderActions: state.orderActions,
        notifications: state.notifications,
      }),
    }
  )
);