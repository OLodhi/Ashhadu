import React from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/homepage/HeroSection';
import FeaturedProducts from '@/components/homepage/FeaturedProducts';
import CollectionsPreview from '@/components/homepage/CollectionsPreview';
import AboutSection from '@/components/homepage/AboutSection';
import TestimonialsSection from '@/components/homepage/TestimonialsSection';
import NewsletterCTA from '@/components/homepage/NewsletterCTA';
import { MainContentWrapper } from '@/components/layout/MainContentWrapper';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <MainContentWrapper>
        <HeroSection />
        <FeaturedProducts />
        <CollectionsPreview />
        <AboutSection />
        <TestimonialsSection />
        <NewsletterCTA />
      </MainContentWrapper>
      
      <Footer />
    </div>
  );
}