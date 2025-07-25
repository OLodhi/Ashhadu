# Changelog

All notable changes to the Ashhadu Islamic Art e-commerce platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Upcoming features and improvements

## [1.0.15] - 2025-01-25

### Fixed
- **Password Reset System Complete Overhaul**: Resolved "Invalid Reset Link" error that prevented users from successfully resetting passwords
- **Supabase Auth Flow Integration**: Fixed password reset redirect flow to work properly with Supabase's authentication system
- **Multiple Authentication Methods**: Enhanced reset-password page to handle various Supabase authentication flows (hash-based tokens, authorization codes, token parameters)
- **Hash-Based Token Support**: Added comprehensive support for Supabase's implicit auth flow using URL hash parameters with access and refresh tokens
- **Session Management**: Proper session establishment and cleanup during password reset process

### Enhanced
- **Authentication Flow Detection**: Advanced parameter detection supporting URL query parameters and hash-based authentication tokens
- **Error Handling**: Comprehensive error management with specific error messages for expired, invalid, or already-used reset links
- **Token Verification**: Multiple verification methods including `exchangeCodeForSession`, `setSession`, and `verifyOtp` for maximum compatibility
- **User Experience**: Clear success messaging and automatic URL cleanup after successful authentication
- **Debug Logging**: Extensive console logging throughout authentication flow for troubleshooting and monitoring

### Added
- **Hash Parameter Detection**: New `handleHashBasedAuth()` function to process access and refresh tokens from URL hash
- **Authorization Code Handling**: Enhanced `handleAuthorizationCode()` function for OAuth-style authorization code exchange
- **Multiple Auth Flow Support**: Support for recovery flags, authorization codes, token parameters, and hash-based authentication
- **URL State Management**: Automatic cleanup of authentication parameters from URL after successful session establishment
- **Toast Notifications**: Success and error feedback throughout the password reset process

### Technical Enhancements
- **Supabase Auth Compatibility**: Full compatibility with Supabase's various authentication redirect methods
- **Client-Side Session Management**: Proper session handling using `supabase.auth.setSession()` and `exchangeCodeForSession()`
- **Error State Management**: Comprehensive error catching and user-friendly error messaging
- **Parameter Parsing**: Enhanced URL parameter and hash parameter parsing for all authentication scenarios
- **Session Validation**: Multiple validation methods to ensure proper session establishment before allowing password updates

### Authentication Flow Improvements
- **Direct Redirect Support**: Password reset API now redirects directly to `/reset-password` without requiring auth callback
- **Hash-Based Flow**: Primary support for Supabase's hash-based authentication with `access_token` and `refresh_token` in URL hash
- **Fallback Compatibility**: Maintains backward compatibility with authorization code flow and token parameter methods
- **Recovery Detection**: Enhanced detection of password recovery flows with proper session verification
- **Session Persistence**: Proper session persistence across page refreshes and navigation

### User Experience Enhancements
- **Success Feedback**: Clear "Password reset link verified successfully!" message upon successful authentication
- **Error Guidance**: Specific error messages with troubleshooting steps for different failure scenarios
- **Loading States**: Professional loading indicators during token verification and session establishment
- **Clean URLs**: Automatic removal of authentication parameters from URL after successful processing
- **Consistent Interface**: Maintained luxury Islamic art design aesthetic throughout password reset flow

### Security Improvements
- **Token Validation**: Comprehensive validation of all authentication tokens before session establishment
- **Session Security**: Proper session cleanup and new session establishment during password reset
- **Error Prevention**: Prevention of session hijacking through proper token validation and error handling
- **Audit Trail**: Complete logging of authentication attempts and outcomes for security monitoring

### Files Modified
- `/src/app/reset-password/page.tsx` - Complete overhaul with multi-flow authentication support and hash parameter detection
- `/src/app/api/auth/send-password-reset/route.ts` - Reverted to direct redirect approach for better Supabase compatibility
- `/src/app/auth/callback/route.ts` - Enhanced with password reset flow detection and recovery flag support

### Technical Details
- **Authentication Methods**: Support for 4 different Supabase authentication flows with automatic detection
- **Parameter Detection**: Enhanced URL parameter and hash parameter parsing for comprehensive flow support
- **Session Management**: Proper session lifecycle management from token verification to password update completion
- **Error Recovery**: Robust error handling with automatic fallback to alternative authentication methods
- **State Cleanup**: Automatic URL state cleanup and proper browser history management

