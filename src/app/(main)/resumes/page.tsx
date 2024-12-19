import { canCreateResume } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeDataInclude } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import CreateResumeButton from "./CreateResumeButton";
import ResumeItem from "./ResumeItem";

// Define metadata for the page, used by Next.js for SEO and browser title
export const metadata: Metadata = {
  title: "Your resumes", // Set the page title
};

export default async function Page() {
  // Retrieve the authenticated user's ID using Clerk
  const { userId } = await auth();

  // If the user is not authenticated, return null (render nothing)
  if (!userId) {
    return null;
  }

  try {
    // Fetch resumes, total resume count, and subscription level concurrently using Promise.all
    const [resumes, totalCount, subscriptionLevel] = await Promise.all([
      prisma.resume.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        include: resumeDataInclude,
      }),
      prisma.resume.count({ where: { userId } }),
      getUserSubscriptionLevel(userId),
    ]);

    // Render page content if the database fetch is successful
    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
        {/* Render a button for creating a new resume */}
        <CreateResumeButton canCreate={canCreateResume(subscriptionLevel, totalCount)} />

        {/* Section header with the total count of resumes */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Your resumes</h1>
          <p>Total: {totalCount}</p>
        </div>

        {/* Grid layout to display all the resumes */}
        <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
          {resumes.map((resume) => (
            <ResumeItem key={resume.id} resume={resume} />
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
          We are currently unable to load your resumes. Please try again later.
        </p>
      </main>
    );
  }
}
