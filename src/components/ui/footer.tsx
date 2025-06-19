import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { Github, Twitter, Linkedin } from "lucide-react";

// Icon mapping for string-based icons
const iconMap = {
  Github,
  Twitter,
  Linkedin,
} as const;

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
  icon: keyof typeof iconMap;
}

interface FooterProps {
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
  className?: string;
  variant?: "simple" | "detailed";
}

export function Footer({
  logo,
  brandName,
  description,
  sections = [],
  socialLinks = [],
  bottomLinks = [],
  copyright,
  className = "",
  variant = "simple"
}: FooterProps) {
  if (variant === "simple") {
    return (
      <footer className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3">
              {logo && (
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width || 24}
                  height={logo.height || 24}
                  className="rounded-full"
                />
              )}
              {brandName && (
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {brandName}
                </span>
              )}
            </div>

            {/* Quick Links */}
            <div className="flex items-center gap-6">
              {bottomLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-800 dark:hover:text-green-100 transition-colors"
                  {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-500 dark:text-gray-500">
              {copyright || `© ${new Date().getFullYear()} ${brandName || 'Company'}. All rights reserved.`}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {logo && (
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width || 32}
                  height={logo.height || 32}
                  className="rounded-full"
                />
              )}
              {brandName && (
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {brandName}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {description}
              </p>
            )}
            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = iconMap[social.icon];
                  return (
                    <Link
                      key={index}
                      href={social.href}
                      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-green-900/10 dark:hover:bg-green-900/20 text-gray-600 dark:text-gray-400 hover:text-green-800 dark:hover:text-green-100 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Sections */}
          {sections.map((section, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-800 dark:hover:text-green-100 transition-colors"
                      {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-500">
              {copyright || `© ${new Date().getFullYear()} ${brandName || 'Company'}. All rights reserved.`}
            </div>
            {bottomLinks.length > 0 && (
              <div className="flex items-center gap-6">
                {bottomLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="text-sm text-gray-500 dark:text-gray-500 hover:text-green-800 dark:hover:text-green-100 transition-colors"
                    {...(link.external && { target: "_blank", rel: "noopener noreferrer" })}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
} 