import { canCreateResume } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeDataInclude } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import CreateResumeButton from "./CreateResumeButton";
import ResumeItem from "./ResumeItem";

export const metadata: Metadata = {
  title: "AI Powered Resume Builder",
};

export default async function Page() {
  const { userId } = await auth();

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
        <div className="animate-fade-in-up">
          <CreateResumeButton canCreate={canCreateResume(subscriptionLevel, totalCount)} />
        </div>

        {/* Section header with the total count of resumes */}
        <div className="space-y-1 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl font-bold">Your Resumes</h1>
          <p>Total: {totalCount}</p>
        </div>

        {/* Grid layout to display all the resumes */}
        <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4 stagger-container">
          {resumes.map((resume, index) => (
            <div key={resume.id} className="stagger-item" style={{ '--item-index': index } as any}>
              <ResumeItem resume={resume} />
            </div>
          ))}
        </div>
      </main>
    );
  } catch (err) {
    // Log the error and display a fallback message
    console.error("Database Error:", err);

    return (
      <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6 text-center animate-fade-in-up">
        <h1 className="text-3xl font-bold text-red-500">Something went wrong!</h1>
        <p className="text-gray-600">
          We are currently unable to load your Resumes. Please try again later.
        </p>
      </main>
    );
  }
}
