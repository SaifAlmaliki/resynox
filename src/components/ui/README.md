# UI Components

This directory contains reusable UI components including navigation and layout components.

## Navigation Components

### FloatingHeader

A modern, rounded floating header with glassmorphism effect that stays at the top of the page.

**Features:**
- Transparent with backdrop blur
- Rounded pill design
- Mobile responsive with hamburger menu
- Support for logo, brand name, navigation items, and CTA button
- Smooth animations and hover effects

**Usage:**
```tsx
import { FloatingHeader } from '@/components/ui/floating-header';
import { floatingHeaderData } from '@/constants/navigationData';

<FloatingHeader {...floatingHeaderData} />
```

**Props:**
- `logo?` - Logo configuration with src, alt, width, height
- `brandName?` - Brand name text
- `navItems` - Array of navigation items with label, href, and optional icon
- `ctaButton?` - Call-to-action button configuration
- `className?` - Additional CSS classes

### Footer

A flexible footer component with simple and detailed variants.

**Features:**
- Two variants: "simple" and "detailed"
- Support for logo, brand name, sections, social links
- Responsive design
- Configurable copyright and links

**Usage:**
```tsx
import { Footer } from '@/components/ui/footer';
import { simpleFooterData } from '@/constants/navigationData';

<Footer {...simpleFooterData} />
```

**Props:**
- `logo?` - Logo configuration
- `brandName?` - Brand name
- `description?` - Brand description (detailed variant)
- `sections?` - Array of footer sections with links
- `socialLinks?` - Array of social media links
- `bottomLinks?` - Array of bottom footer links
- `copyright?` - Copyright text
- `variant?` - "simple" or "detailed"

## Configuration

Navigation data is centralized in `src/constants/navigationData.ts`:

```tsx
export const floatingHeaderData = {
  logo: { src: logo, alt: "Brand", width: 32, height: 32 },
  brandName: "RESYNOX",
  navItems: [
    { label: "Resumes", href: "/resumes", icon: FileText },
    { label: "Cover Letters", href: "/cover-letters", icon: FileText },
    // ...
  ],
  ctaButton: { text: "Get Started", href: "/resumes", variant: "premium" }
};

export const simpleFooterData = {
  brandName: "RESYNOX",
  bottomLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/tos" },
    // ...
  ],
  variant: "simple"
};
```

## Design System

### Colors
- Primary: Green theme (`green-400`, `green-600`)
- Background: White/Gray with dark mode support
- Text: Gray scale with green accents on hover

### Animations
- Smooth transitions on hover states
- Backdrop blur effects
- Mobile menu slide animations
- Loading state animations

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-friendly mobile interactions
- Adaptive layouts

### Accessibility
- Keyboard navigation support
- Screen reader friendly
- ARIA labels where appropriate
- Focus indicators

## Best Practices

1. **Consistency**: Use the same data configuration pattern
2. **Performance**: Components are optimized for fast rendering
3. **Modularity**: Each component is self-contained and reusable
4. **TypeScript**: Full type safety with interfaces
5. **Responsive**: Mobile-first design approach 