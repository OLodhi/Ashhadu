import React from 'react';
import Link from 'next/link';
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
  LogOut
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}