'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Package, Truck, CreditCard, Palette, HelpCircle, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
}

const faqCategories: FAQCategory[] = [
  {
    id: 'orders',
    title: 'Orders & Payment',
    icon: <CreditCard className="w-5 h-5" />,
    description: 'Questions about placing orders, payment methods, and order management'
  },
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    icon: <Truck className="w-5 h-5" />,
    description: 'Information about shipping options, delivery times, and tracking'
  },
  {
    id: 'products',
    title: 'Products & Materials',
    icon: <Package className="w-5 h-5" />,
    description: 'Details about our Islamic art pieces, 3D printing, and materials'
  },
  {
    id: 'custom',
    title: 'Custom Commissions',
    icon: <Palette className="w-5 h-5" />,
    description: 'Information about personalized Islamic art and custom orders'
  },
  {
    id: 'general',
    title: 'General Questions',
    icon: <HelpCircle className="w-5 h-5" />,
    description: 'General information about Ashhadu Islamic Art and our services'
  }
];

const faqData: FAQItem[] = [
  // Orders & Payment
  {
    category: 'orders',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including Visa, Mastercard, American Express, PayPal, Apple Pay, and Google Pay. All payments are processed securely through our encrypted payment system. We also offer the option to save payment methods for faster future checkouts.'
  },
  {
    category: 'orders',
    question: 'Can I modify or cancel my order after placing it?',
    answer: 'You can cancel your order within 24 hours of placing it, provided it hasn\'t entered the production phase. For modifications, please contact us immediately at orders@ashhadu.co.uk. Once production begins, we cannot make changes to ensure the highest quality of your Islamic art piece.'
  },
  {
    category: 'orders',
    question: 'Do you offer guest checkout?',
    answer: 'Yes, you can place orders as a guest without creating an account. However, creating an account allows you to track your orders, save your favorite pieces to a wishlist, and receive updates about new Islamic art collections.'
  },
  {
    category: 'orders',
    question: 'Is my payment information secure?',
    answer: 'Absolutely. We use industry-standard SSL encryption and are PCI DSS compliant. Your payment information is processed through secure payment gateways and is never stored on our servers. We take your privacy and security very seriously.'
  },

  // Shipping & Delivery
  {
    category: 'shipping',
    question: 'How long does shipping take?',
    answer: 'UK delivery typically takes 2-3 business days with our standard shipping. Express delivery (next business day) is available for orders placed before 2 PM. International shipping times vary by location: EU (5-7 days), North America (7-10 days), Rest of World (10-14 days).'
  },
  {
    category: 'shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship worldwide! We offer international shipping to over 50 countries. Shipping costs are calculated at checkout based on your location and the size of your order. All international orders include tracking and insurance.'
  },
  {
    category: 'shipping',
    question: 'What are your shipping costs?',
    answer: 'UK shipping starts from £4.99 for standard delivery, with free shipping on orders over £75. Express delivery is £9.99. International shipping varies by destination and weight. Exact costs are calculated at checkout before you complete your order.'
  },
  {
    category: 'shipping',
    question: 'How can I track my order?',
    answer: 'Once your order ships, you\'ll receive a tracking number via email. You can also track your order by logging into your account and viewing your order history. We provide real-time updates on your order status from production to delivery.'
  },
  {
    category: 'shipping',
    question: 'What if my item arrives damaged?',
    answer: 'While we package our Islamic art pieces with the utmost care, if your item arrives damaged, please contact us within 48 hours with photos of the damage. We\'ll immediately arrange for a replacement or full refund, and we\'ll handle the return shipping at no cost to you.'
  },

  // Products & Materials
  {
    category: 'products',
    question: 'What materials do you use for your Islamic art pieces?',
    answer: 'We use premium 3D printing materials including high-quality PLA+, PETG, and resin for different pieces. Our materials are non-toxic, durable, and carefully selected to showcase the intricate details of Islamic calligraphy and geometric patterns. Each product page specifies the exact materials used.'
  },
  {
    category: 'products',
    question: 'Are your Islamic art pieces authentic and respectful?',
    answer: 'Absolutely. Our Islamic art is created with deep respect for Islamic traditions and culture. We work closely with Islamic scholars and artists to ensure our pieces are culturally appropriate and authentic. Each piece includes information about its historical and cultural significance.'
  },
  {
    category: 'products',
    question: 'Can I see the 3D model before purchasing?',
    answer: 'Yes! Many of our products feature interactive 3D viewers that allow you to rotate, zoom, and examine the piece from all angles before purchasing. This helps you appreciate the intricate details and craftsmanship of each Islamic art piece.'
  },
  {
    category: 'products',
    question: 'What sizes are available?',
    answer: 'Our Islamic art pieces come in various sizes to suit different spaces and preferences. Common sizes range from small desk pieces (10-15cm) to large wall displays (30-50cm). Each product page shows exact dimensions, and many pieces are available in multiple size options.'
  },
  {
    category: 'products',
    question: 'Do you offer different colors or finishes?',
    answer: 'Yes, many of our pieces are available in different colors and finishes. Popular options include natural PLA, gold finish, black, and white. Some pieces also offer metallic finishes or hand-painted details. Available options are shown on each product page.'
  },

  // Custom Commissions
  {
    category: 'custom',
    question: 'Do you create custom Islamic art pieces?',
    answer: 'Yes! We specialize in custom Islamic calligraphy, personalized Arabic names, custom mosque models, and bespoke Islamic geometric designs. Each custom piece is carefully designed and crafted to your specifications while maintaining cultural authenticity and respect.'
  },
  {
    category: 'custom',
    question: 'How long do custom orders take?',
    answer: 'Custom Islamic art pieces typically take 2-4 weeks from design approval to completion, depending on complexity. The process includes initial consultation (2-3 days), design creation and approval (1 week), and production (1-2 weeks). We\'ll keep you updated throughout the entire process.'
  },
  {
    category: 'custom',
    question: 'What information do I need to provide for custom Arabic calligraphy?',
    answer: 'For custom Arabic calligraphy, please provide the text you\'d like (in Arabic or English for translation), preferred calligraphy style, size requirements, and any specific design preferences. We\'ll work with you to ensure proper Arabic grammar and beautiful presentation.'
  },
  {
    category: 'custom',
    question: 'Can you create Islamic art from my own design?',
    answer: 'We can work with your design concepts and references, but all final pieces must meet our quality and cultural authenticity standards. We\'ll review your design and provide feedback to ensure it\'s appropriate and can be produced with our 3D printing technology.'
  },
  {
    category: 'custom',
    question: 'What are the costs for custom work?',
    answer: 'Custom piece pricing starts from £120 for simple Arabic names and can go up to £500+ for complex architectural models or large installations. Pricing depends on size, complexity, materials, and design time required. We provide detailed quotes after initial consultation.'
  },

  // General Questions
  {
    category: 'general',
    question: 'What is Ashhadu Islamic Art?',
    answer: 'Ashhadu Islamic Art is a UK-based company specializing in premium 3D printed Islamic art, calligraphy, and architectural models. We combine traditional Islamic artistic heritage with modern 3D printing technology to create beautiful, authentic pieces that celebrate Islamic culture and faith.'
  },
  {
    category: 'general',
    question: 'Where are you located?',
    answer: 'We\'re based in London, UK, with our design studio and production facility located in the heart of the city. While we\'re UK-based, we serve customers worldwide and ship internationally to bring Islamic art to Muslim communities everywhere.'
  },
  {
    category: 'general',
    question: 'Do you have a physical showroom?',
    answer: 'Currently, we operate as an online-first business, but we occasionally participate in Islamic art exhibitions and craft fairs in London. Follow our social media or newsletter for announcements about upcoming events where you can see our pieces in person.'
  },
  {
    category: 'general',
    question: 'Can I return or exchange my purchase?',
    answer: 'We offer a 30-day return policy for unused items in original condition. Custom-made pieces cannot be returned unless there\'s a manufacturing defect. For exchanges, please contact us within 14 days of delivery. Return shipping costs are covered by us for defective items.'
  },
  {
    category: 'general',
    question: 'Do you offer volume discounts for mosques or Islamic centers?',
    answer: 'Yes! We offer special pricing for mosques, Islamic centers, madrasas, and other Islamic institutions. We also provide bulk discounts for orders of 10+ pieces. Please contact us at wholesale@ashhadu.co.uk for institutional pricing.'
  },
  {
    category: 'general',
    question: 'How can I stay updated on new products?',
    answer: 'Subscribe to our newsletter for updates on new Islamic art pieces, special offers, and Islamic art insights. You can also follow us on social media and create an account to add pieces to your wishlist for notifications when similar items are available.'
  }
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black">
      <Header />
      
      <MainContentWrapper>
        {/* Hero Section */}
        <div className="relative py-20 text-center">
          {/* Islamic Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
              <defs>
                <pattern id="islamic-pattern-faq" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <polygon points="10,1 4,8 4,12 10,19 16,12 16,8" fill="currentColor" fillOpacity="0.1"/>
                  <polygon points="1,10 8,4 12,4 19,10 12,16 8,16" fill="currentColor" fillOpacity="0.1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#islamic-pattern-faq)"/>
            </svg>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-luxury-gold to-warm-gold p-3 rounded-full">
                <HelpCircle className="w-8 h-8 text-luxury-black" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-luxury-gold to-warm-gold bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about our Islamic art collection, 
              3D printing process, shipping, and custom commissions.
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`p-4 rounded-xl text-center transition-all duration-200 ${
                  selectedCategory === 'all'
                    ? 'bg-luxury-gold text-luxury-black font-medium'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">All Topics</span>
              </button>
              
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-xl text-center transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-luxury-gold text-luxury-black font-medium'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-center mb-2">
                    {category.icon}
                  </div>
                  <span className="text-sm font-medium">{category.title}</span>
                </button>
              ))}
            </div>

            {/* Category Description */}
            {selectedCategory !== 'all' && (
              <div className="mt-6 p-4 bg-white/5 rounded-xl border-l-4 border-luxury-gold">
                <p className="text-gray-300">
                  {faqCategories.find(cat => cat.id === selectedCategory)?.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No questions found</h3>
                <p className="text-gray-300">
                  Try adjusting your search terms or browse all categories to find what you're looking for.
                </p>
              </div>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => {
              const isExpanded = expandedItems.has(index);
              return (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden transition-all duration-200 hover:bg-white/15"
                >
                  <button
                    onClick={() => toggleExpanded(index)}
                    className="w-full px-6 py-5 text-left focus:outline-none focus:bg-white/20 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-luxury-gold/20 text-luxury-gold mr-3">
                            {faqCategories.find(cat => cat.id === faq.category)?.title || 'General'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-luxury-gold transition-colors duration-200">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-luxury-gold" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-5 pt-0 animate-in slide-in-from-top-1 duration-200">
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our customer support team is here to help 
              with any questions about our Islamic art pieces, custom commissions, or orders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@ashhadu.co.uk"
                className="bg-luxury-gold text-luxury-black px-6 py-3 rounded-xl font-medium hover:bg-warm-gold transition-colors duration-200"
              >
                Email Us
              </a>
              <a
                href="/contact"
                className="bg-white/10 text-white px-6 py-3 rounded-xl font-medium border border-white/20 hover:bg-white/20 transition-colors duration-200"
              >
                Contact Form
              </a>
            </div>
          </div>
        </div>
      </MainContentWrapper>

      <Footer />
    </div>
  );
}