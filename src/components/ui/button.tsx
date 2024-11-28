import { Slot } from "@radix-ui/react-slot";
// Slot is used to allow replacing the underlying component with a custom one while preserving styles and behavior.

import { cva, type VariantProps } from "class-variance-authority";
// `cva` is a utility for managing class names with conditional variants.
// `VariantProps` provides TypeScript support for type-safe access to variants.

import * as React from "react";
// Standard React import for creating components.

import { cn } from "@/lib/utils";
// A utility function (likely custom) for conditionally combining class names.

const buttonVariants = cva(
  // `cva` defines a set of CSS class variants for the button component.
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  // Base classes: Common styles applied to all buttons, ensuring a consistent structure.

  {
    variants: {
      // Define variant options, which allow customizing the button's appearance.
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        // Default button style: Primary background with foreground color.

        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        // Style for destructive actions, e.g., deleting something.

        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        // Style for an outlined button with hover effects.

        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        // Style for secondary actions.

        ghost: "hover:bg-accent hover:text-accent-foreground",
        // Ghost button: Transparent with a subtle hover effect.

        link: "text-primary underline-offset-4 hover:underline",
        // Link-style button: Styled like a hyperlink.

        premium:
          "bg-gradient-to-r from-green-600 to-green-400 text-white shadow hover:from-green-600/90 hover:to-green-400/90",
        // Premium button: Gradient background for special actions.
      },
      size: {
        // Define size options to control button dimensions.
        default: "h-9 px-4 py-2", // Default size: Medium height and padding.
        sm: "h-8 rounded-md px-3 text-xs", // Small button: Smaller height and text.
        lg: "h-10 rounded-md px-8", // Large button: Larger height and padding.
        icon: "h-9 w-9", // Icon-only button: Square dimensions.
      },
    },
    defaultVariants: {
      // Default variant and size applied when none are specified.
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    // Extends the default HTML button attributes (e.g., `onClick`, `disabled`).
    VariantProps<typeof buttonVariants> {
  // Adds type support for `variant` and `size` props based on `buttonVariants`.
  asChild?: boolean;
  // If `true`, allows using a custom component instead of the default `button`.
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  // `React.forwardRef` allows passing a `ref` to the underlying DOM element or component.
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    // Determines the component to render: a custom component (`Slot`) or a default `button`.

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        // Combines the base styles, selected variants, and any additional custom classes.
        ref={ref}
        {...props}
        // Spreads other props onto the component (e.g., `onClick`, `disabled`).
      />
    );
  },
);

Button.displayName = "Button";
// Assigns a display name for easier debugging in React DevTools.

export { Button, buttonVariants };
// Exports the `Button` component and `buttonVariants` for use in other parts of the application.
