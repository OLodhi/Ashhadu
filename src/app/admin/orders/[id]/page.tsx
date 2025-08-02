'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Edit,
  Printer,
  Mail,
  Phone,
  MapPin,
  Package,
  Truck,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  Download,
  Plus,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface DatabaseOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  currency: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  billingAddress?: {
    id: string;
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
  };
  shippingAddress?: {
    id: string;
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
  };
  items: Array<{
    id: string;
    productId: string;
    name: string;
    arabicName?: string;
    sku: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
    islamicCategory?: string;
  }>;
}

const OrderDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<DatabaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Fetch order data from database
  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${id}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch order');
      }

      setOrder(result.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update order');
      }

      // Update local state
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const updatePaymentStatus = async (newStatus: string) => {
    if (!order) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus: newStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update payment');
      }

      // Update local state
      setOrder(prev => prev ? { ...prev, paymentStatus: newStatus } : null);
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const markAsShipped = async () => {
    if (!order || !trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'shipped',
          shippedAt: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to mark as shipped');
      }

      // Update local state
      setOrder(prev => prev ? { 
        ...prev, 
        status: 'shipped',
        shippedAt: new Date().toISOString()
      } : null);
      
      setTrackingNumber('');
      toast.success('Order marked as shipped');
    } catch (error) {
      console.error('Error marking as shipped:', error);
      toast.error('Failed to mark as shipped');
    } finally {
      setUpdating(false);
    }
  };

  const markAsDelivered = async () => {
    if (!order) return;
    
    try {
      setUpdating(true);
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'delivered',
          deliveredAt: new Date().toISOString()
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to mark as delivered');
      }

      // Update local state
      setOrder(prev => prev ? { 
        ...prev, 
        status: 'delivered',
        deliveredAt: new Date().toISOString()
      } : null);
      
      toast.success('Order marked as delivered');
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast.error('Failed to mark as delivered');
    } finally {
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!order || !newNote.trim()) return;
    
    try {
      setUpdating(true);
      const currentNotes = order.notes || '';
      const timestamp = new Date().toLocaleString();
      const noteWithTimestamp = `[${timestamp}] ${newNote}`;
      const updatedNotes = currentNotes ? `${currentNotes}\n${noteWithTimestamp}` : noteWithTimestamp;
      
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: updatedNotes }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to add note');
      }

      // Update local state
      setOrder(prev => prev ? { ...prev, notes: updatedNotes } : null);
      setNewNote('');
      setShowAddNote(false);
      toast.success('Note added successfully');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setUpdating(false);
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
      case 'shipped':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'delivered':
        return 'text-green-700 bg-green-100 border-green-300';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-luxury-gold mx-auto mb-4 animate-spin" />
          <p className="text-luxury-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="h-16 w-16 text-luxury-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-luxury-black mb-2">Order not found</h2>
          <p className="text-luxury-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/admin/orders')}
            className="btn-luxury"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="p-2 text-luxury-gray-600 hover:text-luxury-black transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="heading-section text-luxury-black">
              Order #{order.orderNumber}
            </h1>
            <p className="text-body mt-1">
              Created on {new Date(order.createdAt).toLocaleDateString()} at{' '}
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border ${getStatusColor(order.status)}`}>
            <span className="capitalize">{order.status.replace('-', ' ')}</span>
          </div>
          <button 
            onClick={fetchOrder}
            className="btn-luxury-ghost"
            disabled={updating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="btn-luxury-ghost">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-luxury">
            <div className="px-6 py-4 border-b border-luxury-gray-100">
              <h3 className="text-lg font-semibold text-luxury-black">Order Items</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-luxury-gray-100 rounded-lg">
                    <div className="w-16 h-16 bg-luxury-gray-100 rounded-lg flex items-center justify-center">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-8 w-8 text-luxury-gold" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-luxury-black">{item.name}</h4>
                      {item.arabicName && (
                        <p className="text-sm text-luxury-gray-600 arabic-text">{item.arabicName}</p>
                      )}
                      <p className="text-sm text-luxury-gray-600">SKU: {item.sku}</p>
                      {item.islamicCategory && (
                        <p className="text-xs text-luxury-gold">{item.islamicCategory}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-luxury-black">Qty: {item.quantity}</p>
                      <p className="text-sm text-luxury-gray-600">{formatPrice(item.price)} each</p>
                      <p className="font-semibold text-luxury-gold">{formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="mt-6 pt-6 border-t border-luxury-gray-100">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-luxury-gray-600">Subtotal:</span>
                    <span className="text-luxury-black">{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-luxury-gray-600">Shipping:</span>
                    <span className="text-luxury-black">{formatPrice(order.shippingAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-luxury-gray-600">VAT (20%):</span>
                    <span className="text-luxury-black">{formatPrice(order.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-luxury-gray-100">
                    <span className="font-semibold text-luxury-black">Total:</span>
                    <span className="font-bold text-luxury-gold text-lg">{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="bg-white rounded-lg shadow-luxury">
            <div className="px-6 py-4 border-b border-luxury-gray-100">
              <h3 className="text-lg font-semibold text-luxury-black">Order Timeline</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-luxury-black">Order created</p>
                    <p className="text-sm text-luxury-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.paymentStatus === 'paid' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-luxury-black">Payment received</p>
                      <p className="text-sm text-luxury-gray-600">
                        {order.paymentMethod} payment processed
                      </p>
                    </div>
                  </div>
                )}

                {order.shippedAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-luxury-black">Order shipped</p>
                      <p className="text-sm text-luxury-gray-600">
                        {new Date(order.shippedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {order.deliveredAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-luxury-black">Order delivered</p>
                      <p className="text-sm text-luxury-gray-600">
                        {new Date(order.deliveredAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-luxury">
            <div className="px-6 py-4 border-b border-luxury-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-luxury-black">Notes</h3>
              <button
                onClick={() => setShowAddNote(true)}
                className="btn-luxury-ghost"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </button>
            </div>
            <div className="p-6">
              {showAddNote && (
                <div className="mb-6 p-4 bg-luxury-gray-50 rounded-lg">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    rows={3}
                    className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold resize-none"
                  />
                  <div className="flex items-center justify-end mt-3 space-x-2">
                    <button
                      onClick={() => setShowAddNote(false)}
                      className="btn-luxury-ghost text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addNote}
                      className="btn-luxury text-sm"
                      disabled={updating}
                    >
                      Add Note
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {order.notes ? (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800 whitespace-pre-wrap">{order.notes}</div>
                  </div>
                ) : (
                  <p className="text-luxury-gray-500 text-sm">No notes added yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Actions */}
          <div className="bg-white rounded-lg shadow-luxury p-6">
            <h3 className="text-lg font-semibold text-luxury-black mb-4">Order Actions</h3>
            <div className="space-y-3">
              {order.status === 'pending' && order.paymentStatus === 'pending' && (
                <button
                  onClick={() => updatePaymentStatus('paid')}
                  className="w-full btn-luxury text-sm"
                  disabled={updating}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Mark as Paid
                </button>
              )}

              {order.status === 'pending' && order.paymentStatus === 'paid' && (
                <button
                  onClick={() => updateOrderStatus('processing')}
                  className="w-full btn-luxury text-sm"
                  disabled={updating}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Start Processing
                </button>
              )}

              {order.status === 'processing' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold text-sm"
                  />
                  <button
                    onClick={markAsShipped}
                    className="w-full btn-luxury text-sm"
                    disabled={updating}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Mark as Shipped
                  </button>
                </div>
              )}

              {order.status === 'shipped' && (
                <button
                  onClick={markAsDelivered}
                  className="w-full btn-luxury text-sm"
                  disabled={updating}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </button>
              )}

              {/* Only show cancel button if order hasn't been shipped */}
              {order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    const confirmCancel = window.confirm(
                      'Are you sure you want to cancel this order? This action cannot be undone.'
                    );
                    if (confirmCancel) {
                      updateOrderStatus('cancelled');
                    }
                  }}
                  className="w-full btn-luxury-ghost text-sm text-red-600 flex items-center justify-center"
                  disabled={updating}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Cancel Order
                </button>
              )}
              
              {/* Show cancellation notice for shipped orders */}
              {(order.status === 'shipped' || order.status === 'delivered') && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <AlertCircle className="h-4 w-4 inline mr-2" />
                    Order cannot be cancelled after shipping. Please contact customer for returns.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-luxury p-6">
            <h3 className="text-lg font-semibold text-luxury-black mb-4">Customer</h3>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-luxury-black">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <p className="text-sm text-luxury-gray-600">{order.customer.email}</p>
              </div>

              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-luxury-gray-400" />
                <a
                  href={`mailto:${order.customer.email}`}
                  className="text-sm text-luxury-gold hover:underline"
                >
                  Send Email
                </a>
              </div>

              {order.customer.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-luxury-gray-400" />
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-sm text-luxury-gold hover:underline"
                  >
                    {order.customer.phone}
                  </a>
                </div>
              )}
              
              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="pt-4 border-t border-luxury-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-luxury-gray-400" />
                    <span className="text-sm font-medium text-luxury-black">Shipping Address</span>
                  </div>
                  <div className="text-sm text-luxury-gray-600 space-y-1">
                    <p className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    {order.shippingAddress.company && (
                      <p>{order.shippingAddress.company}</p>
                    )}
                    <p>{order.shippingAddress.addressLine1}</p>
                    {order.shippingAddress.addressLine2 && (
                      <p>{order.shippingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.shippingAddress.city}
                      {order.shippingAddress.county && `, ${order.shippingAddress.county}`}
                    </p>
                    <p>{order.shippingAddress.postcode}</p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && (
                      <p className="pt-1">
                        <span className="text-luxury-gray-500">Phone: </span>
                        {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Billing Address (if different from shipping) */}
              {order.billingAddress && 
               order.billingAddress.id !== order.shippingAddress?.id && (
                <div className="pt-4 border-t border-luxury-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-luxury-gray-400" />
                    <span className="text-sm font-medium text-luxury-black">Billing Address</span>
                  </div>
                  <div className="text-sm text-luxury-gray-600 space-y-1">
                    <p className="font-medium">
                      {order.billingAddress.firstName} {order.billingAddress.lastName}
                    </p>
                    {order.billingAddress.company && (
                      <p>{order.billingAddress.company}</p>
                    )}
                    <p>{order.billingAddress.addressLine1}</p>
                    {order.billingAddress.addressLine2 && (
                      <p>{order.billingAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.billingAddress.city}
                      {order.billingAddress.county && `, ${order.billingAddress.county}`}
                    </p>
                    <p>{order.billingAddress.postcode}</p>
                    <p>{order.billingAddress.country}</p>
                    {order.billingAddress.phone && (
                      <p className="pt-1">
                        <span className="text-luxury-gray-500">Phone: </span>
                        {order.billingAddress.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-luxury p-6">
            <h3 className="text-lg font-semibold text-luxury-black mb-4">Payment</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-luxury-gray-600">Status:</span>
                <span className={`text-sm font-medium ${
                  order.paymentStatus === 'paid' ? 'text-green-600' :
                  order.paymentStatus === 'pending' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-luxury-gray-600">Method:</span>
                <span className="text-sm text-luxury-black">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-luxury-gray-600">Currency:</span>
                <span className="text-sm text-luxury-black">{order.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;