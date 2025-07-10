# Changelog

All notable changes to the Ashhadu Islamic Art e-commerce platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Upcoming features and improvements

## [1.0.8] - 2025-07-10

### Added
- **Complete Inventory Management System**: Comprehensive stock tracking and management functionality
- **Stock Validation**: Automatic stock availability checking before order creation to prevent overselling
- **Inventory Movement Tracking**: Complete audit trail of all stock changes with reasons and references
- **Automatic Stock Deduction**: Stock automatically deducted when orders are placed
- **Automatic Stock Restoration**: Stock automatically restored when orders are cancelled or refunded
- **Stock Status Management**: Automatic updates to stock status (in-stock/low-stock/out-of-stock) based on quantities
- **Manual Stock Adjustments**: Admin interface for manual inventory corrections with audit logging
- **Inventory Reports API**: Comprehensive reporting endpoints for stock summaries and detailed analysis
- **Admin Inventory Dashboard**: Full-featured inventory management interface with overview, stock levels, and movement history
- **Low Stock Monitoring**: Automatic identification and reporting of products below stock thresholds
- **Stock Value Calculations**: Real-time calculation of total inventory value for business reporting

### Enhanced
- **Order Creation API**: Enhanced with automatic stock validation and deduction functionality
- **Order Cancellation**: Now includes automatic stock restoration for cancelled orders
- **Bulk Order Operations**: Enhanced bulk cancellation to properly restore stock for multiple orders
- **Database Integration**: All inventory operations properly integrated with existing order management system
- **Error Handling**: Comprehensive error management with transaction rollback for failed inventory operations

### Fixed
- **Admin Customer List**: Excluded admin accounts from customer listings using proper email-based filtering
- **Order Processing**: Prevented creation of orders when insufficient stock is available
- **Stock Consistency**: Ensured accurate stock levels across all order operations
- **Customer API Authentication**: Enhanced security with proper admin role verification

### API Enhancements
- **POST `/api/inventory/adjust`**: Manual stock adjustment endpoint with admin authentication
- **GET `/api/inventory/movements`**: Inventory movement history with filtering and pagination
- **GET `/api/inventory/reports`**: Stock reporting with summary, low-stock, and detailed views
- **Enhanced `/api/orders`**: Integrated stock validation and automatic deduction
- **Enhanced `/api/orders/[id]`**: Added stock restoration for order cancellations
- **Enhanced `/api/orders/bulk`**: Added bulk stock restoration for cancelled orders
- **Enhanced `/api/customers`**: Improved filtering to exclude admin accounts from customer listings

### Islamic Art Business Features
- **3D Printing Inventory**: Proper stock management for 3D printed Islamic art pieces
- **Custom Commission Tracking**: Inventory management for personalized Islamic art orders
- **Material Cost Tracking**: Stock value calculations for production planning and material costs
- **Seasonal Stock Planning**: Comprehensive reporting for Islamic holiday and seasonal inventory management
- **Arabic Product Integration**: Full inventory support for products with Arabic names and Islamic categories

### Technical Details
- **New Library**: `/src/lib/inventory.ts` - Complete inventory management utility functions
- **Type Safety**: Full TypeScript integration with proper inventory and stock movement interfaces
- **Database Performance**: Efficient queries with proper indexing for inventory operations
- **Audit Trail**: Complete logging of all inventory changes with user attribution and timestamps
- **Error Recovery**: Robust error handling with automatic rollback for failed operations
- **Real-time Updates**: Live stock status updates across all admin interfaces

### Security & Business Logic
- **Admin-Only Access**: All inventory management features restricted to admin users
- **Stock Validation**: Prevents overselling through comprehensive availability checking
- **Transaction Integrity**: Ensures order and inventory operations remain consistent
- **Audit Compliance**: Complete trail of all inventory movements for business reporting
- **Error Prevention**: Multiple safeguards against inventory inconsistencies

## [1.0.7] - 2025-07-10

