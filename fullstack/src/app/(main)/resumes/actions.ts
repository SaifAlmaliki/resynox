"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { del } from "@vercel/blob"; // Utility for deleting blobs (e.g., uploaded files)
import { revalidatePath } from "next/cache"; // Utility to revalidate Next.js paths

/**
 * Deletes a resume from the database and any associated photo blob.
 * @param id - The unique identifier of the resume to delete.
 * @throws Error if the user is not authenticated or if the resume is not found.
 */
export async function deleteResume(id: string) {
  // Authenticate the current user
  const { userId } = await auth();

  // If the user is not authenticated, throw an error
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Retrieve the resume for the provided ID and ensure it belongs to the current user
  const resume = await prisma.resume.findUnique({
    where: {
      id,      // Resume ID
      userId,  // User ID for ownership verification
    },
  });

  // If the resume is not found, throw an error
  if (!resume) {
    throw new Error("Resume not found");
  }

  // If the resume has an associated photo URL, delete the photo blob
  if (resume.photoUrl) {
    try {
      await del(resume.photoUrl);
    } catch (error) {
      console.error("Error deleting photo:", error);
      throw new Error("Failed to delete the associated photo.");
    }
  }

  // Delete the resume record from the database
  await prisma.resume.delete({
    where: {
      id, // Resume ID
    },
  });

  // Revalidate the resumes path to update the UI after deletion
  revalidatePath("/resumes");
}
