"use server";

import { db } from "@/lib/db";

// Use the existing Prisma instance from the global context
const prisma = db;

// Define Resume type
export type Resume = {
  id: string;
  userId: string;
  title: string;
  description?: string;
  photoUrl?: string;
  colorHex?: string;
  borderStyle?: string;
  summary?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
  coverLetter?: string;
  jobDescription?: string;
};

/**
 * Get all resumes for a specific user
 * @param userId The ID of the user
 * @returns Array of resume objects
 */
export async function getUserResumes(userId: string): Promise<Resume[]> {
  try {
    const resumes = await prisma.resume.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return resumes as Resume[];
  } catch (error) {
    console.error("Error fetching user resumes:", error);
    return [];
  }
}

/**
 * Get a specific resume by ID
 * @param resumeId The ID of the resume
 * @returns Resume object or null if not found
 */
export async function getResumeById(resumeId: string): Promise<Resume | null> {
  try {
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
      },
    });

    return resume as Resume | null;
  } catch (error) {
    console.error("Error fetching resume:", error);
    return null;
  }
}
