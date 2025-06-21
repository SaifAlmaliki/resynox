/**
 * Utility Script for Resume Data Management
 *
 * This script provides utility functions for:
 * 1. **Combining and resolving Tailwind CSS class names** (`cn`).
 * 2. **Serializing File objects** (`fileReplacer`).
 * 3. **Mapping server-side resume data to a validated client-side format** (`mapToResumeValues`).
 *
 * These utilities simplify working with user interface rendering, data transformation, and
 * JSON serialization in a TypeScript-based frontend application.
 */

// Import utilities and type definitions
import { clsx, type ClassValue } from "clsx"; // `clsx` for conditionally joining class names
import { twMerge } from "tailwind-merge";     // `twMerge` resolves conflicts in Tailwind CSS classes
import { ResumeServerData } from "./types";   // Type definition: server-side resume data
import { ResumeValues } from "./validation";  // Type definition: validated resume data

/**
 * Combines and resolves class names, specifically for Tailwind CSS.
 *
 * This function merges class names passed as inputs while resolving conflicts
 * in Tailwind CSS utility classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)); // Combines classes using `clsx` and resolves conflicts with `twMerge`
}

/**
 * Custom JSON replacer to simplify `File` objects during serialization.
 *
 * Replaces `File` objects in a JSON object with a plain structure containing essential properties.
 * This is useful for preparing `File` objects to be sent to a server or logged for debugging.
 */
export function fileReplacer(key: unknown, value: unknown) {
  return value instanceof File
    ? {
        name: value.name,          // File name
        size: value.size,          // File size in bytes
        type: value.type,          // MIME type of the file
        lastModified: value.lastModified, // Last modified timestamp
      }
    : value; // Return unchanged if the value is not a `File`
}

/**
 * Maps server-side resume data (`ResumeServerData`) to a validated client-side format (`ResumeValues`).
 *
 * This function transforms server-side resume data into a structure suitable for use in the frontend.
 * It ensures dates are properly formatted as ISO strings and fills in missing fields with empty strings
 * instead of undefined to prevent controlled/uncontrolled input issues.
 */
export function mapToResumeValues(data: ResumeServerData): ResumeValues {
  return {
    id: data.id, // Unique identifier for the resume
    title: data.title || "", // Title of the resume - use empty string instead of undefined
    description: data.description || "", // Resume description or summary
    photo: data.photoUrl || undefined, // Profile photo URL - this can remain undefined
    firstName: data.firstName || "", // First name of the user
    lastName: data.lastName || "", // Last name of the user
    jobTitle: data.jobTitle || "", // Current job title
    city: data.city || "", // City of residence
    country: data.country || "", // Country of residence
    phone: data.phone || "", // Phone number
    email: data.email || "", // Email address

    // Work experience mapping: transforms dates to ISO format and ensures string values
    workExperiences: data.workExperiences.map((exp) => ({
      position: exp.position || "", // Job position/title - use empty string
      company: exp.company || "", // Name of the company - use empty string
      startDate: exp.startDate?.toISOString().split("T")[0] || "", // Start date in ISO string format
      endDate: exp.endDate?.toISOString().split("T")[0] || "", // End date in ISO string format
      description: exp.description || "", // Description of job responsibilities - use empty string
    })),

    // Education mapping: transforms dates to ISO format and ensures string values
    educations: data.educations.map((edu) => ({
      degree: edu.degree || "", // Name of the degree - use empty string
      school: edu.school || "", // Educational institution name - use empty string
      startDate: edu.startDate?.toISOString().split("T")[0] || "", // Start date in ISO string format
      endDate: edu.endDate?.toISOString().split("T")[0] || "", // End date in ISO string format
    })),

    // Skills mapping - ensure it's always an array
    skills: data.skills || [],

    // Language skills mapping - ensure proper structure
    languages: data.languages?.map((lang) => ({
      language: lang.language || "",
      level: lang.level as "native" | "advanced" | "intermediate" | "beginner",
    })) || [],
    
    borderStyle: data.borderStyle || "squircle", // Border style for resume design
    colorHex: data.colorHex || "#000000",       // Hexadecimal color code for styling
    summary: data.summary || "", // Professional summary or about section - use empty string
    jobDescription: "", // Default empty string for job description
    coverLetter: "", // Default empty string for cover letter
  };
}
