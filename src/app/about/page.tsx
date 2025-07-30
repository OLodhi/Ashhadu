'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Heart, Sparkles, Users, MapPin, Clock, Shield, Star } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';

export default function AboutPage() {
  const stats = [
    {
      icon: Users,
      value: '500+',
      label: 'Happy Customers',
      color: 'text-luxury-gold'
    },
    {
      icon: Award,
      value: '50+',
      label: 'Unique Designs',
      color: 'text-blue-600'
    },
    {
      icon: Heart,
      value: '5+',
      label: 'Years Experience',
      color: 'text-red-600'
    },
    {
      icon: Sparkles,
      value: '100%',
      label: 'Handcrafted',
      color: 'text-purple-600'
    }
  ];

  const values = [
    {
      title: 'Authentic Islamic Art',
      description: 'Each piece is created with deep respect for Islamic traditions and artistic heritage, ensuring cultural authenticity in every design.',
      icon: '🕌'
    },
    {
      title: 'Premium Materials',
      description: 'We use only the finest 3D printing materials to ensure durability, precision, and lasting beauty in every piece.',
      icon: '✨'
    },
    {
      title: 'Custom Commissions',
      description: 'Work directly with our skilled artists to create personalized pieces for your home, office, or mosque.',
      icon: '🎨'
    },
    {
      title: 'UK Craftsmanship',
      description: 'Proudly designed and manufactured in the United Kingdom with meticulous attention to detail and quality.',
      icon: '🇬🇧'
    }
  ];

  const team = [
    {
      name: 'Master Calligrapher',
      role: 'Arabic Calligraphy Specialist',
      description: 'Over 15 years of experience in traditional Islamic calligraphy, ensuring authentic and beautiful Arabic text in every piece.',
      icon: '✍️'
    },
    {
      name: '3D Design Team',
      role: 'Digital Artisans',
      description: 'Skilled professionals who bridge traditional Islamic art with modern 3D printing technology.',
      icon: '🔧'
    },
    {
      name: 'Quality Assurance',
      role: 'Precision Specialists',
      description: 'Dedicated team ensuring every piece meets our exacting standards for quality and authenticity.',
      icon: '🔍'
    }
  ];

  const certifications = [
    {
      title: 'Cultural Authenticity',
      description: 'Reviewed by Islamic scholars for cultural and religious accuracy',
      icon: Shield
    },
    {
      title: 'Quality Assurance',
      description: 'ISO-standard manufacturing processes ensure consistent excellence',
      icon: Star
    },
    {
      title: 'UK Standards',
      description: 'Compliant with British manufacturing and safety standards',
      icon: MapPin
    },
    {
      title: 'Fast Delivery',
      description: 'Express processing and delivery across the United Kingdom',
      icon: Clock
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <MainContentWrapper>
        {/* Hero Section */}
        <section className="section-padding bg-gradient-to-br from-luxury-black via-gray-900 to-luxury-black text-white relative overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover opacity-20"
              style={{ filter: 'blur(1px) grayscale(30%)' }}
            >
              <source src="/videos/mosque-ethereal.mp4" type="video/mp4" />
            </video>
          </div>
          
          {/* Dark overlay to maintain readability */}
          <div className="absolute inset-0 bg-luxury-black/50"></div>
          
          {/* Islamic pattern overlay */}
          <div className="absolute inset-0 islamic-pattern-overlay opacity-10"></div>
          
          <div className="container-luxury relative">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              {/* Content Box with Glass Morphism Effect */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 md:p-12 border border-white/20 shadow-2xl"
                   style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)' }}
              >
                <h1 className="heading-hero mb-6">
                  <span className="text-luxury-gold">Crafting Sacred Art with</span>
                  <span className="text-white block mt-2">Modern Innovation</span>
                </h1>
                <p className="text-body-large mb-8 text-gray-200">
                  At Ashhadu Islamic Art, we bridge the timeless beauty of Islamic calligraphy 
                  and architecture with cutting-edge 3D printing technology. Each piece in our 
                  collection is a testament to the divine beauty found in Islamic art.
                </p>
              </div>
              
              {/* Stats Grid - Outside the box for better visual hierarchy */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <stat.icon size={32} className={`mx-auto mb-3 ${stat.color}`} />
                    <div className="font-playfair text-2xl font-bold text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="section-padding bg-white">
          <div className="container-luxury">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <h2 className="heading-section luxury-accent-left">
                  Our Story
                </h2>
                <div className="space-y-4 text-body">
                  <p>
                    Our journey began with a simple yet profound mission: to make authentic Islamic art 
                    accessible to every home, mosque, and heart that seeks to connect with the divine through beauty.
                  </p>
                  <p>
                    Founded by passionate artisans and technology enthusiasts, we recognized the unique opportunity 
                    to preserve and celebrate Islamic artistic traditions while embracing modern manufacturing techniques.
                  </p>
                  <p>
                    Every piece we create is more than just art—it's a bridge between the sacred traditions of Islamic 
                    calligraphy and the possibilities of contemporary craftsmanship. We work closely with Islamic scholars 
                    and calligraphy masters to ensure every Arabic text is perfectly rendered with cultural authenticity and respect.
                  </p>
                  <p>
                    Today, we're proud to serve customers across the UK and beyond, bringing the timeless beauty of 
                    Islamic art into modern homes and sacred spaces.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-[4/5] bg-gradient-to-br from-luxury-gold/10 to-luxury-gold/5 rounded-2xl overflow-hidden relative">
                  <div className="absolute inset-0 islamic-pattern-overlay opacity-20"></div>
                  <div className="relative h-full flex flex-col justify-center items-center p-8 text-center">
                    <div className="space-y-6">
                      <div className="w-24 h-24 mx-auto bg-luxury-gold/20 rounded-full flex items-center justify-center">
                        <div className="text-4xl">🕌</div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-playfair text-2xl font-semibold text-luxury-black">
                          Bridging Tradition & Innovation
                        </h3>
                        <p className="text-luxury-gray-600">
                          Where ancient artistry meets modern precision
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="section-padding bg-luxury-gray-50">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="heading-section mb-6">Our Values</h2>
              <p className="text-body-large max-w-3xl mx-auto">
                Everything we do is guided by our commitment to authenticity, quality, and respect for Islamic artistic traditions.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-luxury p-8 space-y-4"
                >
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <h3 className="font-playfair text-xl font-semibold text-luxury-black">
                    {value.title}
                  </h3>
                  <p className="text-body text-luxury-gray-600">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Team Section */}
        <section className="section-padding bg-white">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="heading-section mb-6">Our Artisans</h2>
              <p className="text-body-large max-w-3xl mx-auto">
                Meet the skilled professionals who bring centuries-old Islamic artistic traditions into the modern world.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-luxury p-8 text-center space-y-4"
                >
                  <div className="text-5xl mb-4">{member.icon}</div>
                  <h3 className="font-playfair text-xl font-semibold text-luxury-black">
                    {member.name}
                  </h3>
                  <p className="text-luxury-gold font-medium">
                    {member.role}
                  </p>
                  <p className="text-body text-luxury-gray-600">
                    {member.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Quality & Certifications */}
        <section className="section-padding bg-luxury-gray-50">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="heading-section mb-6">Quality & Standards</h2>
              <p className="text-body-large max-w-3xl mx-auto">
                Our commitment to excellence is reflected in our certifications and adherence to the highest standards.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-luxury p-6 text-center space-y-4"
                >
                  <cert.icon size={40} className="mx-auto text-luxury-gold" />
                  <h3 className="font-playfair text-lg font-semibold text-luxury-black">
                    {cert.title}
                  </h3>
                  <p className="text-small text-luxury-gray-600">
                    {cert.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </MainContentWrapper>
      
      <Footer />
    </div>
  );
}