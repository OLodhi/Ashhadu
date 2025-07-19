'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  BellRing, 
  Check, 
  X, 
  Clock, 
  AlertCircle, 
  Package, 
  ShoppingCart, 
  User, 
  Star,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { AdminNotification, NotificationType, NotificationPriority } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  maxItems?: number;
  className?: string;
}

// Icon mapping for notification types
const NOTIFICATION_TYPE_ICONS: Record<NotificationType, React.ComponentType<{ size?: number; className?: string }>> = {
  order_new: ShoppingCart,
  order_cancelled: X,
  order_shipped: Package,
  order_delivered: Check,
  product_low_stock: AlertCircle,
  product_out_of_stock: X,
  product_back_in_stock: Check,
  customer_new: User,
  customer_updated: User,
  review_pending: Star,
  review_approved: Star,
  review_rejected: Star,
  payment_failed: X,
  payment_disputed: AlertCircle,
  system_alert: Bell,
  inventory_updated: Package,
};

// Priority colors
const PRIORITY_COLORS: Record<NotificationPriority, string> = {
  low: 'text-gray-500',
  normal: 'text-blue-500',
  high: 'text-orange-500',
  urgent: 'text-red-500',
};

const PRIORITY_BG_COLORS: Record<NotificationPriority, string> = {
  low: 'bg-gray-100',
  normal: 'bg-blue-100',
  high: 'bg-orange-100',
  urgent: 'bg-red-100',
};

export default function NotificationDropdown({ maxItems = 10, className = '' }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    dismissNotification 
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get recent notifications for dropdown (undismissed only)
  const recentNotifications = notifications
    .filter(n => !n.dismissed)
    .slice(0, maxItems);

  const handleNotificationClick = async (notification: AdminNotification) => {
    // Mark as read if not already read
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }

    setIsOpen(false);
  };

  const handleMarkAsRead = async (notification: AdminNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    await markAsRead(notification.id);
  };

  const handleDismiss = async (notification: AdminNotification, e: React.MouseEvent) => {
    e.stopPropagation();
    await dismissNotification(notification.id);
  };

  const formatNotificationTime = (createdAt: string) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const renderNotificationItem = (notification: AdminNotification) => {
    const IconComponent = NOTIFICATION_TYPE_ICONS[notification.type];
    const priorityColor = PRIORITY_COLORS[notification.priority];
    const priorityBgColor = PRIORITY_BG_COLORS[notification.priority];

    return (
      <div
        key={notification.id}
        className={`
          p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors
          ${!notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}
        `}
        onClick={() => handleNotificationClick(notification)}
      >
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`flex-shrink-0 p-2 rounded-full ${priorityBgColor}`}>
            <IconComponent size={16} className={priorityColor} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                  {notification.title}
                </p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {notification.message}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {formatNotificationTime(notification.created_at)}
                  </span>
                  {notification.priority === 'urgent' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Urgent
                    </span>
                  )}
                  {notification.priority === 'high' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      High
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 ml-2">
                {!notification.read && (
                  <button
                    onClick={(e) => handleMarkAsRead(notification, e)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  onClick={(e) => handleDismiss(notification, e)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  title="Dismiss"
                >
                  <X size={14} />
                </button>
                {notification.action_url && (
                  <ExternalLink size={12} className="text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-luxury-black hover:text-luxury-gold transition-colors"
        title={`${unreadCount} unread notifications`}
      >
        {unreadCount > 0 ? (
          <BellRing className="h-5 w-5 animate-pulse" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
        
        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    ({unreadCount} unread)
                  </span>
                )}
              </h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <Link
                  href="/admin/notifications"
                  className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  View all
                </Link>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-luxury-gold mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications</p>
                <p className="text-xs text-gray-400 mt-1">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div>
                {recentNotifications.map(renderNotificationItem)}
                
                {/* Show "View all" if there are more notifications */}
                {notifications.filter(n => !n.dismissed).length > maxItems && (
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <Link
                      href="/admin/notifications"
                      className="block text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      View all {notifications.filter(n => !n.dismissed).length} notifications
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}