"use client";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { CreditCard } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";
import { NavLink } from "@/components/ui/nav-link";



export default function Navbar() {
  const { theme } = useTheme();
  const [points, setPoints] = useState<number>(0);

  // Fetch points balance on mount and on custom events
  useEffect(() => {
    let active = true;
    const fetchPoints = async () => {
      try {
        const res = await fetch('/api/points/balance', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (active) setPoints(typeof data.points === 'number' ? data.points : 0);
      } catch {
        if (active) setPoints(0);
      }
    };

    // initial fetch
    fetchPoints();

    // refetch on focus/visibility change
    const onFocus = () => fetchPoints();
    const onVisibility = () => { if (document.visibilityState === 'visible') fetchPoints(); };
    const onPointsUpdate = () => fetchPoints();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('points:update', onPointsUpdate as EventListener);
    return () => {
      active = false;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('points:update', onPointsUpdate as EventListener);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="bg-green-900/90 backdrop-blur-md border-b border-green-800/30 shadow-lg">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-2.5">
          {/* Logo and Brand */}
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src={logo}
                alt="RESYNOX Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-lg font-bold tracking-tight text-white">
                RESYNOX
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-1">
              <NavLink 
                href="/resumes" 
                className="px-3 py-1.5 rounded-full text-sm font-medium text-green-100 hover:text-white hover:bg-green-800/50 transition-all duration-200"
              >
                Resumes
              </NavLink>
              <NavLink 
                href="/cover-letters" 
                className="px-3 py-1.5 rounded-full text-sm font-medium text-green-100 hover:text-white hover:bg-green-800/50 transition-all duration-200"
              >
                Cover Letters
              </NavLink>
              <NavLink 
                href="/interview" 
                className="px-3 py-1.5 rounded-full text-sm font-medium text-green-100 hover:text-white hover:bg-green-800/50 transition-all duration-200"
              >
                Interviews
              </NavLink>
              <NavLink 
                href="/billing" 
                className="px-3 py-1.5 rounded-full text-sm font-medium text-green-100 hover:text-white hover:bg-green-800/50 transition-all duration-200"
              >
                Billing
              </NavLink>
            </div>
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Points badge (always visible) */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-green-900 text-sm font-medium border border-green-100 shadow-sm">
                <span>Points: {points}</span>
              </div>
              {/* Theme Toggle with dark green styling */}
              <div className="p-1 rounded-full hover:bg-green-800/50 transition-colors">
                <ThemeToggle />
              </div>

              {/* User Button - simplified to prevent hydration issues */}
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: {
                      width: 35,
                      height: 35,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                    },
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Billing"
                    labelIcon={<CreditCard className="size-4" />}
                    href="/billing"
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