### Added
- **Complete Order Management System**: Comprehensive order processing workflow with database integration
- **Individual Order API**: GET and PUT endpoints for single order management (`/api/orders/[id]`)
- **Bulk Order Operations**: API for handling multiple orders simultaneously (`/api/orders/bulk`)
- **Order Statistics API**: Advanced analytics and reporting (`/api/orders/stats`)
- **Order Detail View**: Fully functional admin order detail page with real-time updates
- **Order Actions System**: Complete workflow management (mark paid, shipping, delivery, cancellation)
- **Smart Order Workflow**: Automatic status progression with business logic enforcement
- **Order Timeline**: Visual order progression with timestamps and status history
- **Note Management**: Add timestamped notes to orders with admin attribution
- **Revenue Protection**: Cancelled orders excluded from revenue calculations

### Enhanced
- **Database Integration**: All order operations now use Supabase instead of localStorage
- **Admin Order Dashboard**: Real-time statistics and filtering powered by database
- **Customer Order Visibility**: Admin-created orders now visible in customer dashboards
- **Order Search & Filtering**: Enhanced search capabilities with status and customer filters
- **Financial Accuracy**: Revenue widgets exclude cancelled orders for accurate reporting
- **Bulk Action Safety**: Prevention of invalid bulk operations on shipped orders

### Fixed
- **Order Storage Architecture**: Resolved disconnect between admin creation and customer visibility
- **Order Detail Page**: Fixed broken preview/view functionality in admin orders list
- **Data Consistency**: Unified order data across admin and customer interfaces
- **Order Actions**: Proper workflow enforcement preventing invalid status changes
- **Revenue Calculations**: Accurate financial reporting excluding cancelled order values

### Security & Business Logic
- **Cancellation Protection**: Orders cannot be cancelled once shipped or delivered
- **Workflow Enforcement**: Smart prevention of invalid order status transitions
- **Role-Based Access**: Proper admin/customer separation for order operations
- **Data Validation**: Server-side validation for all order updates and status changes
- **Audit Trail**: Complete logging of order actions and status changes

### API Enhancements
- **POST `/api/orders`**: Create orders with automatic customer creation/linking
- **GET `/api/orders`**: List orders with comprehensive filtering and relationship data
- **GET `/api/orders/[id]`**: Fetch individual orders with full details and customer information
- **PUT `/api/orders/[id]`**: Update order status, payment, shipping, and notes
- **POST `/api/orders/bulk`**: Bulk operations for multiple orders with validation
- **GET `/api/orders/stats`**: Advanced analytics with time-based filtering

### Islamic Art Business Features
- **Production Management**: 3D printing workflow with processing status tracking
- **UK Market Focus**: Proper GBP currency and VAT handling in all calculations
- **Arabic Product Support**: Order items display Arabic names and Islamic categories
- **Customer Communication**: Direct email and phone integration for order management
- **Luxury Experience**: Professional order management interface matching brand aesthetic

### Technical Details
- **Database Migration**: Complete transition from Zustand store to Supabase database
- **Type Safety**: Full TypeScript integration with proper database type definitions
- **Error Handling**: Comprehensive error management with user-friendly messaging
- **Real-time Updates**: Optimistic UI updates with database synchronization
- **Performance**: Efficient queries with proper indexing and relationship loading
- **SSR Compatibility**: Server-side rendering support for all order operations

## [1.0.6] - 2025-07-09

### Added
- **Customer Edit Page**: Complete customer management interface for admin dashboard at `/admin/customers/[id]/edit`
- **Customer Information Editing**: Full form to edit customer personal details (name, email, phone, date of birth, marketing consent)
- **Password Reset Email**: Admin capability to trigger password reset emails to customers with one-click functionality
- **Customer Password Reset Page**: Dedicated `/reset-password` page for customers to securely reset their passwords via email links
- **Enhanced Customer API**: Added PUT method to customer API for updating customer information with validation
- **Customer Statistics Display**: Overview cards showing order count, address count, payment methods, and member since date
- **Admin Impersonation Integration**: Quick "View as Customer" button on customer edit page

### Enhanced
- **Customer API Endpoints**: Enhanced GET method to include date of birth and relationship counts (addresses, orders, payments)
- **Form Validation**: Comprehensive validation for email format, UK phone numbers, and required fields
- **Security Controls**: Admin role verification for all customer edit operations with audit logging
- **User Experience**: Loading states, error handling, and success notifications throughout customer management workflow

