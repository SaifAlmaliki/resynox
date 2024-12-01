"use client";

// Import necessary icons and components
import { Moon, Sun } from "lucide-react"; // Icons for dark/light theme
import { useTheme } from "next-themes";   // Hook for theme management
import { Button } from "./ui/button";     // Styled button component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"; // Dropdown menu components

/**
 * ThemeToggle Component
 * Provides a dropdown menu to switch between light, dark, and system themes
 */
export default function ThemeToggle() {
  // Get setTheme function from next-themes to change the theme
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      {/* Trigger button with animated sun/moon icons */}
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {/* Sun icon - visible in light mode, rotates and scales out in dark mode */}
          <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          {/* Moon icon - visible in dark mode, rotates and scales in from light mode */}
          <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          {/* Screen reader text for accessibility */}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown menu content aligned to the end */}
      <DropdownMenuContent align="end">
        {/* Theme options with click handlers */}
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}