'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AdminNotification, 
  NotificationFilters, 
  NotificationSettings, 
  NotificationContextType,
  NotificationSettingKey,
  DEFAULT_NOTIFICATION_SETTINGS
} from '@/types/notifications';
import toast from 'react-hot-toast';

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [subscriptionRef, setSubscriptionRef] = useState<any>(null);

  // Check if user is admin
  const isAdmin = profile?.role === 'admin';

  // Fetch notifications
  const fetchNotifications = useCallback(async (filters?: NotificationFilters) => {
    if (!isAdmin) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
          }
        });
      }

      const url = `/api/admin/notifications${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.data.notifications);
        setUnreadCount(data.data.unread_count);
      } else {
        setError(data.error || 'Failed to fetch notifications');
        toast.error(data.error || 'Failed to fetch notifications');
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch notifications';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const response = await fetch('/api/admin/notifications/unread-count');
      const data = await response.json();

      if (data.success) {
        setUnreadCount(data.data.unread_count);
      }
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAdmin]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        toast.success('Notification marked as read');
      } else {
        toast.error(data.error || 'Failed to mark notification as read');
      }
    } catch (err) {
      toast.error('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
    }
  }, [isAdmin]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const response = await fetch('/api/admin/notifications/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_all_read' }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        
        setUnreadCount(0);
        toast.success(data.data.message);
      } else {
        toast.error(data.error || 'Failed to mark all notifications as read');
      }
    } catch (err) {
      toast.error('Failed to mark all notifications as read');
      console.error('Error marking all notifications as read:', err);
    }
  }, [isAdmin]);

  // Dismiss notification
  const dismissNotification = useCallback(async (notificationId: string) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismissed: true }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, dismissed: true }
              : notification
          )
        );
        
        // Update unread count if notification was unread
        const notification = notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        toast.success('Notification dismissed');
      } else {
        toast.error(data.error || 'Failed to dismiss notification');
      }
    } catch (err) {
      toast.error('Failed to dismiss notification');
      console.error('Error dismissing notification:', err);
    }
  }, [isAdmin, notifications]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!isAdmin) return;

    try {
      const response = await fetch(`/api/admin/notifications/${notificationId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast.success('Notification deleted');
      } else {
        toast.error(data.error || 'Failed to delete notification');
      }
    } catch (err) {
      toast.error('Failed to delete notification');
      console.error('Error deleting notification:', err);
    }
  }, [isAdmin]);

  // Fetch notification settings
  const fetchSettings = useCallback(async () => {
    if (!isAdmin) return;

    try {
      const response = await fetch('/api/admin/notification-settings');
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
      } else {
        setError(data.error || 'Failed to fetch notification settings');
      }
    } catch (err) {
      console.error('Error fetching notification settings:', err);
      setError('Failed to fetch notification settings');
    }
  }, [isAdmin]);

  // Update single notification setting
  const updateSetting = useCallback(async (key: NotificationSettingKey, value: any) => {
    if (!isAdmin) return;

    try {
      const response = await fetch('/api/admin/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        toast.success('Notification setting updated');
      } else {
        toast.error(data.error || 'Failed to update notification setting');
      }
    } catch (err) {
      toast.error('Failed to update notification setting');
      console.error('Error updating notification setting:', err);
    }
  }, [isAdmin]);

  // Update multiple notification settings
  const updateSettings = useCallback(async (newSettings: Partial<NotificationSettings>) => {
    if (!isAdmin) return;

    try {
      const response = await fetch('/api/admin/notification-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        toast.success('Notification settings updated');
      } else {
        toast.error(data.error || 'Failed to update notification settings');
      }
    } catch (err) {
      toast.error('Failed to update notification settings');
      console.error('Error updating notification settings:', err);
    }
  }, [isAdmin]);

  // Subscribe to real-time notifications
  const subscribe = useCallback(() => {
    if (!isAdmin || !user?.id || subscriptionRef) return;

    console.log('🔔 Subscribing to real-time notifications for user:', user.id);

    const subscription = supabase
      .channel('admin_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_notifications',
          filter: `admin_user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('🔔 Real-time notification event:', payload);

          if (payload.eventType === 'INSERT') {
            // New notification received
            const newNotification = payload.new as AdminNotification;
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Show toast notification if enabled
            if (settings?.notification_sound_enabled) {
              toast.success(`New ${newNotification.type.replace('_', ' ')}: ${newNotification.title}`);
            }
          } else if (payload.eventType === 'UPDATE') {
            // Notification updated
            const updatedNotification = payload.new as AdminNotification;
            setNotifications(prev => 
              prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
            );
          } else if (payload.eventType === 'DELETE') {
            // Notification deleted
            const deletedId = payload.old.id;
            setNotifications(prev => prev.filter(n => n.id !== deletedId));
          }
        }
      )
      .subscribe();

    setSubscriptionRef(subscription);
  }, [isAdmin, user?.id, subscriptionRef, settings?.notification_sound_enabled]);

  // Unsubscribe from real-time notifications
  const unsubscribe = useCallback(() => {
    if (subscriptionRef) {
      console.log('🔔 Unsubscribing from real-time notifications');
      supabase.removeChannel(subscriptionRef);
      setSubscriptionRef(null);
    }
  }, [subscriptionRef]);

  // Initialize when user becomes admin
  useEffect(() => {
    if (isAdmin && user?.id) {
      fetchNotifications({ limit: 20 });
      fetchSettings();
      subscribe();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setSettings(null);
      unsubscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [isAdmin, user?.id]);

  // Periodic refresh of unread count
  useEffect(() => {
    if (!isAdmin) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAdmin, fetchUnreadCount]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    settings,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    deleteNotification,
    fetchSettings,
    updateSetting,
    updateSettings,
    subscribe,
    unsubscribe,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}

// Hook for notification count only (lighter weight)
export function useNotificationCount() {
  const { unreadCount, loading } = useNotifications();
  return { unreadCount, loading };
}