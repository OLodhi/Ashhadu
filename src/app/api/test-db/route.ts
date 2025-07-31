// Simple database connection test
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    // Test basic connection with anon key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase configuration',
        details: {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          hasServiceKey: !!supabaseServiceKey
        }
      }, { status: 500 });
    }

    // Test with anon key first
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
    
    try {
      const { data: anonData, error: anonError } = await supabaseAnon
        .from('products')
        .select('id, name, status')
        .limit(1);

      if (anonError) {
        // Test with service key if anon fails
        if (supabaseServiceKey) {
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
          
          const { data: adminData, error: adminError } = await supabaseAdmin
            .from('products')
            .select('id, name, status')
            .limit(1);

          return NextResponse.json({
            success: adminError ? false : true,
            tests: {
              anonKey: {
                status: 'FAILED',
                error: anonError.message,
                code: anonError.code,
                details: anonError.details,
                hint: anonError.hint
              },
              serviceKey: {
                status: adminError ? 'FAILED' : 'SUCCESS',
                error: adminError?.message,
                code: adminError?.code,
                dataCount: adminData?.length || 0
              }
            },
            diagnosis: anonError.message.includes('Invalid API key') ? 
              'API key issue - check if keys match your Supabase project' :
              'Database access issue - check RLS policies'
          });
        } else {
          return NextResponse.json({
            success: false,
            tests: {
              anonKey: {
                status: 'FAILED',
                error: anonError.message,
                code: anonError.code,
                details: anonError.details,
                hint: anonError.hint
              }
            },
            diagnosis: anonError.message.includes('Invalid API key') ? 
              'API key issue - check if keys match your Supabase project' :
              'Database access issue - check RLS policies'
          });
        }
      } else {
        return NextResponse.json({
          success: true,
          tests: {
            anonKey: {
              status: 'SUCCESS',
              dataCount: anonData?.length || 0
            }
          },
          diagnosis: 'Connection working properly'
        });
      }
    } catch (connectionError: any) {
      return NextResponse.json({
        success: false,
        error: 'Connection failed',
        details: connectionError.message,
        diagnosis: 'Network or configuration issue'
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      diagnosis: 'Unexpected error'
    }, { status: 500 });
  }
}