/*
 * File: Layout.tsx
 * Purpose: Defines a layout wrapper for authenticated users, providing a consistent UI structure.
 *
 * Description:
 * - This layout is used to wrap pages and components for authenticated users.
 * - It retrieves the user's subscription level and provides it to the entire application using a context provider.
 * - The layout includes:
 *   - A `Navbar` component for navigation.
 *   - A `PremiumModal` component to display premium upgrade options when needed.
 *   - Children components (the content of the specific page).
 */

import PremiumModal from "@/components/premium/PremiumModal";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import Navbar from "./Navbar";
import SubscriptionLevelProvider from "./SubscriptionLevelProvider";

export default async function Layout({children}: {children: React.ReactNode;}) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const userSubscriptionLevel = await getUserSubscriptionLevel(userId);

  return (
    <SubscriptionLevelProvider userSubscriptionLevel={userSubscriptionLevel}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        {children}
        <PremiumModal />
      </div>
    </SubscriptionLevelProvider>
  );
}
