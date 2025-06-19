# Landing Page Components

This directory contains modular, reusable components for the landing page. Each component is designed to be flexible and configurable through props.

## Components

### Section Components
- **`HeroSection`** - Main hero section with title, subtitle, CTAs, and 3D scene
- **`StatsSection`** - Statistics display with animated counters
- **`HowItWorksSection`** - Step-by-step process explanation
- **`SuccessStoriesSection`** - Customer testimonials
- **`FAQSection`** - Interactive FAQ with expand/collapse
- **`CTASection`** - Call-to-action section with multiple CTAs

### Reusable Components
- **`FeatureCard`** - Individual feature/step cards
- **`TestimonialCard`** - Customer testimonial cards
- **`FAQItem`** - Individual FAQ items with animations
- **`CTACard`** - Call-to-action cards

## Usage

### Basic Setup
```tsx
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

export default function LandingPage() {
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
```

### Individual Component Usage
```tsx
// Using FeatureCard independently
<FeatureCard
  icon={FileText}
  title="Resume Builder"
  description="Create professional resumes with AI assistance"
  step="1"
/>

// Using TestimonialCard independently
<TestimonialCard
  name="John Doe"
  role="Software Engineer"
  content="Great platform!"
  rating={5}
  icon={User}
/>
```

## Customization

### Data Configuration
All content is centralized in `src/constants/landingData.ts`:
- `heroData` - Hero section content
- `statsData` - Statistics array
- `howItWorksData` - Process steps
- `successStoriesData` - Testimonials
- `faqData` - FAQ items
- `ctaData` - Call-to-action items

### Styling
Components use Tailwind CSS classes and support:
- Dark mode variants
- Responsive design
- Hover effects
- Smooth animations
- Staggered animations for lists

### Animations
- CSS-only animations for performance
- Staggered animations using CSS custom properties
- Smooth transitions and hover effects
- Configurable animation delays

## Features

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- ARIA labels where needed

### Performance
- Lightweight components
- CSS-only animations
- Optimized for fast loading
- Minimal JavaScript usage

### Reusability
- Prop-based configuration
- Composable components
- Consistent API design
- Easy to extend and modify

## File Structure
```
src/components/landing/
├── HeroSection.tsx
├── StatsSection.tsx
├── FeatureCard.tsx
├── HowItWorksSection.tsx
├── TestimonialCard.tsx
├── SuccessStoriesSection.tsx
├── FAQItem.tsx
├── FAQSection.tsx
├── CTACard.tsx
├── CTASection.tsx
├── index.ts
└── README.md
```

## Best Practices

1. **Keep components focused** - Each component has a single responsibility
2. **Use TypeScript interfaces** - All props are typed for better DX
3. **Maintain consistency** - Similar patterns across components
4. **Support dark mode** - All components work in light/dark themes
5. **Performance first** - Lightweight and optimized animations 