'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  ShoppingBag,
  ArrowUpDown
} from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Order, OrderStatus, PaymentStatus, OrderFilters, ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/types/order';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const { user, customer, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'created_at' | 'total' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const [filters, setFilters] = useState<OrderFilters>({
    status: [],
    payment_status: [],
    search: '',
    dateFrom: '',
    dateTo: '',
    minAmount: undefined,
    maxAmount: undefined
  });

  useEffect(() => {
    if (user && customer && !authLoading) {
      loadOrders();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, customer, authLoading, filters, sortBy, sortOrder]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      if (!customer?.id) {
        console.warn('No customer ID available for loading orders');
        setOrders([]);
        return;
      }

      // Build query
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (
              id,
              name,
              featured_image,
              slug,
              islamic_category
            )
          )
        `)
        .eq('customer_id', customer.id);

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters.payment_status && filters.payment_status.length > 0) {
        query = query.in('payment_status', filters.payment_status);
      }

      if (filters.search) {
        query = query.or(
          `id.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
        );
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.minAmount !== undefined) {
        query = query.gte('total', filters.minAmount);
      }

      if (filters.maxAmount !== undefined) {
        query = query.lte('total', filters.maxAmount);
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;

      if (error) {
        console.error('Error loading orders:', error);
        toast.error('Failed to load orders');
        setOrders([]);
        return;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getPaymentIcon = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'refunded':
        return <ArrowUpDown className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const handleFilterChange = (key: keyof OrderFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleStatusFilter = (status: OrderStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    handleFilterChange('status', newStatuses);
  };

  const handlePaymentStatusFilter = (status: PaymentStatus) => {
    const currentStatuses = filters.payment_status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    handleFilterChange('payment_status', newStatuses);
  };

  const clearFilters = () => {
    setFilters({
      status: [],
      payment_status: [],
      search: '',
      dateFrom: '',
      dateTo: '',
      minAmount: undefined,
      maxAmount: undefined
    });
  };

  const exportOrders = () => {
    // TODO: Implement order export functionality
    toast.success('Export functionality coming soon!');
  };

  const toggleOrderDetails = (order: Order) => {
    setSelectedOrder(selectedOrder?.id === order.id ? null : order);
  };

  // Don't render if not authenticated
  if (authLoading || loading) {
    return (
      <AccountLayout 
        title="Orders" 
        description="Loading your order history..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
        </div>
      </AccountLayout>
    );
  }

  if (!user) {
    return (
      <AccountLayout 
        title="Orders" 
        description="Please log in to view your orders"
      >
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Required</h3>
          <p className="mt-2 text-gray-600">Please log in to view your order history.</p>
        </div>
      </AccountLayout>
    );
  }

  if (!customer) {
    return (
      <AccountLayout 
        title="Orders" 
        description="Customer profile loading..."
      >
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Profile Loading</h3>
          <p className="mt-2 text-gray-600">Please wait while we load your customer profile.</p>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout 
      title="Orders" 
      description="View and manage your Islamic art orders"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${
                showFilters ? 'bg-gray-50' : ''
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${
                showFilters ? 'rotate-180' : ''
              }`} />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'created_at' | 'total' | 'status');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="total-desc">Highest Amount</option>
              <option value="total-asc">Lowest Amount</option>
              <option value="status-asc">Status A-Z</option>
            </select>

            {/* Export */}
            <button
              onClick={exportOrders}
              className="inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-luxury-gold hover:text-yellow-600"
              >
                Clear All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Order Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <div className="space-y-2">
                  {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(status as OrderStatus) || false}
                        onChange={() => handleStatusFilter(status as OrderStatus)}
                        className="h-4 w-4 text-luxury-gold focus:ring-luxury-gold border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{config.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <div className="space-y-2">
                  {Object.entries(PAYMENT_STATUS_CONFIG).map(([status, config]) => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.payment_status?.includes(status as PaymentStatus) || false}
                        onChange={() => handlePaymentStatusFilter(status as PaymentStatus)}
                        className="h-4 w-4 text-luxury-gold focus:ring-luxury-gold border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{config.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <input
                    type="date"
                    placeholder="From"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                  />
                  <input
                    type="date"
                    placeholder="To"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                  />
                </div>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Range (£)
                </label>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Amount"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                  />
                  <input
                    type="number"
                    placeholder="Max Amount"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/6"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderDetails(order)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(order.total, order.currency)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            ORDER_STATUS_CONFIG[order.status].color
                          }`}>
                            {ORDER_STATUS_CONFIG[order.status].label}
                          </span>
                          <div className="flex items-center">
                            {getPaymentIcon(order.payment_status)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 text-gray-400 transform transition-transform ${
                        selectedOrder?.id === order.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {selectedOrder?.id === order.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Order Summary */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span>{formatCurrency(order.subtotal, order.currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax:</span>
                            <span>{formatCurrency(order.tax_amount, order.currency)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping:</span>
                            <span>{formatCurrency(order.shipping_amount, order.currency)}</span>
                          </div>
                          <div className="border-t pt-2 flex justify-between font-medium">
                            <span>Total:</span>
                            <span>{formatCurrency(order.total, order.currency)}</span>
                          </div>
                        </div>

                        {order.notes && (
                          <div className="mt-4">
                            <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                            <p className="text-sm text-gray-600">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Items</h4>
                        <div className="space-y-3">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3">
                              {item.product?.featured_image && (
                                <img
                                  src={item.product.featured_image}
                                  alt={item.product_name}
                                  className="h-12 w-12 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {item.product_name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.quantity} × {formatCurrency(item.price, order.currency)}
                                </p>
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {formatCurrency(item.total, order.currency)}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-4 border-t">
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="inline-flex items-center text-luxury-gold hover:text-yellow-600 font-medium text-sm"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Full Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Orders Found</h3>
              <p className="mt-2 text-gray-600">
                {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v)
                  ? 'No orders match your current filters. Try adjusting your search criteria.'
                  : 'You haven\'t placed any orders yet. Start browsing our beautiful Islamic art collection.'
                }
              </p>
              <div className="mt-6 space-x-3">
                {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  href="/shop"
                  className="inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}