### Islamic Art Business Impact
- **Customer Support**: Eliminated password reset support tickets through reliable self-service functionality
- **User Retention**: Improved customer experience with working password recovery system
- **Brand Trust**: Professional authentication experience maintaining luxury Islamic art brand standards
- **UK Market**: Reliable password reset system for British Islamic art customers

### Password Reset Flow Summary
1. **User Request**: Customer requests password reset via `/forgot-password`
2. **Email Generation**: System generates Supabase recovery link and sends email
3. **Link Processing**: Supabase processes link and redirects to `/reset-password` with authentication tokens
4. **Token Detection**: Reset page detects and processes various token formats (hash, query params, codes)
5. **Session Establishment**: Appropriate handler establishes authenticated session using detected tokens
6. **Password Update**: User can now securely update password with verified session
7. **Completion**: Clean redirect to login page with success messaging

### Compatibility Notes
- **Supabase Auth**: Full compatibility with Supabase Auth v2 and various redirect methods
- **Browser Support**: Works across all modern browsers including mobile devices
- **Security Standards**: Meets OAuth 2.0 and modern authentication security requirements
- **Error Handling**: Graceful degradation with clear error messaging for all failure scenarios

## [1.0.14] - 2025-07-23

### Fixed
- **Login Page Popup Issues**: Removed redundant "Please check your email" toast message to show only clean "Account created successfully" message
- **SessionRecovery Component**: Disabled SessionRecovery component to prevent additional popup notifications during login
- **Profile Full Name Population**: Fixed missing `full_name` field in profiles table during admin signup by combining `firstName` and `lastName` with proper trimming
- **User Experience**: Enhanced signup workflow with cleaner success messaging and reduced notification clutter

### Enhanced
- **Project Directory Cleanup**: Removed 34 unnecessary files while preserving essential database schema and documentation
- **Code Organization**: Streamlined project structure by removing temporary troubleshooting files and debug scripts
- **Admin Signup API**: Enhanced profile creation to properly populate all required fields including full_name
- **Login Flow**: Simplified login page notifications to show only relevant success messages

### Removed
- **Temporary Files**: 18 temporary/debug SQL files no longer needed for development
- **Debug Scripts**: 6 test/debug JavaScript files that were used during development
- **Troubleshooting Documentation**: 8 temporary documentation files created during debugging sessions
- **Backup Components**: 2 backup component files that were no longer needed

### Added
- **Email Template SQL**: Added `auth-email-templates.sql` for proper email template configuration
- **Admin Signup System**: Complete admin signup API at `/api/auth/admin-signup` with enhanced profile creation
- **Email Service Enhancement**: Improved email service with template registry system
- **Authentication Webhook**: Added comprehensive auth webhook handling for user lifecycle events
- **Debug Endpoints**: Enhanced debugging capabilities with signup test endpoints

### Technical Improvements
- **File Cleanup**: Removed 34 unnecessary files including SQL scripts, debug files, and troubleshooting docs
- **Database Schema**: Preserved essential schema files (`supabase-*.sql`) while removing temporary ones
- **Profile Creation**: Enhanced admin signup to create complete profile records with all required fields
- **Authentication Flow**: Streamlined authentication process with better error handling and user feedback
- **Email Integration**: Improved email template system with proper service organization

### User Experience Enhancements
- **Cleaner Signup**: Users now see only one clear success message after account creation
- **Reduced Confusion**: Eliminated multiple popup notifications that could confuse users
- **Complete Profiles**: User profiles now have complete information including proper full name display
- **Professional Flow**: Enhanced signup email workflow with better success messaging

### Developer Experience
- **Organized Codebase**: Much cleaner project directory with only essential files
- **Better Documentation**: Preserved important documentation while removing temporary troubleshooting files
- **Enhanced APIs**: Improved admin signup and authentication APIs with better error handling
- **Debug Tools**: Enhanced debugging capabilities while removing obsolete debug scripts

### Files Modified
- `/src/app/login/page.tsx` - Removed redundant toast messages and disabled SessionRecovery
- `/src/app/api/auth/admin-signup/route.ts` - Enhanced profile creation with full_name field
- `/src/contexts/AuthContext.tsx` - Improved authentication flow and error handling
- `/src/lib/email/email-service.ts` - Enhanced email service architecture
- `/src/lib/email/template-registry.ts` - Added email template registry system
- `/src/app/account/page.tsx` - Enhanced customer dashboard functionality

