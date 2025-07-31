// Debug API route to check environment variables in production
import { NextRequest, NextResponse } from 'next/server';

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
    // Check environment variables (without exposing sensitive values)
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'MISSING',
      // Show first and last 10 characters for verification
      supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 10)}...${process.env.NEXT_PUBLIC_SUPABASE_URL.slice(-10)}` : 'MISSING',
      anonKeyPreview: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(-10)}` : 'MISSING',
    };

    // Test Supabase connection
    let supabaseTest = null;
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Test basic connection
      const { data, error } = await supabase.from('products').select('count', { count: 'exact' }).limit(1);
      
      if (error) {
        supabaseTest = {
          status: 'ERROR',
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        };
      } else {
        supabaseTest = {
          status: 'SUCCESS',
          message: 'Successfully connected to Supabase',
          productCount: data?.length || 0
        };
      }
    } catch (error: any) {
      supabaseTest = {
        status: 'CONNECTION_ERROR',
        message: error.message,
        type: error.constructor.name
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      supabaseTest
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}