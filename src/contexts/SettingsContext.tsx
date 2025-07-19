'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SiteSetting, SettingKey, SETTING_KEYS } from '@/types/settings';
import { supabase } from '@/lib/supabase-client';
import toast from 'react-hot-toast';

interface SettingsContextType {
  settings: Record<string, any>;
  loading: boolean;
  error: string | null;
  getSetting: <K extends SettingKey>(key: K) => any;
  updateSetting: (key: string, value: any) => Promise<void>;
  refreshSettings: () => Promise<void>;
  // Payment method helpers
  isStripeEnabled: boolean;
  isPayPalEnabled: boolean;
  isApplePayEnabled: boolean;
  isGooglePayEnabled: boolean;
  // Feature helpers
  isWishlistEnabled: boolean;
  isSearchEnabled: boolean;
  isNewsletterEnabled: boolean;
  // Shipping helpers
  freeShippingThreshold: number;
  defaultShippingCost: number;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) throw error;

      // Convert array to object keyed by setting key
      const settingsMap: Record<string, any> = {};
      data?.forEach((setting: SiteSetting) => {
        settingsMap[setting.key] = setting.value;
      });

      setSettings(settingsMap);
      setError(null);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
      
      // Set default values on error
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();

    // Set up real-time subscription for settings changes
    const settingsSubscription = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings'
        },
        (payload) => {
          console.log('Settings changed:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            // Update the specific setting in local state
            setSettings(prev => ({
              ...prev,
              [payload.new.key]: payload.new.value
            }));
          } else if (payload.eventType === 'INSERT' && payload.new) {
            // Add new setting to local state
            setSettings(prev => ({
              ...prev,
              [payload.new.key]: payload.new.value
            }));
          } else if (payload.eventType === 'DELETE' && payload.old) {
            // Remove setting from local state
            setSettings(prev => {
              const updated = { ...prev };
              delete updated[payload.old.key];
              return updated;
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      settingsSubscription.unsubscribe();
    };
  }, [fetchSettings]);

  const getSetting = useCallback(<K extends SettingKey>(key: K): any => {
    return settings[key] ?? getDefaultValue(key);
  }, [settings]);

  const updateSetting = useCallback(async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value, updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;

      // Update local state
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));

      toast.success('Setting updated successfully');
    } catch (err) {
      console.error('Error updating setting:', err);
      toast.error('Failed to update setting');
      throw err;
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    setLoading(true);
    await fetchSettings();
  }, [fetchSettings]);

  // Create reactive helper properties using useMemo or direct computation
  const isStripeEnabled = getSetting(SETTING_KEYS.PAYMENT_STRIPE_ENABLED);
  const isPayPalEnabled = getSetting(SETTING_KEYS.PAYMENT_PAYPAL_ENABLED);
  const isApplePayEnabled = getSetting(SETTING_KEYS.PAYMENT_APPLE_PAY_ENABLED);
  const isGooglePayEnabled = getSetting(SETTING_KEYS.PAYMENT_GOOGLE_PAY_ENABLED);
  const isWishlistEnabled = getSetting(SETTING_KEYS.FEATURE_WISHLIST);
  const isSearchEnabled = getSetting(SETTING_KEYS.FEATURE_SEARCH);
  const isNewsletterEnabled = getSetting(SETTING_KEYS.FEATURE_NEWSLETTER);
  const freeShippingThreshold = getSetting(SETTING_KEYS.SHIPPING_FREE_THRESHOLD);
  const defaultShippingCost = getSetting(SETTING_KEYS.SHIPPING_DEFAULT_COST);

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    getSetting,
    updateSetting,
    refreshSettings,
    // Payment method helpers - now reactive
    isStripeEnabled,
    isPayPalEnabled,
    isApplePayEnabled,
    isGooglePayEnabled,
    // Feature helpers - now reactive
    isWishlistEnabled,
    isSearchEnabled,
    isNewsletterEnabled,
    // Shipping helpers - now reactive
    freeShippingThreshold,
    defaultShippingCost,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Default values for settings
