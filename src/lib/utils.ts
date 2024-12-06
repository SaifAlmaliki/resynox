// Import utilities and types
import { clsx, type ClassValue } from "clsx"; // `clsx` is used for conditional classNames
import { twMerge } from "tailwind-merge";     // `twMerge` is used to combine Tailwind CSS classes with conflict resolution
import { ResumeServerData } from "./types";   // Type definition for server-side resume data
import { ResumeValues } from "./validation";  // Type definition for validated resume data

/**
 * Combines class names with conflict resolution for Tailwind CSS.
 *
 * @param inputs - Array of class names or conditional class values
 * @returns A string with merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // Combine classNames using `clsx` and resolve conflicts with `twMerge`
}

/**
 * Replaces `File` objects in JSON serialization with a simplified structure.
 *
 * @param key - The key in the object being serialized
 * @param value - The value in the object being serialized
 * @returns Serialized `File` object as plain JSON, or the original value if not a `File`
 */
export function fileReplacer(key: unknown, value: unknown) {
  return value instanceof File
    ? {
        name: value.name, // Name of the file
        size: value.size, // Size of the file in bytes
        type: value.type, // MIME type of the file
        lastModified: value.lastModified, // Last modified timestamp of the file
      }
    : value; // Return the value unchanged if it's not a `File`
}

/**
 * Maps server-side resume data (`ResumeServerData`) to client-side validated data (`ResumeValues`).
 *
 * @param data - The raw resume data fetched from the server
 * @returns A transformed `ResumeValues` object with properly formatted fields
 */
export function mapToResumeValues(data: ResumeServerData): ResumeValues {
  return {
    id: data.id, // Resume ID
    title: data.title || undefined, // Resume title or `undefined` if not provided
    description: data.description || undefined, // Resume description
    photo: data.photoUrl || undefined, // Photo URL or `undefined` if not provided
    firstName: data.firstName || undefined, // First name
    lastName: data.lastName || undefined, // Last name
    jobTitle: data.jobTitle || undefined, // Job title
    city: data.city || undefined, // City of residence
    country: data.country || undefined, // Country of residence
    phone: data.phone || undefined, // Phone number
    email: data.email || undefined, // Email address

    // Map work experience details, converting dates to ISO string format
    workExperiences: data.workExperiences.map((exp) => ({
      position: exp.position || undefined, // Job position
      company: exp.company || undefined, // Company name
      startDate: exp.startDate?.toISOString().split("T")[0], // Start date as ISO string
      endDate: exp.endDate?.toISOString().split("T")[0], // End date as ISO string
      description: exp.description || undefined, // Job description
    })),

    // Map education details, converting dates to ISO string format
    educations: data.educations.map((edu) => ({
      degree: edu.degree || undefined, // Degree title
      school: edu.school || undefined, // School name
      startDate: edu.startDate?.toISOString().split("T")[0], // Start date as ISO string
      endDate: edu.endDate?.toISOString().split("T")[0], // End date as ISO string
    })),

    skills: data.skills, // Array of skills
    borderStyle: data.borderStyle, // Border style for the resume
    colorHex: data.colorHex, // Hex color code for styling
    summary: data.summary || undefined, // Professional summary
  };
}
