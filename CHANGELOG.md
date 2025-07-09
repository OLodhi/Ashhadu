# Changelog

All notable changes to the Ashhadu Islamic Art e-commerce platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial changelog documentation

## [1.0.3] - 2025-07-09

### Fixed
- **Header Navigation**: Enhanced account button routing with proper role-based navigation
- **Account Dropdown**: Implemented role-specific dropdown content for admin and customer users
- **Admin Experience**: Admin users now consistently redirect to `/admin/dashboard` from any page
- **Customer Experience**: Customer users continue to use `/account` with full dropdown functionality

### Changed
- **Account Button Routing**: Replaced hardcoded `/account` links with dynamic `getUserRedirectPath()` function
- **Admin Dropdown**: Streamlined admin account dropdown to show only "Sign Out" option
- **Customer Dropdown**: Maintained full dropdown with "My Account", "My Orders", and "Sign Out" options

### Technical Details
- Added `getAccountUrl()` helper function for consistent role-based routing
- Imported `getUserRedirectPath` from `@/lib/auth-utils-shared`
- Enhanced AuthContext usage to include `profile` and `isAdmin` function
- Updated 4 account link locations: main button, dropdown, mobile menu, logged-out state
- Implemented conditional dropdown rendering based on user role

## [1.0.2] - 2025-07-09

### Fixed
- **Admin Login Redirect**: Added missing `/api/debug/user-info` endpoint to resolve admin login redirect failure
- **Authentication Flow**: Login page now properly calls debug endpoint for role-based routing
- **Documentation**: Updated CLAUDE.md to document critical API endpoint for future protection

### Added
- **API Endpoint**: `/api/debug/user-info` route for user profile data retrieval
- **Critical Endpoint Documentation**: Added warnings in CLAUDE.md to prevent accidental deletion

### Technical Details
- Created `src/app/api/debug/user-info/route.ts` with proper authentication validation
- Returns user profile data in expected format for login page redirect logic
- Uses `createServerSupabaseClient` for SSR-compatible authentication
- Resolves issue where admin users were redirected to `/account` instead of `/admin/dashboard`

## [1.0.1] - 2025-07-09

### Added
- **Comprehensive Documentation**: Complete authentication troubleshooting session documentation in CLAUDE.md
- **Project Structure**: Detailed project architecture and file organization
- **Development Workflow**: Commands and setup instructions for development environment

### Fixed
- **Authentication System**: Resolved RLS policy infinite recursion on profiles table
- **SSR Compatibility**: Implemented proper server-side rendering with `@supabase/ssr`
- **Admin Access Control**: Fixed admin role detection and redirect logic
- **Data Parsing**: Corrected API response parsing in AdminLayoutClient component

### Changed
- **Authentication Architecture**: Split client and server authentication utilities
- **RLS Policies**: Replaced recursive policies with JWT metadata-based policies
- **Error Handling**: Enhanced error state management and duplicate notification prevention

### Technical Details
- Created `src/lib/auth-utils-server.ts` for server-only authentication utilities
- Created `src/lib/supabase-client.ts` for SSR-compatible browser client
- Created `src/lib/auth-utils-shared.ts` for client-safe authentication utilities
- Updated `src/components/admin/AdminLayoutClient.tsx` with proper data parsing
- Enhanced `src/contexts/AuthContext.tsx` with SSR-compatible client usage

## [1.0.0] - 2025-07-09

### Added
- **Initial Release**: Complete Next.js 15 Islamic art e-commerce platform
- **Authentication System**: Full user authentication with Supabase integration
- **Admin Dashboard**: Comprehensive admin interface for product and order management
- **Customer Portal**: User account management and order tracking
- **Product Management**: Complete CRUD operations for Islamic art products
- **Shopping Cart**: Zustand-powered cart with persistence
- **Payment Integration**: Stripe, PayPal, Apple Pay, and Google Pay support
- **Database Schema**: Complete PostgreSQL schema with RLS policies
- **Responsive Design**: Mobile-first luxury Islamic art aesthetic
- **Wishlist Functionality**: User wishlist management
- **Search System**: Product search with modal interface
- **Role-Based Access**: Admin and customer role separation
- **Image Upload**: Product image management with Supabase storage
- **UK E-commerce Features**: VAT handling, GBP currency, UK addresses

### Technical Stack
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: Zustand, React Context
- **Payments**: Stripe, PayPal integration
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Fonts**: Playfair Display, Inter, Amiri (Arabic support)

### Features
- **11 Database Tables**: Complete e-commerce schema with Islamic art specifics
- **RESTful API**: Full CRUD operations with type safety
- **Authentication**: JWT-based with role-based access control
- **Admin Features**: Product management, customer management, order tracking
- **Customer Features**: Account management, order history, wishlist
- **Islamic Art Focus**: Arabic text support, cultural context, UK market
- **Luxury Design**: Black/white/gold aesthetic with Islamic patterns

---

## Version History

- **v1.0.3** (2025-07-09): Header navigation and account routing improvements
- **v1.0.2** (2025-07-09): Admin login redirect fix and API endpoint addition
- **v1.0.1** (2025-07-09): Authentication system fixes and documentation
- **v1.0.0** (2025-07-09): Initial release of complete e-commerce platform

---

## Development Information

- **Repository**: https://github.com/OLodhi/Ashhadu
- **Development Server**: `npm run dev` (runs on port 3000)
- **Database**: Supabase PostgreSQL with Row Level Security
- **Authentication**: Supabase Auth with JWT metadata for role management
- **Deployment**: Ready for production deployment to GoDaddy or similar hosting

---

*This changelog is maintained to track all significant changes, bug fixes, and feature additions to the Ashhadu Islamic Art e-commerce platform.*