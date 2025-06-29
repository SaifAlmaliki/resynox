import logo from "@/assets/logo.png";
import { StaticImageData } from "next/image";

// Icon types matching the FloatingHeader component
type IconType = "FileText" | "Mic" | "CreditCard" | "Mail";

// Type definitions
interface NavItem {
  label: string;
  href: string;
  icon?: IconType;
}

interface FloatingHeaderData {
  logo?: {
    src: string | StaticImageData;
    alt: string;
    width?: number;
    height?: number;
  };
  brandName?: string;
  navItems: NavItem[];
  ctaButton?: {
    text: string;
    href: string;
    variant?: "default" | "premium" | "outline";
  };
}

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  label: string;
  href: string;
  icon: "Github" | "Twitter" | "Linkedin";
}

interface FooterData {
  logo?: {
    src: string | StaticImageData;
    alt: string;
    width?: number;
    height?: number;
  };
  brandName?: string;
  description?: string;
  sections?: FooterSection[];
  socialLinks?: SocialLink[];
  bottomLinks?: FooterLink[];
  copyright?: string;
  variant?: "simple" | "detailed";
}

export const floatingHeaderData: FloatingHeaderData = {
  logo: {
    src: logo,
    alt: "RESYNOX Logo",
    width: 32,
    height: 32,
  },
  brandName: "RESYNOX",
  navItems: [
    {
      label: "Resumes",
      href: "/resumes",
      icon: "FileText"
    },
    {
      label: "Cover Letters",
      href: "/cover-letters",
      icon: "FileText"
    },
    {
      label: "Interviews",
      href: "/interview",
      icon: "Mic"
    },
    {
      label: "Billing",
      href: "/billing",
      icon: "CreditCard"
    },
    {
      label: "Pricing",
      href: "/pricing",
      icon: "CreditCard"
    }
  ],
  ctaButton: {
    text: "Get Started",
    href: "#cta-section",
    variant: "premium" as const
  }
};

export const footerData: FooterData = {
  logo: {
    src: logo,
    alt: "RESYNOX Logo",
    width: 24,
    height: 24,
  },
  brandName: "RESYNOX",
  description: "Your complete career preparation platform powered by AI",
  sections: [
    {
      title: "Product",
      links: [
        { label: "Resume Builder", href: "/resumes" },
        { label: "Cover Letters", href: "/cover-letters" },
        { label: "Mock Interviews", href: "/interview" },
        { label: "Pricing", href: "/pricing" }
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
        { label: "Contact", href: "/contact" }
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Contact Support", href: "/contact" },
        { label: "Documentation", href: "/docs" },
        { label: "Community", href: "/community" }
      ]
    }
  ],
  socialLinks: [
    {
      label: "GitHub",
      href: "https://github.com/resynox",
      icon: "Github"
    },
    {
      label: "Twitter",
      href: "https://twitter.com/resynox",
      icon: "Twitter"
    },
    {
      label: "LinkedIn",
      href: "https://linkedin.com/company/resynox",
      icon: "Linkedin"
    }
  ],
  bottomLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/tos" },
    { label: "Cookies", href: "/cookies" }
  ],
  copyright: "© 2024 RESYNOX. All rights reserved.",
  variant: "simple" as const
};

// Simplified footer for the landing page
export const simpleFooterData: FooterData = {
  brandName: "RESYNOX",
  bottomLinks: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/tos" },
    { label: "Support", href: "/contact" },
    { label: "Contact", href: "/contact" }
  ],
  copyright: "© 2024 RESYNOX. All rights reserved.",
  variant: "simple" as const
};