// Test site settings system in production
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // Only allow this in development or with a secret key for security
  const authHeader = request.headers.get('authorization');
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hasValidAuth = authHeader === `Bearer ${process.env.DEBUG_SECRET || 'debug-secret-123'}`;
  
  if (!isDevelopment && !hasValidAuth) {
    return NextResponse.json({ 
      error: 'Unauthorized. Add Authorization: Bearer debug-secret-123 header or run in development.' 
    }, { status: 401 });
  }

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Supabase environment variables not configured'
      }, { status: 500 });
    }

    // Test with anonymous client (same as frontend)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test site_settings table access
    const { data: settings, error: settingsError } = await supabase
      .from('site_settings')
      .select('key, value, category, label')
      .order('category');

    if (settingsError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch site settings',
        details: {
          message: settingsError.message,
          code: settingsError.code,
          details: settingsError.details,
          hint: settingsError.hint
        }
      }, { status: 500 });
    }

    // Organize settings by category
    const settingsByCategory = (settings || []).reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        key: setting.key,
        label: setting.label,
        hasValue: !!setting.value,
        valueType: typeof setting.value
      });
      return acc;
    }, {} as Record<string, any[]>);

    // Test specific critical settings
    const criticalSettings = [
      'payment_stripe_enabled',
      'payment_paypal_enabled', 
      'feature_search',
      'feature_wishlist',
      'store_name',
      'store_email'
    ];

    const criticalSettingsStatus: Record<string, any> = {};
    for (const key of criticalSettings) {
      const setting = settings?.find(s => s.key === key);
      criticalSettingsStatus[key] = {
        exists: !!setting,
        value: setting?.value || null,
        category: setting?.category || null
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      settingsCount: settings?.length || 0,
      categoriesFound: Object.keys(settingsByCategory),
      settingsByCategory,
      criticalSettings: criticalSettingsStatus,
      testPassed: settings && settings.length > 0
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}