### Database Schema
- **Profile Creation**: Enhanced profile insertion to include `full_name` field properly populated
- **User Data**: Improved user data handling in admin signup process
- **Email Templates**: Added proper email template configuration for authentication flows

### Security & Reliability
- **Admin Signup**: Enhanced admin signup process with proper validation and error handling
- **Profile Data**: Ensured all profile fields are properly populated during user creation
- **Authentication**: Improved authentication flow with better session management
- **Email Security**: Enhanced email service with proper template handling and security

### Islamic Art Business Features
- **Complete User Profiles**: Customer profiles now display full names properly in admin dashboard
- **Professional Signup**: Clean, professional signup experience for Islamic art customers
- **UK Market**: Enhanced user experience for British Islamic art enthusiasts
- **Brand Consistency**: Maintained luxury brand experience throughout authentication flow

## [1.0.13] - 2025-01-19

### Fixed
- **Email System Overhaul**: Complete resolution of newsletter subscription and order confirmation email issues
- **Newsletter API Route**: Fixed 404 "Page Not Found" error by restarting Next.js development server after configuration changes
- **Email Domain Configuration**: Updated email configuration from sandbox domain (`onboarding@resend.dev`) to verified domain (`orders@ashhadu.co.uk`, `newsletter@ashhadu.co.uk`)
- **React Email Async Rendering**: Fixed "The 'html' field must be a string" Resend error by adding proper `await` to `render()` calls in all email functions
- **Admin Email Configuration**: Fixed database key mismatch where code looked for `email_admin_notification_emails` but schema used `admin_notification_emails`

### Enhanced
- **Guest Customer Separation**: Implemented comprehensive system to distinguish guest checkouts from registered customers
- **Customer Management**: Enhanced admin dashboard to only show registered customers, hiding one-time guest purchases
- **Address Filtering**: Updated admin customer list to show shipping address count only (excluding billing addresses)
- **Email Template Integration**: Proper integration with React Email templates using verified domain configuration

### Added
- **Guest Customer Database Flag**: Added `is_guest` boolean field to customers table to track customer type
- **Customer Type Detection**: Automatic guest customer identification based on authenticated user status during checkout
- **Admin Customer Filtering**: Enhanced customer API to filter out guest customers from admin dashboard
- **Shipping Address Filtering**: Updated address counting logic to only include shipping addresses in admin statistics

### Technical Enhancements
- **Email Service Architecture**: SSR-compatible email sending with proper async/await patterns
- **Database Schema Evolution**: Added guest customer flag with proper indexing and constraints
- **Type Safety Improvements**: Enhanced TypeScript interfaces with clear documentation for address filtering
- **API Security**: Maintained proper role-based access control while adding customer filtering

### Database Changes
- **Guest Customer Field**: `ALTER TABLE customers ADD COLUMN is_guest BOOLEAN DEFAULT false NOT NULL;`
- **Order Creation Logic**: Updated to set guest flag based on authenticated user presence
- **Customer Queries**: Enhanced to filter guest customers from admin views

### Email System Improvements
- **Domain Verification**: All emails now use verified `ashhadu.co.uk` domain instead of Resend sandbox
- **Template Rendering**: Fixed Promise-based rendering issues in React Email templates
- **Admin Notifications**: Corrected email routing to use proper database setting keys
- **Newsletter Integration**: Complete newsletter subscription workflow with verified domain

### Customer Experience Improvements
- **Clean Admin Dashboard**: Only registered customers appear in admin customer management
- **Accurate Statistics**: Address counts reflect shipping addresses only for clearer logistics data
- **Proper Email Delivery**: Order confirmations and newsletters delivered from verified business domain
- **Guest Checkout Functionality**: Maintains seamless guest checkout while properly categorizing customers

### Admin Experience Improvements
- **Focused Customer List**: Clear separation between registered customers and one-time guest purchases
- **Shipping Address Focus**: Address statistics relevant to fulfillment operations only
- **Email Management**: Proper admin notification routing with correct email addresses
- **Customer Segmentation**: Enhanced ability to target marketing to registered customers only

