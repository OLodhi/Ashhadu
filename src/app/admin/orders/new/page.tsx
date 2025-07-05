'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateUUID } from '@/lib/uuid';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Minus,
  Search,
  User,
  Package,
  MapPin,
  CreditCard
} from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { useProductStore } from '@/store/productStore';
import { Customer, BillingAddress, ShippingAddress, OrderItem } from '@/types/order';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const NewOrderPage = () => {
  const router = useRouter();
  const { createOrder } = useOrderStore();
  const { products } = useProductStore();

  // Order form state
  const [customer, setCustomer] = useState<Partial<Customer>>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    isRegistered: false,
    isGuest: true,
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    notes: '',
    tags: [],
  });

  const [billing, setBilling] = useState<Partial<BillingAddress>>({
    firstName: '',
    lastName: '',
    company: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postcode: '',
    country: 'United Kingdom',
    phone: '',
    email: '',
  });

  const [shipping, setShipping] = useState<Partial<ShippingAddress>>({
    firstName: '',
    lastName: '',
    company: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postcode: '',
    country: 'United Kingdom',
    phone: '',
    email: '',
    instructions: '',
    isCommercial: false,
    isSameAsBilling: true,
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  
  // Shipping and payment
  const [shippingCost, setShippingCost] = useState(5.99);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  // Auto-copy billing to shipping
  const handleBillingChange = (field: string, value: any) => {
    setBilling(prev => ({ ...prev, [field]: value }));
    
    if (shipping.isSameAsBilling) {
      setShipping(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleShippingChange = (field: string, value: any) => {
    setShipping(prev => ({ ...prev, [field]: value }));
    
    if (field === 'isSameAsBilling' && value) {
      setShipping(prev => ({ ...prev, ...billing }));
    }
  };

  // Product search and selection
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setOrderItems(prev => prev.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        id: generateUUID(),
        productId: product.id,
        name: product.name,
        arabicName: product.arabicName,
        sku: product.sku,
        image: product.featuredImage || '',
        unitPrice: product.price,
        quantity: 1,
        totalPrice: product.price,
        customizations: [],
        personalizations: [],
        printStatus: 'pending',
        printTime: product.printTime || 2,
        finishingTime: product.finishingTime || 1,
        materialUsed: product.material.join(', '),
        fulfilled: false,
        qualityChecked: false,
      };
      setOrderItems(prev => [...prev, newItem]);
    }
    
    setShowProductSearch(false);
    setSearchTerm('');
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setOrderItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setOrderItems(prev => prev.map(item =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const vatAmount = subtotal * 0.2; // UK VAT 20%
  const total = subtotal + shippingCost + vatAmount - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!customer.email || !customer.firstName || !customer.lastName) {
      toast.error('Please fill in customer information');
      return;
    }
    
    if (!billing.addressLine1 || !billing.city || !billing.postcode) {
      toast.error('Please fill in billing address');
      return;
    }
    
    if (orderItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    try {
      const orderData = {
        customer: {
          ...customer,
          id: generateUUID(),
        } as Customer,
        billing: billing as BillingAddress,
        shipping: shipping as ShippingAddress,
        items: orderItems,
        subtotal,
        shippingCost,
        taxAmount: vatAmount,
        vatAmount,
        discountAmount,
        total,
        currency: 'GBP' as const,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        fulfillmentStatus: 'pending' as const,
        paymentMethod: {
          type: 'card' as const,
          provider: 'manual',
        },
        paymentProvider: 'manual' as const,
        shippingMethod: {
          id: 'standard',
          name: 'Standard Shipping',
          description: '3-5 business days',
          cost: shippingCost,
          estimatedDays: '3-5',
          trackingIncluded: true,
          insuranceIncluded: false,
          signatureRequired: false,
        },
        notes,
        internalNotes: `Manual order created. Priority: ${priority}`,
        source: 'admin' as const,
        tags: [],
        priority,
        vatNumber: customer.company ? 'GB123456789' : undefined,
        businessOrder: !!customer.company,
        invoiceRequired: !!customer.company,
        customizations: [],
        giftWrapping: false,
        productionStatus: 'not-started' as const,
        estimatedProductionTime: orderItems.reduce((sum, item) => sum + (item.printTime + item.finishingTime) * item.quantity, 0),
      };

      const orderId = createOrder(orderData);
      toast.success('Order created successfully!');
      router.push(`/admin/orders/${orderId}`);
    } catch (error) {
      toast.error('Failed to create order');
      console.error(error);
    }
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
            <h1 className="heading-section text-luxury-black">Create New Order</h1>
            <p className="text-body mt-1">Manually create an order for a customer</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/admin/orders')}
            className="btn-luxury-ghost"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-luxury p-6">
              <div className="flex items-center space-x-2 mb-6">
                <User className="h-5 w-5 text-luxury-gold" />
                <h3 className="text-lg font-semibold text-luxury-black">Customer Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={customer.firstName}
                    onChange={(e) => setCustomer(prev => ({ ...prev, firstName: e.target.value }))}
                    className="input-luxury"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={customer.lastName}
                    onChange={(e) => setCustomer(prev => ({ ...prev, lastName: e.target.value }))}
                    className="input-luxury"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                    className="input-luxury"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    className="input-luxury"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    value={customer.company}
                    onChange={(e) => setCustomer(prev => ({ ...prev, company: e.target.value }))}
                    className="input-luxury"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-luxury p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MapPin className="h-5 w-5 text-luxury-gold" />
                <h3 className="text-lg font-semibold text-luxury-black">Billing Address</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={billing.firstName}
                    onChange={(e) => handleBillingChange('firstName', e.target.value)}
                    className="input-luxury"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={billing.lastName}
                    onChange={(e) => handleBillingChange('lastName', e.target.value)}
                    className="input-luxury"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={billing.addressLine1}
                    onChange={(e) => handleBillingChange('addressLine1', e.target.value)}
                    className="input-luxury"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={billing.addressLine2}
                    onChange={(e) => handleBillingChange('addressLine2', e.target.value)}
                    className="input-luxury"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={billing.city}
                    onChange={(e) => handleBillingChange('city', e.target.value)}
                    className="input-luxury"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    County
                  </label>
                  <input
                    type="text"
                    value={billing.county}
                    onChange={(e) => handleBillingChange('county', e.target.value)}
                    className="input-luxury"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={billing.postcode}
                    onChange={(e) => handleBillingChange('postcode', e.target.value)}
                    className="input-luxury"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Country *
                  </label>
                  <select
                    value={billing.country}
                    onChange={(e) => handleBillingChange('country', e.target.value)}
                    className="input-luxury"
                    required
                  >
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Ireland">Ireland</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-luxury p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-luxury-gold" />
                  <h3 className="text-lg font-semibold text-luxury-black">Shipping Address</h3>
                </div>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={shipping.isSameAsBilling}
                    onChange={(e) => handleShippingChange('isSameAsBilling', e.target.checked)}
                    className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
                  />
                  <span className="text-sm text-luxury-gray-600">Same as billing</span>
                </label>
              </div>
              
              {!shipping.isSameAsBilling && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Repeat billing address fields for shipping */}
                  <div>
                    <label className="block text-sm font-medium text-luxury-black mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shipping.firstName}
                      onChange={(e) => handleShippingChange('firstName', e.target.value)}
                      className="input-luxury"
                      required
                    />
                  </div>
                  {/* Add other shipping fields as needed */}
                </div>
              )}
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Delivery Instructions
                </label>
                <textarea
                  value={shipping.instructions}
                  onChange={(e) => handleShippingChange('instructions', e.target.value)}
                  rows={2}
                  className="textarea-luxury"
                  placeholder="Any special delivery instructions..."
                />
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-luxury p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-luxury-gold" />
                  <h3 className="text-lg font-semibold text-luxury-black">Order Items</h3>
                </div>
                
                <button
                  type="button"
                  onClick={() => setShowProductSearch(true)}
                  className="btn-luxury"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              </div>
              
              {/* Product Search Modal */}
              {showProductSearch && (
                <div className="mb-6 p-4 bg-luxury-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-luxury-black">Search Products</h4>
                    <button
                      type="button"
                      onClick={() => setShowProductSearch(false)}
                      className="text-luxury-gray-400 hover:text-luxury-black"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by product name or SKU..."
                      className="pl-10 pr-4 py-2 w-full border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                    />
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredProducts.slice(0, 10).map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addProductToOrder(product)}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-luxury-gray-100 hover:border-luxury-gold cursor-pointer transition-colors"
                      >
                        <div>
                          <p className="font-medium text-luxury-black">{product.name}</p>
                          <p className="text-sm text-luxury-gray-600">SKU: {product.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-luxury-gold">{formatPrice(product.price)}</p>
                          <p className="text-sm text-luxury-gray-600">Stock: {product.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Order Items List */}
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-luxury-gray-100 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-luxury-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-luxury-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-luxury-black">{item.name}</p>
                        <p className="text-sm text-luxury-gray-600">SKU: {item.sku}</p>
                        <p className="text-sm text-luxury-gold">{formatPrice(item.unitPrice)} each</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-luxury-gray-100 hover:bg-luxury-gray-200 rounded transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-luxury-gray-100 hover:bg-luxury-gray-200 rounded transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-luxury-black">{formatPrice(item.totalPrice)}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {orderItems.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-luxury-gray-400 mx-auto mb-4" />
                    <p className="text-luxury-gray-600">No items added yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-luxury p-6">
              <h3 className="text-lg font-semibold text-luxury-black mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-luxury-gray-600">Subtotal:</span>
                  <span className="text-luxury-black">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-luxury-gray-600">Shipping:</span>
                  <span className="text-luxury-black">{formatPrice(shippingCost)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-luxury-gray-600">VAT (20%):</span>
                  <span className="text-luxury-black">{formatPrice(vatAmount)}</span>
                </div>
                
                {discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-luxury-gray-600">Discount:</span>
                    <span className="text-green-600">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="border-t border-luxury-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-luxury-black">Total:</span>
                    <span className="font-bold text-luxury-gold text-lg">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Settings */}
            <div className="bg-white rounded-lg shadow-luxury p-6">
              <h3 className="text-lg font-semibold text-luxury-black mb-4">Order Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="input-luxury"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Shipping Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(parseFloat(e.target.value) || 0)}
                    className="input-luxury"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Discount Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    className="input-luxury"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Order Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="textarea-luxury"
                    placeholder="Any special notes for this order..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                className="w-full btn-luxury"
                disabled={orderItems.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Create Order
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/admin/orders')}
                className="w-full btn-luxury-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewOrderPage;