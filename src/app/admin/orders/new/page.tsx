'use client';

import React, { useState, useEffect } from 'react';
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
  CreditCard,
  Users,
  ChevronDown,
  Check
} from 'lucide-react';
// import { useOrderStore } from '@/store/orderStore'; // Replaced with database API
import { Customer, BillingAddress, ShippingAddress, OrderItem } from '@/types/order';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface DatabaseCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  marketingConsent: boolean;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
  addressCount: number;
  paymentMethodCount: number;
  orderCount: number;
}

const NewOrderPage = () => {
  const router = useRouter();
  // const { createOrder } = useOrderStore(); // Replaced with database API

  // Customer selection state
  const [existingCustomers, setExistingCustomers] = useState<DatabaseCustomer[]>([]);
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerSelectionMode, setCustomerSelectionMode] = useState<'existing' | 'manual'>('manual');
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

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

  const [billing, setBilling] = useState<Partial<BillingAddress & { isSameAsShipping?: boolean }>>({
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
    isSameAsShipping: true,
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
    isSameAsBilling: false,
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  
  // Fetch existing customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomers(true);
        const response = await fetch('/api/customers');
        if (response.ok) {
          const data = await response.json();
          setExistingCustomers(data.data || []);
        } else {
          console.error('Failed to fetch customers');
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        } else {
          console.error('Failed to fetch products');
          toast.error('Failed to load products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Error loading products');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter customers based on search term
  const filteredCustomers = existingCustomers.filter(customer =>
    customer.fullName.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  // Fetch customer addresses
  const fetchCustomerAddresses = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/addresses`);
      
      if (response.ok) {
        const data = await response.json();
        return data.data || [];
      } else {
        console.error('Failed to fetch customer addresses:', response.status);
      }
    } catch (error) {
      console.error('Error fetching customer addresses:', error);
    }
    return [];
  };

  // Handle customer selection
  const handleCustomerSelect = async (customer: DatabaseCustomer) => {
    setSelectedCustomerId(customer.id);
    setCustomerSearchTerm(customer.fullName);
    setShowCustomerDropdown(false);
    
    // Auto-fill customer information
    setCustomer(prev => ({
      ...prev,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone || '',
      isRegistered: true,
      isGuest: false,
      totalOrders: customer.orderCount,
      totalSpent: 0, // We'd need to calculate this from orders
      averageOrderValue: 0, // We'd need to calculate this from orders
    }));

    // Auto-fill billing address with customer name
    setBilling(prev => ({
      ...prev,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone || prev.phone,
    }));

    // Fetch and auto-fill shipping address if available
    const addresses = await fetchCustomerAddresses(customer.id);
    
    if (addresses.length > 0) {
      // Find default shipping address or use the first one
      const defaultAddress = addresses.find((addr: any) => addr.isDefault && addr.type === 'shipping') || 
                           addresses.find((addr: any) => addr.type === 'shipping') ||
                           addresses[0];

      if (defaultAddress) {
        setShipping(prev => ({
          ...prev,
          firstName: defaultAddress.firstName || customer.firstName,
          lastName: defaultAddress.lastName || customer.lastName,
          company: defaultAddress.company || '',
          addressLine1: defaultAddress.addressLine1 || '',
          addressLine2: defaultAddress.addressLine2 || '',
          city: defaultAddress.city || '',
          county: defaultAddress.county || '',
          postcode: defaultAddress.postcode || '',
          country: defaultAddress.country || 'United Kingdom',
          phone: defaultAddress.phone || customer.phone || '',
          email: customer.email, // Use customer email since addresses don't store email
        }));

        toast.success(`Selected customer: ${customer.fullName} (address auto-filled)`);
      } else {
        toast.success(`Selected customer: ${customer.fullName}`);
      }
    } else {
      toast.success(`Selected customer: ${customer.fullName}`);
    }
  };

  // Clear customer selection and reset to manual mode
  const clearCustomerSelection = () => {
    setSelectedCustomerId(null);
    setCustomerSearchTerm('');
    setCustomerSelectionMode('manual');
    
    // Reset customer form
    setCustomer({
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

    // Reset billing address
    setBilling(prev => ({
      ...prev,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    }));
  };

  // Shipping and payment
  const [shippingCost, setShippingCost] = useState(5.99);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');

  // Auto-copy shipping to billing
  const handleShippingChange = (field: string, value: any) => {
    setShipping(prev => ({ ...prev, [field]: value }));
    
    if (billing.isSameAsShipping) {
      setBilling(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBillingChange = (field: string, value: any) => {
    setBilling(prev => ({ ...prev, [field]: value }));
    
    if (field === 'isSameAsShipping' && value) {
      setBilling(prev => ({ ...prev, ...shipping }));
    }
  };

  // Product search and selection
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addProductToOrder = (product: Product) => {
    console.log('Adding product to order:', product); // Debug log
    
    const existingItem = orderItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setOrderItems(prev => prev.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      const productPrice = product.price || product.regularPrice || 0;
      console.log('Product price resolved to:', productPrice); // Debug log
      
      const newItem: OrderItem = {
        id: generateUUID(),
        order_id: '', // Will be set when order is created
        product_id: product.id,
        quantity: 1,
        price: productPrice,
        total: productPrice,
        product_name: product.name,
        product_sku: product.sku,
        created_at: new Date().toISOString(),
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
          ? { ...item, quantity, total: quantity * item.price }
          : item
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setOrderItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = subtotal * 0.2; // UK VAT 20%
  const total = subtotal + shippingCost + vatAmount - discountAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!customer.email || !customer.firstName || !customer.lastName) {
      toast.error('Please fill in customer information');
      return;
    }
    
    if (!shipping.addressLine1 || !shipping.city || !shipping.postcode) {
      toast.error('Please fill in shipping address');
      return;
    }
    
    if (orderItems.length === 0) {
      toast.error('Please add at least one product');
      return;
    }

    try {
      // Create the order data for the API
      const orderData = {
        customer: {
          id: selectedCustomerId,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phone: customer.phone,
        },
        items: orderItems.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          name: item.product_name,
          sku: item.product_sku || `ITEM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`
        })),
        subtotal,
        taxAmount: vatAmount,
        shippingAmount: shippingCost,
        total,
        currency: 'GBP',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: {
          type: 'manual'
        },
        notes: notes ? `${notes}\n\nShipping Address:\n${shipping.firstName} ${shipping.lastName}\n${shipping.addressLine1}\n${shipping.addressLine2 ? shipping.addressLine2 + '\n' : ''}${shipping.city}, ${shipping.county}\n${shipping.postcode}\n${shipping.country}\n\nBilling Address:\n${billing.isSameAsShipping ? 'Same as shipping' : `${billing.firstName} ${billing.lastName}\n${billing.addressLine1}\n${billing.addressLine2 ? billing.addressLine2 + '\n' : ''}${billing.city}, ${billing.county}\n${billing.postcode}\n${billing.country}`}` : `Shipping Address:\n${shipping.firstName} ${shipping.lastName}\n${shipping.addressLine1}\n${shipping.addressLine2 ? shipping.addressLine2 + '\n' : ''}${shipping.city}, ${shipping.county}\n${shipping.postcode}\n${shipping.country}\n\nBilling Address:\n${billing.isSameAsShipping ? 'Same as shipping' : `${billing.firstName} ${billing.lastName}\n${billing.addressLine1}\n${billing.addressLine2 ? billing.addressLine2 + '\n' : ''}${billing.city}, ${billing.county}\n${billing.postcode}\n${billing.country}`}`
      };

      // Send to database API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create order');
      }

      toast.success(`Order ${result.data.orderNumber} created successfully!`);
      router.push(`/admin/orders/${result.data.orderId}`);
    } catch (error) {
      toast.error('Failed to create order');
      console.error('Order creation error:', error);
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

              {/* Customer Selection Mode Toggle */}
              <div className="mb-6 p-4 bg-luxury-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-luxury-black">Customer Source</h4>
                  {selectedCustomerId && (
                    <button
                      type="button"
                      onClick={clearCustomerSelection}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear Selection
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-4 mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="customerMode"
                      value="existing"
                      checked={customerSelectionMode === 'existing'}
                      onChange={(e) => setCustomerSelectionMode('existing')}
                      className="text-luxury-gold focus:ring-luxury-gold"
                    />
                    <span className="text-sm font-medium text-luxury-black">Select Existing Customer</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="customerMode"
                      value="manual"
                      checked={customerSelectionMode === 'manual'}
                      onChange={(e) => setCustomerSelectionMode('manual')}
                      className="text-luxury-gold focus:ring-luxury-gold"
                    />
                    <span className="text-sm font-medium text-luxury-black">Enter Manually</span>
                  </label>
                </div>

                {/* Customer Selection Dropdown */}
                {customerSelectionMode === 'existing' && (
                  <div className="relative">
                    <div className="flex items-center">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gray-400" />
                      <input
                        type="text"
                        value={customerSearchTerm}
                        onChange={(e) => {
                          setCustomerSearchTerm(e.target.value);
                          setShowCustomerDropdown(true);
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        placeholder="Search customers by name or email..."
                        className="pl-10 pr-10 py-2 w-full border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gray-400" />
                    </div>

                    {/* Customer Dropdown */}
                    {showCustomerDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-luxury-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {loadingCustomers ? (
                          <div className="p-4 text-center text-luxury-gray-500">
                            Loading customers...
                          </div>
                        ) : filteredCustomers.length > 0 ? (
                          filteredCustomers.slice(0, 10).map((customer) => (
                            <div
                              key={customer.id}
                              onClick={() => handleCustomerSelect(customer)}
                              className="p-3 hover:bg-luxury-gray-50 cursor-pointer border-b border-luxury-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-luxury-black">{customer.fullName}</p>
                                  <p className="text-sm text-luxury-gray-600">{customer.email}</p>
                                  {customer.phone && (
                                    <p className="text-sm text-luxury-gray-500">{customer.phone}</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-medium text-luxury-gold">{customer.orderCount} orders</p>
                                  {selectedCustomerId === customer.id && (
                                    <Check className="h-4 w-4 text-green-600 ml-2" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-luxury-gray-500">
                            {customerSearchTerm ? 'No customers found' : 'Start typing to search customers'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Click outside to close dropdown */}
                    {showCustomerDropdown && (
                      <div
                        className="fixed inset-0 z-5"
                        onClick={() => setShowCustomerDropdown(false)}
                      />
                    )}
                  </div>
                )}

                {/* Selected Customer Info */}
                {selectedCustomerId && customerSelectionMode === 'existing' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        Customer selected: {customer.firstName} {customer.lastName} ({customer.email})
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Customer Form Fields - Show based on mode */}
              {customerSelectionMode === 'manual' || !selectedCustomerId ? (
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
                      disabled={customerSelectionMode === 'existing' && selectedCustomerId}
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
                      disabled={customerSelectionMode === 'existing' && selectedCustomerId}
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
                      disabled={customerSelectionMode === 'existing' && selectedCustomerId}
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
                      disabled={customerSelectionMode === 'existing' && selectedCustomerId}
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
                      disabled={customerSelectionMode === 'existing' && selectedCustomerId}
                    />
                  </div>
                </div>
              ) : (
                /* Read-only customer info when existing customer is selected */
                <div className="bg-luxury-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-luxury-gray-600 mb-1">First Name</label>
                      <p className="text-luxury-black font-medium">{customer.firstName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-luxury-gray-600 mb-1">Last Name</label>
                      <p className="text-luxury-black font-medium">{customer.lastName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-luxury-gray-600 mb-1">Email</label>
                      <p className="text-luxury-black font-medium">{customer.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-luxury-gray-600 mb-1">Phone</label>
                      <p className="text-luxury-black font-medium">{customer.phone || 'Not provided'}</p>
                    </div>
                    {customer.company && (
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-luxury-gray-600 mb-1">Company</label>
                        <p className="text-luxury-black font-medium">{customer.company}</p>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <div className="flex items-center space-x-4 text-sm text-luxury-gray-600">
                        <span>📦 {customer.totalOrders} previous orders</span>
                        <span>✅ {customer.isRegistered ? 'Registered' : 'Guest'} customer</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-luxury p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MapPin className="h-5 w-5 text-luxury-gold" />
                <h3 className="text-lg font-semibold text-luxury-black">Shipping Address</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={shipping.lastName}
                    onChange={(e) => handleShippingChange('lastName', e.target.value)}
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
                    value={shipping.addressLine1}
                    onChange={(e) => handleShippingChange('addressLine1', e.target.value)}
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
                    value={shipping.addressLine2}
                    onChange={(e) => handleShippingChange('addressLine2', e.target.value)}
                    className="input-luxury"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={shipping.city}
                    onChange={(e) => handleShippingChange('city', e.target.value)}
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
                    value={shipping.county}
                    onChange={(e) => handleShippingChange('county', e.target.value)}
                    className="input-luxury"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={shipping.postcode}
                    onChange={(e) => handleShippingChange('postcode', e.target.value)}
                    className="input-luxury"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-luxury-black mb-2">
                    Country *
                  </label>
                  <select
                    value={shipping.country}
                    onChange={(e) => handleShippingChange('country', e.target.value)}
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

            {/* Billing Address */}
            <div className="bg-white rounded-lg shadow-luxury p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-luxury-gold" />
                  <h3 className="text-lg font-semibold text-luxury-black">Billing Address</h3>
                </div>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={billing.isSameAsShipping}
                    onChange={(e) => handleBillingChange('isSameAsShipping', e.target.checked)}
                    className="rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
                  />
                  <span className="text-sm text-luxury-gray-600">Same as shipping</span>
                </label>
              </div>
              
              {!billing.isSameAsShipping ? (
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
              ) : (
                <div className="bg-luxury-gray-50 rounded-lg p-4">
                  <p className="text-sm text-luxury-gray-600">Billing address will be the same as shipping address</p>
                </div>
              )}
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
                    {loadingProducts ? (
                      <div className="p-4 text-center text-luxury-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-luxury-gold mx-auto mb-2"></div>
                        Loading products...
                      </div>
                    ) : filteredProducts.length > 0 ? (
                      filteredProducts.slice(0, 10).map((product) => (
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
                            <p className="font-semibold text-luxury-gold">{formatPrice(product.price || product.regularPrice)}</p>
                            <p className="text-sm text-luxury-gray-600">Stock: {product.stock}</p>
                          </div>
                        </div>
                      ))
                    ) : products.length === 0 ? (
                      <div className="p-4 text-center text-luxury-gray-500">
                        <Package className="h-8 w-8 text-luxury-gray-400 mx-auto mb-2" />
                        <p>No products available</p>
                        <p className="text-sm">Add products to your catalog first</p>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-luxury-gray-500">
                        <Search className="h-8 w-8 text-luxury-gray-400 mx-auto mb-2" />
                        <p>No products found</p>
                        <p className="text-sm">Try a different search term</p>
                      </div>
                    )}
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
                        <p className="font-medium text-luxury-black">{item.product_name}</p>
                        <p className="text-sm text-luxury-gray-600">SKU: {item.product_sku}</p>
                        <p className="text-sm text-luxury-gold">{formatPrice(item.price)} each</p>
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
                        <p className="font-semibold text-luxury-black">{formatPrice(item.total)}</p>
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