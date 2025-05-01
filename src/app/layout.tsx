// Import a `Toaster` component for displaying toast notifications in the UI.
import { Toaster } from "@/components/ui/toaster";

// Wraps the app with Clerk's provider for authentication and user management.
import { ClerkProvider } from "@clerk/nextjs";

// Type import for defining metadata related to the page.
import type { Metadata } from "next";

// Provides theme management, enabling support for light, dark, and system themes.
import { ThemeProvider } from "next-themes";

// Dynamically loads the "Inter" font from Google Fonts.
import { Inter } from "next/font/google";

// Global CSS file to define shared styles across the application.
import "./globals.css";

// Initializes the Inter font with support for the Latin subset.
const inter = Inter({ subsets: ["latin"] });

// Meta information for the application, used for SEO and browser display.
export const metadata: Metadata = {
  // Template for dynamic page titles.
  title: {
    template: "%s - AI Powered Resume Builder",
    // Default title when no template is provided.
    absolute: "AI Powered Resume Builder",
  },
  // Meta description for SEO purposes.
  description:
    "AI powered resume builder that helps you create a professional resume in minutes. Get started for free!",
};

// Root layout component that wraps the application with global providers and layout.
export default function RootLayout({
  children,
}: Readonly<{
  // React Node representing nested components or pages.
  children: React.ReactNode;
}>) {
  return (
    // Wraps the application in ClerkProvider to enable authentication and session handling.
    <ClerkProvider>
      {/* Defines the HTML root element with the language set to English.
          The `suppressHydrationWarning` prevents hydration-related warnings. */}
      <html lang="en" suppressHydrationWarning>
        {/* Applies the Inter font's className to the `body` element for consistent typography. */}
        <body className={inter.className}>
          {/* Provides theme switching functionality (light, dark, or system-based). */}
          <ThemeProvider
            // Theme mode is set using a CSS class (e.g., "light", "dark").
            attribute="class"
            // Sets the default theme to follow the system preference.
            defaultTheme="system"
            // Enables automatic theme switching based on the system preference.
            enableSystem
            // Disables transition animations when changing themes.
            disableTransitionOnChange
          >
            {/* Renders the nested content (pages and components). */}
            {children}
            {/* Includes the Toaster component to display toast notifications globally. */}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
