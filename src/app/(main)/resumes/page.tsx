import { canCreateResume } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeDataInclude } from "@/lib/types";
import { auth } from "@clerk/nextjs/server"; // Authentication utility from Clerk for server-side user authentication
import { Metadata } from "next"; // Metadata type from Next.js for SEO
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

  // Fetch resumes, total resume count, and subscription level concurrently using Promise.all for efficiency
  const [resumes, totalCount, subscriptionLevel] = await Promise.all([
    prisma.resume.findMany({
      where: {
        userId, // Filter resumes by the authenticated user's ID
      },
      orderBy: {
        updatedAt: "desc", // Sort resumes by the most recently updated first
      },
      include: resumeDataInclude, // Include related fields (e.g., sections, work experience)
    }),
    prisma.resume.count({
      where: {
        userId, // Count the total number of resumes for the user
      },
    }),
    getUserSubscriptionLevel(userId), // Retrieve the user's subscription level
  ]);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      {/* Render a button for creating a new resume, enabled only if allowed by subscription level */}
      <CreateResumeButton canCreate={canCreateResume(subscriptionLevel, totalCount)}/>

      {/* Section header with the total count of resumes */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Your resumes</h1>
        <p>Total: {totalCount}</p>
      </div>

      {/* Grid layout to display all the resumes */}
      <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {resumes.map((resume) => (
          <ResumeItem key={resume.id} resume={resume} />
          // Map through each resume and render the ResumeItem component
          // 'key' is required by React for efficient rendering
        ))}
      </div>
    </main>
  );
}