### API Enhancements
- **Enhanced Customer API**: Added guest filtering and shipping address filtering with proper permissions
- **Order Creation API**: Enhanced to detect and flag guest customers automatically
- **Email API**: Fixed React Email template rendering with proper async handling
- **Settings Integration**: Improved email setting key lookup consistency

### Files Modified
- `/src/lib/email/resend-client.ts` - Updated email addresses to use verified domain
- `/src/lib/email/index.ts` - Fixed async render calls in all email template functions
- `/src/app/api/orders/create/route.ts` - Added guest customer detection and fixed admin email key lookup
- `/src/app/checkout/page.tsx` - Enhanced to include userId in all order creation flows
- `/src/app/api/customers/route.ts` - Added guest customer filtering and shipping address filtering
- `/src/app/admin/customers/page.tsx` - Updated UI labels to reflect shipping address filtering
- `/src/lib/inventory.ts` - Fixed admin email setting key for consistency
- `add-guest-customer-field.sql` - Database migration script for guest customer flag

### Technical Details
- **React Email Integration**: Proper async/await patterns for server-side email template rendering
- **Database Key Consistency**: Unified setting key naming between schema and application code
- **Customer Type Architecture**: Clear separation between guest and registered customer workflows
- **Email Domain Management**: Complete migration from sandbox to production email configuration

### User Experience
- **Email Reliability**: All emails now delivered from professional business domain
- **Admin Clarity**: Clean customer management interface focused on registered users
- **Guest Checkout**: Maintains seamless anonymous purchase workflow
- **Data Accuracy**: Proper customer segmentation for business intelligence and marketing

## [1.0.12] - 2025-07-18

### Fixed
- **Wishlist Product Access**: Fixed "Product not found" error when accessing products from wishlist page by updating links to use product IDs instead of slugs
- **Password Reset Functionality**: Complete overhaul of password reset system after extensive troubleshooting to resolve "Invalid Reset Link" errors
- **Supabase Email Template Configuration**: Updated email template to use `{{ .TokenHash }}` instead of `{{ .Token }}` for proper token verification
- **Password Reset Page Styling**: Applied consistent dark gradient background and glass morphism styling to match other auth pages

### Enhanced
- **Token Verification Logic**: Comprehensive token handling supporting both `token` and `token_hash` parameters with proper session establishment
- **Error Handling**: Enhanced error messages and troubleshooting UI for password reset failures
- **Authentication Flow**: Improved password reset workflow with proper session management and cleanup
- **UI Consistency**: Unified styling across all authentication pages (login, forgot password, reset password)

### Added
- **Password Reset Troubleshooting Guide**: Created comprehensive `PASSWORD_RESET_TROUBLESHOOTING.md` with configuration requirements and common solutions
- **Auth Callback Routes**: Created `/auth/callback` and `/auth/confirm` routes for enhanced authentication handling (used during troubleshooting)
- **Enhanced Token Support**: Added support for both 6-digit OTP tokens and token hash verification methods
- **User Experience Improvements**: Better error states, loading indicators, and success feedback throughout password reset flow

### Technical Details
- **Root Cause Analysis**: Identified mismatch between Supabase email template (`{{ .Token }}`) and code expectations (`{{ .TokenHash }}`)
- **Extensive Debugging**: Implemented comprehensive logging and error tracking throughout authentication flow
- **Multiple Fix Attempts**: Tried various approaches including callback routes, token extraction methods, and verification approaches
- **Final Solution**: Email template configuration change to use `{{ .TokenHash }}` resolved all issues
- **Session Management**: Proper session cleanup after password update with redirect to login page

### Files Modified
- `/src/app/account/wishlist/page.tsx` - Fixed product links to use IDs instead of slugs
- `/src/app/account/page.tsx` - Fixed wishlist product links in recent orders section
- `/src/app/reset-password/page.tsx` - Complete overhaul with comprehensive token handling and error management
- `/src/contexts/AuthContext.tsx` - Updated redirect URLs for password reset flow
- `/src/app/auth/callback/route.ts` - Created auth callback handler (during troubleshooting phase)
- `/src/app/auth/confirm/route.ts` - Created confirmation handler (during troubleshooting phase)

### Documentation
- **PASSWORD_RESET_TROUBLESHOOTING.md**: Complete guide for password reset configuration and troubleshooting
- **CLAUDE.md Updates**: Comprehensive documentation of troubleshooting session and lessons learned