### Fixed
- **Header Layout**: Simplified back navigation to arrow-only with improved spacing between navigation and page title
- **API Data Structure**: Consistent camelCase transformation for frontend compatibility
- **Error Handling**: Proper error messages for duplicate emails, invalid data, and missing customers

### Technical Details
- **New Components**: CustomerEditPage with responsive design and luxury Islamic art branding
- **API Security**: Role-based access control with session validation for all customer operations  
- **Password Reset Flow**: Secure token-based password reset using Supabase Auth with proper expiration handling
- **Database Integration**: Full CRUD operations for customer management with relationship counting
- **Admin Audit Trail**: Logging of all customer modifications performed by admin users

## [1.0.5] - 2025-07-09

### Added
- **Favicon System**: Complete favicon implementation using Islamic star symbol from logo
- **Multi-Format Icons**: SVG, ICO, and PNG formats for optimal browser compatibility
- **Progressive Web App Support**: Web app manifest with theme colors and app metadata
- **Apple Touch Icon**: iOS-optimized 180x180 icon for home screen bookmarks
- **High-Resolution Icons**: 192x192 and 512x512 PNG icons for various display contexts

### Enhanced
- **SEO Metadata**: Enhanced layout.tsx with comprehensive favicon references and PWA metadata
- **Brand Consistency**: Favicon uses exact star design from main logo with luxury gold color (#d4af37)
- **Cross-Platform Compatibility**: Icons optimized for desktop browsers, mobile devices, and PWA installations

### Technical Details
- **Files Added**: 6 new files in public directory (favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, manifest.json)
- **Metadata Enhancement**: Updated layout.tsx with complete icon metadata and PWA configuration
- **Islamic Design**: Star symbol extracted from logo maintaining authentic Islamic geometric pattern
- **Theme Integration**: Favicon colors match luxury brand palette (gold #d4af37, black #1a1a1a)

## [1.0.4] - 2025-07-09

### Fixed
- **Admin Wishlist Navigation**: Admin users clicking wishlist button now properly redirect to `/admin/dashboard` instead of customer account
- **Impersonation System**: Complete overhaul of admin impersonation functionality with proper customer data loading
- **Customer Data Display**: Impersonation now correctly shows customer information (name, phone, address, payment details) instead of empty dashboard
- **Email Display**: During impersonation, customer email is displayed instead of admin email across all account pages
- **Shop Page Compilation**: Resolved JSX syntax error causing site crash when visiting shop page during impersonation

### Added
- **Global Impersonation Bar**: Impersonation banner now positioned at very top of page (above navbar) and persists across all pages
- **Dynamic Content Spacing**: `MainContentWrapper` component for proper spacing when impersonation bar is active
- **Impersonation-Aware Authentication**: Enhanced `validateUserSession()` to check impersonation sessions first
- **Customer Data Loading**: Added `validateImpersonationSession()` helper for proper customer data retrieval
- **Debug Utilities**: Enhanced logging and error handling for impersonation troubleshooting

### Changed
- **Header Navigation**: Added dynamic wishlist URL function based on user role (`getWishlistUrl()`)
- **Authentication System**: Made session validation impersonation-aware with proper customer data loading
- **Layout Architecture**: Moved impersonation banner to root layout for global persistence
- **Component Positioning**: Updated Header and page components to accommodate impersonation bar
- **API Profile Route**: Enhanced to handle impersonation sessions and return customer data

### Technical Details
- **Files Modified**: 10 files updated, 1 new file created (`MainContentWrapper.tsx`)
- **Authentication Enhancement**: `auth-utils-server.ts` expanded with 233+ lines of impersonation logic
- **Code Statistics**: 505 insertions, 265 deletions across core authentication and layout files
- **Shop Page Regeneration**: Complete rebuild of `ShopPageClient.tsx` with proper JSX structure
- **Z-index Management**: Impersonation banner positioned with z-index 9999 for proper layering

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

- **v1.0.8** (2025-07-10): Complete inventory management system with automatic stock tracking and comprehensive admin tools
- **v1.0.7** (2025-07-10): Complete order management system with database integration and workflow enforcement
- **v1.0.6** (2025-07-09): Comprehensive customer management system with edit functionality and password reset
- **v1.0.5** (2025-07-09): Complete favicon system implementation with PWA support
- **v1.0.4** (2025-07-09): Admin impersonation system overhaul and navigation fixes
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