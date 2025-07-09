'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Menu,
  LogOut,
  User
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface AdminLayoutClientProps {
  children: React.ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const { user, profile, signOut, loading } = useAuth();
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [hasShownError, setHasShownError] = useState(false);
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  // Reset error state when user changes
  useEffect(() => {
    setHasShownError(false);
  }, [user?.id]);

  // Check admin access using profile data
  useEffect(() => {
    const checkAdminAccess = async () => {
      // First, try to use the profile from AuthContext
      if (profile) {
        console.log('✅ AdminLayoutClient: Using profile from AuthContext:', profile);
        setAdminProfile(profile);
        
        // Check if user is actually an admin
        if (profile.role !== 'admin') {
          console.log('❌ AdminLayoutClient: User is not admin, role:', profile.role);
          if (!hasShownError) {
            setHasShownError(true);
            toast.error('Admin access required');
            router.push('/account');
          }
          return;
        }
        
        console.log('✅ AdminLayoutClient: Admin access verified via AuthContext');
        setLoadingProfile(false);
        return;
      }
      
      // Fallback: Fetch admin profile if not available in AuthContext
      try {
        console.log('🔍 AdminLayoutClient: Profile not in AuthContext, fetching...');
        const response = await fetch('/api/auth/profile');
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ AdminLayoutClient: Profile response received:', data);
          
          // Fix: Access the correct data path
          if (data.success && data.data) {
            setAdminProfile(data.data.profile);
            
            // Check if user is actually an admin
            if (data.data.profile?.role !== 'admin') {
              console.log('❌ AdminLayoutClient: User is not admin, role:', data.data.profile?.role);
              if (!hasShownError) {
                setHasShownError(true);
                toast.error('Admin access required');
                router.push('/account');
              }
              return;
            }
            
            console.log('✅ AdminLayoutClient: Admin access verified via API');
          } else {
            console.error('❌ AdminLayoutClient: Invalid response structure:', data);
            if (!hasShownError) {
              setHasShownError(true);
              toast.error('Failed to verify admin access');
              router.push('/login');
            }
          }
        } else {
          console.error('❌ AdminLayoutClient: Failed to fetch admin profile, status:', response.status);
          router.push('/login');
        }
      } catch (error) {
        console.error('❌ AdminLayoutClient: Error fetching admin profile:', error);
        router.push('/login');
      } finally {
        setLoadingProfile(false);
      }
    };

    if (!loading && user) {
      checkAdminAccess();
    } else if (!loading && !user) {
      console.log('🔄 AdminLayoutClient: No user, redirecting to login');
      router.push('/login');
    }
  }, [user, loading, profile, router, hasShownError]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  // Show loading state
  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-luxury-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
          <p className="text-luxury-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated or not admin
  if (!user || !adminProfile || adminProfile.role !== 'admin') {
    console.log('🔄 AdminLayoutClient: Render blocked:', { 
      hasUser: !!user, 
      hasProfile: !!adminProfile, 
      profileRole: adminProfile?.role 
    });
    return null;
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name[0].toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'A';
  };

  const displayName = adminProfile.full_name || user.email?.split('@')[0] || 'Admin User';
  const displayEmail = adminProfile.email || user.email || '';

  return (
    <div className="min-h-screen bg-luxury-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-luxury-black">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-luxury-gray-600 px-6">
            <Link 
              href="/" 
              className="transition-opacity hover:opacity-80"
              title="Back to Ashhadu Islamic Art Homepage"
            >
              <Logo textColor="text-white" size="sm" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-luxury-gray-700 hover:text-white transition-colors"
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-luxury-gray-600 p-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-luxury-gold flex items-center justify-center">
                <span className="text-sm font-medium text-luxury-black">
                  {getInitials(adminProfile.full_name, user.email)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {displayEmail}
                </p>
              </div>
              <button 
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-luxury-gray-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="lg:hidden p-1 text-luxury-black hover:text-luxury-gold">
                <Menu className="h-6 w-6" />
              </button>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-luxury-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, orders..."
                  className="pl-10 pr-4 py-2 w-80 border border-luxury-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-luxury-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome, {displayName}</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-luxury-black hover:text-luxury-gold transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Quick Actions */}
              <Link
                href="/admin/products/new"
                className="btn-luxury text-sm px-4 py-2"
              >
                Add Product
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}