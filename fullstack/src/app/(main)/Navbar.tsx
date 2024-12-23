"use client"; // Mark this component as a client-side component

// Import external dependencies
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { CreditCard } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

// Import internal dependencies
import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";

// Define Clerk user button appearance configuration
const getUserButtonAppearance = (theme: string | undefined) => ({
  baseTheme: theme === "dark" ? dark : undefined,
  elements: {
    avatarBox: {
      width: 35,
      height: 35,
    },
  },
});

export default function Navbar() {
  // Get current theme from next-themes
  const { theme } = useTheme();

  return (
    <header className="shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
        {/* Logo and Brand Name */}
        <Link href="/resumes" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="Logo"
            width={35}
            height={35}
            className="rounded-full"
          />
          <span className="text-xl font-bold tracking-tight">
            RESYNOX
          </span>
        </Link>

        {/* Right-side Controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* User Profile Menu */}
          <UserButton appearance={getUserButtonAppearance(theme)}>
            <UserButton.MenuItems>
              {/* Billing Menu Item */}
              <UserButton.Link
                label="Billing"
                labelIcon={<CreditCard className="size-4" />}
                href="/billing"
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
      </nav>
    </header>
  );
}
