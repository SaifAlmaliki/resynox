// Import necessary libraries and utilities
import prisma from "@/lib/prisma"; // Database client
import { resumeDataInclude } from "@/lib/types"; // Resume data structure
import { auth } from "@clerk/nextjs/server"; // Authentication utility
import { Metadata } from "next"; // Metadata type for Next.js
import ResumeEditor from "./ResumeEditor"; // Resume editor component

// Define the interface for the component's props
interface PageProps {
  searchParams: Promise<{ resumeId?: string }>; // Asynchronous search params with an optional resumeId
}

// Metadata for the page
export const metadata: Metadata = {
  title: "Design your resume", // Title for the browser tab and SEO
};

// Main Page component
export default async function Page({ searchParams }: PageProps) {
  // Extract resumeId from search parameters
  const { resumeId } = await searchParams;

  // Get the authenticated user's ID
  const { userId } = await auth();

  // If no user is authenticated, return null (prevent rendering the page)
  if (!userId) {
    return null;
  }

  // Fetch the resume to edit if a resumeId is provided and it belongs to the authenticated user
  const resumeToEdit = resumeId
    ? await prisma.resume.findUnique({
        where: { id: resumeId, userId }, // Ensure the resume belongs to the logged-in user
        include: resumeDataInclude, // Include additional related data
      })
    : null; // If no resumeId is provided, no resume is fetched

  // Render the ResumeEditor component, passing the fetched resume as a prop
  return <ResumeEditor resumeToEdit={resumeToEdit} />;
}
