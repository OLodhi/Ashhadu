import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy | Ashhadu Islamic Art',
  description: 'Learn how Ashhadu Islamic Art collects, uses, and protects your personal information. Our comprehensive privacy policy for UK customers.',
  keywords: 'privacy policy, data protection, GDPR, Islamic art, UK privacy rights, personal information',
  openGraph: {
    title: 'Privacy Policy | Ashhadu Islamic Art',
    description: 'Learn how Ashhadu Islamic Art collects, uses, and protects your personal information. Our comprehensive privacy policy for UK customers.',
    type: 'website',
    locale: 'en_GB',
  },
  alternates: {
    canonical: '/privacy-policy'
  }
};

export default function PrivacyPolicyPage() {
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

        <div className="relative z-10">
          {/* Header Section */}
          <section className="py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-luxury-gold to-warm-gold mb-6">
                <svg className="w-8 h-8 text-luxury-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  <path d="M12 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor" opacity="0.7"/>
                </svg>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold text-white mb-6">
                Privacy Policy
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Your privacy is sacred to us. Learn how we collect, use, and protect your personal information 
                in accordance with UK data protection laws.
              </p>
              
              <div className="mt-8 text-sm text-gray-400">
                <p>Last updated: January 27, 2025</p>
                <p>Effective date: January 27, 2025</p>
              </div>
            </div>
          </section>

          {/* Privacy Policy Content */}
          <section className="pb-20 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 md:p-12">
                
                {/* Table of Contents */}
                <div className="mb-12 p-6 bg-luxury-gold/10 rounded-xl border border-luxury-gold/20">
                  <h2 className="text-2xl font-playfair font-bold text-white mb-4">Contents</h2>
                  <div className="grid md:grid-cols-2 gap-2 text-gray-300">
                    <a href="#company-info" className="hover:text-luxury-gold transition-colors">1. Company Information</a>
                    <a href="#data-collection" className="hover:text-luxury-gold transition-colors">2. Information We Collect</a>
                    <a href="#data-use" className="hover:text-luxury-gold transition-colors">3. How We Use Your Information</a>
                    <a href="#data-sharing" className="hover:text-luxury-gold transition-colors">4. Information Sharing</a>
                    <a href="#cookies" className="hover:text-luxury-gold transition-colors">5. Cookies and Tracking</a>
                    <a href="#your-rights" className="hover:text-luxury-gold transition-colors">6. Your Rights</a>
                    <a href="#data-security" className="hover:text-luxury-gold transition-colors">7. Data Security</a>
                    <a href="#retention" className="hover:text-luxury-gold transition-colors">8. Data Retention</a>
                    <a href="#international" className="hover:text-luxury-gold transition-colors">9. International Transfers</a>
                    <a href="#children" className="hover:text-luxury-gold transition-colors">10. Children's Privacy</a>
                    <a href="#changes" className="hover:text-luxury-gold transition-colors">11. Policy Changes</a>
                    <a href="#contact" className="hover:text-luxury-gold transition-colors">12. Contact Information</a>
                  </div>
                </div>

                <div className="prose prose-invert prose-lg max-w-none">
                  
                  {/* Company Information */}
                  <section id="company-info" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">1</span>
                      Company Information
                    </h2>
                    <div className="text-gray-300 space-y-4">
                      <p>
                        This privacy policy is provided by <strong className="text-white">Ashhadu Islamic Art</strong>, 
                        a UK-based company specializing in artisanal Islamic calligraphy and 3D printed Islamic art pieces.
                      </p>
                      <div className="bg-white/5 p-4 rounded-lg">
                        <p><strong className="text-luxury-gold">Company:</strong> Ashhadu Islamic Art</p>
                        <p><strong className="text-luxury-gold">Website:</strong> https://ashhadu.co.uk</p>
                        <p><strong className="text-luxury-gold">Email:</strong> privacy@ashhadu.co.uk</p>
                        <p><strong className="text-luxury-gold">Location:</strong> United Kingdom</p>
                      </div>
                    </div>
                  </section>

                  {/* Information We Collect */}
                  <section id="data-collection" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">2</span>
                      Information We Collect
                    </h2>
                    <div className="text-gray-300 space-y-6">
                      
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Personal Information</h3>
                        <p>When you create an account, place an order, or contact us, we may collect:</p>
                        <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
                          <li>Name and contact information (email address, phone number)</li>
                          <li>Billing and shipping addresses</li>
                          <li>Payment information (processed securely by our payment providers)</li>
                          <li>Order history and purchase preferences</li>
                          <li>Account credentials and security information</li>
                          <li>Custom Islamic art specifications and personalization requests</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Automatically Collected Information</h3>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                          <li>IP address and device information</li>
                          <li>Browser type and version</li>
                          <li>Pages visited and time spent on our website</li>
                          <li>Referring websites and search terms</li>
                          <li>Shopping cart contents and abandoned cart information</li>
                          <li>Interaction with our 3D model viewers and product galleries</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Communications</h3>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                          <li>Email communications and newsletter subscriptions</li>
                          <li>Customer service inquiries and support tickets</li>
                          <li>Product reviews and feedback</li>
                          <li>Survey responses and marketing preferences</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* How We Use Your Information */}
                  <section id="data-use" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">3</span>
                      How We Use Your Information
                    </h2>
                    <div className="text-gray-300 space-y-6">
                      
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Order Processing and Fulfillment</h3>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                          <li>Process and fulfill your orders</li>
                          <li>Arrange shipping and delivery</li>
                          <li>Send order confirmations and shipping notifications</li>
                          <li>Handle returns, exchanges, and customer service inquiries</li>
                          <li>Create custom Islamic art pieces according to your specifications</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Account Management</h3>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                          <li>Create and maintain your customer account</li>
                          <li>Provide access to order history and account settings</li>
                          <li>Manage your wishlist and saved payment methods</li>
                          <li>Authenticate your identity and prevent fraud</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Communication and Marketing</h3>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                          <li>Send newsletters and promotional offers (with your consent)</li>
                          <li>Notify you about new Islamic art collections and products</li>
                          <li>Provide customer support and respond to inquiries</li>
                          <li>Send important account and service updates</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Website Improvement</h3>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                          <li>Analyze website usage and performance</li>
                          <li>Improve our product recommendations</li>
                          <li>Enhance our 3D model viewing experience</li>
                          <li>Develop new features and functionality</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Information Sharing */}
                  <section id="data-sharing" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">4</span>
                      Information Sharing
                    </h2>
                    <div className="text-gray-300 space-y-6">
                      <p>
                        We respect your privacy and do not sell your personal information. We only share your 
                        information in the following circumstances:
                      </p>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Service Providers</h3>
                        <p>We share information with trusted third-party service providers who help us operate our business:</p>
                        <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
                          <li><strong>Payment Processors:</strong> Stripe, PayPal for secure payment processing</li>
                          <li><strong>Shipping Partners:</strong> Royal Mail, DPD, and other courier services</li>
                          <li><strong>Email Service:</strong> Resend for transactional and marketing emails</li>
                          <li><strong>Cloud Storage:</strong> Supabase for secure data storage</li>
                          <li><strong>Analytics:</strong> Website performance and usage analytics</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Legal Requirements</h3>
                        <p>We may disclose your information if required by law or to:</p>
                        <ul className="list-disc list-inside ml-4 space-y-2 mt-3">
                          <li>Comply with legal proceedings or government requests</li>
                          <li>Protect our rights, property, or safety</li>
                          <li>Prevent fraud or abuse of our services</li>
                          <li>Enforce our terms of service</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Business Transfers</h3>
                        <p>
                          In the event of a merger, acquisition, or sale of assets, your information may be 
                          transferred as part of the transaction, subject to the same privacy protections.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Cookies and Tracking */}
                  <section id="cookies" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">5</span>
                      Cookies and Tracking Technologies
                    </h2>
                    <div className="text-gray-300 space-y-6">
                      <p>
                        We use cookies and similar technologies to enhance your browsing experience and 
                        provide personalized services. You can control cookie settings through your browser.
                      </p>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Types of Cookies We Use</h3>
                        <div className="space-y-4">
                          <div className="bg-white/5 p-4 rounded-lg">
                            <h4 className="font-bold text-luxury-gold mb-2">Essential Cookies</h4>
                            <p>Required for basic website functionality, including shopping cart, user authentication, and security.</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-lg">
                            <h4 className="font-bold text-luxury-gold mb-2">Functional Cookies</h4>
                            <p>Remember your preferences, language settings, and enhance website features like 3D model interactions.</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-lg">
                            <h4 className="font-bold text-luxury-gold mb-2">Analytics Cookies</h4>
                            <p>Help us understand how visitors use our website to improve performance and user experience.</p>
                          </div>
                          <div className="bg-white/5 p-4 rounded-lg">
                            <h4 className="font-bold text-luxury-gold mb-2">Marketing Cookies</h4>
                            <p>Used to deliver relevant advertisements and track marketing campaign effectiveness (with your consent).</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Managing Cookies</h3>
                        <p>
                          You can control cookies through your browser settings. However, disabling certain 
                          cookies may affect website functionality, including the ability to view 3D models 
                          or maintain your shopping cart.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Your Rights */}
                  <section id="your-rights" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">6</span>
                      Your Privacy Rights
                    </h2>
                    <div className="text-gray-300 space-y-6">
                      <p>
                        Under UK data protection laws (UK GDPR), you have several rights regarding your personal information:
                      </p>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="font-bold text-luxury-gold mb-2">Right of Access</h4>
                          <p>Request a copy of the personal information we hold about you.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="font-bold text-luxury-gold mb-2">Right to Rectification</h4>
                          <p>Correct any inaccurate or incomplete personal information.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="font-bold text-luxury-gold mb-2">Right to Erasure</h4>
                          <p>Request deletion of your personal information in certain circumstances.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="font-bold text-luxury-gold mb-2">Right to Restrict Processing</h4>
                          <p>Limit how we use your personal information in specific situations.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="font-bold text-luxury-gold mb-2">Right to Data Portability</h4>
                          <p>Receive your personal information in a structured, machine-readable format.</p>
                        </div>
                        <div className="bg-white/5 p-4 rounded-lg">
                          <h4 className="font-bold text-luxury-gold mb-2">Right to Object</h4>
                          <p>Object to processing of your personal information for marketing purposes.</p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">How to Exercise Your Rights</h3>
                        <p>
                          To exercise any of these rights, please contact us at <strong className="text-luxury-gold">privacy@ashhadu.co.uk</strong>. 
                          We will respond to your request within one month and may ask you to verify your identity 
                          for security purposes.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Right to Complain</h3>
                        <p>
                          If you're not satisfied with how we handle your personal information, you have the 
                          right to lodge a complaint with the Information Commissioner's Office (ICO) at 
                          <a href="https://ico.org.uk" className="text-luxury-gold hover:underline">ico.org.uk</a>.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Data Security */}
                  <section id="data-security" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">7</span>
                      Data Security
                    </h2>
                    <div className="text-gray-300 space-y-4">
                      <p>
                        We implement appropriate technical and organizational measures to protect your personal 
                        information against unauthorized access, alteration, disclosure, or destruction.
                      </p>
                      
                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Security Measures</h3>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                          <li>SSL/TLS encryption for all data transmission</li>
                          <li>Secure cloud infrastructure with Supabase</li>
                          <li>Regular security updates and monitoring</li>
                          <li>Access controls and authentication systems</li>
                          <li>Regular backups and disaster recovery procedures</li>
                          <li>Staff training on data protection best practices</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Payment Security</h3>
                        <p>
                          We do not store your complete payment card details. All payment processing is handled 
                          by PCI DSS compliant payment providers (Stripe, PayPal) with industry-standard security measures.
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Data Retention */}
                  <section id="retention" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">8</span>
                      Data Retention
                    </h2>
                    <div className="text-gray-300 space-y-4">
                      <p>
                        We retain your personal information only as long as necessary to fulfill the purposes 
                        outlined in this privacy policy and comply with legal obligations.
                      </p>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Retention Periods</h3>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                          <li><strong>Account Information:</strong> Retained while your account is active and for 7 years after closure for legal compliance</li>
                          <li><strong>Order Data:</strong> Retained for 7 years to comply with UK tax and accounting requirements</li>
                          <li><strong>Payment Information:</strong> Payment tokens retained until you remove them; transaction records kept for 7 years</li>
                          <li><strong>Marketing Communications:</strong> Until you unsubscribe or withdraw consent</li>
                          <li><strong>Website Analytics:</strong> Anonymized after 2 years</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* International Transfers */}
                  <section id="international" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">9</span>
                      International Data Transfers
                    </h2>
                    <div className="text-gray-300 space-y-4">
                      <p>
                        Some of our service providers may be located outside the UK. When we transfer your 
                        personal information internationally, we ensure appropriate safeguards are in place.
                      </p>

                      <div>
                        <h3 className="text-xl font-bold text-white mb-3">Safeguards</h3>
                        <ul className="list-disc list-inside ml-4 space-y-2">
                          <li>EU-US Data Privacy Framework and Swiss-US Data Privacy Framework</li>
                          <li>Standard Contractual Clauses approved by the European Commission</li>
                          <li>Adequacy decisions by the UK government</li>
                          <li>Certification under approved codes of conduct</li>
                        </ul>
                      </div>
                    </div>
                  </section>

                  {/* Children's Privacy */}
                  <section id="children" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">10</span>
                      Children's Privacy
                    </h2>
                    <div className="text-gray-300 space-y-4">
                      <p>
                        Our services are not intended for children under the age of 16. We do not knowingly 
                        collect personal information from children under 16. If we discover we have collected 
                        such information, we will delete it promptly.
                      </p>
                      <p>
                        If you are a parent or guardian and believe your child has provided us with personal 
                        information, please contact us at <strong className="text-luxury-gold">privacy@ashhadu.co.uk</strong>.
                      </p>
                    </div>
                  </section>

                  {/* Policy Changes */}
                  <section id="changes" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">11</span>
                      Changes to This Privacy Policy
                    </h2>
                    <div className="text-gray-300 space-y-4">
                      <p>
                        We may update this privacy policy from time to time to reflect changes in our practices 
                        or legal requirements. We will notify you of any material changes by:
                      </p>
                      <ul className="list-disc list-inside ml-4 space-y-2">
                        <li>Posting the updated policy on our website</li>
                        <li>Sending an email notification to registered users</li>
                        <li>Displaying a prominent notice on our website</li>
                      </ul>
                      <p>
                        Your continued use of our services after the effective date of the updated policy 
                        constitutes acceptance of the changes.
                      </p>
                    </div>
                  </section>

                  {/* Contact Information */}
                  <section id="contact" className="mb-12">
                    <h2 className="text-3xl font-playfair font-bold text-white mb-6 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-luxury-gold text-luxury-black flex items-center justify-center text-sm font-bold mr-3">12</span>
                      Contact Information
                    </h2>
                    <div className="text-gray-300 space-y-6">
                      <p>
                        If you have any questions about this privacy policy or our data practices, 
                        please contact us using the information below:
                      </p>

                      <div className="bg-luxury-gold/10 p-6 rounded-xl border border-luxury-gold/20">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-3">Privacy Inquiries</h3>
                            <div className="space-y-2">
                              <p><strong className="text-luxury-gold">Email:</strong> privacy@ashhadu.co.uk</p>
                              <p><strong className="text-luxury-gold">Subject Line:</strong> Privacy Policy Inquiry</p>
                              <p><strong className="text-luxury-gold">Response Time:</strong> Within 30 days</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-3">General Contact</h3>
                            <div className="space-y-2">
                              <p><strong className="text-luxury-gold">Email:</strong> hello@ashhadu.co.uk</p>
                              <p><strong className="text-luxury-gold">Website:</strong> https://ashhadu.co.uk</p>
                              <p><strong className="text-luxury-gold">Business Hours:</strong> Monday-Friday, 9AM-5PM GMT</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-sm text-gray-400 border-t border-gray-700 pt-6">
                        <p>
                          This privacy policy is governed by the laws of England and Wales. Any disputes 
                          relating to this policy will be subject to the exclusive jurisdiction of the 
                          courts of England and Wales.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}