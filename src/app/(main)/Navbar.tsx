"use client";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { CreditCard } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

import logo from "@/assets/logo.png";
import ThemeToggle from "@/components/ThemeToggle";


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
  const { theme } = useTheme();

  return (
    <header className="shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">

        <div className="flex items-center gap-2">
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
        </div>


        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link href="/resumes" className="font-medium hover:text-primary transition-colors">
              Resumes
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />

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
        </div>
      </nav>
    </header>
  );
}
