'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Star,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { Product } from '@/types/product';
import Link from 'next/link';

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products', {
          // Prevent caching to ensure fresh data
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          setProducts(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Refresh data when window regains focus (user comes back to dashboard)
    const handleFocus = () => {
      fetchProducts();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Calculate stats from API data
  const stats = {
    totalProducts: products.length,
    publishedProducts: products.filter(p => p.status === 'published').length,
    totalValue: products.reduce((sum, p) => sum + (p.price || p.regularPrice || 0) * (p.stock || 0), 0),
    lowStockProducts: products.filter(p => p.stock <= (p.lowStockThreshold || 5) && p.stock > 0).length,
    recentlyAdded: products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  };

  const lowStockProducts = products.filter(p => p.stock <= (p.lowStockThreshold || 5) && p.stock > 0);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const featuredProducts = products.filter(p => p.featured);

  const dashboardStats = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      change: '+12%',
      changeType: 'positive' as const,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Published Products',
      value: stats.publishedProducts,
      change: '+8%',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Total Inventory Value',
      value: formatPrice(stats.totalValue),
      change: '+15%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-luxury-gold',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Low Stock Alerts',
      value: stats.lowStockProducts,
      change: '-5%',
      changeType: 'negative' as const,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  const quickActions = [
    {
      name: 'Add New Product',
      description: 'Create a new Islamic art product',
      href: '/admin/products/new',
      icon: Plus,
      color: 'bg-luxury-gold',
    },
    {
      name: 'Manage Inventory',
      description: 'Update stock levels and manage inventory',
      href: '/admin/products?tab=inventory',
      icon: Package,
      color: 'bg-blue-600',
    },
    {
      name: 'View Orders',
      description: 'Process and manage customer orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      color: 'bg-green-600',
    },
    {
      name: 'Customer Management',
      description: 'View and manage customer accounts',
      href: '/admin/customers',
      icon: Users,
      color: 'bg-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="heading-section text-luxury-black">
            Admin Dashboard
          </h1>
          <p className="text-body mt-2">
            Welcome to your Islamic art store management dashboard
          </p>
        </div>

        {/* Loading Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-luxury p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 bg-luxury-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-luxury-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-luxury-gray-200 rounded-lg"></div>
              </div>
              <div className="mt-4">
                <div className="h-4 bg-luxury-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-luxury p-6 animate-pulse">
              <div className="h-6 bg-luxury-gray-200 rounded w-32 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-luxury-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-luxury p-6 animate-pulse">
              <div className="h-6 bg-luxury-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 bg-luxury-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="heading-section text-luxury-black">
          Admin Dashboard
        </h1>
        <p className="text-body mt-2">
          Welcome to your Islamic art store management dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-luxury p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-luxury-gray-600">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-luxury-black mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-luxury-gray-600 ml-1">
                  from last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-luxury-black mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.name}
                href={action.href}
                className="group bg-white rounded-lg shadow-luxury p-6 hover:shadow-luxury-hover transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-luxury-black group-hover:text-luxury-gold transition-colors">
                      {action.name}
                    </h3>
                    <p className="text-sm text-luxury-gray-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Products */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-luxury">
            <div className="px-6 py-4 border-b border-luxury-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-luxury-black">
                  Recent Products
                </h3>
                <Link
                  href="/admin/products"
                  className="text-sm text-luxury-gold hover:text-luxury-black transition-colors"
                >
                  View all
                </Link>
              </div>
            </div>
            <div className="p-6">
              {stats.recentlyAdded.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentlyAdded.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-luxury-gray-100 rounded-lg flex items-center justify-center">
                        {product.featuredImage ? (
                          <img 
                            src={product.featuredImage} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-luxury-gold" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-luxury-black">
                          {product.name}
                        </h4>
                        <p className="text-sm text-luxury-gray-600">
                          {product.category?.replace('-', ' ')} • Stock: {product.stock || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-luxury-gold">
                          {formatPrice(product.price || product.regularPrice || 0)}
                        </p>
                        <p className="text-sm text-luxury-gray-600 capitalize">
                          {product.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-luxury-gray-400 mx-auto mb-4" />
                  <p className="text-luxury-gray-600">No products added yet</p>
                  <Link
                    href="/admin/products/new"
                    className="btn-luxury mt-4 inline-flex"
                  >
                    Add Your First Product
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-luxury">
            <div className="px-6 py-4 border-b border-luxury-gray-100">
              <h3 className="text-lg font-semibold text-luxury-black flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                Stock Alerts
              </h3>
            </div>
            <div className="p-6">
              {lowStockProducts.length > 0 || outOfStockProducts.length > 0 ? (
                <div className="space-y-3">
                  {outOfStockProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-red-800">{product.name}</p>
                        <p className="text-sm text-red-600">Out of stock</p>
                      </div>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        0 left
                      </span>
                    </div>
                  ))}
                  {lowStockProducts.slice(0, 2).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-800">{product.name}</p>
                        <p className="text-sm text-yellow-600">Low stock</p>
                      </div>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {product.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertTriangle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-green-600 font-medium">All stock levels good!</p>
                </div>
              )}
            </div>
          </div>

          {/* Featured Products */}
          <div className="bg-white rounded-lg shadow-luxury">
            <div className="px-6 py-4 border-b border-luxury-gray-100">
              <h3 className="text-lg font-semibold text-luxury-black flex items-center">
                <Star className="h-5 w-5 text-luxury-gold mr-2" />
                Featured Products
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-luxury-gray-600 mb-4">
                {featuredProducts.length} products currently featured
              </p>
              {featuredProducts.length > 0 ? (
                <div className="space-y-3">
                  {featuredProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-luxury-gold/20 rounded flex items-center justify-center">
                        <Star className="h-4 w-4 text-luxury-gold" />
                      </div>
                      <div>
                        <p className="font-medium text-luxury-black text-sm">
                          {product.name}
                        </p>
                        <p className="text-xs text-luxury-gray-600">
                          {formatPrice(product.price || product.regularPrice || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-luxury-gray-500 text-sm">
                  No featured products yet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;