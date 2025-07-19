'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Search, 
  Filter, 
  Check, 
  X, 
  Trash2, 
  RefreshCw, 
  Archive, 
  Eye, 
  EyeOff,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Package,
  ShoppingCart,
  User,
  Star,
  ExternalLink
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  AdminNotification, 
  NotificationFilters, 
  NotificationType, 
  NotificationPriority 
} from '@/types/notifications';
import { formatDistanceToNow, format } from 'date-fns';

// Priority icons and colors
const PRIORITY_CONFIG = {
  low: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100', border: 'border-gray-200' },
  normal: { icon: Bell, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-200' },
  high: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' },
  urgent: { icon: Zap, color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-200' },
};

// Type icons
const TYPE_ICONS = {
  order_new: ShoppingCart,
  order_cancelled: X,
  order_shipped: Package,
  order_delivered: CheckCircle2,
  product_low_stock: AlertCircle,
  product_out_of_stock: X,
  product_back_in_stock: CheckCircle2,
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

export default function AdminNotificationsPage() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    dismissNotification 
  } = useNotifications();

  const [filters, setFilters] = useState<NotificationFilters>({
    limit: 50,
    offset: 0
  });
  const [selectedNotifications, setSelectedNotifications] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch notifications on mount and when filters change
  useEffect(() => {
    fetchNotifications(filters);
  }, [filters, fetchNotifications]);

  // Filter notifications based on search query
  const filteredNotifications = notifications.filter(notification =>
    searchQuery === '' || 
    notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFilterChange = (key: keyof NotificationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset pagination when filters change
    }));
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  const selectAllVisible = () => {
    const visibleIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(new Set(visibleIds));
  };

  const clearSelection = () => {
    setSelectedNotifications(new Set());
  };

  const handleBulkAction = async (action: string) => {
    if (selectedNotifications.size === 0) return;

    try {
      const response = await fetch('/api/admin/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: action,
          notification_ids: Array.from(selectedNotifications)
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        clearSelection();
        fetchNotifications(filters);
      }
    } catch (error) {
      console.error('Bulk action error:', error);
    }
  };

  const formatNotificationTime = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        absolute: format(date, 'MMM d, yyyy \'at\' h:mm a')
      };
    } catch {
      return {
        relative: 'Recently',
        absolute: 'Unknown time'
      };
    }
  };

  const renderNotificationItem = (notification: AdminNotification) => {
    const TypeIcon = TYPE_ICONS[notification.type];
    const priorityConfig = PRIORITY_CONFIG[notification.priority];
    const PriorityIcon = priorityConfig.icon;
    const timeFormatted = formatNotificationTime(notification.created_at);
    const isSelected = selectedNotifications.has(notification.id);

    return (
      <div
        key={notification.id}
        className={`
          relative border rounded-lg p-4 transition-all hover:shadow-md
          ${!notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
          ${notification.dismissed ? 'opacity-60' : ''}
          ${isSelected ? 'ring-2 ring-luxury-gold' : ''}
        `}
      >
        {/* Selection checkbox */}
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleNotificationSelection(notification.id)}
            className="h-4 w-4 text-luxury-gold focus:ring-luxury-gold border-gray-300 rounded"
          />
        </div>

        <div className="ml-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {/* Type Icon */}
              <div className={`p-2 rounded-full ${priorityConfig.bg}`}>
                <TypeIcon size={16} className={priorityConfig.color} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                    {notification.title}
                  </h3>
                  
                  {/* Priority badge */}
                  <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs ${priorityConfig.bg} ${priorityConfig.color}`}>
                    <PriorityIcon size={12} />
                    <span className="capitalize">{notification.priority}</span>
                  </div>

                  {/* Status badges */}
                  {notification.dismissed && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                      <Archive size={10} className="mr-1" />
                      Dismissed
                    </span>
                  )}
                  
                  {!notification.read && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-600">
                      <Eye size={10} className="mr-1" />
                      Unread
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                  {notification.message}
                </p>

                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span title={timeFormatted.absolute}>{timeFormatted.relative}</span>
                  <span className="capitalize">{notification.type.replace('_', ' ')}</span>
                  {notification.related_type && (
                    <span>Related to {notification.related_type}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Mark as read"
                >
                  <Check size={16} />
                </button>
              )}
              
              {!notification.dismissed && (
                <button
                  onClick={() => dismissNotification(notification.id)}
                  className="p-1 text-gray-400 hover:text-orange-600 transition-colors"
                  title="Dismiss"
                >
                  <Archive size={16} />
                </button>
              )}

              {notification.action_url && (
                <a
                  href={notification.action_url}
                  className="p-1 text-gray-400 hover:text-luxury-gold transition-colors"
                  title="Go to related item"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your admin notifications and preferences
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchNotifications(filters)}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              <CheckCircle2 size={16} />
              <span>Mark all read</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-3 py-2 border rounded-md text-sm transition-colors ${
              showFilters ? 'bg-luxury-gold text-white border-luxury-gold' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Read Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.read === undefined ? 'all' : filters.read ? 'read' : 'unread'}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('read', value === 'all' ? undefined : value === 'read');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={filters.type || 'all'}
                  onChange={(e) => handleFilterChange('type', e.target.value === 'all' ? undefined : e.target.value as NotificationType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                >
                  <option value="all">All Types</option>
                  <option value="order_new">New Orders</option>
                  <option value="order_cancelled">Cancelled Orders</option>
                  <option value="product_low_stock">Low Stock</option>
                  <option value="product_out_of_stock">Out of Stock</option>
                  <option value="customer_new">New Customers</option>
                  <option value="review_pending">Pending Reviews</option>
                  <option value="payment_failed">Payment Failed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority || 'all'}
                  onChange={(e) => handleFilterChange('priority', e.target.value === 'all' ? undefined : e.target.value as NotificationPriority)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Dismissed Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={filters.dismissed === undefined ? 'active' : filters.dismissed ? 'dismissed' : 'active'}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleFilterChange('dismissed', value === 'dismissed' ? true : false);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold"
                >
                  <option value="active">Active</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.size > 0 && (
        <div className="bg-luxury-gold/10 border border-luxury-gold rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {selectedNotifications.size} notification{selectedNotifications.size !== 1 ? 's' : ''} selected
            </span>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('mark_selected_read')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                <Check size={14} />
                <span>Mark Read</span>
              </button>
              
              <button
                onClick={() => handleBulkAction('dismiss_selected')}
                className="flex items-center space-x-1 px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
              >
                <Archive size={14} />
                <span>Dismiss</span>
              </button>
              
              <button
                onClick={clearSelection}
                className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
              >
                <X size={14} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Selection Controls */}
      {filteredNotifications.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <button
              onClick={selectAllVisible}
              className="text-luxury-gold hover:text-luxury-gold/80 font-medium"
            >
              Select all visible ({filteredNotifications.length})
            </button>
            {selectedNotifications.size > 0 && (
              <button
                onClick={clearSelection}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear selection
              </button>
            )}
          </div>
          
          <span>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </span>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-luxury-gold mx-auto mb-4"></div>
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {searchQuery ? 'No notifications match your search.' : 'You have no notifications at the moment.'}
            </p>
          </div>
        ) : (
          <>
            {filteredNotifications.map(renderNotificationItem)}
            
            {/* Load More */}
            {notifications.length >= (filters.limit || 50) && (
              <div className="text-center py-6">
                <button
                  onClick={() => handleFilterChange('limit', (filters.limit || 50) + 50)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Load More Notifications
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}