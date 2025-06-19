'use client';

import { NavLink } from "./nav-link";
import { Button } from "./button";
import { Menu, X, FileText, Mic, CreditCard, Mail } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import logo from "@/assets/logo.png";

// Icon mapping for string-based icons
const iconMap = {
  FileText,
  Mic,
  CreditCard,
  Mail,
} as const;

interface NavItem {
  label: string;
  href: string;
  icon?: keyof typeof iconMap;
}

interface FloatingHeaderProps {
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
  className?: string;
}

export function FloatingHeader({ 
  logo: logoProps, 
  brandName, 
  navItems, 
  ctaButton,
  className = "" 
}: FloatingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Floating Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <nav className="bg-green-900/80 backdrop-blur-md rounded-2xl border border-green-800/30 shadow-lg px-6 py-4">
            <div className="flex items-center justify-between gap-8">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                {logoProps && (
                  <Image
                    src={logoProps.src}
                    alt={logoProps.alt}
                    width={logoProps.width || 32}
                    height={logoProps.height || 32}
                    className="rounded-full"
                  />
                )}
                {brandName && (
                  <span className="text-lg font-bold tracking-tight text-white">
                    {brandName}
                  </span>
                )}
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                {navItems.map((item, index) => {
                  const Icon = item.icon ? iconMap[item.icon] : null;
                  return (
                    <NavLink
                      key={index}
                      href={item.href}
                      className="flex items-center gap-2 text-sm font-medium text-green-100 hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-green-800/50"
                    >
                      {Icon && <Icon className="h-4 w-4" />}
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>

              {/* CTA Button */}
              {ctaButton && (
                <div className="hidden md:block">
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="rounded-full px-6 bg-white text-green-900 hover:bg-green-50 border border-green-100 shadow-sm"
                  >
                    <Link href={ctaButton.href}>
                      {ctaButton.text}
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-full hover:bg-green-800/50 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-green-100" />
                ) : (
                  <Menu className="h-5 w-5 text-green-100" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-24 left-4 right-4 bg-green-900/95 backdrop-blur-md rounded-2xl border border-green-800/30 shadow-xl p-6">
            <div className="space-y-4">
              {navItems.map((item, index) => {
                const Icon = item.icon ? iconMap[item.icon] : null;
                return (
                  <NavLink
                    key={index}
                    href={item.href}
                    className="flex items-center gap-3 text-base font-medium text-green-100 hover:text-white transition-colors p-3 rounded-lg hover:bg-green-800/50 w-full"
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    {item.label}
                  </NavLink>
                );
              })}
              
              {ctaButton && (
                <div className="pt-4 border-t border-green-800/30">
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="w-full rounded-lg bg-white text-green-900 hover:bg-green-50 border border-green-100 shadow-sm"
                  >
                    <Link href={ctaButton.href}>
                      {ctaButton.text}
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 