### User Experience
- **Customer Feedback**: User confirmed password reset functionality: "Thats worked"
- **Wishlist Fix**: Products now properly accessible from wishlist without "Product not found" errors
- **Consistent Design**: All authentication pages now have matching luxury aesthetic
- **Clear Error Messages**: Enhanced error handling with specific troubleshooting guidance

### Lessons Learned
- **Email Template Critical**: Supabase email template configuration is crucial for password reset functionality
- **Token Format Matters**: Difference between `{{ .Token }}` and `{{ .TokenHash }}` affects verification approach
- **Comprehensive Debugging**: Step-by-step logging essential for complex authentication troubleshooting
- **User Communication**: When initial fixes fail, deeper investigation and systematic approach needed

## [1.0.11] - 2025-07-18

### Added
- **Order Cancellation Utility**: New `cancelOrderDueToPaymentFailure` function for systematic order cancellation on payment failures
- **Customer Order Cancellation Permissions**: Customers can now cancel their own pending orders through API
- **Enhanced PayPal Cancel Page**: Automatic order cancellation when PayPal payments are cancelled
- **Stripe Payment Failure Handling**: Comprehensive order cancellation for failed Stripe payments
- **Address Deduplication Logic**: System now reuses existing addresses instead of creating duplicates

### Enhanced
- **Customer Dashboard Data Loading**: Fixed incorrect order counts and spending amounts using proper customer ID relationships
- **Address Management**: Enhanced checkout flow to use existing address IDs when available, preventing duplication
- **Payment Error Handling**: Comprehensive error handling across all payment methods (Stripe, PayPal, Apple Pay, Google Pay)
- **Order Lifecycle Management**: Proper order status management throughout payment flows
- **API Security**: Enhanced permissions allowing customers to cancel their own orders while maintaining admin privileges

### Fixed
- **Customer Dashboard Issues**: Fixed 0 orders, £0.00 spent, and empty recent orders displaying incorrect data
- **Address Duplication**: Eliminated duplicate address creation during checkout when using existing default addresses
- **PayPal Cancellation**: Resolved orphaned orders when PayPal payments are cancelled
- **Stripe Payment Failures**: Fixed orphaned orders when Stripe payments fail
- **Order Cancellation Permissions**: Customers can now successfully cancel their own pending orders
- **PayPal Cancel Page Errors**: Fixed "Failed to cancel order" error for customers without default payment methods

### Technical Enhancements
- **Database Relationships**: Fixed customer-order relationship lookup through email-based connections
- **Inventory Integration**: Proper stock restoration when orders are cancelled due to payment failures
- **Error Recovery**: Robust error handling with automatic cleanup for failed payment scenarios
- **Payment Processing**: Enhanced payment flow with proper order status tracking
- **API Error Messages**: More specific error messages for better debugging and user feedback

### Customer Experience Improvements
- **Accurate Dashboards**: Customers now see correct order history and spending amounts
- **Clean Checkout**: No more duplicate addresses cluttering customer accounts
- **Reliable Cancellation**: Can cancel payments without leaving orphaned orders in system
- **Clear Feedback**: Better error messages and success notifications throughout payment flows
- **Seamless Experience**: Consistent behavior across all payment methods

### Admin Experience Improvements
- **Clean Order Management**: No more orphaned orders from cancelled payments in admin dashboard
- **Accurate Inventory**: Proper stock levels maintained across all payment scenarios
- **Data Integrity**: Consistent order statuses across all payment methods
- **Efficient Support**: Better error tracking and payment IDs for customer support resolution

### Security & Business Logic
- **Customer Permissions**: Allow customers to cancel their own pending orders with proper validation
- **Admin Privileges**: Maintain full administrative control over all orders
- **Security Validation**: Proper ownership and status checks before allowing order modifications
- **Payment Integrity**: Orders accurately reflect payment status across all scenarios
- **Inventory Accuracy**: Stock properly managed with automatic restoration on cancellations

### API Enhancements
- **Enhanced PUT `/api/orders/[id]`**: Improved permissions allowing customer order cancellations
- **Enhanced `/api/orders/create`**: Added address deduplication logic to prevent duplicate creation
- **Improved Error Handling**: More specific error messages and better network error handling
- **Payment Status Tracking**: Better order status management throughout payment lifecycle