function getDefaultValue(key: SettingKey): any {
  const defaults: Record<string, any> = {
    // Payment defaults
    [SETTING_KEYS.PAYMENT_STRIPE_ENABLED]: true,
    [SETTING_KEYS.PAYMENT_PAYPAL_ENABLED]: true,
    [SETTING_KEYS.PAYMENT_APPLE_PAY_ENABLED]: false,
    [SETTING_KEYS.PAYMENT_GOOGLE_PAY_ENABLED]: false,
    [SETTING_KEYS.PAYMENT_TEST_MODE]: true,
    
    // Store defaults
    [SETTING_KEYS.STORE_NAME]: 'Ashhadu Islamic Art',
    [SETTING_KEYS.STORE_EMAIL]: 'info@ashhadu.co.uk',
    [SETTING_KEYS.STORE_PHONE]: '+44 20 1234 5678',
    [SETTING_KEYS.STORE_ADDRESS]: '123 Islamic Art Lane, London, UK',
    [SETTING_KEYS.STORE_CURRENCY]: 'GBP',
    [SETTING_KEYS.STORE_COUNTRY]: 'GB',
    
    // Shipping defaults
    [SETTING_KEYS.SHIPPING_FREE_THRESHOLD]: 50,
    [SETTING_KEYS.SHIPPING_DEFAULT_COST]: 4.99,
    [SETTING_KEYS.SHIPPING_EXPRESS_ENABLED]: true,
    [SETTING_KEYS.SHIPPING_EXPRESS_COST]: 9.99,
    [SETTING_KEYS.SHIPPING_INTERNATIONAL_ENABLED]: false,
    
    // Tax defaults
    [SETTING_KEYS.TAX_RATE]: 20,
    [SETTING_KEYS.TAX_INCLUSIVE_PRICING]: true,
    [SETTING_KEYS.TAX_DISPLAY_IN_CART]: true,
    
    // Product defaults
    [SETTING_KEYS.PRODUCT_LOW_STOCK_THRESHOLD]: 5,
    [SETTING_KEYS.PRODUCT_ALLOW_BACKORDERS]: false,
    [SETTING_KEYS.PRODUCT_REVIEWS_ENABLED]: true,
    [SETTING_KEYS.PRODUCT_GUEST_REVIEWS]: false,
    
    // Customer defaults
    [SETTING_KEYS.CUSTOMER_GUEST_CHECKOUT]: true,
    [SETTING_KEYS.CUSTOMER_EMAIL_VERIFICATION]: true,
    [SETTING_KEYS.CUSTOMER_MARKETING_DEFAULT]: false,
    
    // Feature defaults
    [SETTING_KEYS.FEATURE_WISHLIST]: true,
    [SETTING_KEYS.FEATURE_SEARCH]: true,
    [SETTING_KEYS.FEATURE_NEWSLETTER]: true,
    [SETTING_KEYS.FEATURE_SOCIAL_LINKS]: true,
    
    // Email defaults
    [SETTING_KEYS.EMAIL_ORDER_CONFIRMATION]: true,
    [SETTING_KEYS.EMAIL_SHIPPING_NOTIFICATION]: true,
    [SETTING_KEYS.EMAIL_ADMIN_NEW_ORDER]: true,
    [SETTING_KEYS.EMAIL_ADMIN_LOW_STOCK]: true,
    
    // Social defaults
    [SETTING_KEYS.SOCIAL_INSTAGRAM]: 'https://instagram.com/ashhadu',
    [SETTING_KEYS.SOCIAL_FACEBOOK]: 'https://facebook.com/ashhadu',
    [SETTING_KEYS.SOCIAL_TWITTER]: 'https://twitter.com/ashhadu',
    [SETTING_KEYS.SOCIAL_TIKTOK]: '',
  };
  
  return defaults[key];
}

function getDefaultSettings(): Record<string, any> {
  const defaults: Record<string, any> = {};
  Object.values(SETTING_KEYS).forEach(key => {
    defaults[key] = getDefaultValue(key as SettingKey);
  });
  return defaults;
}