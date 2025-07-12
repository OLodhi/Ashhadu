'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Edit, Trash2, Star, Building, Home, Briefcase } from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/supabase-client';
import toast from 'react-hot-toast';

interface Address {
  id: string;
  customer_id: string;
  type: 'billing' | 'shipping';
  label: string | null;
  first_name: string;
  last_name: string;
  company: string | null;
  address_line_1: string;
  address_line_2: string | null;
  city: string;
  county: string | null;
  postcode: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface AddressFormData {
  label: string;
  firstName: string;
  lastName: string;
  company: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const { user, customer, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Debug authentication state
  console.log('🔍 AddressesPage Auth State:', {
    user: user ? { id: user.id, email: user.email } : 'NOT LOGGED IN',
    customer: customer ? { id: customer.id, email: customer.email } : 'NO CUSTOMER',
    authLoading,
    loading
  });
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    label: '',
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
    isDefault: false,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user && customer) {
      loadAddresses();
    } else if (user && !customer && !authLoading) {
      // User is authenticated but no customer found
      setLoading(false);
    } else if (!user && !authLoading) {
      // If no user, stop loading and show empty state
      setLoading(false);
    }
    // Otherwise keep loading while auth is still loading
  }, [user, customer, authLoading]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      
      if (!customer?.id) {
        console.warn('No customer ID available for loading addresses');
        setLoading(false);
        return;
      }
      
      const { data, error } = await db.addresses.selectByCustomerId(customer.id);
      if (error) {
        console.error('Error loading addresses:', error);
        toast.error('Failed to load addresses');
        // Continue with empty addresses if there's an error
      }
      
