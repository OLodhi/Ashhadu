'use client';

import React, { useState } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const OrderDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const {
    getOrder,
    updateOrderStatus,
    updatePaymentStatus,
    markAsShipped,
    markAsDelivered,
    cancelOrder,
    refundOrder,
    addOrderNote,
  } = useOrderStore();

  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  const order = getOrder(id as string);

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

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    addOrderNote(order.id, newNote, isInternalNote);
    setNewNote('');
    setShowAddNote(false);
    toast.success('Note added successfully');
  };

  const handleMarkAsShipped = () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }
    
    markAsShipped(order.id, trackingNumber, 'Standard Shipping');
    setTrackingNumber('');
    toast.success('Order marked as shipped');
  };

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
          <button className="btn-luxury-ghost">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button className="btn-luxury-ghost">
            <MoreHorizontal className="h-4 w-4" />
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
                      <Package className="h-8 w-8 text-luxury-gold" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-luxury-black">{item.name}</h4>
                      {item.arabicName && (
                        <p className="text-sm text-luxury-gray-600 arabic-text">{item.arabicName}</p>
                      )}
                      <p className="text-sm text-luxury-gray-600">SKU: {item.sku}</p>
                      {item.customizations.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-medium text-luxury-gray-700">Customizations:</p>
                          {item.customizations.map((custom, index) => (
                            <p key={index} className="text-xs text-luxury-gray-600">
                              {custom.name}: {custom.value}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-luxury-black">Qty: {item.quantity}</p>
                      <p className="font-semibold text-luxury-gold">{formatPrice(item.totalPrice)}</p>
                      <div className={`inline-flex items-center px-2 py-1 text-xs rounded-full mt-1 ${
                        item.printStatus === 'completed' ? 'bg-green-50 text-green-600' :
                        item.printStatus === 'printing' ? 'bg-blue-50 text-blue-600' :
                        'bg-gray-50 text-gray-600'
                      }`}>
                        {item.printStatus}
                      </div>
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
                    <span className="text-luxury-black">{formatPrice(order.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-luxury-gray-600">VAT (20%):</span>
                    <span className="text-luxury-black">{formatPrice(order.vatAmount)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-luxury-gray-600">Discount:</span>
                      <span className="text-green-600">-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
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

                {order.paidAt && (
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-luxury-black">Payment received</p>
                      <p className="text-sm text-luxury-gray-600">
                        {new Date(order.paidAt).toLocaleString()}
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
                      {order.trackingNumber && (
                        <p className="text-sm text-luxury-gray-600">
                          Tracking: {order.trackingNumber}
                        </p>
                      )}
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
                  <div className="flex items-center justify-between mt-3">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={(e) => setIsInternalNote(e.target.checked)}
                        className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
                      />
                      <span className="text-sm text-luxury-gray-600">Internal note (not visible to customer)</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setShowAddNote(false)}
                        className="btn-luxury-ghost text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddNote}
                        className="btn-luxury text-sm"
                      >
                        Add Note
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {order.notes ? (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">{order.notes}</p>
                  </div>
                ) : (
                  <p className="text-luxury-gray-500 text-sm">No customer notes</p>
                )}

                {order.internalNotes && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xs font-medium text-yellow-700 mb-1">Internal Notes:</p>
                    <p className="text-sm text-yellow-800">{order.internalNotes}</p>
                  </div>
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
                  onClick={() => updatePaymentStatus(order.id, 'paid')}
                  className="w-full btn-luxury text-sm"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Mark as Paid
                </button>
              )}

              {order.status === 'confirmed' && order.productionStatus === 'not-started' && (
                <button
                  onClick={() => updateOrderStatus(order.id, 'processing')}
                  className="w-full btn-luxury text-sm"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Start Production
                </button>
              )}

              {order.status === 'ready' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Tracking number"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold text-sm"
                  />
                  <button
                    onClick={handleMarkAsShipped}
                    className="w-full btn-luxury text-sm"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Mark as Shipped
                  </button>
                </div>
              )}

              {order.status === 'shipped' && (
                <button
                  onClick={() => markAsDelivered(order.id)}
                  className="w-full btn-luxury text-sm"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </button>
              )}

              <button
                onClick={() => {
                  const reason = prompt('Cancellation reason:');
                  if (reason) {
                    cancelOrder(order.id, reason);
                    toast.success('Order cancelled');
                  }
                }}
                className="w-full btn-luxury-ghost text-sm text-red-600"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Cancel Order
              </button>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-luxury p-6">
            <h3 className="text-lg font-semibold text-luxury-black mb-4">Customer</h3>
            <div className="space-y-3">
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

              <div className="pt-3 border-t border-luxury-gray-100">
                <p className="text-sm font-medium text-luxury-black mb-1">Order History</p>
                <p className="text-sm text-luxury-gray-600">
                  {order.customer.totalOrders} orders • {formatPrice(order.customer.totalSpent)} total
                </p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-luxury p-6">
            <h3 className="text-lg font-semibold text-luxury-black mb-4">Shipping Address</h3>
            <div className="space-y-2">
              <p className="font-medium text-luxury-black">
                {order.shipping.firstName} {order.shipping.lastName}
              </p>
              {order.shipping.company && (
                <p className="text-sm text-luxury-gray-600">{order.shipping.company}</p>
              )}
              <div className="text-sm text-luxury-gray-600">
                <p>{order.shipping.addressLine1}</p>
                {order.shipping.addressLine2 && <p>{order.shipping.addressLine2}</p>}
                <p>
                  {order.shipping.city}, {order.shipping.county} {order.shipping.postcode}
                </p>
                <p>{order.shipping.country}</p>
              </div>
              {order.shipping.instructions && (
                <div className="pt-2 border-t border-luxury-gray-100">
                  <p className="text-xs font-medium text-luxury-gray-700">Delivery Instructions:</p>
                  <p className="text-sm text-luxury-gray-600">{order.shipping.instructions}</p>
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
                <span className="text-sm text-luxury-black">{order.paymentMethod.type}</span>
              </div>
              {order.transactionId && (
                <div className="flex justify-between">
                  <span className="text-sm text-luxury-gray-600">Transaction ID:</span>
                  <span className="text-sm text-luxury-black font-mono">{order.transactionId}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;