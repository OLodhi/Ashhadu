'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  User,
  MapPin,
  Package,
  Heart,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import SafeLink from '@/components/ui/SafeLink';
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner';
import { useImpersonation } from '@/hooks/useImpersonation';
import toast from 'react-hot-toast';

interface AccountLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AccountLayout({ children, title, description }: AccountLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, profile, customer, signOut, loading } = useAuth();
  const { impersonationSession } = useImpersonation();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/account',
      icon: Monitor,
      current: pathname === '/account',
    },
    {
      name: 'Profile',
      href: '/account/profile',
      icon: User,
      current: pathname === '/account/profile',
    },
    {
      name: 'Addresses',
      href: '/account/addresses',
      icon: MapPin,
      current: pathname === '/account/addresses',
    },
    {
      name: 'Orders',
      href: '/account/orders',
      icon: Package,
      current: pathname === '/account/orders',
    },
    {
      name: 'Wishlist',
      href: '/account/wishlist',
      icon: Heart,
      current: pathname === '/account/wishlist',
    },
    {
      name: 'Payment Methods',
      href: '/account/payments',
      icon: CreditCard,
      current: pathname === '/account/payments',
    },
  ];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-16">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-luxury-gold"></div>
        </div>
      </>
    );
  }

  const topPadding = impersonationSession.isImpersonating ? 'pt-28' : 'pt-16';

  return (
    <>
      {/* Header */}
      <Header />

      {/* Impersonation Banner */}
      <ImpersonationBanner />

      <div className={`min-h-screen bg-gray-50 ${topPadding}`}>
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-xl">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex flex-shrink-0 flex-col px-6 py-4 border-b border-gray-200">
              <span className="text-lg font-playfair font-semibold text-luxury-black">
                My Account
              </span>
            </div>
            <nav className="flex-1 px-3 space-y-1" style={{ marginTop: '20px' }}>
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? 'bg-luxury-gold text-luxury-black'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-luxury-black'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={handleSignOut}
                className="group flex w-full items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
                Sign Out
              </button>
            </nav>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:top-16 lg:flex lg:w-64 lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
            <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 flex-col px-6 pb-4">
                <span className="text-xl font-playfair font-semibold text-luxury-black">
                  My Account
                </span>
              </div>
              <nav className="flex-1 px-3 space-y-2" style={{ marginTop: '20px' }}>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        item.current
                          ? 'bg-luxury-gold text-luxury-black shadow-sm'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-luxury-black'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-luxury-gold flex items-center justify-center">
                      <span className="text-sm font-medium text-luxury-black">
                        {customer?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">
                      {customer ? `${customer.first_name} ${customer.last_name}` : user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top navigation for mobile */}
          <div className="relative flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8" style={{ marginTop: '15px' }}>
            <button
              type="button"
              className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Breadcrumb */}
            <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <SafeLink href="/" className="text-gray-400 hover:text-gray-500">
                      Home
                    </SafeLink>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                    <span className="text-gray-500">Account</span>
                  </li>
                  {pathname !== '/account' && (
                    <li className="flex items-center">
                      <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                      <span className="text-luxury-gold font-medium">{title}</span>
                    </li>
                  )}
                </ol>
              </nav>
            </div>
          </div>
          
          {/* Separator line */}
          <div className="border-b-2 border-luxury-gold/20"></div>

          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {/* Page header */}
              <div className="mb-8">
                <h1 className="text-3xl font-playfair font-bold text-gray-900">{title}</h1>
                {description && (
                  <p className="mt-2 text-gray-600">{description}</p>
                )}
              </div>

              {/* Page content */}
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}