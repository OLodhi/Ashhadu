'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ShoppingBag,
  UserCheck,
  UserX,
  Grid,
  List,
  Calendar,
  Download,
  X,
  UserCheck2
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useImpersonation } from '@/hooks/useImpersonation';

interface Customer {
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
  addressCount: number; // Count of shipping addresses only
  paymentMethodCount: number;
  orderCount: number;
}

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { startImpersonation, loading: impersonationLoading } = useImpersonation();
  
  // Filter states
  const [filters, setFilters] = useState({
    marketingConsent: 'all' as 'all' | 'subscribed' | 'not-subscribed',
    dateRange: {
      from: '',
      to: ''
    },
    hasOrders: 'all' as 'all' | 'yes' | 'no',
    hasPaymentMethods: 'all' as 'all' | 'yes' | 'no'
  });

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const url = new URL('/api/customers', window.location.origin);
        if (searchTerm) {
          url.searchParams.set('search', searchTerm);
        }
        
        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          setCustomers(data.data || []);
        } else {
          console.error('Failed to fetch customers');
          toast.error('Failed to load customers');
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
        toast.error('Error loading customers');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchCustomers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  // Filter customers based on applied filters
  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      // Marketing consent filter
      if (filters.marketingConsent === 'subscribed' && !customer.marketingConsent) return false;
      if (filters.marketingConsent === 'not-subscribed' && customer.marketingConsent) return false;
      
      // Date range filter
      if (filters.dateRange.from) {
        const customerDate = new Date(customer.createdAt);
        const fromDate = new Date(filters.dateRange.from);
        if (customerDate < fromDate) return false;
      }
      if (filters.dateRange.to) {
        const customerDate = new Date(customer.createdAt);
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        if (customerDate > toDate) return false;
      }
      
      // Has orders filter
      if (filters.hasOrders === 'yes' && customer.orderCount === 0) return false;
      if (filters.hasOrders === 'no' && customer.orderCount > 0) return false;
      
      // Has payment methods filter
      if (filters.hasPaymentMethods === 'yes' && customer.paymentMethodCount === 0) return false;
      if (filters.hasPaymentMethods === 'no' && customer.paymentMethodCount > 0) return false;
      
      return true;
    });
  };

  const clearFilters = () => {
    setFilters({
      marketingConsent: 'all',
      dateRange: { from: '', to: '' },
      hasOrders: 'all',
      hasPaymentMethods: 'all'
    });
  };

  const hasActiveFilters = () => {
    return filters.marketingConsent !== 'all' ||
           filters.dateRange.from !== '' ||
           filters.dateRange.to !== '' ||
           filters.hasOrders !== 'all' ||
           filters.hasPaymentMethods !== 'all';
  };

  const filteredCustomers = getFilteredCustomers();

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAllCustomers = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportCustomers = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Shipping Addresses', 'Payment Methods', 'Orders', 'Marketing Consent', 'Joined'],
      ...customers.map(customer => [
        customer.fullName,
        customer.email,
        customer.phone || '',
        customer.addressCount,
        customer.paymentMethodCount,
        customer.orderCount,
        customer.marketingConsent ? 'Yes' : 'No',
        formatDate(customer.createdAt)
      ])
    ];

    const csv = csvContent.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Customer data exported successfully');
  };

  const handleImpersonateCustomer = async (customer: Customer) => {
    const confirmed = confirm(
      `Are you sure you want to login as ${customer.fullName} (${customer.email})?\n\n` +
      'This will allow you to see their account dashboard and perform actions on their behalf.'
    );

    if (confirmed) {
      toast.loading('Starting impersonation...', { id: 'impersonation' });
      const success = await startImpersonation(customer.id);
      
      if (success) {
        toast.success(`Now viewing as ${customer.fullName}`, { id: 'impersonation' });
      } else {
        toast.dismiss('impersonation');
      }
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    // Show different confirmation based on order count
    let confirmMessage = '';
    
    if (customer.orderCount > 0) {
      confirmMessage = `⚠️  CANNOT DELETE CUSTOMER\n\n` +
        `${customer.fullName} has ${customer.orderCount} order(s) on file.\n\n` +
        `Customers with existing orders cannot be deleted for record keeping purposes.\n\n` +
        `Click OK to acknowledge this limitation.`;
    } else {
      confirmMessage = `⚠️  DELETE CUSTOMER ACCOUNT\n\n` +
        `Are you sure you want to permanently delete ${customer.fullName} (${customer.email})?\n\n` +
        `This action will:\n` +
        `• Mark all payment methods as inactive\n` +
        `• Delete all shipping/billing addresses\n` +
        `• Remove customer and profile records\n\n` +
        `⚠️  THIS CANNOT BE UNDONE!\n\n` +
        `Type "DELETE" in the next prompt to confirm deletion.`;
    }

    const acknowledged = confirm(confirmMessage);
    
    if (!acknowledged) {
      return;
    }

    // If customer has orders, just show the warning and exit
    if (customer.orderCount > 0) {
      toast.error(`Cannot delete ${customer.fullName} - customer has ${customer.orderCount} order(s) on file`);
      return;
    }

    // For customers without orders, require typing "DELETE" to confirm
    const deleteConfirmation = prompt(
      `To confirm deletion of ${customer.fullName}, type "DELETE" (all caps):`
    );

    if (deleteConfirmation !== 'DELETE') {
      toast.error('Deletion cancelled - confirmation text did not match');
      return;
    }

    // Proceed with deletion
    const deleteToastId = toast.loading(`Deleting ${customer.fullName}...`);

    try {
      const response = await fetch(`/api/customers/${customer.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to delete customer');
      }

      // Remove customer from local state
      setCustomers(prev => prev.filter(c => c.id !== customer.id));
      
      toast.success(data.message || `${customer.fullName} has been successfully deleted`, { 
        id: deleteToastId 
      });

    } catch (error: any) {
      console.error('Error deleting customer:', error);
      
      if (error.message.includes('order(s) on file')) {
        toast.error(error.message, { id: deleteToastId });
      } else {
        toast.error(error.message || 'Failed to delete customer', { id: deleteToastId });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="w-48 h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="w-64 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-luxury-black">Customers</h1>
          <p className="text-luxury-gray-600 mt-1">
            Manage your customer base and view customer insights
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportCustomers}
            className="inline-flex items-center px-4 py-2 border border-luxury-gray-300 text-sm font-medium rounded-lg text-luxury-black bg-white hover:bg-luxury-gray-50 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
          <Link
            href="/admin/customers/new"
            className="btn-luxury text-sm px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-luxury-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-luxury-black">{filteredCustomers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-luxury-gray-600">Marketing Subscribers</p>
              <p className="text-2xl font-semibold text-luxury-black">
                {filteredCustomers.filter(c => c.marketingConsent).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-luxury-gray-600">Customers with Orders</p>
              <p className="text-2xl font-semibold text-luxury-black">
                {filteredCustomers.filter(c => c.orderCount > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-100 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-luxury-gray-600">With Payment Methods</p>
              <p className="text-2xl font-semibold text-luxury-black">
                {filteredCustomers.filter(c => c.paymentMethodCount > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-80 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
              />
            </div>

            {/* Filter Button */}
            <button
              onClick={() => {
                if (showFilters) {
                  // If closing filters, clear all filters
                  clearFilters();
                }
                setShowFilters(!showFilters);
              }}
              className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                showFilters || hasActiveFilters()
                  ? 'border-luxury-gold text-luxury-gold bg-luxury-gold bg-opacity-10'
                  : 'border-luxury-gray-300 text-luxury-gray-700 hover:bg-luxury-gray-50'
              }`}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters() && (
                <span className="ml-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-luxury-gold rounded-full">
                  {[
                    filters.marketingConsent !== 'all',
                    filters.dateRange.from !== '',
                    filters.dateRange.to !== '',
                    filters.hasOrders !== 'all',
                    filters.hasPaymentMethods !== 'all'
                  ].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Clear Filters */}
            {hasActiveFilters() && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-1.5 border border-luxury-gray-300 text-sm font-medium rounded-md text-luxury-gray-700 bg-white hover:bg-luxury-gray-50"
              >
                <X className="mr-1 h-3 w-3" />
                Clear Filters
              </button>
            )}

            {/* Bulk Actions */}
            {selectedCustomers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-luxury-gray-600">
                  {selectedCustomers.length} selected
                </span>
                <button className="inline-flex items-center px-3 py-1.5 border border-luxury-gray-300 text-sm font-medium rounded-md text-luxury-gray-700 bg-white hover:bg-luxury-gray-50">
                  <Mail className="mr-1 h-3 w-3" />
                  Email
                </button>
                <button className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50">
                  <Trash2 className="mr-1 h-3 w-3" />
                  Delete
                </button>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center border border-luxury-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-luxury-gold text-white' : 'text-luxury-gray-600 hover:text-luxury-black'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-luxury-gold text-white' : 'text-luxury-gray-600 hover:text-luxury-black'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-luxury-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Marketing Consent Filter */}
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Marketing Consent
                </label>
                <select
                  value={filters.marketingConsent}
                  onChange={(e) => setFilters(prev => ({ ...prev, marketingConsent: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                >
                  <option value="all">All Customers</option>
                  <option value="subscribed">Subscribed</option>
                  <option value="not-subscribed">Not Subscribed</option>
                </select>
              </div>

              {/* Date Range From */}
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Joined From
                </label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, from: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                />
              </div>

              {/* Date Range To */}
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Joined To
                </label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, to: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                />
              </div>

              {/* Has Orders Filter */}
              <div>
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Order History
                </label>
                <select
                  value={filters.hasOrders}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasOrders: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                >
                  <option value="all">All Customers</option>
                  <option value="yes">Has Orders</option>
                  <option value="no">No Orders</option>
                </select>
              </div>

              {/* Has Payment Methods Filter */}
              <div className="md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Payment Methods
                </label>
                <select
                  value={filters.hasPaymentMethods}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasPaymentMethods: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                >
                  <option value="all">All Customers</option>
                  <option value="yes">Has Payment Methods</option>
                  <option value="no">No Payment Methods</option>
                </select>
              </div>

              {/* Quick Filter Presets */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-luxury-black mb-2">
                  Quick Filters
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, marketingConsent: 'subscribed' }))}
                    className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
                  >
                    Marketing Subscribers
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, hasOrders: 'yes' }))}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                  >
                    Customers with Orders
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, hasPaymentMethods: 'no' }))}
                    className="px-3 py-1 text-xs bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
                  >
                    No Payment Methods
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { 
                        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
                        to: new Date().toISOString().split('T')[0] 
                      }
                    }))}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
                  >
                    Last 30 Days
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer List/Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-100 p-12 text-center">
          <UserX className="mx-auto h-12 w-12 text-luxury-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-luxury-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-luxury-gray-500">
            {searchTerm || hasActiveFilters() ? 'Try adjusting your search terms or filters' : 'Get started by adding your first customer'}
          </p>
          {!searchTerm && !hasActiveFilters() && (
            <div className="mt-6">
              <Link
                href="/admin/customers/new"
                className="btn-luxury text-sm px-4 py-2"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Link>
            </div>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="bg-white rounded-lg shadow-sm border border-luxury-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-luxury-gray-200">
              <thead className="bg-luxury-gray-50">
                <tr>
                  <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                    <input
                      type="checkbox"
                      className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={handleSelectAllCustomers}
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                    Marketing
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-luxury-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-luxury-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={`hover:bg-luxury-gray-50 ${
                      selectedCustomers.includes(customer.id) ? 'bg-luxury-gold bg-opacity-5' : ''
                    }`}
                  >
                    <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-luxury-gold bg-opacity-10 flex items-center justify-center">
                            <span className="text-sm font-medium text-luxury-gold">
                              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-luxury-black">
                            {customer.fullName}
                          </div>
                          <div className="text-sm text-luxury-gray-500">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-luxury-gray-900">
                          <Mail className="h-3 w-3 mr-1 text-luxury-gray-400" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-sm text-luxury-gray-500">
                            <Phone className="h-3 w-3 mr-1 text-luxury-gray-400" />
                            {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-sm text-luxury-gray-500">
                        <span className="flex items-center">
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          {customer.orderCount}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {customer.addressCount}
                        </span>
                        <span className="flex items-center">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {customer.paymentMethodCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        customer.marketingConsent
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {customer.marketingConsent ? 'Subscribed' : 'Not subscribed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-luxury-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(customer.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleImpersonateCustomer(customer)}
                          disabled={impersonationLoading}
                          className="text-luxury-gold hover:text-luxury-gold-dark p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Login as Customer"
                        >
                          {impersonationLoading ? (
                            <UserCheck2 className="h-4 w-4 animate-pulse" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <Link
                          href={`/admin/customers/${customer.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 p-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteCustomer(customer)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete Customer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="text-luxury-gray-400 hover:text-luxury-gray-600 p-1">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
                selectedCustomers.includes(customer.id) 
                  ? 'border-luxury-gold ring-2 ring-luxury-gold ring-opacity-20' 
                  : 'border-luxury-gray-100 hover:border-luxury-gray-200'
              }`}
            >
              {/* Card Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-luxury-gold bg-opacity-10 flex items-center justify-center">
                      <span className="text-lg font-medium text-luxury-gold">
                        {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-luxury-black">{customer.fullName}</h3>
                      <p className="text-xs text-luxury-gray-500 truncate">{customer.email}</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-luxury-gray-300 text-luxury-gold focus:ring-luxury-gold"
                    checked={selectedCustomers.includes(customer.id)}
                    onChange={() => handleSelectCustomer(customer.id)}
                  />
                </div>
              </div>

              {/* Card Content */}
              <div className="px-6 pb-4">
                {/* Contact Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-luxury-gray-500">
                    <Mail className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-xs text-luxury-gray-500">
                      <Phone className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <ShoppingBag className="h-3 w-3 text-luxury-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-luxury-black">{customer.orderCount}</p>
                    <p className="text-xs text-luxury-gray-500">Orders</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <MapPin className="h-3 w-3 text-luxury-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-luxury-black">{customer.addressCount}</p>
                    <p className="text-xs text-luxury-gray-500">Shipping</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <CreditCard className="h-3 w-3 text-luxury-gray-400" />
                    </div>
                    <p className="text-xs font-medium text-luxury-black">{customer.paymentMethodCount}</p>
                    <p className="text-xs text-luxury-gray-500">Payment</p>
                  </div>
                </div>

                {/* Marketing Status */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-luxury-gray-500">Marketing:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.marketingConsent
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.marketingConsent ? 'Yes' : 'No'}
                  </span>
                </div>

                {/* Join Date */}
                <div className="flex items-center text-xs text-luxury-gray-500 mb-4">
                  <Calendar className="h-3 w-3 mr-2" />
                  <span>Joined {formatDate(customer.createdAt)}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="border-t border-luxury-gray-100 px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleImpersonateCustomer(customer)}
                      disabled={impersonationLoading}
                      className="text-luxury-gold hover:text-luxury-gold-dark p-1 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Login as Customer"
                    >
                      {impersonationLoading ? (
                        <UserCheck2 className="h-4 w-4 animate-pulse" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <Link
                      href={`/admin/customers/${customer.id}/edit`}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors"
                      title="Edit Customer"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteCustomer(customer)}
                      className="text-red-600 hover:text-red-900 p-1 rounded transition-colors"
                      title="Delete Customer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button 
                    className="text-luxury-gray-400 hover:text-luxury-gray-600 p-1 rounded transition-colors"
                    title="More Options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomersPage;