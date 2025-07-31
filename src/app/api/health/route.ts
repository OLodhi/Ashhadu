// Simple health check endpoint
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      config: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
        supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'configured' : 'missing',
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not-set'
      }
    };

    return NextResponse.json(health);
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
