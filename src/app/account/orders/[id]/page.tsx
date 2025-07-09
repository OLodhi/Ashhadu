'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  ArrowLeft,
  Download,
  Truck,
  MapPin,
  CreditCard,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Building,
  User,
  FileText,
  Star
} from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase-client';
import { Order, ORDER_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '@/types/order';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const { user, customer, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && customer && !authLoading && orderId) {
      loadOrder();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, customer, authLoading, orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);

      if (!customer?.id) {
        console.warn('No customer ID available for loading order');
        return;
      }

      const { data, error } = await supabase
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
              islamic_category,
              arabic_name
            )
          )
        `)
        .eq('id', orderId)
        .eq('customer_id', customer.id)
        .single();

      if (error) {
        console.error('Error loading order:', error);
        if (error.code === 'PGRST116') {
          toast.error('Order not found');
          router.push('/account/orders');
        } else {
          toast.error('Failed to load order details');
        }
        return;
      }

      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order details');
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getOrderTimeline = (order: Order) => {
    const timeline = [
      {
        status: 'pending',
        label: 'Order Placed',
        date: order.created_at,
        completed: true,
        description: 'Your order has been received and is being processed'
      },
      {
        status: 'processing',
        label: 'Processing',
        date: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? order.updated_at : null,
        completed: ['processing', 'shipped', 'delivered'].includes(order.status),
        description: 'Your Islamic art pieces are being prepared'
      },
      {
        status: 'shipped',
        label: 'Shipped',
        date: order.shipped_at,
        completed: ['shipped', 'delivered'].includes(order.status),
        description: 'Your order is on its way to you'
      },
      {
        status: 'delivered',
        label: 'Delivered',
        date: order.delivered_at,
        completed: order.status === 'delivered',
        description: 'Your order has been successfully delivered'
      }
    ];

    return timeline;
  };

  const downloadInvoice = () => {
    // TODO: Implement invoice download
    toast.success('Invoice download functionality coming soon!');
  };

  const trackOrder = () => {
    // TODO: Implement order tracking
    toast.success('Order tracking functionality coming soon!');
  };

  if (authLoading || loading) {
    return (
      <AccountLayout 
        title="Order Details" 
        description="Loading order information..."
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
        title="Order Details" 
        description="Please log in to view order details"
      >
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Authentication Required</h3>
          <p className="mt-2 text-gray-600">Please log in to view your order details.</p>
        </div>
      </AccountLayout>
    );
  }

  if (!order) {
    return (
      <AccountLayout 
        title="Order Details" 
        description="Order not found"
      >
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Order Not Found</h3>
          <p className="mt-2 text-gray-600">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link
            href="/account/orders"
            className="mt-4 inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </div>
      </AccountLayout>
    );
  }

  const timeline = getOrderTimeline(order);

  return (
    <AccountLayout 
      title={`Order #${order.id.slice(-8)}`}
      description={`Placed on ${formatShortDate(order.created_at)}`}
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/account/orders"
            className="inline-flex items-center text-luxury-gold hover:text-yellow-600 font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>

          <div className="flex items-center space-x-3">
            {order.status === 'shipped' && (
              <button
                onClick={trackOrder}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Truck className="mr-2 h-4 w-4" />
                Track Order
              </button>
            )}
            <button
              onClick={downloadInvoice}
              className="inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Invoice
            </button>
          </div>
        </div>

        {/* Order Status Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                {getStatusIcon(order.status)}
              </div>
              <div>
                <h2 className="text-2xl font-playfair font-bold text-gray-900">
                  Order #{order.id.slice(-8)}
                </h2>
                <p className="text-gray-600">
                  Placed on {formatDate(order.created_at)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(order.total, order.currency)}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  ORDER_STATUS_CONFIG[order.status].color
                }`}>
                  {ORDER_STATUS_CONFIG[order.status].label}
                </span>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                  PAYMENT_STATUS_CONFIG[order.payment_status].color
                }`}>
                  {PAYMENT_STATUS_CONFIG[order.payment_status].label}
                </span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Timeline</h3>
            <div className="space-y-4">
              {timeline.map((step, index) => (
                <div key={step.status} className="flex items-start space-x-4">
                  <div className={`p-2 rounded-full ${
                    step.completed ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`font-medium ${
                        step.completed ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-sm text-gray-500">
                          {formatShortDate(step.date)}
                        </p>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Order Items</h3>
              <div className="space-y-6">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg">
                    {item.product?.featured_image && (
                      <img
                        src={item.product.featured_image}
                        alt={item.product_name}
                        className="h-20 w-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        {item.product_name}
                      </h4>
                      {item.product?.arabic_name && (
                        <p className="text-sm text-gray-600 font-amiri">
                          {item.product.arabic_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        SKU: {item.product_sku}
                      </p>
                      {item.product?.islamic_category && (
                        <p className="text-sm text-luxury-gold">
                          {item.product.islamic_category}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × {formatCurrency(item.price, order.currency)}
                        </p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.total, order.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="border-t mt-6 pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>{formatCurrency(order.subtotal, order.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (VAT):</span>
                    <span>{formatCurrency(order.tax_amount, order.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span>{formatCurrency(order.shipping_amount, order.currency)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total, order.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">
                    {customer?.first_name} {customer?.last_name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{user?.email}</span>
                </div>
                {customer?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900">{customer.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.payment_method || 'Card Payment'}
                    </p>
                    <p className={`text-xs ${
                      PAYMENT_STATUS_CONFIG[order.payment_status].color.replace('bg-', 'text-').replace('-100', '-800')
                    }`}>
                      {PAYMENT_STATUS_CONFIG[order.payment_status].label}
                    </p>
                  </div>
                </div>
                {order.stripe_payment_intent_id && (
                  <div className="text-xs text-gray-500">
                    Payment ID: {order.stripe_payment_intent_id.slice(-8)}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {order.notes && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Notes</h3>
                <div className="flex items-start space-x-3">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-700">{order.notes}</p>
                </div>
              </div>
            )}

            {/* Support */}
            <div className="bg-luxury-gold/10 rounded-xl border border-luxury-gold/20 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your order, please don't hesitate to contact us.
              </p>
              <div className="space-y-3">
                <Link
                  href="/contact"
                  className="block w-full text-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Contact Support
                </Link>
                <Link
                  href="/shop"
                  className="block w-full text-center px-4 py-2 border border-luxury-gold text-luxury-gold font-medium rounded-lg hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountLayout>
  );
}