'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Music } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import { useSettings } from '@/contexts/SettingsContext';
import { SETTING_KEYS } from '@/types/settings';

const footerNavigation = {
  shop: [
    { name: 'All Products', href: '/shop' },
    { name: 'Islamic Calligraphy', href: '/collections/calligraphy' },
    { name: 'Islamic Architecture', href: '/collections/mosque-models' },
    { name: 'Geometric Art', href: '/collections/geometric-art' },
    { name: 'Heritage Collections', href: '/collections/custom' },
  ],
  helpInfo: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Returns & Exchanges', href: '/returns' },
    { name: 'FAQ', href: '/faq' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Cookie Policy', href: '/cookie-policy' },
  ],
};

const socialIcons = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { 
    isNewsletterEnabled, 
    getSetting,
    loading: settingsLoading 
  } = useSettings();
  
  // Get store information settings
  const storeName = getSetting(SETTING_KEYS.STORE_NAME);
  const storeEmail = getSetting(SETTING_KEYS.STORE_EMAIL);
  const storePhone = getSetting(SETTING_KEYS.STORE_PHONE);
  const storeAddress = getSetting(SETTING_KEYS.STORE_ADDRESS);
  
  // Get social media settings
  const showSocialLinks = getSetting(SETTING_KEYS.FEATURE_SOCIAL_LINKS);
  const facebookUrl = getSetting(SETTING_KEYS.SOCIAL_FACEBOOK);
  const instagramUrl = getSetting(SETTING_KEYS.SOCIAL_INSTAGRAM);
  const twitterUrl = getSetting(SETTING_KEYS.SOCIAL_TWITTER);
  const tiktokUrl = getSetting(SETTING_KEYS.SOCIAL_TIKTOK);
  
  // Build social links array dynamically
  const socialLinks = [];
  if (showSocialLinks) {
    if (facebookUrl) {
      socialLinks.push({ name: 'Facebook', href: facebookUrl, icon: Facebook });
    }
    if (instagramUrl) {
      socialLinks.push({ name: 'Instagram', href: instagramUrl, icon: Instagram });
    }
    if (twitterUrl) {
      socialLinks.push({ name: 'Twitter', href: twitterUrl, icon: Twitter });
    }
    if (tiktokUrl) {
      socialLinks.push({ name: 'TikTok', href: tiktokUrl, icon: Music });
    }
  }

  return (
    <footer className="bg-luxury-black text-white islamic-pattern-overlay">
      {/* Newsletter Section */}
      {isNewsletterEnabled && (
        <div className="border-b border-luxury-gray-600">
          <div className="container-luxury py-12 lg:py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="heading-section text-white mb-4">
                Stay Connected with Islamic Art
              </h3>
              <p className="text-body text-gray-300 mb-8">
                Subscribe to our newsletter for new collection releases, exclusive offers, 
                and insights into Islamic art and culture.
              </p>
              <NewsletterSignup />
            </div>
          </div>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="container-luxury py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Logo className="h-10 w-auto" textColor="text-white" />
            </Link>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {storeName || 'Ashhadu Islamic Art'} specializes in premium 3D printed Islamic calligraphy 
              and architectural models. Each piece is crafted with precision and reverence, 
              celebrating the beauty of Islamic art and heritage.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              {storeEmail && (
                <div className="flex items-center space-x-3">
                  <Mail size={18} className="text-luxury-gold flex-shrink-0" />
                  <a 
                    href={`mailto:${storeEmail}`}
                    className="text-gray-300 hover:text-luxury-gold transition-colors duration-200"
                  >
                    {storeEmail}
                  </a>
                </div>
              )}
              {storePhone && (
                <div className="flex items-center space-x-3">
                  <Phone size={18} className="text-luxury-gold flex-shrink-0" />
                  <a 
                    href={`tel:${storePhone.replace(/\s/g, '')}`}
                    className="text-gray-300 hover:text-luxury-gold transition-colors duration-200"
                  >
                    {storePhone}
                  </a>
                </div>
              )}
              {storeAddress && (
                <div className="flex items-start space-x-3">
                  <MapPin size={18} className="text-luxury-gold flex-shrink-0 mt-0.5" />
                  <span className="text-gray-300">
                    {storeAddress}
                  </span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center space-x-4 mt-6">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-300 hover:text-luxury-gold bg-white/10 hover:bg-luxury-gold/20 rounded-lg transition-all duration-200"
                      aria-label={`Follow us on ${item.name}`}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-playfair text-lg font-semibold text-luxury-gold mb-6">
              Shop
            </h4>
            <ul className="space-y-3">
              {footerNavigation.shop.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-luxury-gold transition-colors duration-200 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help & Info Links */}
          <div>
            <h4 className="font-playfair text-lg font-semibold text-luxury-gold mb-6">
              Help & Info
            </h4>
            <ul className="space-y-3">
              {footerNavigation.helpInfo.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-luxury-gold transition-colors duration-200 text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-luxury-gray-600">
        <div className="container-luxury py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-gray-400">
              © {currentYear} {storeName || 'Ashhadu Islamic Art'}. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-6">
              {footerNavigation.legal.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-sm text-gray-400 hover:text-luxury-gold transition-colors duration-200"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Certifications/Trust Badges */}
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded">
                SSL Secured
              </div>
              <div className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded">
                UK Based
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Islamic Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full bg-islamic-pattern"></div>
      </div>
    </footer>
  );
};

export default Footer;