import React from 'react';
import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ArrowLeft, Package, Clock, Shield, Mail, Phone, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Returns & Exchanges | Ashhadu Islamic Art',
  description: 'Learn about our return and exchange policy for Islamic art pieces, 3D printed models, and custom commissions. UK consumer rights and hassle-free returns.',
  keywords: 'returns policy, exchanges, refunds, Islamic art returns, UK consumer rights, product warranty',
  openGraph: {
    title: 'Returns & Exchanges | Ashhadu Islamic Art',
    description: 'Hassle-free returns and exchanges for your Islamic art purchases. 30-day return policy with full UK consumer protection.',
    url: 'https://ashhadu.co.uk/returns',
    siteName: 'Ashhadu Islamic Art',
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Returns & Exchanges | Ashhadu Islamic Art',
    description: 'Hassle-free returns and exchanges for your Islamic art purchases.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

const MainContentWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black">
    {/* Islamic Pattern Overlay */}
    <div className="fixed inset-0 opacity-5 pointer-events-none">
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.4'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px'
      }} />
    </div>
    <div className="relative">
      {children}
    </div>
  </div>
);

const ReturnStep: React.FC<{
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ number, title, description, icon }) => (
  <div className="flex items-start space-x-4 p-6 bg-white/5 backdrop-blur-lg rounded-lg border border-white/10">
    <div className="flex-shrink-0">
      <div className="w-12 h-12 bg-gradient-to-r from-luxury-gold to-warm-gold rounded-full flex items-center justify-center text-luxury-black font-bold text-lg">
        {number}
      </div>
    </div>
    <div className="flex-1">
      <div className="flex items-center space-x-2 mb-2">
        <div className="text-luxury-gold">{icon}</div>
        <h3 className="text-xl font-playfair font-semibold text-white">{title}</h3>
      </div>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </div>
  </div>
);

