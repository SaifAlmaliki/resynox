'use client';

import {
  HeroSection,
  StatsSection,
  HowItWorksSection,
  SuccessStoriesSection,
  FAQSection,
  CTASection
} from '@/components/landing';

import {
  heroData,
  statsData,
  howItWorksData,
  successStoriesData,
  faqData,
  ctaData
} from '@/constants/landingData';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <HeroSection {...heroData} />
        <StatsSection stats={statsData} />
        <HowItWorksSection {...howItWorksData} />
        <SuccessStoriesSection {...successStoriesData} />
        <FAQSection {...faqData} />
        <CTASection {...ctaData} />
      </div>
    </main>
  );
}