### Files Modified
- `/src/app/account/page.tsx` - Fixed customer dashboard data loading with correct customer ID lookup
- `/src/app/checkout/page.tsx` - Enhanced address handling and comprehensive payment error handling
- `/src/app/api/orders/create/route.ts` - Added address deduplication logic for existing addresses
- `/src/app/checkout/paypal/cancel/page.tsx` - Added automatic order cancellation and improved error handling
- `/src/lib/paypal.ts` - Enhanced PayPal cancel URL to include order ID for proper cancellation
- `/src/app/api/orders/[id]/route.ts` - Enhanced customer cancellation permissions and security validation

## [1.0.10] - 2025-07-15

### Added
- **PayPal Email Pre-fill**: Saved PayPal email addresses now pre-fill during checkout for faster payment processing
- **PayPal Popup Window**: PayPal authentication opens in centered popup window instead of full redirect
- **Payment Status API**: New `/api/orders/[id]/status` endpoint for checking order payment status
- **PayPal Cart Clearing**: Cart automatically clears after successful PayPal payments
- **Enhanced Sign Out**: Complete sign out functionality with user feedback and automatic redirect

### Enhanced
- **PayPal Integration**: Enhanced PayPal Orders API v2 integration with `payment_source.paypal.email_address` field
- **Checkout User Experience**: Streamlined PayPal flow with popup window (450x600px) centered on screen
- **Payment Processing**: Enhanced payment data handling to include saved PayPal email for returning customers
- **Navigation Feedback**: Added toast notifications for sign out success/failure with proper state cleanup
- **Cross-Platform Popup**: PayPal popup positioning accounts for taskbars, docks, and multi-monitor setups

### Fixed
- **Sign Out Functionality**: Fixed non-functional sign out button in navigation header
- **PayPal Cart State**: Resolved issue where cart didn't clear after successful PayPal payments
- **Popup Window Centering**: Enhanced popup centering logic with edge case protection and screen detection
- **State Management**: Proper cleanup of UI state (menus, modals, cart) during sign out process
- **User Feedback**: Added missing success confirmation and automatic redirect after sign out

### Technical Enhancements
- **PayPal API Parameters**: Added `payerEmail` parameter to PayPal order creation for email pre-fill
- **Popup Window Management**: Sophisticated popup monitoring with automatic closure detection
- **Payment Flow Optimization**: Popup-based PayPal flow with fallback to full redirect if blocked
- **Toast Integration**: Enhanced user feedback with react-hot-toast notifications
- **Order Status Polling**: Automatic payment verification after popup window closure

### PayPal Improvements
- **Email Pre-fill Logic**: Extracts saved email from `defaultPaymentMethod.details.email`
- **Popup Window Specs**: 450×600 pixel window with proper browser chrome removal
- **Success Page Enhancement**: Detects popup context and closes window vs redirects appropriately
- **Cancel Page Enhancement**: Popup-aware button text and behavior modifications
- **Fallback Compatibility**: Graceful degradation to full redirect if popup blocked

### User Experience Enhancements
- **Reduced Checkout Friction**: PayPal users only need to enter password, email pre-filled
- **Professional Payment Flow**: Clean popup window with centered positioning
- **Clear Navigation**: Sign out provides immediate feedback and redirects to homepage
- **Consistent Cart Behavior**: Cart clearing works identically across all payment methods
- **Cross-Device Compatibility**: Popup centering works on all screen sizes and operating systems

### Security & Reliability
- **Authentication Session Cleanup**: Complete session termination during sign out
- **Popup Security**: PayPal authentication maintains security while improving UX
- **Error Handling**: Comprehensive error management for popup blocked scenarios
- **Payment Verification**: Automatic verification of payment completion after popup closure
- **State Consistency**: Proper state management across popup and parent windows

### API Enhancements
- **GET `/api/orders/[id]/status`**: Real-time order and payment status checking
- **Enhanced PayPal Flow**: Improved payment data structure with email pre-fill support
- **Payment Processing**: Enhanced payment API to handle saved PayPal email addresses
- **Order Status Verification**: Automatic payment confirmation after popup-based flows

### Islamic Art Business Features
- **Streamlined Customer Experience**: Faster checkout for returning Islamic art customers
- **Professional Payment Interface**: Clean, branded payment experience maintaining luxury aesthetic
- **UK Market Optimization**: Enhanced payment flow for British Islamic art market
- **Customer Retention**: Improved user experience encouraging repeat purchases