      // Ensure data is always an array
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast.error('Failed to load addresses');
      // Set empty addresses on error
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postcode is required';
    } else if (!/^[A-Z]{1,2}[0-9R][0-9A-Z]?\s?[0-9][A-Z]{2}$/i.test(formData.postcode.replace(/\s/g, ''))) {
      newErrors.postcode = 'Please enter a valid UK postcode';
    }

    if (formData.phone && !/^(\+44|0)[0-9]{10,11}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid UK phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const resetForm = () => {
    setFormData({
      label: '',
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
      isDefault: false,
    });
    setErrors({});
    setEditingAddress(null);
  };

  const handleAddAddress = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setFormData({
      label: address.label || '',
      firstName: address.first_name,
      lastName: address.last_name,
      company: address.company || '',
      addressLine1: address.address_line_1,
      addressLine2: address.address_line_2 || '',
      city: address.city,
      county: address.county || '',
      postcode: address.postcode,
      country: address.country,
      phone: address.phone || '',
      isDefault: address.is_default,
    });
    setEditingAddress(address);
    setShowForm(true);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Debug authentication state
    console.log('🔍 Authentication Debug:', {
      user: user ? { id: user.id, email: user.email } : null,
      customer: customer ? { id: customer.id, email: customer.email } : null,
      userExists: !!user,
      customerExists: !!customer
    });

    if (!user?.id) {
      toast.error('User not authenticated. Please log in again.');
      console.error('❌ No user found');
      return;
    }

    if (!customer?.id) {
      toast.error('Customer profile not found. Please refresh the page or contact support.');
      console.error('❌ No customer found for user:', user.id);
      return;
    }

    setFormLoading(true);

    try {
      const addressData = {
        customer_id: customer.id, // ✅ CRITICAL FIX: Using customer.id instead of user.id
        type: 'shipping',
        label: formData.label || null,
        first_name: formData.firstName,
        last_name: formData.lastName,
        company: formData.company || null,
        address_line_1: formData.addressLine1,
        address_line_2: formData.addressLine2 || null,
        city: formData.city,
        county: formData.county || null,
        postcode: formData.postcode.toUpperCase(),
        country: formData.country,
        phone: formData.phone || null,
        is_default: formData.isDefault,
      };

      console.log('📦 Address data to save:', addressData);

      if (editingAddress) {
        // Update existing address
        console.log('✏️ Updating address:', editingAddress.id);
        const { error } = await db.addresses.update(editingAddress.id, addressData);
        if (error) {
          console.error('❌ Update error:', error);
          throw error;
        }
        toast.success('Address updated successfully');
      } else {
        // Create new address
        console.log('➕ Creating new address');
        const { error } = await db.addresses.insert(addressData);
        if (error) {
          console.error('❌ Insert error:', error);
          throw error;
        }
        toast.success('Address added successfully');
      }

      // If this is set as default, unset other defaults
      if (formData.isDefault) {
        const otherAddresses = addresses.filter(addr => 
          addr.type === 'shipping' && 
          (!editingAddress || addr.id !== editingAddress.id)
        );
        
        for (const addr of otherAddresses) {
          if (addr.is_default) {
            await db.addresses.update(addr.id, { is_default: false });
          }
        }
      }

      await loadAddresses();
      setShowForm(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving address:', error);
      toast.error(error.message || 'Failed to save address');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const { error } = await db.addresses.delete(addressId);
      if (error) throw error;
      
      toast.success('Address deleted successfully');
      await loadAddresses();
    } catch (error: any) {
      console.error('Error deleting address:', error);
      toast.error(error.message || 'Failed to delete address');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // First, unset all defaults
      const shippingAddresses = addresses.filter(addr => addr.type === 'shipping');
      for (const addr of shippingAddresses) {
        if (addr.is_default) {
          await db.addresses.update(addr.id, { is_default: false });
        }
      }

      // Then set the selected address as default
      const { error } = await db.addresses.update(addressId, { is_default: true });
      if (error) throw error;

      toast.success('Default address updated');
      await loadAddresses();
    } catch (error: any) {
      console.error('Error setting default address:', error);
      toast.error(error.message || 'Failed to update default address');
    }
  };

  const formatAddress = (address: Address) => {
    const parts = [
      address.address_line_1,
      address.address_line_2,
      address.city,
      address.county,
      address.postcode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  };

  const getAddressIcon = (label: string | null) => {
    if (!label) return <MapPin className="h-5 w-5" />;
    
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('home')) return <Home className="h-5 w-5" />;
    if (lowerLabel.includes('work') || lowerLabel.includes('office')) return <Briefcase className="h-5 w-5" />;
    if (lowerLabel.includes('company') || lowerLabel.includes('business')) return <Building className="h-5 w-5" />;
    
    return <MapPin className="h-5 w-5" />;
  };

  const shippingAddresses = addresses.filter(addr => addr.type === 'shipping');

  return (
    <AccountLayout 
      title="Addresses" 
      description="Manage your billing and shipping addresses for faster checkout."
    >
      <div className="space-y-8">
        {/* Add Address Button */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Addresses</h2>
            <p className="text-gray-600 mt-1">
              Save your addresses for faster checkout
            </p>
          </div>
          <button
            onClick={handleAddAddress}
            disabled={!customer}
            className="inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </button>
        </div>

        {loading || authLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !user ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="text-red-600">
              <h4 className="text-lg font-medium">Authentication Required</h4>
              <p className="mt-2">
                Please log in to view your addresses.
              </p>
            </div>
          </div>
        ) : !customer ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <div className="text-amber-600">
              <h4 className="text-lg font-medium">Customer Profile Loading</h4>
              <p className="mt-2">
                Please wait while we load your customer profile, or try refreshing the page.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Shipping Addresses */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-blue-600" />
                Addresses
              </h3>
              {shippingAddresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shippingAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`bg-white rounded-xl border p-6 ${
                        address.is_default ? 'border-luxury-gold bg-luxury-gold/5' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 rounded-lg mr-3">
                            {getAddressIcon(address.label)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {address.label || 'Address'}
                              {address.is_default && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-luxury-gold text-luxury-black">
                                  <Star className="mr-1 h-3 w-3" />
                                  Default
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {address.first_name} {address.last_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        {address.company && (
                          <p className="font-medium">{address.company}</p>
                        )}
                        <p>{formatAddress(address)}</p>
                        {address.phone && <p>Phone: {address.phone}</p>}
                      </div>

                      {!address.is_default && (
                        <button
                          onClick={() => handleSetDefault(address.id)}
                          className="mt-4 text-sm text-luxury-gold hover:text-yellow-600 font-medium"
                        >
                          Set as default
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-4 text-lg font-medium text-gray-900">
                    No Addresses
                  </h4>
                  <p className="mt-2 text-gray-600">
                    Add an address to get your Islamic art delivered
                  </p>
                  <button
                    onClick={handleAddAddress}
                    disabled={!customer}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Address
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Address Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowForm(false)} />

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit} className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">
                      {editingAddress ? 'Update your address information' : 'Add a new address to your account'}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Label */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Label (Optional)
                      </label>
                      <input
                        type="text"
                        name="label"
                        value={formData.label}
                        onChange={handleInputChange}
                        placeholder="e.g., Home, Work, Office"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                      />
                    </div>

                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold ${
                            errors.firstName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold ${
                            errors.lastName ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company (Optional)
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                      />
                    </div>

                    {/* Address Lines */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        name="addressLine1"
                        value={formData.addressLine1}
                        onChange={handleInputChange}
                        placeholder="Street address, P.O. box, etc."
                        className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold ${
                          errors.addressLine1 ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.addressLine1 && (
                        <p className="mt-1 text-sm text-red-500">{errors.addressLine1}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        name="addressLine2"
                        value={formData.addressLine2}
                        onChange={handleInputChange}
                        placeholder="Apartment, suite, unit, building, floor, etc."
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                      />
                    </div>

                    {/* City, County, Postcode */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold ${
                            errors.city ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.city && (
                          <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          County (Optional)
                        </label>
                        <input
                          type="text"
                          name="county"
                          value={formData.county}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postcode *
                        </label>
                        <input
                          type="text"
                          name="postcode"
                          value={formData.postcode}
                          onChange={handleInputChange}
                          placeholder="SW1A 1AA"
                          className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold ${
                            errors.postcode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.postcode && (
                          <p className="mt-1 text-sm text-red-500">{errors.postcode}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country *
                        </label>
                        <select
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                        >
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Ireland">Ireland</option>
                        </select>
                      </div>
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+44 or 07xxx xxx xxx"
                        className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>

                    {/* Set as Default */}
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="isDefault"
                          name="isDefault"
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={handleInputChange}
                          className="focus:ring-luxury-gold h-4 w-4 text-luxury-gold border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="isDefault" className="text-gray-700">
                          Set as default address
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="flex-1 bg-luxury-gold border border-transparent rounded-lg py-2 px-4 text-sm font-medium text-luxury-black hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {formLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-luxury-black mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        editingAddress ? 'Update Address' : 'Add Address'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AccountLayout>
  );
}