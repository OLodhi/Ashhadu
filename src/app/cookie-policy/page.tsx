import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';

export const metadata: Metadata = {
  title: 'Cookie Policy | Ashhadu Islamic Art',
  description: 'Learn about how Ashhadu uses cookies to enhance your browsing experience and provide personalized services on our Islamic art e-commerce platform.',
  keywords: 'cookies, privacy, data protection, website cookies, GDPR, UK regulations',
  robots: 'index, follow',
  openGraph: {
    title: 'Cookie Policy | Ashhadu Islamic Art',
    description: 'Learn about how Ashhadu uses cookies to enhance your browsing experience and provide personalized services.',
    type: 'website',
    url: '/cookie-policy',
  },
};

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <MainContentWrapper>
        <div className="min-h-screen bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black relative overflow-hidden">
          {/* Islamic Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 py-20">
            {/* Header Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-serif text-white mb-6">
                Cookie Policy
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-luxury-gold to-warm-gold mx-auto mb-8"></div>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                This Cookie Policy explains how Ashhadu Islamic Art uses cookies and similar technologies 
                to enhance your browsing experience and provide personalized services.
              </p>
              <p className="text-sm text-gray-400 mt-4">
                Last updated: {new Date().toLocaleDateString('en-GB', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-12">
              {/* What Are Cookies */}
              <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-serif text-luxury-gold mb-6 flex items-center">
                  <div className="w-2 h-8 bg-luxury-gold mr-4 rounded-full"></div>
                  What Are Cookies?
                </h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    Cookies are small text files that are stored on your device (computer, tablet, or mobile) 
                    when you visit our website. They help us provide you with a better experience by remembering 
                    your preferences and understanding how you use our site.
                  </p>
                  <p>
                    Cookies cannot harm your device or access your personal files. They are widely used across 
                    the internet to make websites work more efficiently and provide a personalized experience.
                  </p>
                </div>
              </section>

              {/* How We Use Cookies */}
              <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-serif text-luxury-gold mb-6 flex items-center">
                  <div className="w-2 h-8 bg-luxury-gold mr-4 rounded-full"></div>
                  How We Use Cookies
                </h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    At Ashhadu Islamic Art, we use cookies to:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Keep you signed in to your account</li>
                    <li>Remember items in your shopping cart</li>
                    <li>Understand your preferences and improve your experience</li>
                    <li>Analyze website traffic and performance</li>
                    <li>Provide relevant product recommendations</li>
                    <li>Ensure the security of our website and services</li>
                    <li>Comply with legal and regulatory requirements</li>
                  </ul>
                </div>
              </section>

              {/* Types of Cookies */}
              <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-serif text-luxury-gold mb-6 flex items-center">
                  <div className="w-2 h-8 bg-luxury-gold mr-4 rounded-full"></div>
                  Types of Cookies We Use
                </h2>
                <div className="space-y-6">
                  {/* Essential Cookies */}
                  <div className="border-l-4 border-luxury-gold pl-6">
                    <h3 className="text-xl font-medium text-white mb-3">Essential Cookies</h3>
                    <p className="text-gray-300 mb-3">
                      These cookies are necessary for our website to function properly. They enable basic 
                      features like security, network management, and accessibility.
                    </p>
                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2"><strong>Examples:</strong></p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Authentication cookies (keeping you logged in)</li>
                        <li>• Shopping cart cookies</li>
                        <li>• Security cookies</li>
                        <li>• Load balancing cookies</li>
                      </ul>
                      <p className="text-sm text-luxury-gold mt-3">
                        <strong>Required:</strong> Yes - These cannot be disabled as they are essential for the website to work.
                      </p>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border-l-4 border-warm-gold pl-6">
                    <h3 className="text-xl font-medium text-white mb-3">Analytics Cookies</h3>
                    <p className="text-gray-300 mb-3">
                      These cookies help us understand how visitors interact with our website by collecting 
                      and reporting information anonymously.
                    </p>
                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2"><strong>Examples:</strong></p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Google Analytics cookies</li>
                        <li>• Page view tracking</li>
                        <li>• User journey analysis</li>
                        <li>• Performance monitoring</li>
                      </ul>
                      <p className="text-sm text-warm-gold mt-3">
                        <strong>Required:</strong> No - You can opt out of these cookies.
                      </p>
                    </div>
                  </div>

                  {/* Functional Cookies */}
                  <div className="border-l-4 border-blue-400 pl-6">
                    <h3 className="text-xl font-medium text-white mb-3">Functional Cookies</h3>
                    <p className="text-gray-300 mb-3">
                      These cookies enable enhanced functionality and personalization, such as remembering 
                      your preferences and settings.
                    </p>
                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2"><strong>Examples:</strong></p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Language preferences</li>
                        <li>• Regional settings</li>
                        <li>• Theme preferences</li>
                        <li>• Recently viewed products</li>
                      </ul>
                      <p className="text-sm text-blue-400 mt-3">
                        <strong>Required:</strong> No - Disabling these may affect website functionality.
                      </p>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border-l-4 border-red-400 pl-6">
                    <h3 className="text-xl font-medium text-white mb-3">Marketing Cookies</h3>
                    <p className="text-gray-300 mb-3">
                      These cookies are used to deliver personalized advertisements and measure the 
                      effectiveness of advertising campaigns.
                    </p>
                    <div className="bg-black/20 rounded-lg p-4">
                      <p className="text-sm text-gray-400 mb-2"><strong>Examples:</strong></p>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Social media advertising pixels</li>
                        <li>• Retargeting cookies</li>
                        <li>• Campaign tracking</li>
                        <li>• Conversion measurement</li>
                      </ul>
                      <p className="text-sm text-red-400 mt-3">
                        <strong>Required:</strong> No - You can opt out of these cookies.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Third-Party Cookies */}
              <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-serif text-luxury-gold mb-6 flex items-center">
                  <div className="w-2 h-8 bg-luxury-gold mr-4 rounded-full"></div>
                  Third-Party Cookies
                </h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    Some cookies on our site are set by third-party services that appear on our pages. 
                    These services include:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Payment Processors</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Stripe (payment processing)</li>
                        <li>• PayPal (payment processing)</li>
                        <li>• Apple Pay (payment processing)</li>
                        <li>• Google Pay (payment processing)</li>
                      </ul>
                    </div>
                    <div className="bg-black/20 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Analytics & Marketing</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Google Analytics (website analytics)</li>
                        <li>• Facebook Pixel (advertising)</li>
                        <li>• Google Ads (advertising)</li>
                        <li>• Instagram (social media integration)</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    We do not control these third-party cookies. Please check the relevant third party's 
                    website for more information about their cookies and how to manage them.
                  </p>
                </div>
              </section>

              {/* Managing Cookies */}
              <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-serif text-luxury-gold mb-6 flex items-center">
                  <div className="w-2 h-8 bg-luxury-gold mr-4 rounded-full"></div>
                  Managing Your Cookie Preferences
                </h2>
                <div className="space-y-6">
                  <div className="text-gray-300 leading-relaxed space-y-4">
                    <p>
                      You have several options to manage cookies on our website:
                    </p>
                  </div>

                  {/* Website Cookie Settings */}
                  <div className="bg-luxury-gold/10 border border-luxury-gold/20 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <div className="w-2 h-2 bg-luxury-gold rounded-full mr-3"></div>
                      Website Cookie Settings
                    </h4>
                    <p className="text-gray-300 mb-4">
                      Use our cookie preference center to control which types of cookies you allow:
                    </p>
                    <button className="bg-luxury-gold hover:bg-warm-gold text-black px-6 py-3 rounded-lg font-medium transition-colors">
                      Manage Cookie Preferences
                    </button>
                  </div>

                  {/* Browser Settings */}
                  <div className="bg-black/20 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-3 flex items-center">
                      <div className="w-2 h-2 bg-warm-gold rounded-full mr-3"></div>
                      Browser Settings
                    </h4>
                    <p className="text-gray-300 mb-4">
                      You can also control cookies through your browser settings:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-white font-medium mb-2">Popular Browsers:</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>• <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-luxury-gold hover:text-warm-gold">Google Chrome</a></li>
                          <li>• <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-luxury-gold hover:text-warm-gold">Firefox</a></li>
                          <li>• <a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-luxury-gold hover:text-warm-gold">Safari</a></li>
                          <li>• <a href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer" className="text-luxury-gold hover:text-warm-gold">Microsoft Edge</a></li>
                        </ul>
                      </div>
                      <div>
                        <p className="text-white font-medium mb-2">What you can do:</p>
                        <ul className="text-gray-300 space-y-1">
                          <li>• Block all cookies</li>
                          <li>• Block third-party cookies</li>
                          <li>• Delete existing cookies</li>
                          <li>• Set up notifications for new cookies</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-red-900/20 border border-red-400/20 rounded-lg">
                      <p className="text-red-200 text-sm">
                        <strong>Important:</strong> Blocking all cookies may affect your ability to use certain 
                        features of our website, including making purchases and accessing your account.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Retention */}
              <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-serif text-luxury-gold mb-6 flex items-center">
                  <div className="w-2 h-8 bg-luxury-gold mr-4 rounded-full"></div>
                  Cookie Retention Periods
                </h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    Different cookies have different retention periods:
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left py-3 px-4 text-white">Cookie Type</th>
                          <th className="text-left py-3 px-4 text-white">Retention Period</th>
                          <th className="text-left py-3 px-4 text-white">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-300">
                        <tr className="border-b border-gray-700">
                          <td className="py-3 px-4">Session Cookies</td>
                          <td className="py-3 px-4">Until you close your browser</td>
                          <td className="py-3 px-4">Essential website functionality</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                          <td className="py-3 px-4">Authentication</td>
                          <td className="py-3 px-4">Up to 30 days</td>
                          <td className="py-3 px-4">Keep you logged in</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                          <td className="py-3 px-4">Shopping Cart</td>
                          <td className="py-3 px-4">Up to 7 days</td>
                          <td className="py-3 px-4">Remember cart contents</td>
                        </tr>
                        <tr className="border-b border-gray-700">
                          <td className="py-3 px-4">Analytics</td>
                          <td className="py-3 px-4">Up to 2 years</td>
                          <td className="py-3 px-4">Website usage analysis</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4">Marketing</td>
                          <td className="py-3 px-4">Up to 1 year</td>
                          <td className="py-3 px-4">Personalized advertising</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-serif text-luxury-gold mb-6 flex items-center">
                  <div className="w-2 h-8 bg-luxury-gold mr-4 rounded-full"></div>
                  Your Rights Under UK/EU Law
                </h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    Under the UK GDPR and EU GDPR, you have the following rights regarding cookies and personal data:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-luxury-gold rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="text-white font-medium">Right to Information</h4>
                          <p className="text-sm text-gray-400">Know what cookies we use and why</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-luxury-gold rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="text-white font-medium">Right to Access</h4>
                          <p className="text-sm text-gray-400">Request access to your personal data</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-luxury-gold rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="text-white font-medium">Right to Rectification</h4>
                          <p className="text-sm text-gray-400">Correct inaccurate personal data</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-luxury-gold rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="text-white font-medium">Right to Erasure</h4>
                          <p className="text-sm text-gray-400">Request deletion of your personal data</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-luxury-gold rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="text-white font-medium">Right to Object</h4>
                          <p className="text-sm text-gray-400">Object to certain data processing</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-luxury-gold rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <h4 className="text-white font-medium">Right to Withdraw Consent</h4>
                          <p className="text-sm text-gray-400">Withdraw consent for cookie use</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Changes to Policy */}
              <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-serif text-luxury-gold mb-6 flex items-center">
                  <div className="w-2 h-8 bg-luxury-gold mr-4 rounded-full"></div>
                  Changes to This Policy
                </h2>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    We may update this Cookie Policy from time to time to reflect changes in our practices, 
                    technology, legal requirements, or other factors. When we make significant changes, we will:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Update the "Last modified" date at the top of this policy</li>
                    <li>Notify you via email if you have an account with us</li>
                    <li>Display a prominent notice on our website</li>
                    <li>Request fresh consent for new types of cookies</li>
                  </ul>
                  <p>
                    We encourage you to review this policy periodically to stay informed about how we use cookies.
                  </p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-gradient-to-r from-luxury-gold/10 to-warm-gold/10 backdrop-blur-lg rounded-2xl p-8 border border-luxury-gold/20">
                <h2 className="text-2xl font-serif text-luxury-gold mb-6 flex items-center">
                  <div className="w-2 h-8 bg-luxury-gold mr-4 rounded-full"></div>
                  Contact Us About Cookies
                </h2>
                <div className="space-y-6">
                  <div className="text-gray-300 leading-relaxed">
                    <p className="mb-4">
                      If you have any questions about our use of cookies or this Cookie Policy, please contact us:
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Data Protection Officer</h4>
                        <p className="text-gray-300">privacy@ashhadu.co.uk</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">General Inquiries</h4>
                        <p className="text-gray-300">info@ashhadu.co.uk</p>
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-2">Phone</h4>
                        <p className="text-gray-300">+44 20 7946 0958</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-white font-medium mb-2">Postal Address</h4>
                        <div className="text-gray-300 space-y-1">
                          <p>Ashhadu Islamic Art Ltd</p>
                          <p>Data Protection Team</p>
                          <p>123 Islamic Art Street</p>
                          <p>London, SW1A 1AA</p>
                          <p>United Kingdom</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-luxury-gold/5 border border-luxury-gold/20 rounded-lg">
                    <p className="text-sm text-gray-300">
                      <strong className="text-luxury-gold">Response Time:</strong> We aim to respond to all 
                      cookie and privacy-related inquiries within 5 business days. For urgent matters, 
                      please call our customer service line.
                    </p>
                  </div>
                </div>
              </section>

              {/* Related Policies */}
              <section className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
                <h2 className="text-2xl font-serif text-luxury-gold mb-6 flex items-center">
                  <div className="w-2 h-8 bg-luxury-gold mr-4 rounded-full"></div>
                  Related Policies
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <a href="/privacy-policy" className="group bg-black/20 hover:bg-black/30 rounded-lg p-6 transition-colors">
                    <h4 className="text-white font-medium mb-2 group-hover:text-luxury-gold transition-colors">
                      Privacy Policy
                    </h4>
                    <p className="text-sm text-gray-400">
                      Learn how we collect, use, and protect your personal information.
                    </p>
                  </a>
                  <a href="/terms-of-service" className="group bg-black/20 hover:bg-black/30 rounded-lg p-6 transition-colors">
                    <h4 className="text-white font-medium mb-2 group-hover:text-luxury-gold transition-colors">
                      Terms of Service
                    </h4>
                    <p className="text-sm text-gray-400">
                      Understand the terms and conditions for using our website.
                    </p>
                  </a>
                  <a href="/data-protection" className="group bg-black/20 hover:bg-black/30 rounded-lg p-6 transition-colors">
                    <h4 className="text-white font-medium mb-2 group-hover:text-luxury-gold transition-colors">
                      Data Protection
                    </h4>
                    <p className="text-sm text-gray-400">
                      Our commitment to protecting your data under UK GDPR.
                    </p>
                  </a>
                </div>
              </section>
            </div>
          </div>
        </div>
      </MainContentWrapper>
      <Footer />
    </>
  );
}