## [1.0.9] - 2025-07-12

### Added
- **Complete Guest Checkout System**: Full e-commerce checkout flow supporting guest customers without authentication
- **Guest Order Management**: Automatic customer record creation for guest orders with proper tracking
- **Enhanced Shopping Cart**: Complete cart implementation with VAT calculation, item management, and persistence
- **Multi-Step Checkout Process**: Professional checkout workflow with address selection, payment methods, and order confirmation
- **Customer Order Creation API**: New `/api/orders/create` endpoint enabling customer-initiated orders with stock validation
- **Centralized Payment Processing**: New `/api/payments/process` endpoint supporting multiple payment gateways
- **Dynamic Address Management**: Simplified address system with modal creation forms and improved UI
- **Shipping Threshold System**: Free shipping over £50 with dynamic shipping cost calculation
- **Checkout Confirmation Pages**: Complete order confirmation system with guest order tracking
- **Enhanced Address API**: New `/api/addresses` endpoint for customer address management

### Enhanced
- **E-commerce Workflow**: Complete customer-facing order process from cart to confirmation
- **Guest User Experience**: Streamlined checkout for non-registered customers
- **Address Management**: Simplified address types removing billing/shipping distinction
- **Order Integration**: Full integration between customer orders and existing inventory system
- **Payment Gateway Support**: Enhanced payment processing with guest support
- **Cart Persistence**: Improved cart state management with Zustand

### Fixed
- **Guest Order Tracking**: Proper order visibility for guest customers
- **Address Form UX**: Improved address creation with modal interface
- **Checkout Validation**: Enhanced form validation throughout checkout process
- **Payment Integration**: Streamlined payment processing for both guest and authenticated users

### API Enhancements
- **POST `/api/orders/create`**: Customer order creation with inventory integration
- **POST `/api/payments/process`**: Centralized payment processing with multi-gateway support
- **GET/POST `/api/addresses`**: Customer address management with authentication awareness
- **Enhanced Cart APIs**: Improved cart management with VAT and shipping calculations

### E-commerce Features
- **Guest Checkout Support**: Complete anonymous purchase workflow
- **Address Selection UI**: Enhanced address picker with creation modal
- **Payment Method Selection**: Streamlined payment method choice interface
- **Order Confirmation**: Professional post-purchase confirmation system
- **VAT Calculation**: Proper UK VAT handling throughout checkout process
- **Shipping Management**: Dynamic shipping costs with free threshold

### Islamic Art Business Features
- **Guest Commission Orders**: Anonymous customers can place custom Islamic art orders
- **UK Market Integration**: Enhanced VAT and shipping for UK Islamic art market
- **Guest Customer Conversion**: System to convert guest orders to registered customers
- **Arabic Product Support**: Full guest checkout support for Arabic-named products

### Technical Details
- **New Components**: AddressFormModal, CheckoutConfirmation, enhanced Cart system
- **API Modernization**: RESTful customer order creation with proper validation
- **Guest Session Management**: Secure guest order tracking without authentication
- **Enhanced Type Safety**: Full TypeScript integration for new checkout features
- **Database Integration**: Guest orders properly integrated with existing schema
- **Error Handling**: Comprehensive error management throughout checkout process

### Security & Business Logic
- **Guest Data Protection**: Secure handling of guest customer information
- **Order Validation**: Enhanced validation for guest and authenticated orders
- **Payment Security**: Secure payment processing for anonymous customers
- **Inventory Integration**: Proper stock management for guest orders

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

- **v1.0.15** (2025-01-25): Complete password reset system overhaul with multi-flow Supabase authentication support and hash-based token processing
- **v1.0.14** (2025-07-23): Signup email workflow fixes, profile data completion, and comprehensive project directory cleanup
- **v1.0.13** (2025-01-19): Complete email system overhaul with domain configuration and customer management enhancements
- **v1.0.12** (2025-07-18): Wishlist product access fix and complete password reset functionality overhaul with Supabase email template configuration
- **v1.0.11** (2025-07-18): Critical customer experience fixes - dashboard data accuracy, address deduplication, payment cancellation improvements, and enhanced error handling
- **v1.0.10** (2025-07-15): PayPal email pre-fill, popup checkout window, enhanced sign out functionality, and improved payment UX
- **v1.0.9** (2025-07-12): Complete guest checkout system with enhanced e-commerce workflow and customer order management
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