'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Heart,
  MapPin,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  Star,
  ShoppingBag
} from 'lucide-react';
import { AccountLayout } from '@/components/account/AccountLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { supabase } from '@/lib/supabase-client';

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  currency: string;
}

interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  wishlistItems: number;
  recentOrders: Order[];
}

export default function AccountDashboard() {
  const { user, profile, customer, loading: authLoading, refreshProfile } = useAuth();
  const { wishlistCount, totalValue, wishlistItems } = useWishlist();
  const router = useRouter();
  
  // Debug customer data
  console.log('Customer data:', customer);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalSpent: 0,
    wishlistItems: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirectTo=/account');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadDashboardData();
      } else {
        // If no user, stop loading
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // First get the customer record using the authenticated user's email
      let { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user?.email)
        .single();

      // If no customer record exists, create one for this registered user
      if (customerError && customerError.code === 'PGRST116') {
        console.log('No customer record found, creating one for new user...');
        
        // Parse full name into first and last name
        const fullName = profile?.full_name || '';
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({
            email: user?.email,
            first_name: firstName,
            last_name: lastName,
            phone: '',
            is_guest: false // This is a registered user
          })
          .select('id')
          .single();

        if (createError) {
          console.error('Error creating customer record:', createError);
          // Continue with empty stats if we can't create customer record
          setStats({
            totalOrders: 0,
            totalSpent: 0,
            wishlistItems: wishlistCount,
            recentOrders: []
          });
          return;
        }

        customerData = newCustomer;
        console.log('✅ Customer record created successfully');
        
        // Refresh the auth context to update the customer data
        await refreshProfile();
      } else if (customerError) {
        console.error('Error loading customer data:', customerError);
        // If other error, continue with empty stats
        setStats({
          totalOrders: 0,
          totalSpent: 0,
          wishlistItems: wishlistCount,
          recentOrders: []
        });
        return;
      }

      // Ensure we have customer data before proceeding
      if (!customerData) {
        console.error('No customer data available');
        setStats({
          totalOrders: 0,
          totalSpent: 0,
          wishlistItems: wishlistCount,
          recentOrders: []
        });
        return;
      }

      // Load orders using the customer's ID
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, status, created_at, currency')
        .eq('customer_id', customerData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) {
        console.error('Error loading orders:', ordersError);
        // Continue with empty orders if there's an error
      }

      // Load all orders for total calculations (not just recent ones)
      const { data: allOrders, error: allOrdersError } = await supabase
        .from('orders')
        .select('total, status')
        .eq('customer_id', customerData.id)
        .neq('status', 'cancelled'); // Exclude cancelled orders from totals

      if (allOrdersError) {
        console.error('Error loading all orders:', allOrdersError);
      }

      // Calculate stats (ensure orders is always an array)
      const ordersList = orders || [];
      const allOrdersList = allOrders || [];
      const totalOrders = allOrdersList.length;
      const totalSpent = allOrdersList.reduce((sum, order) => sum + order.total, 0);

      setStats({
        totalOrders,
        totalSpent,
        wishlistItems: wishlistCount, // Use real wishlist count
        recentOrders: ordersList
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set empty stats on error
      setStats({
        totalOrders: 0,
        totalSpent: 0,
        wishlistItems: 0,
        recentOrders: []
      });
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
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      case 'processing':
        return 'text-yellow-600 bg-yellow-100';
      case 'pending':
        return 'text-gray-600 bg-gray-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const quickActions = [
    {
      name: 'Edit Profile',
      description: 'Update your personal information',
      href: '/account/profile',
      icon: User,
      color: 'bg-blue-500'
    },
    {
      name: 'Manage Addresses',
      description: 'Add or update shipping addresses',
      href: '/account/addresses',
      icon: MapPin,
      color: 'bg-green-500'
    },
    {
      name: 'View Orders',
      description: 'Track your Islamic art orders',
      href: '/account/orders',
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      name: 'My Wishlist',
      description: 'Save your favorite pieces',
      href: '/account/wishlist',
      icon: Heart,
      color: 'bg-pink-500'
    }
  ];

  // Don't render anything while checking auth
  if (authLoading || loading) {
    return (
      <AccountLayout 
        title="My Account" 
        description="Loading your account information..."
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold"></div>
        </div>
      </AccountLayout>
    );
  }

  // Don't render if no user (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <AccountLayout 
      title="My Account" 
      description={`Welcome back${customer?.first_name ? ` ${customer.first_name}` : ''}! Here's an overview of your account activity.`}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-luxury-black to-gray-800 rounded-2xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-playfair font-bold mb-2">
                Welcome back{customer?.first_name ? ` ${customer.first_name}` : ''}!
              </h2>
              <p className="text-gray-300">
                Thank you for being part of the Ashhadu Islamic Art community. 
                Discover our latest collection of authentic Islamic calligraphy and art pieces.
              </p>
            </div>
            <div className="hidden md:block">
              <Link
                href="/shop"
                className="inline-flex items-center px-6 py-3 bg-luxury-gold text-luxury-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">
                    {customer ? `${customer.first_name} ${customer.last_name}` : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{customer?.email || user?.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{customer?.phone || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Member Since</p>
                  <p className="font-medium">
                    {profile?.created_at ? formatDate(profile.created_at) : 'Recently'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/account/profile"
              className="inline-flex items-center text-luxury-gold hover:text-yellow-600 font-medium"
            >
              Edit Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  href={action.href}
                  className="group p-4 border border-gray-200 rounded-lg hover:border-luxury-gold hover:shadow-md transition-all"
                >
                  <div className={`inline-flex p-2 ${action.color} rounded-lg text-white mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-medium text-gray-900 group-hover:text-luxury-gold transition-colors">
                    {action.name}
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Link
              href="/account/orders"
              className="text-luxury-gold hover:text-yellow-600 font-medium text-sm"
            >
              View All
            </Link>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex space-x-4 p-4 border border-gray-100 rounded-lg">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Package className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.id.slice(-8)}</p>
                      <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(order.total, order.currency)}
                    </p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-4 text-lg font-medium text-gray-900">No Recent Orders</h4>
              <p className="mt-2 text-gray-600">
                Start browsing our beautiful Islamic art collection
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Shop Now
              </Link>
            </div>
          )}
        </div>

        {/* Recent Wishlist Items */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Wishlist Items</h3>
            <Link
              href="/account/wishlist"
              className="text-luxury-gold hover:text-yellow-600 font-medium text-sm"
            >
              View All ({wishlistCount})
            </Link>
          </div>
          
          {wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlistItems.slice(0, 3).map((item) => (
                <div key={item.id} className="border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product.featured_image ? (
                        <img
                          src={item.product.featured_image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Heart className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-luxury-gold transition-colors truncate block"
                      >
                        {item.product.name}
                      </Link>
                      {item.product.arabic_name && (
                        <p className="text-xs text-gray-600 arabic-text mt-1">
                          {item.product.arabic_name}
                        </p>
                      )}
                      <p className="text-sm font-medium text-luxury-gold mt-1">
                        {formatCurrency(item.product.price, item.product.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <h4 className="mt-4 text-lg font-medium text-gray-900">No Wishlist Items</h4>
              <p className="mt-2 text-gray-600">
                Save your favorite Islamic art pieces to see them here
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-flex items-center px-4 py-2 bg-luxury-gold text-luxury-black font-medium rounded-lg hover:bg-yellow-400 transition-colors"
              >
                <Heart className="mr-2 h-4 w-4" />
                Explore Art
              </Link>
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}