"use server";
/**
 * This file appears to define a server-side action (saveResume) to create or update a resume in a database,
 * with integrated permissions checks and photo handlin
 */

import { canCreateResume, canUseCustomizations } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeSchema, ResumeValues } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { del, put } from "@vercel/blob";
import path from "path";

/**
 * Saves a resume (either creates a new one or updates an existing one) for the authenticated user.
 *
 * Steps:
 * 1. Validate and parse the incoming resume data.
 * 2. Check user authentication and subscription level.
 * 3. Ensure user has permission to create or modify resumes (including customizations).
 * 4. Handle optional photo file upload or deletion (stored via Vercel Blob Storage).
 * 5. Create or update the resume record in the database using Prisma.
 * 6. Return the updated or newly created resume object.
 *
 * @param values The resume data (including optional photo file and experience/education entries).
 * @returns The updated or newly created resume record.
 */
export async function saveResume(values: ResumeValues) {
  const { id } = values;
  console.log("received values", values);

  // Validate incoming resume data against the Zod schema
  const { photo, workExperiences, educations, ...resumeValues } = resumeSchema.parse(values);

  // Retrieve the authenticated user ID from Clerk
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  // Get the user's subscription level, used for permission checks
  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  // If no ID is provided, we're creating a new resume. Check if the user can create another resume.
  if (!id) {
    const resumeCount = await prisma.resume.count({ where: { userId } });
    if (!canCreateResume(subscriptionLevel, resumeCount)) {
      throw new Error("Maximum resume count reached for this subscription level");
    }
  }

  // If we're updating an existing resume, ensure it exists and belongs to the user
  const existingResume = id
    ? await prisma.resume.findUnique({ where: { id, userId } })
    : null;

  if (id && !existingResume) {
    throw new Error("Resume not found");
  }

  // Check if the user is attempting to use customizations (e.g., borderStyle, custom colors)
  // and ensure that their subscription level permits it.
  const hasCustomizations = (resumeValues.borderStyle && resumeValues.borderStyle !== existingResume?.borderStyle) ||
    (resumeValues.colorHex && resumeValues.colorHex !== existingResume?.colorHex);

  if (hasCustomizations && !canUseCustomizations(subscriptionLevel)) {
    throw new Error("Customizations not allowed for this subscription level");
  }

  // Handle photo upload or deletion. If the user provides a File, upload it and get the URL.
  // If the user sets photo to null, delete the existing photo.
  let newPhotoUrl: string | undefined | null = undefined;

  if (photo instanceof File) {
    // If there's an existing photo, delete it before uploading a new one
    if (existingResume?.photoUrl) {
      await del(existingResume.photoUrl);
    }

    // Upload the new photo to Vercel Blob Storage
    const blob = await put(`resume_photos/${path.extname(photo.name)}`, photo, {
      access: "public",
    });
    newPhotoUrl = blob.url;
  } else if (photo === null) {
    // If photo is explicitly set to null, remove it
    if (existingResume?.photoUrl) {
      await del(existingResume.photoUrl);
    }
    newPhotoUrl = null;
  }

  // If an ID exists, update the resume; otherwise, create a new one.
  if (id) {
    return prisma.resume.update({
      where: { id },
      data: {
        ...resumeValues,
        photoUrl: newPhotoUrl,
        // Remove existing work experiences and educations before adding the new ones
        workExperiences: {
          deleteMany: {},
          create: workExperiences?.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        },
        educations: {
          deleteMany: {},
          create: educations?.map((edu) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        },
        updatedAt: new Date(),
      },
    });
  } else {
    // Creating a new resume for the user
    return prisma.resume.create({
      data: {
        ...resumeValues,
        userId,
        photoUrl: newPhotoUrl,
        workExperiences: {
          create: workExperiences?.map((exp) => ({
            ...exp,
            startDate: exp.startDate ? new Date(exp.startDate) : undefined,
            endDate: exp.endDate ? new Date(exp.endDate) : undefined,
          })),
        },
        educations: {
          create: educations?.map((edu) => ({
            ...edu,
            startDate: edu.startDate ? new Date(edu.startDate) : undefined,
            endDate: edu.endDate ? new Date(edu.endDate) : undefined,
          })),
        },
      },
    });
  }
}