const PolicySection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error';
}> = ({ title, icon, children, variant = 'success' }) => {
  const getBorderColor = () => {
    switch (variant) {
      case 'success': return 'border-green-500/30';
      case 'warning': return 'border-yellow-500/30';
      case 'error': return 'border-red-500/30';
      default: return 'border-luxury-gold/30';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-luxury-gold';
    }
  };

  return (
    <div className={`bg-white/5 backdrop-blur-lg rounded-lg border ${getBorderColor()} p-6`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className={getIconColor()}>{icon}</div>
        <h2 className="text-2xl font-playfair font-semibold text-white">{title}</h2>
      </div>
      <div className="text-gray-300 space-y-4">{children}</div>
    </div>
  );
};

export default function ReturnsPage() {
  return (
    <MainContentWrapper>
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link 
              href="/" 
              className="inline-flex items-center text-luxury-gold hover:text-warm-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </nav>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-4">
              Returns & Exchanges
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We stand behind the quality of our Islamic art pieces. Your satisfaction is our priority.
            </p>
          </div>

          <div className="space-y-8">
            {/* Return Policy Overview */}
            <PolicySection title="30-Day Return Policy" icon={<Shield className="w-6 h-6" />}>
              <p>
                We offer a <strong className="text-luxury-gold">30-day return window</strong> from the date of delivery for most items. 
                All returned items must be in their original condition, unused, and in original packaging.
              </p>
              <p>
                As a UK-based business, your purchase is protected under the Consumer Rights Act 2015, 
                giving you additional rights beyond our standard return policy.
              </p>
            </PolicySection>

            {/* What Can Be Returned */}
            <PolicySection title="What Can Be Returned" icon={<CheckCircle className="w-6 h-6" />}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-white mb-2">✅ Eligible for Returns:</h4>
                  <ul className="space-y-1">
                    <li>• Standard Islamic calligraphy pieces</li>
                    <li>• Mosque architectural models</li>
                    <li>• Geometric Islamic art</li>
                    <li>• Decorative Islamic art pieces</li>
                    <li>• Damaged or defective items</li>
                    <li>• Items not as described</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">❌ Not Eligible for Returns:</h4>
                  <ul className="space-y-1">
                    <li>• Custom commissioned pieces</li>
                    <li>• Personalised items with custom text</li>
                    <li>• Items damaged by customer misuse</li>
                    <li>• Items returned after 30 days</li>
                    <li>• Items without original packaging</li>
                  </ul>
                </div>
              </div>
            </PolicySection>

            {/* Custom Commissions Policy */}
            <PolicySection 
              title="Custom Commissions Policy" 
              icon={<AlertCircle className="w-6 h-6" />}
              variant="warning"
            >
              <p>
                <strong>Custom commissioned pieces and personalised items are final sale.</strong> 
                This includes custom Arabic text, personalised names, and bespoke designs created specifically for you.
              </p>
              <p>
                However, if your custom piece arrives damaged, defective, or significantly different from the approved design, 
                we will work with you to resolve the issue through repair, replacement, or refund.
              </p>
            </PolicySection>

            {/* Return Process */}
            <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-luxury-gold/30 p-6">
              <h2 className="text-2xl font-playfair font-semibold text-white mb-6 flex items-center">
                <Package className="w-6 h-6 text-luxury-gold mr-3" />
                Return Process
              </h2>
              
              <div className="space-y-6">
                <ReturnStep
                  number="1"
                  title="Contact Us"
                  description="Email us at returns@ashhadu.co.uk or call +44 20 7946 0958 within 30 days of delivery. Include your order number and reason for return."
                  icon={<Mail className="w-5 h-5" />}
                />
                
                <ReturnStep
                  number="2"
                  title="Receive Return Label"
                  description="We'll email you a prepaid return label within 24 hours. For items over £100, we provide tracked and insured return shipping at no cost to you."
                  icon={<Package className="w-5 h-5" />}
                />
                
                <ReturnStep
                  number="3"
                  title="Pack Securely"
                  description="Pack the item in its original packaging with all accessories. Use the protective materials provided to prevent damage during transit."
                  icon={<Shield className="w-5 h-5" />}
                />
                
                <ReturnStep
                  number="4"
                  title="Ship & Track"
                  description="Drop off at any Royal Mail location or schedule a collection. You'll receive a tracking number to monitor your return's progress."
                  icon={<Clock className="w-5 h-5" />}
                />
              </div>
            </div>

            {/* Refund Information */}
            <PolicySection title="Refunds & Processing Times" icon={<Clock className="w-6 h-6" />}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3">Refund Timeline:</h4>
                  <ul className="space-y-2">
                    <li><strong>1-2 business days:</strong> Return received and inspected</li>
                    <li><strong>2-3 business days:</strong> Refund processed</li>
                    <li><strong>3-5 business days:</strong> Refund appears in your account</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-3">Refund Method:</h4>
                  <ul className="space-y-2">
                    <li>• Original payment method</li>
                    <li>• Full product price refunded</li>
                    <li>• Original shipping costs refunded if item is defective</li>
                    <li>• VAT refunded as applicable</li>
                  </ul>
                </div>
              </div>
            </PolicySection>

            {/* Exchanges */}
            <PolicySection title="Exchanges" icon={<Package className="w-6 h-6" />}>
              <p>
                We're happy to exchange items for different sizes or designs within our standard collection. 
                Exchange requests must be made within 30 days of delivery.
              </p>
              <p>
                <strong>Exchange Process:</strong> Contact us using the same process as returns. 
                We'll send you the replacement item once we receive and inspect your original item. 
                If there's a price difference, we'll either refund the difference or send a payment request.
              </p>
            </PolicySection>

            {/* Damaged Items */}
            <PolicySection 
              title="Damaged or Defective Items" 
              icon={<XCircle className="w-6 h-6" />}
              variant="error"
            >
              <p>
                If your item arrives damaged or defective, please contact us immediately at <strong>returns@ashhadu.co.uk</strong> 
                with photos of the damage. We'll arrange for immediate replacement or full refund, including all shipping costs.
              </p>
              <p>
                For fragile items, please inspect your package upon delivery. If the outer packaging shows damage, 
                note this with the delivery person and contact us within 24 hours.
              </p>
            </PolicySection>

            {/* UK Consumer Rights */}
            <PolicySection title="Your UK Consumer Rights" icon={<Shield className="w-6 h-6" />}>
              <p>
                Under the Consumer Rights Act 2015, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Return items within 14 days for any reason (cooling-off period)</li>
                <li>Receive goods that are as described, fit for purpose, and of satisfactory quality</li>
                <li>Repair, replacement, or refund if goods are faulty</li>
                <li>Compensation if we cause damage to your property</li>
              </ul>
              <p className="mt-4">
                These rights are in addition to our 30-day return policy and do not affect your statutory rights.
              </p>
            </PolicySection>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-luxury-gold/10 to-warm-gold/10 backdrop-blur-lg rounded-lg border border-luxury-gold/30 p-6">
              <h2 className="text-2xl font-playfair font-semibold text-white mb-4">
                Need Help with a Return?
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-luxury-gold mb-2">Email Support</h3>
                  <p className="text-gray-300 mb-1">returns@ashhadu.co.uk</p>
                  <p className="text-sm text-gray-400">Response within 24 hours</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-luxury-gold mb-2">Phone Support</h3>
                  <p className="text-gray-300 mb-1">+44 20 7946 0958</p>
                  <p className="text-sm text-gray-400">Mon-Fri, 9:00 AM - 6:00 PM GMT</p>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-gray-300 text-sm">
                  <strong>Ashhadu Islamic Art Ltd</strong><br />
                  Returns Department<br />
                  London, United Kingdom<br />
                  Company Number: 12345678
                </p>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="text-center">
              <p className="text-gray-400 mb-4">
                Have questions about our return policy?
              </p>
              <Link 
                href="/contact" 
                className="inline-flex items-center bg-gradient-to-r from-luxury-gold to-warm-gold text-luxury-black px-8 py-3 rounded-lg font-semibold hover:from-warm-gold hover:to-luxury-gold transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Contact Our Support Team
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </MainContentWrapper>
  );
}