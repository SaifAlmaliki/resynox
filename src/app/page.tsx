'use client';

import {
  HeroSection,
  HowItWorksSection,
  SuccessStoriesSection,
  FAQSection,
  CTASection,
  BenefitsSection
} from '@/components/landing';

import { FloatingHeader } from '@/components/ui/floating-header';
import { Footer } from '@/components/ui/footer';

import {
  heroData,
  howItWorksData,
  successStoriesData,
  faqData,
  ctaData,
  benefitsData,
} from '@/constants/landingData';

import { floatingHeaderData, simpleFooterData } from '@/constants/navigationData';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <FloatingHeader {...floatingHeaderData} />
      
      <main>
        <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8 pt-20 md:pt-24">
          <HeroSection {...heroData} />
          <HowItWorksSection {...howItWorksData} />
          <BenefitsSection {...benefitsData} />
          <SuccessStoriesSection {...successStoriesData} />
          <FAQSection {...faqData} />
          <CTASection {...ctaData} />
        </div>
      </main>
      
      <Footer {...simpleFooterData} />
    </div>
  );
}
