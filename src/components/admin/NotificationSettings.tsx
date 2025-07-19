'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Mail, 
  Clock, 
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Package,
  ShoppingCart,
  User,
  Star
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationSettings, NOTIFICATION_SETTING_KEYS, DEFAULT_NOTIFICATION_SETTINGS } from '@/types/notifications';
import toast from 'react-hot-toast';

interface NotificationSettingsProps {
  className?: string;
}

export default function NotificationSettingsComponent({ className = '' }: NotificationSettingsProps) {
  const { settings, loading, updateSettings, fetchSettings } = useNotifications();
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize local settings when context settings load
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      setHasChanges(false);
    }
  }, [settings]);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
      toast.success('Notification settings saved successfully');
    } catch (error) {
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLocalSettings(settings || DEFAULT_NOTIFICATION_SETTINGS);
    setHasChanges(false);
  };

  const eventSettings = [
    {
      key: 'notification_new_orders' as const,
      title: 'New Orders',
      description: 'Notify when new orders are received',
      icon: <ShoppingCart size={20} className="text-blue-500" />,
    },
    {
      key: 'notification_cancelled_orders' as const,
      title: 'Cancelled Orders',
      description: 'Notify when orders are cancelled',
      icon: <ShoppingCart size={20} className="text-red-500" />,
    },
    {
      key: 'notification_low_stock' as const,
      title: 'Low Stock Alerts',
      description: 'Notify when products are running low on stock',
      icon: <Package size={20} className="text-orange-500" />,
    },
    {
      key: 'notification_out_of_stock' as const,
      title: 'Out of Stock Alerts',
      description: 'Notify when products go out of stock',
      icon: <Package size={20} className="text-red-500" />,
    },
    {
      key: 'notification_back_in_stock' as const,
      title: 'Back in Stock',
      description: 'Notify when products come back in stock',
      icon: <Package size={20} className="text-green-500" />,
    },
    {
      key: 'notification_new_customers' as const,
      title: 'New Customer Registrations',
      description: 'Notify when new customers register',
      icon: <User size={20} className="text-blue-500" />,
    },
    {
      key: 'notification_pending_reviews' as const,
      title: 'Pending Reviews',
      description: 'Notify when new reviews need approval',
      icon: <Star size={20} className="text-yellow-500" />,
    },
    {
      key: 'notification_payment_failures' as const,
      title: 'Payment Failures',
      description: 'Notify when payments fail or are disputed',
      icon: <AlertCircle size={20} className="text-red-500" />,
    },
  ];

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
              <p className="text-sm text-gray-600">Configure your personal notification preferences</p>
            </div>
          </div>
          
          {hasChanges && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-1.5 bg-luxury-gold text-white rounded-md text-sm hover:bg-luxury-gold/90 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Event Notifications */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">Event Notifications</h3>
          <div className="space-y-4">
            {eventSettings.map((setting) => (
              <div key={setting.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  {setting.icon}
                  <div>
                    <div className="font-medium text-gray-900">{setting.title}</div>
                    <div className="text-sm text-gray-600">{setting.description}</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={localSettings[setting.key]}
                    onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Preferences */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">Delivery Preferences</h3>
          <div className="space-y-4">
            {/* Sound Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                {localSettings.notification_sound_enabled ? (
                  <Volume2 size={20} className="text-green-500" />
                ) : (
                  <VolumeX size={20} className="text-gray-400" />
                )}
                <div>
                  <div className="font-medium text-gray-900">Sound Notifications</div>
                  <div className="text-sm text-gray-600">Play sound when new notifications arrive</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={localSettings.notification_sound_enabled}
                  onChange={(e) => handleSettingChange('notification_sound_enabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
              </label>
            </div>

            {/* Desktop Notifications */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <Monitor size={20} className="text-blue-500" />
                <div>
                  <div className="font-medium text-gray-900">Desktop Notifications</div>
                  <div className="text-sm text-gray-600">Show browser notifications for important alerts</div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={localSettings.notification_desktop_enabled}
                  onChange={(e) => handleSettingChange('notification_desktop_enabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
              </label>
            </div>

            {/* Email Digest */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <Mail size={20} className="text-purple-500" />
                <div>
                  <div className="font-medium text-gray-900">Email Digest</div>
                  <div className="text-sm text-gray-600">Receive notification summaries via email</div>
                </div>
              </div>
              <select
                value={localSettings.notification_email_digest}
                onChange={(e) => handleSettingChange('notification_email_digest', e.target.value as 'never' | 'daily' | 'weekly')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
              >
                <option value="never">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Behavior Settings */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">Behavior Settings</h3>
          <div className="space-y-4">
            {/* Auto Dismiss */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <Clock size={20} className="text-orange-500" />
                <div>
                  <div className="font-medium text-gray-900">Auto Dismiss</div>
                  <div className="text-sm text-gray-600">Automatically dismiss notifications after this many days</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={localSettings.notification_auto_dismiss_days}
                  onChange={(e) => handleSettingChange('notification_auto_dismiss_days', parseInt(e.target.value) || 30)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
                />
                <span className="text-sm text-gray-600">days</span>
              </div>
            </div>

            {/* Minimum Priority */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <AlertCircle size={20} className="text-yellow-500" />
                <div>
                  <div className="font-medium text-gray-900">Minimum Priority</div>
                  <div className="text-sm text-gray-600">Only show notifications at or above this priority level</div>
                </div>
              </div>
              <select
                value={localSettings.notification_min_priority}
                onChange={(e) => handleSettingChange('notification_min_priority', e.target.value as 'low' | 'normal' | 'high' | 'urgent')}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        {hasChanges && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle size={16} className="text-yellow-600" />
            <span className="text-sm text-yellow-800">You have unsaved changes</span>
          </div>
        )}
        
        {!hasChanges && settings && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 size={16} className="text-green-600" />
            <span className="text-sm text-green-800">Settings saved</span>
          </div>
        )}
      </div>
    </div>
  );
}