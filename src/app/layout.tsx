import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { WishlistProvider } from '@/contexts/WishlistContext';

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
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body className="font-inter antialiased">
        <AuthProvider>
          <WishlistProvider>
            {children}
          </WishlistProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}