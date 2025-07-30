'use client';

import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsOfServicePage() {
  useEffect(() => {
    document.title = 'Terms of Service | Ashhadu Islamic Art';
    
    // Set meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Terms and conditions for Ashhadu Islamic Art - luxury Islamic calligraphy and 3D printed art pieces. Read our complete terms of service for purchases, shipping, and usage.');
    }
  }, []);

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black relative">
        {/* Islamic Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-16.569 13.431-30 30-30v60c-16.569 0-30-13.431-30-30zM0 30c0 16.569 13.431 30 30 30V0C13.431 0 0 13.431 0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                <h1 className="text-4xl md:text-5xl font-playfair font-bold text-white mb-4">
                  Terms of Service
                </h1>
                <p className="text-lg text-gray-200 max-w-2xl mx-auto">
                  Please read these terms and conditions carefully before using our services
                </p>
                <div className="mt-6 text-sm text-gray-300">
                  Last updated: January 27, 2025
                </div>
              </div>
            </div>

            {/* Terms Content */}
            <div className="space-y-8">
              {/* Introduction */}
              <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-playfair font-semibold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-luxury-gold mr-4"></span>
                  1. Introduction and Acceptance
                </h2>
                <div className="space-y-4 text-gray-200">
                  <p>
                    Welcome to Ashhadu Islamic Art ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our website at ashhadu.co.uk (the "Service") operated by Ashhadu Islamic Art, a UK-based business specializing in luxury Islamic calligraphy and 3D printed art pieces.
                  </p>
                  <p>
                    By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service. These Terms constitute a legally binding agreement between you and Ashhadu Islamic Art.
                  </p>
                </div>
              </section>

              {/* Use of Service */}
              <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-playfair font-semibold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-luxury-gold mr-4"></span>
                  2. Use of Our Service
                </h2>
                <div className="space-y-4 text-gray-200">
                  <h3 className="text-xl font-semibold text-white">Permitted Use</h3>
                  <p>
                    You may use our Service for lawful purposes only. You agree to use the Service in accordance with all applicable laws and regulations and in a manner that does not infringe upon the rights of others.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-white">Prohibited Activities</h3>
                  <p>You agree not to:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Use the Service for any unlawful purpose or in violation of these Terms</li>
                    <li>Attempt to gain unauthorized access to our systems or networks</li>
                    <li>Upload or transmit any malicious code, viruses, or harmful content</li>
                    <li>Reproduce, distribute, or commercially exploit our Islamic art designs without permission</li>
                    <li>Use automated systems or software to extract data from our website</li>
                    <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                    <li>Impersonate any person or entity or misrepresent your affiliation</li>
                  </ul>
                </div>
              </section>

              {/* Products and Purchases */}
              <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-playfair font-semibold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-luxury-gold mr-4"></span>
                  3. Products and Purchases
                </h2>
                <div className="space-y-4 text-gray-200">
                  <h3 className="text-xl font-semibold text-white">Product Information</h3>
                  <p>
                    We specialize in luxury Islamic calligraphy and 3D printed art pieces. All product descriptions, images, and specifications are provided for informational purposes and are subject to change without notice. We strive for accuracy but cannot guarantee that all product information is complete or error-free.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-white">Pricing and Payment</h3>
                  <p>
                    All prices are displayed in British Pounds (GBP) and include VAT where applicable. Prices are subject to change without notice. Payment is required at the time of purchase through our secure payment processors (Stripe, PayPal, Apple Pay, or Google Pay).
                  </p>

                  <h3 className="text-xl font-semibold text-white">Custom Commissions</h3>
                  <p>
                    Custom Islamic art commissions require approval and may involve additional terms. Custom work typically requires a deposit and has different return policies than standard products.
                  </p>
                </div>
              </section>

              {/* Shipping and Returns */}
              <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-playfair font-semibold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-luxury-gold mr-4"></span>
                  4. Shipping and Returns
                </h2>
                <div className="space-y-4 text-gray-200">
                  <p>
                    We ship within the UK and internationally. Shipping times and costs vary by location and are displayed at checkout. Risk of loss and title pass to you upon delivery to the shipping carrier.
                  </p>
                  <p>
                    Returns are accepted within 30 days of purchase for standard products in original condition. Custom commissions and personalized items are generally final sale. Please see our Returns & Exchanges page for complete details.
                  </p>
                </div>
              </section>

              {/* Intellectual Property */}
              <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-playfair font-semibold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-luxury-gold mr-4"></span>
                  5. Intellectual Property
                </h2>
                <div className="space-y-4 text-gray-200">
                  <p>
                    The Service and its original content, features, and functionality are owned by Ashhadu Islamic Art and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                  </p>
                  <p>
                    Our Islamic art designs are created with respect for Islamic heritage and traditions. We do not claim ownership of traditional Islamic calligraphy or architectural elements, but our specific artistic interpretations and 3D model designs are our intellectual property.
                  </p>
                </div>
              </section>

              {/* Privacy and Accounts */}
              <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-playfair font-semibold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-luxury-gold mr-4"></span>
                  6. User Accounts and Privacy
                </h2>
                <div className="space-y-4 text-gray-200">
                  <p>
                    When you create an account, you must provide accurate and complete information. You are responsible for maintaining the security of your account and all activities under your account.
                  </p>
                  <p>
                    Your privacy is important to us. Please review our Privacy Policy, which governs how we collect, use, and protect your personal information.
                  </p>
                </div>
              </section>

              {/* Disclaimers */}
              <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-playfair font-semibold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-luxury-gold mr-4"></span>
                  7. Disclaimers and Limitation of Liability
                </h2>
                <div className="space-y-4 text-gray-200">
                  <p>
                    The Service is provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
                  </p>
                  <p>
                    In no event shall Ashhadu Islamic Art be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.
                  </p>
                </div>
              </section>

              {/* Governing Law */}
              <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-playfair font-semibold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-luxury-gold mr-4"></span>
                  8. Governing Law and Dispute Resolution
                </h2>
                <div className="space-y-4 text-gray-200">
                  <p>
                    These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms or your use of the Service will be subject to the exclusive jurisdiction of the courts of England and Wales.
                  </p>
                </div>
              </section>

              {/* Changes to Terms */}
              <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-playfair font-semibold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-luxury-gold mr-4"></span>
                  9. Changes to Terms
                </h2>
                <div className="space-y-4 text-gray-200">
                  <p>
                    We reserve the right to modify these Terms at any time. We will notify you of significant changes by posting the new Terms on this page and updating the "Last updated" date.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h2 className="text-2xl font-playfair font-semibold text-white mb-6 flex items-center">
                  <span className="w-2 h-8 bg-luxury-gold mr-4"></span>
                  10. Contact Information
                </h2>
                <div className="space-y-4 text-gray-200">
                  <p><strong>Ashhadu Islamic Art</strong></p>
                  <p>Email: legal@ashhadu.co.uk</p>
                  <p>Address: London, United Kingdom</p>
                  <p>Website: ashhadu.co.uk</p>
                </div>
              </section>
            </div>

            {/* Back to Top */}
            <div className="text-center mt-12">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center px-6 py-3 bg-luxury-gold text-luxury-black font-semibold rounded-lg hover:bg-luxury-gold/90 transition-colors duration-200"
              >
                Back to Top
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}