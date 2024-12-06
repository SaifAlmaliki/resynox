"use client";

import { SubscriptionLevel } from "@/lib/subscription";       // Type for subscription levels
import { createContext, ReactNode, useContext } from "react"; // React utilities for context creation and usage

// Create a React context to store the subscription level
// Initially set to `undefined` to handle cases where it is not provided
const SubscriptionLevelContext = createContext<SubscriptionLevel | undefined>(
  undefined
);

// Define props for the `SubscriptionLevelProvider` component
interface SubscriptionLevelProviderProps {
  children: ReactNode; // React children elements to be wrapped by the provider
  userSubscriptionLevel: SubscriptionLevel; // The subscription level of the current user
}

/**
 * Provider component for the `SubscriptionLevelContext`.
 * Wraps children components and provides the subscription level to the context.
 */
export default function SubscriptionLevelProvider({ children, userSubscriptionLevel }: SubscriptionLevelProviderProps) {
  return (
    // Provide the user's subscription level to the context
    <SubscriptionLevelContext.Provider value={userSubscriptionLevel}>
      {children} {/* Render all child components within the provider */}
    </SubscriptionLevelContext.Provider>
  );
}

/**
 * Hook to consume the `SubscriptionLevelContext`.
 * Ensures the context is used within a `SubscriptionLevelProvider`.
 */
export function useSubscriptionLevel() {
  const context = useContext(SubscriptionLevelContext); // Access the subscription level context

  // Throw an error if the context is used outside the provider
  if (context === undefined) {
    throw new Error(
      "useSubscriptionLevel must be used within a SubscriptionLevelProvider"
    );
  }

  return context; // Return the subscription level
}
