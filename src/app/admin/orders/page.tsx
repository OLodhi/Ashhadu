'use client';

import React, { useState } from 'react';
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
  MapPin
} from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { Order, OrderStatus, PaymentStatus, FulfillmentStatus } from '@/types/order';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

const OrdersPage = () => {
  const {
    getFilteredOrders,
    getOrderStats,
    setFilters,
    filters,
    updateOrderStatus,
    markAsPaid,
    markAsShipped,
    cancelOrder,
  } = useOrderStore();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredOrders = getFilteredOrders();
  const stats = getOrderStats();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters({ search: term });
  };

  const handleStatusFilter = (status: OrderStatus | '') => {
    if (status === '') {
      setFilters({ status: undefined });
    } else {
      setFilters({ status: [status] });
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

  const getStatusColor = (status: OrderStatus) => {
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

  const getPaymentStatusColor = (status: PaymentStatus) => {
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

  const getStatusIcon = (status: OrderStatus) => {
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

  const OrderRow = ({ order }: { order: Order }) => (
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
            #{order.orderNumber}
          </div>
          <div className="text-sm text-luxury-gray-600">
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="font-medium text-luxury-black">
            {order.customer.firstName} {order.customer.lastName}
          </div>
          <div className="text-sm text-luxury-gray-600">
            {order.customer.email}
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
        <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
          <DollarSign className="h-3 w-3 mr-1" />
          <span className="capitalize">{order.paymentStatus}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="font-semibold text-luxury-gold">
          {formatPrice(order.total)}
        </div>
        <div className="text-sm text-luxury-gray-600">
          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="text-sm text-luxury-black">
            {order.shipping.city}, {order.shipping.country}
          </div>
          {order.trackingNumber && (
            <div className="text-xs text-luxury-gray-600">
              Tracking: {order.trackingNumber}
            </div>
          )}
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
          
          {order.status === 'pending' && order.paymentStatus === 'pending' && (
            <button
              onClick={() => markAsPaid(order.id, 'manual', 'MANUAL-PAYMENT')}
              className="p-1 text-luxury-gray-400 hover:text-green-600 transition-colors"
              title="Mark as Paid"
            >
              <DollarSign className="h-4 w-4" />
            </button>
          )}
          
          {order.status === 'ready' && (
            <button
              onClick={() => markAsShipped(order.id, 'TRK' + Date.now(), 'Standard Shipping')}
              className="p-1 text-luxury-gray-400 hover:text-blue-600 transition-colors"
              title="Mark as Shipped"
            >
              <Truck className="h-4 w-4" />
            </button>
          )}
          
          <div className="relative group">
            <button className="p-1 text-luxury-gray-400 hover:text-luxury-black transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-8 hidden group-hover:block bg-white shadow-luxury-hover rounded-lg border border-luxury-gray-100 z-10">
              <div className="py-1 min-w-[120px]">
                <button
                  onClick={() => updateOrderStatus(order.id, 'confirmed')}
                  className="block w-full text-left px-3 py-2 text-sm text-luxury-black hover:bg-luxury-gray-50"
                >
                  Confirm Order
                </button>
                <button
                  onClick={() => cancelOrder(order.id, 'Admin cancellation')}
                  className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );

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
          {/* Search */}
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

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              onChange={(e) => handleStatusFilter(e.target.value as OrderStatus | '')}
              value={filters.status?.[0] || ''}
              className="px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-luxury-ghost"
            >
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>

            <button className="btn-luxury-ghost">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Additional Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-luxury-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Payment Status
                </label>
                <select className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold">
                  <option value="">All Payment Status</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Date Range
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Order Amount
                </label>
                <select className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold">
                  <option value="">Any Amount</option>
                  <option value="0-50">£0 - £50</option>
                  <option value="50-100">£50 - £100</option>
                  <option value="100-200">£100 - £200</option>
                  <option value="200+">£200+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Customer Type
                </label>
                <select className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold">
                  <option value="">All Customers</option>
                  <option value="registered">Registered</option>
                  <option value="guest">Guest</option>
                  <option value="business">Business</option>
                </select>
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
              <button className="btn-luxury-ghost text-sm">
                Mark as Paid
              </button>
              <button className="btn-luxury-ghost text-sm">
                Mark as Shipped
              </button>
              <button className="btn-luxury-ghost text-sm">
                Send Update
              </button>
              <button className="btn-luxury-ghost text-sm text-red-600">
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
      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-lg shadow-luxury p-12 text-center">
          <Package className="h-16 w-16 text-luxury-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-luxury-black mb-2">
            No orders found
          </h3>
          <p className="text-luxury-gray-600 mb-6">
            No orders match your current filters. Try adjusting your search criteria.
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