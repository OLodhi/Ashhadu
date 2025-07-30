'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';
import { useSettings } from '@/contexts/SettingsContext';
import { SETTING_KEYS } from '@/types/settings';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const { getSetting } = useSettings();
  
  // Get store information from settings
  const storeName = getSetting(SETTING_KEYS.STORE_NAME) || 'Ashhadu Islamic Art';
  const storeEmail = getSetting(SETTING_KEYS.STORE_EMAIL) || 'hello@ashhadu.co.uk';
  const storePhone = getSetting(SETTING_KEYS.STORE_PHONE) || '+44 20 7946 0958';
  const storeAddress = getSetting(SETTING_KEYS.STORE_ADDRESS) || 'London, United Kingdom';

  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'custom', label: 'Custom Commission' },
    { value: 'order', label: 'Order Support' },
    { value: 'wholesale', label: 'Wholesale/Business' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'collaboration', label: 'Partnership/Collaboration' }
  ];

  const businessHours = [
    { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
    { day: 'Sunday', hours: 'Closed' }
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Send us an email and we\'ll respond within 24 hours',
      contact: storeEmail,
      action: `mailto:${storeEmail}`,
      color: 'text-blue-600'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak directly with our team during business hours',
      contact: storePhone,
      action: `tel:${storePhone.replace(/\s/g, '')}`,
      color: 'text-green-600'
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Based in London, serving customers across the UK',
      contact: storeAddress,
      action: '#location',
      color: 'text-purple-600'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with us in real-time for immediate assistance',
      contact: 'Available during business hours',
      action: '#chat',
      color: 'text-orange-600'
    }
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    if (formData.phone && !/^[\+]?[0-9\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please correct the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real application, you would send this to your API
      // For now, we'll simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <MainContentWrapper>
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black text-white relative overflow-hidden">
          {/* Islamic pattern overlay */}
          <div className="absolute inset-0 islamic-pattern-overlay opacity-10"></div>
          
          <div className="container-luxury relative">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/20 shadow-2xl">
                <h1 className="heading-hero mb-6">
                  <span className="text-luxury-gold">Get In Touch with</span>
                  <span className="text-white block mt-2">{storeName}</span>
                </h1>
                <p className="text-body-large mb-8 text-gray-200">
                  Have a question about our Islamic art collections, need help with a custom commission, 
                  or want to discuss a wholesale opportunity? We'd love to hear from you.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="#contact-form"
                    className="btn-primary inline-flex items-center justify-center"
                  >
                    <Send size={20} className="mr-2" />
                    Send Message
                  </a>
                  <a
                    href={`tel:${storePhone.replace(/\s/g, '')}`}
                    className="btn-secondary inline-flex items-center justify-center"
                  >
                    <Phone size={20} className="mr-2" />
                    Call Now
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Methods Section */}
        <section className="section-padding bg-white">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="heading-section mb-6">How Can We Help?</h2>
              <p className="text-body-large max-w-3xl mx-auto">
                Choose the contact method that works best for you. We're here to assist with all your Islamic art needs.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <a
                    href={method.action}
                    className="card-luxury p-6 text-center space-y-4 hover:shadow-luxury-hover transition-all duration-300 group block"
                  >
                    <method.icon size={40} className={`mx-auto ${method.color} group-hover:scale-110 transition-transform duration-300`} />
                    <h3 className="font-playfair text-lg font-semibold text-luxury-black">
                      {method.title}
                    </h3>
                    <p className="text-small text-luxury-gray-600 mb-3">
                      {method.description}
                    </p>
                    <p className="text-luxury-gold font-medium">
                      {method.contact}
                    </p>
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form & Info Section */}
        <section className="section-padding bg-luxury-gray-50">
          <div className="container-luxury">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                id="contact-form"
              >
                <div className="card-luxury p-8">
                  <h3 className="font-playfair text-2xl font-semibold text-luxury-black mb-6">
                    Send us a Message
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Inquiry Type */}
                    <div>
                      <label htmlFor="inquiryType" className="block text-sm font-medium text-luxury-black mb-2">
                        What can we help you with? *
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        required
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-luxury-gray-200 rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200"
                      >
                        {inquiryTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-luxury-black mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200 ${
                            errors.name ? 'border-red-500' : 'border-luxury-gray-200'
                          }`}
                          placeholder="Your full name"
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-luxury-black mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200 ${
                            errors.email ? 'border-red-500' : 'border-luxury-gray-200'
                          }`}
                          placeholder="your.email@example.com"
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone & Subject Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-luxury-black mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200 ${
                            errors.phone ? 'border-red-500' : 'border-luxury-gray-200'
                          }`}
                          placeholder="+44 20 1234 5678"
                        />
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-luxury-black mb-2">
                          Subject *
                        </label>
                        <input
                          type="text"
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200 ${
                            errors.subject ? 'border-red-500' : 'border-luxury-gray-200'
                          }`}
                          placeholder="Brief subject line"
                        />
                        {errors.subject && (
                          <p className="mt-1 text-sm text-red-600 flex items-center">
                            <AlertCircle size={16} className="mr-1" />
                            {errors.subject}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-luxury-black mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-luxury-gold focus:border-transparent transition-all duration-200 resize-vertical ${
                          errors.message ? 'border-red-500' : 'border-luxury-gray-200'
                        }`}
                        placeholder="Please provide details about your inquiry, including any specific requirements or questions you may have..."
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle size={16} className="mr-1" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                        isSubmitting
                          ? 'bg-luxury-gray-300 text-luxury-gray-500 cursor-not-allowed'
                          : 'bg-luxury-gold text-luxury-black hover:bg-luxury-gold/90 hover:shadow-luxury-hover'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-luxury-gray-500 mr-2"></div>
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send size={20} className="mr-2" />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className="text-small text-luxury-gray-600 text-center">
                      We typically respond within 24 hours during business days.
                    </p>
                  </form>
                </div>
              </motion.div>

              {/* Business Information */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                {/* Business Hours */}
                <div className="card-luxury p-8">
                  <div className="flex items-center mb-6">
                    <Clock size={24} className="text-luxury-gold mr-3" />
                    <h3 className="font-playfair text-xl font-semibold text-luxury-black">
                      Business Hours
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {businessHours.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-luxury-gray-100 last:border-b-0">
                        <span className="text-luxury-black font-medium">{schedule.day}</span>
                        <span className="text-luxury-gray-600">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-luxury-gold/10 rounded-lg">
                    <p className="text-small text-luxury-gray-700">
                      <strong>Note:</strong> We're closed on UK public holidays. For urgent matters outside business hours, 
                      please send an email and we'll respond as soon as possible.
                    </p>
                  </div>
                </div>

                {/* Location & Service Areas */}
                <div className="card-luxury p-8">
                  <div className="flex items-center mb-6">
                    <MapPin size={24} className="text-luxury-gold mr-3" />
                    <h3 className="font-playfair text-xl font-semibold text-luxury-black">
                      Location & Service
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-luxury-black mb-2">Headquarters</h4>
                      <p className="text-luxury-gray-600">{storeAddress}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-luxury-black mb-2">Shipping Coverage</h4>
                      <p className="text-luxury-gray-600">
                        We ship across the United Kingdom with express delivery options available. 
                        International shipping available upon request.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-luxury-black mb-2">Local Services</h4>
                      <p className="text-luxury-gray-600">
                        Same-day delivery available within Greater London for orders placed before 2 PM.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Response Times */}
                <div className="card-luxury p-8">
                  <div className="flex items-center mb-6">
                    <CheckCircle size={24} className="text-luxury-gold mr-3" />
                    <h3 className="font-playfair text-xl font-semibold text-luxury-black">
                      Response Times
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-luxury-black">Email Inquiries</p>
                        <p className="text-small text-luxury-gray-600">Within 24 hours (business days)</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-luxury-black">Phone Calls</p>
                        <p className="text-small text-luxury-gray-600">Immediate during business hours</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-luxury-black">Custom Commissions</p>
                        <p className="text-small text-luxury-gray-600">Initial response within 48 hours</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="font-medium text-luxury-black">Order Support</p>
                        <p className="text-small text-luxury-gray-600">Same day during business hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Preview Section */}
        <section className="section-padding bg-white">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="heading-section mb-6">Frequently Asked Questions</h2>
              <p className="text-body-large max-w-3xl mx-auto mb-12">
                Find quick answers to common questions about our Islamic art collections, 
                ordering process, and custom commissions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {[
                  {
                    question: "How long does custom calligraphy take?",
                    answer: "Custom commissions typically take 2-3 weeks from design approval to completion."
                  },
                  {
                    question: "Do you ship internationally?",
                    answer: "Yes, we offer international shipping to most countries. Contact us for rates."
                  },
                  {
                    question: "What materials do you use?",
                    answer: "We use premium PLA+ and resin materials for durability and fine detail."
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="card-luxury p-6 text-left"
                  >
                    <h4 className="font-playfair text-lg font-semibold text-luxury-black mb-3">
                      {faq.question}
                    </h4>
                    <p className="text-luxury-gray-600">
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>

              <a
                href="/faq"
                className="btn-secondary inline-flex items-center"
              >
                View All FAQs
                <Send size={16} className="ml-2" />
              </a>
            </motion.div>
          </div>
        </section>

      </MainContentWrapper>
      
      <Footer />
    </div>
  );
}