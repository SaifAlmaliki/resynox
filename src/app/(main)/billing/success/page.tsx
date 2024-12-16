import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Billing Success Page
 *
 * This page confirms a successful billing checkout and informs the user
 * that their Pro account has been activated. It also provides a button
 * to navigate back to the "Resumes" page for further actions.
 */

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl space-y-6 px-3 py-6 text-center">
      {/* Page Title */}
      <h1 className="text-3xl font-bold">Billing Success</h1>

      {/* Success Message */}
      <p>
        The checkout was successful and your Pro account has been activated.
        Enjoy!
      </p>

      {/* Navigation Button */}
      <Button asChild>
        {/* Link navigates the user to the "resumes" page */}
        <Link href="/resumes">Go to resumes</Link>
      </Button>
    </main>
  );
}
