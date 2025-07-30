'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Truck,
  Package,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Download,
  Mail,
  Phone,
  MapPin,
  X
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface DatabaseOrder {
  id: string;
  customer_id: string;
  status: string;
  total: number;
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  currency: string;
  payment_status: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  ordersInProduction: number;
  totalRevenue: number;
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<DatabaseOrder[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    ordersInProduction: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Comprehensive filter state
  const [filters, setFilters] = useState({
    status: 'all' as string,
    paymentStatus: 'all' as string,
    dateRange: {
      from: '',
      to: ''
    },
    amountRange: {
      min: '',
      max: ''
    },
    customerType: 'all' as 'all' | 'new' | 'returning'
  });

  // Fetch orders with debounced search
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const url = new URL('/api/orders', window.location.origin);
        
        // Add search parameter if exists
        if (searchTerm) {
          url.searchParams.set('search', searchTerm);
        }
        
        const response = await fetch(url.toString());
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch orders');
        }

        const ordersData = result.data || [];
        setOrders(ordersData);

        // Calculate stats (exclude cancelled orders from revenue)
        const newStats = {
          totalOrders: ordersData.length,
          pendingOrders: ordersData.filter((o: DatabaseOrder) => o.status === 'pending').length,
          ordersInProduction: ordersData.filter((o: DatabaseOrder) => o.status === 'processing').length,
          totalRevenue: ordersData
            .filter((o: DatabaseOrder) => o.status !== 'cancelled') // Exclude cancelled orders
            .reduce((sum: number, o: DatabaseOrder) => sum + o.total, 0)
        };
        setStats(newStats);

      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    // Debounce the search
    const debounceTimer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Filter helper functions
  const clearFilters = () => {
    setFilters({
      status: 'all',
      paymentStatus: 'all',
      dateRange: { from: '', to: '' },
      amountRange: { min: '', max: '' },
      customerType: 'all'
    });
  };

  const hasActiveFilters = () => {
    return filters.status !== 'all' ||
           filters.paymentStatus !== 'all' ||
           filters.dateRange.from !== '' ||
           filters.dateRange.to !== '' ||
           filters.amountRange.min !== '' ||
           filters.amountRange.max !== '' ||
           filters.customerType !== 'all';
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.paymentStatus !== 'all') count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.amountRange.min || filters.amountRange.max) count++;
    if (filters.customerType !== 'all') count++;
    return count;
  };

  // Comprehensive filtering function
  const getFilteredOrders = () => {
    return orders.filter(order => {
      // Status filter
      if (filters.status !== 'all' && order.status !== filters.status) {
        return false;
      }

      // Payment status filter
      if (filters.paymentStatus !== 'all' && order.payment_status !== filters.paymentStatus) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.from) {
        const orderDate = new Date(order.created_at);
        const fromDate = new Date(filters.dateRange.from);
        if (orderDate < fromDate) return false;
      }
      if (filters.dateRange.to) {
        const orderDate = new Date(order.created_at);
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (orderDate > toDate) return false;
      }

      // Amount range filter
      if (filters.amountRange.min) {
        const minAmount = parseFloat(filters.amountRange.min);
        if (order.total < minAmount) return false;
      }
      if (filters.amountRange.max) {
        const maxAmount = parseFloat(filters.amountRange.max);
        if (order.total > maxAmount) return false;
      }

      // Customer type filter (this would require additional data)
      // if (filters.customerType !== 'all') {
      //   // Would need customer order history to determine new vs returning
      // }

      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    if (filterKey.includes('.')) {
      const [parent, child] = filterKey.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object || {}),
          [child]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterKey]: value
      }));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedOrders.length === 0) return;

    try {
      // Check for shipped orders if trying to cancel
      if (action === 'cancel_orders') {
        const selectedOrdersData = filteredOrders.filter(o => selectedOrders.includes(o.id));
        const shippedOrders = selectedOrdersData.filter(o => o.status === 'shipped' || o.status === 'delivered');
        
        if (shippedOrders.length > 0) {
          toast.error(`Cannot cancel ${shippedOrders.length} order(s) that have been shipped or delivered.`);
          return;
        }
        
        const confirmCancel = window.confirm(
          `Are you sure you want to cancel ${selectedOrders.length} selected order(s)? This action cannot be undone.`
        );
        
        if (!confirmCancel) return;
      }

      // Confirm other bulk actions
      const actionMessages = {
        'mark_paid': 'mark as paid',
        'mark_shipped': 'mark as shipped',
        'start_production': 'start production for',
        'cancel_orders': 'cancel'
      };

      if (action !== 'cancel_orders') {
        const confirmAction = window.confirm(
          `Are you sure you want to ${actionMessages[action as keyof typeof actionMessages]} ${selectedOrders.length} selected order(s)?`
        );
        
        if (!confirmAction) return;
      }

      setLoading(true);

      const response = await fetch('/api/orders/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          orderIds: selectedOrders,
          data: action === 'cancel_orders' ? { reason: 'Bulk cancellation by admin' } : {}
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Bulk action failed');
      }

      // Success feedback
      const successMessages = {
        'mark_paid': 'marked as paid',
        'mark_shipped': 'marked as shipped',
        'start_production': 'moved to production',
        'cancel_orders': 'cancelled'
      };

      toast.success(`${result.data.updatedCount} order(s) ${successMessages[action as keyof typeof successMessages]} successfully`);
      
      // Clear selection and refresh data
      setSelectedOrders([]);
      
      // Refresh orders by triggering search effect
      setSearchTerm(prev => prev);

    } catch (error) {
      console.error('Bulk action error:', error);
      toast.error('Failed to perform bulk action');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'confirmed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'processing':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'ready':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'shipped':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'delivered':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'refunded':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'on-hold':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'failed':
        return 'text-red-700 bg-red-100 border-red-300';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'refunded':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatOrderNumber = (orderId: string) => {
    return `ASH-${orderId.slice(-6).toUpperCase()}`;
  };

  const OrderRow = ({ order }: { order: DatabaseOrder }) => (
    <tr className="hover:bg-luxury-gray-50">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selectedOrders.includes(order.id)}
          onChange={() => handleSelectOrder(order.id)}
          className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
        />
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="font-medium text-luxury-black">
            #{formatOrderNumber(order.id)}
          </div>
          <div className="text-sm text-luxury-gray-600">
            {new Date(order.created_at).toLocaleDateString()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="font-medium text-luxury-black">
            {order.customer ? 
              `${order.customer.first_name || 'Unknown'} ${order.customer.last_name || 'Customer'}` :
              'Unknown Customer'
            }
          </div>
          <div className="text-sm text-luxury-gray-600">
            {order.customer?.email || 'No email provided'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          <span className="ml-1 capitalize">{order.status.replace('-', ' ')}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
          <DollarSign className="h-3 w-3 mr-1" />
          <span className="capitalize">{order.payment_status}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="font-semibold text-luxury-gold">
          {formatPrice(order.total)}
        </div>
        <div className="text-sm text-luxury-gray-600">
          {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="text-sm text-luxury-black">
            Database Order
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Link
            href={`/admin/orders/${order.id}`}
            className="p-1 text-luxury-gray-400 hover:text-blue-600 transition-colors"
            title="View Order"
          >
            <Eye className="h-4 w-4" />
          </Link>
          
          <div className="relative group">
            <button className="p-1 text-luxury-gray-400 hover:text-luxury-black transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-8 hidden group-hover:block bg-white shadow-luxury-hover rounded-lg border border-luxury-gray-100 z-10">
              <div className="py-1 min-w-[120px]">
                <button className="block w-full text-left px-3 py-2 text-sm text-luxury-black hover:bg-luxury-gray-50">
                  Update Status
                </button>
                <button className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-section text-luxury-black">Orders</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-luxury-gray-500">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-section text-luxury-black">Orders</h1>
          <p className="text-body mt-2">
            Manage customer orders and track fulfillment
          </p>
        </div>
        <Link href="/admin/orders/new" className="btn-luxury">
          <Plus className="h-4 w-4 mr-2" />
          Create Order
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-luxury-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-luxury-black">{stats.totalOrders}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-luxury-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold text-luxury-black">{stats.pendingOrders}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-luxury-gray-600">In Production</p>
              <p className="text-2xl font-bold text-luxury-black">{stats.ordersInProduction}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-luxury p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-luxury-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-luxury-gold">{formatPrice(stats.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-luxury p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search and Filters Button */}
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
              />
            </div>

            <button
              onClick={() => {
                if (showFilters) {
                  clearFilters();
                }
                setShowFilters(!showFilters);
              }}
              className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                showFilters || hasActiveFilters()
                  ? 'border-luxury-gold text-luxury-gold bg-luxury-gold bg-opacity-10'
                  : 'border-luxury-gray-300 text-luxury-gray-700 hover:bg-luxury-gray-50'
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-luxury-gold rounded-full">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="min-w-[140px] px-3 py-2 pr-8 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="min-w-[140px] px-3 py-2 pr-8 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold appearance-none bg-white"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              <option value="all">All Payments</option>
              <option value="paid">Paid</option>
              <option value="pending">Payment Pending</option>
              <option value="failed">Payment Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <button className="btn-luxury-ghost whitespace-nowrap">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-luxury-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Order Date From
                </label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => handleFilterChange('dateRange.from', e.target.value)}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Order Date To
                </label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => handleFilterChange('dateRange.to', e.target.value)}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                />
              </div>

              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Min Amount (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.amountRange.min}
                  onChange={(e) => handleFilterChange('amountRange.min', e.target.value)}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Max Amount (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.amountRange.max}
                  onChange={(e) => handleFilterChange('amountRange.max', e.target.value)}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-luxury-gray-100">
              <div className="flex items-center space-x-2">
                {/* Quick Filter Buttons */}
                <button
                  onClick={() => handleFilterChange('status', 'pending')}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
                >
                  Pending Orders
                </button>
                <button
                  onClick={() => handleFilterChange('paymentStatus', 'pending')}
                  className="px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
                >
                  Payment Due
                </button>
                <button
                  onClick={() => handleFilterChange('status', 'processing')}
                  className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
                >
                  In Production
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center px-3 py-1 text-sm text-luxury-gray-600 hover:text-luxury-black transition-colors"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </button>
                )}
                <span className="text-sm text-luxury-gray-600">
                  {filteredOrders.length} of {orders.length} orders
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-luxury-black">
              {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              <button 
                className="btn-luxury-ghost text-sm"
                onClick={() => handleBulkAction('mark_paid')}
              >
                Mark as Paid
              </button>
              <button 
                className="btn-luxury-ghost text-sm"
                onClick={() => handleBulkAction('mark_shipped')}
              >
                Mark as Shipped
              </button>
              <button 
                className="btn-luxury-ghost text-sm"
                onClick={() => handleBulkAction('start_production')}
              >
                Start Production
              </button>
              <button 
                className="btn-luxury-ghost text-sm text-red-600"
                onClick={() => handleBulkAction('cancel_orders')}
              >
                Cancel Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-luxury overflow-hidden">
        <table className="min-w-full divide-y divide-luxury-gray-200">
          <thead className="bg-luxury-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                Shipping
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-luxury-gray-200">
            {filteredOrders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-luxury p-12 text-center">
          <Package className="h-16 w-16 text-luxury-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-luxury-black mb-2">
            No orders found
          </h3>
          <p className="text-luxury-gray-600 mb-6">
            {orders.length === 0 
              ? "No orders have been created yet. Create your first order to get started."
              : "No orders match your current filters. Try adjusting your search criteria."
            }
          </p>
          <Link href="/admin/orders/new" className="btn-luxury">
            <Plus className="h-4 w-4 mr-2" />
            Create First Order
          </Link>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;