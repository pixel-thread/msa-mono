'use client';

import { AboutSection } from '@src/shared/components/home/about-section';
import { ContactSection } from '@src/shared/components/home/contact-section';
import { CtaSection } from '@src/shared/components/home/cta-section';
import { FeaturesSection } from '@src/shared/components/home/features-section';
import { HeroSection } from '@src/shared/components/home/hero-section';
import { HowItWorksSection } from '@src/shared/components/home/how-it-works-section';
import { SecuritySection } from '@src/shared/components/home/security-section';
import { StatsSection } from '@src/shared/components/home/stats-section';
import { TestimonialsSection } from '@src/shared/components/home/testimonials-section';
import { PublicFooter } from '@src/shared/components/public-footer';
import { PublicHeader } from '@src/shared/components/public-header';

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <AboutSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <SecuritySection />
      <CtaSection />
      <ContactSection />
      <PublicFooter />
    </div>
  );
}
