import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/auth-utils-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get the current site URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Check various redirect URL formats
    const possibleRedirectUrls = [
      `${siteUrl}/auth/reset-password`,
      `${siteUrl}/auth/callback`,
      `${siteUrl}/auth/callback?next=/reset-password`,
      `${siteUrl}/reset-password`,
    ];
    
    console.log('🔍 Checking password reset configuration...');
    console.log('Site URL:', siteUrl);
    console.log('Possible redirect URLs:', possibleRedirectUrls);
    
    // Get auth config (this requires admin access)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.email);
    } catch (error) {
      console.error('Error getting user:', error);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        siteUrl,
        possibleRedirectUrls,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        environment: process.env.NODE_ENV,
        recommendation: 'Ensure one of these URLs is added to Supabase Dashboard → Authentication → URL Configuration → Redirect URLs'
      }
    });
  } catch (error) {
    console.error('Debug check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check configuration'
    }, { status: 500 });
  }
}

// Test sending a password reset email with detailed logging
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email is required'
      }, { status: 400 });
    }
    
    const supabase = await createServerSupabaseClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Try different redirect URL formats
    const redirectUrls = [
      `${siteUrl}/auth/reset-password`,
      `${siteUrl}/auth/callback?next=/auth/reset-password`,
    ];
    
    const results = [];
    
    for (const redirectUrl of redirectUrls) {
      console.log(`🔄 Trying password reset with redirect URL: ${redirectUrl}`);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      results.push({
        redirectUrl,
        success: !error,
        error: error?.message || null,
        data
      });
      
      if (!error) {
        console.log(`✅ Successfully sent reset email with redirect URL: ${redirectUrl}`);
        break;
      } else {
        console.error(`❌ Failed with redirect URL ${redirectUrl}:`, error);
      }
    }
    
    return NextResponse.json({
      success: results.some(r => r.success),
      data: {
        email,
        attempts: results,
        successfulRedirectUrl: results.find(r => r.success)?.redirectUrl || null
      }
    });
  } catch (error) {
    console.error('Test reset email error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send test reset email'
    }, { status: 500 });
  }
}