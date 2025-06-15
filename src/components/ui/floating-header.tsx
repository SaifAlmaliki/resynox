"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { 
  BriefcaseIcon, 
  CreditCard, 
  FileText, 
  LogIn,
  Mic, 
  User,
  UserPlus
} from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

const getUserButtonAppearance = (theme: string | undefined) => ({
  baseTheme: theme === "dark" ? dark : undefined,
  elements: {
    avatarBox: {
      width: 32,
      height: 32,
    },
  },
});

export default function FloatingHeader() {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { isSignedIn, user } = useUser();

  // Handle scroll effect for additional transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if current path is active
  const isActivePath = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  // Hide header on auth pages
  const isAuthPage = pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");
  if (isAuthPage) return null;

  return (
    <header className="fixed top-4 left-0 right-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className={`
          backdrop-blur-lg bg-green-900/20 dark:bg-green-900/30 
          border border-green-500/20 dark:border-green-400/20
          rounded-full shadow-lg shadow-green-500/10 dark:shadow-green-400/10
          px-6 py-3
          flex items-center justify-between gap-6
          transition-all duration-300
          ${isScrolled ? "bg-green-900/30 dark:bg-green-900/40" : ""}
        `}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src={logo}
            alt="Resynox Logo"
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
            RESYNOX
          </span>
        </Link>

        {/* Navigation Links - only show for authenticated users */}
        {isSignedIn && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/resumes"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-900/20
                ${isActivePath("/resumes") 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                  : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                }
              `}
            >
              <FileText className="w-4 h-4" />
              Resumes
            </Link>
            
            <Link
              href="/interview"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-900/20
                ${isActivePath("/interview") 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                  : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                }
              `}
            >
              <Mic className="w-4 h-4" />
              Interviews
            </Link>
            
            <Link
              href="/cover-letters"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-900/20
                ${isActivePath("/cover-letters") 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                  : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                }
              `}
            >
              <BriefcaseIcon className="w-4 h-4" />
              Cover Letters
            </Link>
          </div>
        )}

        {/* Mobile Navigation Links - only show for authenticated users */}
        {isSignedIn && (
          <div className="md:hidden flex items-center gap-1">
            <Link
              href="/resumes"
              className={`
                p-2 rounded-full transition-all duration-200
                ${isActivePath("/resumes") 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                  : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                }
              `}
            >
              <FileText className="w-4 h-4" />
            </Link>
            
            <Link
              href="/interview"
              className={`
                p-2 rounded-full transition-all duration-200
                ${isActivePath("/interview") 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                  : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                }
              `}
            >
              <Mic className="w-4 h-4" />
            </Link>
            
            <Link
              href="/cover-letters"
              className={`
                p-2 rounded-full transition-all duration-200
                ${isActivePath("/cover-letters") 
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" 
                  : "text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                }
              `}
            >
              <BriefcaseIcon className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* CTA Button for landing page or sign in/up buttons for non-authenticated users */}
          {pathname === "/" && !isSignedIn && (
            <div className="hidden sm:flex items-center gap-2">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20"
              >
                <Link href="/sign-in" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
              >
                <Link href="/sign-up" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}

          {pathname === "/" && isSignedIn && (
            <Button
              asChild
              size="sm"
              className="hidden sm:flex bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
            >
              <Link href="/resumes">
                Dashboard
              </Link>
            </Button>
          )}
          
          <ThemeToggle />

          {/* User Button - only show when authenticated */}
          {isSignedIn && (
            <div className="flex items-center">
              <UserButton appearance={getUserButtonAppearance(theme)}>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Billing"
                    labelIcon={<CreditCard className="size-4" />}
                    href="/billing"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          )}
        </div>
        </nav>
      </div>
    </header>
  );
} 