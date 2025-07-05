import type { Metadata } from 'next';
import { Inter, Playfair_Display, Amiri } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';

// Font configurations
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

// Temporarily disable Amiri font due to network issues
// const amiri = Amiri({
//   subsets: ['arabic'],
//   weight: ['400', '700'],
//   variable: '--font-amiri',
//   display: 'swap',
// });

// SEO Metadata
export const metadata: Metadata = {
  title: {
    default: 'Ashhadu Islamic Art | Premium 3D Printed Islamic Calligraphy & Art',
    template: '%s | Ashhadu Islamic Art',
  },
  description: 'Discover exquisite 3D printed Islamic calligraphy and art pieces. Handcrafted with precision, featuring Ayat al-Kursi, mosque models, and custom Arabic text art. Premium quality, UK-based.',
  keywords: [
    'Islamic art',
    '3D printed calligraphy',
    'Islamic calligraphy',
    'Ayat al-Kursi',
    'mosque models',
    'Arabic text art',
    'Islamic home decor',
    'Muslim art',
    'premium Islamic art',
    'UK Islamic art',
    '3D printing Islamic',
    'custom Arabic calligraphy',
    'Islamic wall art',
    'architectural models',
    'Islamic heritage',
  ],
  authors: [{ name: 'Ashhadu Islamic Art' }],
  creator: 'Ashhadu Islamic Art',
  publisher: 'Ashhadu Islamic Art',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: '/',
    siteName: 'Ashhadu Islamic Art',
    title: 'Ashhadu Islamic Art | Premium 3D Printed Islamic Calligraphy & Art',
    description: 'Discover exquisite 3D printed Islamic calligraphy and art pieces. Handcrafted with precision, featuring Ayat al-Kursi, mosque models, and custom Arabic text art.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Ashhadu Islamic Art - Premium 3D Printed Calligraphy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ashhadu Islamic Art | Premium 3D Printed Islamic Calligraphy & Art',
    description: 'Discover exquisite 3D printed Islamic calligraphy and art pieces. Handcrafted with precision.',
    images: ['/images/twitter-image.jpg'],
    creator: '@AshhaduArt',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  category: 'E-commerce',
  classification: 'Islamic Art, 3D Printing, E-commerce',
  referrer: 'origin-when-cross-origin',
}

// Structured Data for SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Ashhadu Islamic Art',
  description: 'Premium 3D printed Islamic calligraphy and art pieces',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/images/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+44-XXX-XXX-XXXX',
    contactType: 'customer service',
    areaServed: 'GB',
    availableLanguage: ['English', 'Arabic'],
  },
  sameAs: [
    'https://www.facebook.com/AshhaduArt',
    'https://www.instagram.com/AshhaduArt',
    'https://twitter.com/AshhaduArt',
  ],
  potentialAction: {
    '@type': 'SearchAction',
    target: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#d4af37" />
        
        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ashhadu" />
        
        {/* Next.js optimizes font loading automatically */}
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-luxury-gold text-luxury-black px-4 py-2 font-semibold z-50"
        >
          Skip to main content
        </a>
        
        {/* Main Application */}
        <AuthProvider>
          <div id="root" className="min-h-screen flex flex-col">
            {children}
          </div>
        </AuthProvider>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid #d4af37',
            },
            success: {
              iconTheme: {
                primary: '#d4af37',
                secondary: '#1a1a1a',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#ffffff',
              },
            },
          }}
        />
        
        {/* Analytics Scripts (placeholder) */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
            
            {/* Facebook Pixel (placeholder) */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window,document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '${process.env.NEXT_PUBLIC_FB_PIXEL_ID}');
                  fbq('track', 'PageView');
                `,
              }}
            />
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_FB_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}