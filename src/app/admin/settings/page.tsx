'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Store, 
  Truck, 
  Receipt, 
  Package, 
  Users, 
  ToggleLeft, 
  Mail, 
  Share2,
  Bell,
  Save,
  Loader2,
  AlertCircle,
  Box
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { SiteSetting, SettingCategory, SETTING_KEYS } from '@/types/settings';
import NotificationSettingsComponent from '@/components/admin/NotificationSettings';
import Showcase3DSettings from '@/components/admin/Showcase3DSettings';
import toast from 'react-hot-toast';

interface SettingGroup {
  category: SettingCategory;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const settingGroups: SettingGroup[] = [
  {
    category: 'payment',
    title: 'Payment Methods',
    description: 'Configure which payment methods are available at checkout',
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    category: 'store',
    title: 'Store Information',
    description: 'Basic information about your store',
    icon: <Store className="h-5 w-5" />
  },
  {
    category: 'shipping',
    title: 'Shipping',
    description: 'Configure shipping options and costs',
    icon: <Truck className="h-5 w-5" />
  },
  {
    category: 'tax',
    title: 'Tax Settings',
    description: 'Configure tax rates and display options',
    icon: <Receipt className="h-5 w-5" />
  },
  {
    category: 'product',
    title: 'Product Settings',
    description: 'Configure product-related options',
    icon: <Package className="h-5 w-5" />
  },
  {
    category: 'customer',
    title: 'Customer Settings',
    description: 'Configure customer account options',
    icon: <Users className="h-5 w-5" />
  },
  {
    category: 'features',
    title: 'Site Features',
    description: 'Enable or disable site features',
    icon: <ToggleLeft className="h-5 w-5" />
  },
  {
    category: 'email',
    title: 'Email Notifications',
    description: 'Configure email notification settings',
    icon: <Mail className="h-5 w-5" />
  },
  {
    category: 'social',
    title: 'Social Media',
    description: 'Social media profile links',
    icon: <Share2 className="h-5 w-5" />
  },
  {
    category: 'showcase',
    title: '3D Model Showcase',
    description: 'Configure the homepage 3D model showcase',
    icon: <Box className="h-5 w-5" />
  },
  {
    category: 'notifications',
    title: 'Admin Notifications',
    description: 'Configure your personal notification preferences',
    icon: <Bell className="h-5 w-5" />
  }
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modifiedSettings, setModifiedSettings] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('payment');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;

      setSettings(data || []);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ));
    setModifiedSettings(prev => new Set([...prev, key]));
  };

  const saveSettings = async () => {
    if (modifiedSettings.size === 0) {
      toast.success('No changes to save');
      return;
    }

    setSaving(true);
    try {
      // Update each modified setting
      const updates = settings
        .filter(setting => modifiedSettings.has(setting.key))
        .map(setting => 
          supabase
            .from('site_settings')
            .update({ 
              value: setting.value,
              updated_at: new Date().toISOString()
            })
            .eq('key', setting.key)
        );

      const results = await Promise.all(updates);
      
      // Check for errors
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Some settings failed to save');
      }

      toast.success(`${modifiedSettings.size} settings saved successfully`);
      setModifiedSettings(new Set());
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const renderSettingInput = (setting: SiteSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => handleSettingChange(setting.key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-luxury-gold/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-luxury-gold"></div>
          </label>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, parseFloat(e.target.value) || 0)}
            className="w-32 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
            step={setting.key.includes('cost') || setting.key.includes('threshold') ? '0.01' : '1'}
          />
        );
      
      case 'string':
      default:
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => handleSettingChange(setting.key, e.target.value)}
            className="w-full max-w-md px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold"
          />
        );
    }
  };

  const getCategorySettings = (category: SettingCategory) => {
    return settings.filter(setting => setting.category === category);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Site Settings</h1>
              <p className="mt-1 text-sm text-gray-600">
                Configure your store settings and preferences
              </p>
            </div>
            <button
              onClick={saveSettings}
              disabled={saving || modifiedSettings.size === 0}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                modifiedSettings.size > 0
                  ? 'bg-luxury-gold text-luxury-black hover:bg-yellow-500'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-4 w-4" />
                  Save Changes
                  {modifiedSettings.size > 0 && ` (${modifiedSettings.size})`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-1">
            {settingGroups.map((group) => (
              <button
                key={group.category}
                onClick={() => setActiveCategory(group.category)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeCategory === group.category
                    ? 'bg-luxury-gold/10 text-luxury-gold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {group.icon}
                <span className="ml-3">{group.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {settingGroups.map((group) => {
            if (group.category !== activeCategory) return null;
            
            // Special handling for notifications category
            if (group.category === 'notifications') {
              return (
                <div key={group.category}>
                  <NotificationSettingsComponent />
                </div>
              );
            }
            
            // Special handling for showcase category
            if (group.category === 'showcase') {
              return (
                <div key={group.category}>
                  <Showcase3DSettings />
                </div>
              );
            }
            
            const categorySettings = getCategorySettings(group.category);
            
            return (
              <div key={group.category}>
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {group.title}
                  </h2>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>

                <div className="space-y-6">
                  {categorySettings.map((setting) => (
                    <div 
                      key={setting.key} 
                      className={`border rounded-lg p-6 transition-colors ${
                        modifiedSettings.has(setting.key) 
                          ? 'border-luxury-gold bg-luxury-gold/5' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-900 mb-1">
                            {setting.label}
                          </label>
                          {setting.description && (
                            <p className="text-sm text-gray-600 mb-4">
                              {setting.description}
                            </p>
                          )}
                        </div>
                        <div className="ml-4">
                          {renderSettingInput(setting)}
                        </div>
                      </div>
                      
                      {/* Special notes for payment methods */}
                      {setting.key === SETTING_KEYS.PAYMENT_APPLE_PAY_ENABLED && !setting.value && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Apple Pay requires additional configuration including domain verification and merchant ID setup.
                          </p>
                        </div>
                      )}
                      
                      {setting.key === SETTING_KEYS.PAYMENT_GOOGLE_PAY_ENABLED && !setting.value && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Google Pay requires merchant account configuration and API integration.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}