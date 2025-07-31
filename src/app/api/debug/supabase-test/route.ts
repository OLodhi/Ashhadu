// Comprehensive Supabase connection test for production
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

  const tests: Record<string, any> = {
    environment: {},
    connection: {},
    authentication: {},
    database: {},
    storage: {},
    rls: {}
  };

  try {
    // Test 1: Environment Variables
    tests.environment = {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrlFormat: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') ? 'valid' : 'invalid',
      urlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...` : 'MISSING'
    };

    // Test 2: Basic Connection
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      tests.connection = {
        status: 'FAILED',
        error: 'Missing required environment variables'
      };
      return NextResponse.json({ success: false, tests }, { status: 500 });
    }

    // Create clients
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    tests.connection = {
      status: 'SUCCESS',
      clientCreated: true,
      adminCreated: true
    };

    // Test 3: Database Connection - Products Table
    try {
      const { data: productsData, error: productsError } = await supabaseAdmin
        .from('products')
        .select('id, name, status')
        .limit(5);

      if (productsError) {
        tests.database.products = {
          status: 'ERROR',
          error: productsError.message,
          code: productsError.code,
          details: productsError.details,
          hint: productsError.hint
        };
      } else {
        tests.database.products = {
          status: 'SUCCESS',
          count: productsData?.length || 0,
          sampleData: productsData?.map(p => ({ id: p.id, name: p.name?.substring(0, 30) + '...', status: p.status }))
        };
      }
    } catch (error: any) {
      tests.database.products = {
        status: 'CONNECTION_ERROR',
        error: error.message
      };
    }

    // Test 4: Database Connection - Other Tables
    const tables = ['categories', 'customers', 'orders', 'profiles'];
    for (const table of tables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1);

        if (error) {
          tests.database[table] = {
            status: 'ERROR',
            error: error.message,
            code: error.code
          };
        } else {
          tests.database[table] = {
            status: 'SUCCESS',
            exists: true
          };
        }
      } catch (error: any) {
        tests.database[table] = {
          status: 'ERROR',
          error: error.message
        };
      }
    }

    // Test 5: Storage Connection
    try {
      const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
      
      if (bucketsError) {
        tests.storage = {
          status: 'ERROR',
          error: bucketsError.message
        };
      } else {
        tests.storage = {
          status: 'SUCCESS',
          buckets: buckets?.map(b => b.name) || [],
          hasProductImages: buckets?.some(b => b.name === 'product-images') || false,
          hasUserAvatars: buckets?.some(b => b.name === 'user-avatars') || false
        };
      }
    } catch (error: any) {
      tests.storage = {
        status: 'ERROR',
        error: error.message
      };
    }

    // Test 6: Authentication Test (if user provided)
    const testToken = request.headers.get('x-test-token');
    if (testToken) {
      try {
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser(testToken);
        
        if (authError) {
          tests.authentication = {
            status: 'ERROR',
            error: authError.message
          };
        } else {
          tests.authentication = {
            status: 'SUCCESS',
            userId: user?.id,
            email: user?.email
          };
        }
      } catch (error: any) {
        tests.authentication = {
          status: 'ERROR',
          error: error.message
        };
      }
    } else {
      tests.authentication = {
        status: 'SKIPPED',
        note: 'Add X-Test-Token header to test authentication'
      };
    }

    // Test 7: RLS Policies Test
    try {
      const { data: publicData, error: publicError } = await supabaseClient
        .from('products')
        .select('id, name, status')
        .eq('status', 'published')
        .limit(3);

      if (publicError) {
        tests.rls.public = {
          status: 'ERROR',
          error: publicError.message,
          note: 'Public access to published products failed'
        };
      } else {
        tests.rls.public = {
          status: 'SUCCESS',
          count: publicData?.length || 0,
          note: 'Public access to published products working'
        };
      }
    } catch (error: any) {
      tests.rls.public = {
        status: 'ERROR',
        error: error.message
      };
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      tests,
      summary: {
        environment: tests.environment.hasSupabaseUrl && tests.environment.hasAnonKey ? 'PASS' : 'FAIL',
        connection: tests.connection.status,
        database: tests.database.products?.status === 'SUCCESS' ? 'PASS' : 'FAIL',
        storage: tests.storage.status,
        authentication: tests.authentication.status,
        rls: tests.rls.public?.status === 'SUCCESS' ? 'PASS' : 'FAIL'
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      tests
    }, { status: 500 });
  }
}