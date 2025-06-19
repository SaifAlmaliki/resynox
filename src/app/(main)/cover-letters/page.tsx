import { canCreateCoverLetter } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import CreateCoverLetterButton from "./CreateCoverLetterButton";
import CoverLetterItem from "./CoverLetterItem";

export const metadata: Metadata = {
  title: "AI Powered Cover Letter Generator",
};

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    // Fetch cover letters, total cover letter count, and subscription level concurrently using Promise.all
    const [coverLetters, totalCount, subscriptionLevel] = await Promise.all([
      prisma.coverLetter.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.coverLetter.count({ where: { userId } }),
      getUserSubscriptionLevel(userId),
    ]);

    // Render page content if the database fetch is successful
    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
        {/* Render a button for creating a new cover letter */}
        <CreateCoverLetterButton canCreate={canCreateCoverLetter(subscriptionLevel, totalCount)} />

        {/* Section header with the total count of cover letters */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Cover Letters</h1>
          <p>Total: {totalCount}</p>
        </div>

        {/* Grid layout to display all the cover letters */}
        <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
          {coverLetters.map((coverLetter) => (
            <CoverLetterItem key={coverLetter.id} coverLetter={coverLetter} />
          ))}
        </div>
      </main>
    );
  } catch (err) {
    // Log the error and display a fallback message
    console.error("Database Error:", err);

    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6 text-center">
        <h1 className="text-3xl font-bold text-red-500">Something went wrong!</h1>
        <p className="text-gray-600">
          We are currently unable to load your Cover Letters. Please try again later.
        </p>
      </main>
    );
  }
}