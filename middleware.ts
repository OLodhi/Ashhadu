import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/database';

export async function middleware(req: NextRequest) {
  console.log('🟢 MIDDLEWARE RUNNING FOR PATH:', req.nextUrl.pathname);
  
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  console.log('🔵 Session status:', session ? 'Authenticated' : 'Not authenticated');

  const { pathname } = req.nextUrl;

  // Protected customer routes
  const customerProtectedRoutes = [
    '/account',
    '/account/',
    '/account/profile',
    '/account/addresses',
    '/account/orders',
    '/account/wishlist',
    '/account/payments',
    '/wishlist',
    '/test-protected'
  ];

  // Protected admin routes
  const adminProtectedRoutes = [
    '/admin',
    '/admin/',
    '/admin/dashboard',
    '/admin/products',
    '/admin/orders',
    '/admin/customers'
  ];

  // Auth routes (redirect if already logged in)
  const authRoutes = ['/login', '/signup', '/forgot-password'];

  // Check if current path is protected
  const isCustomerProtected = customerProtectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  const isAdminProtected = adminProtectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  console.log('🔵 Route check:', { pathname, isCustomerProtected, isAdminProtected, hasSession: !!session });

  // If user is not authenticated and trying to access protected routes
  if (!session && (isCustomerProtected || isAdminProtected)) {
    console.log('🔴 Redirecting to login - no session for protected route:', pathname);
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access auth routes
  if (session && isAuthRoute) {
    // Check user role and redirect appropriately
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    } else {
      return NextResponse.redirect(new URL('/account', req.url));
    }
  }

  // Check admin access for admin routes
  if (session && isAdminProtected) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/account', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api (API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};