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
 * It ensures dates are properly formatted as ISO strings and fills in missing fields with `undefined`
 * where necessary.
 */
export function mapToResumeValues(data: ResumeServerData): ResumeValues {
  return {
    id: data.id, // Unique identifier for the resume
    title: data.title || undefined, // Title of the resume
    description: data.description || undefined, // Resume description or summary
    photo: data.photoUrl || undefined, // Profile photo URL
    firstName: data.firstName || undefined, // First name of the user
    lastName: data.lastName || undefined, // Last name of the user
    jobTitle: data.jobTitle || undefined, // Current job title
    city: data.city || undefined, // City of residence
    country: data.country || undefined, // Country of residence
    phone: data.phone || undefined, // Phone number
    email: data.email || undefined, // Email address

    // Work experience mapping: transforms dates to ISO format
    workExperiences: data.workExperiences.map((exp) => ({
      position: exp.position || undefined, // Job position/title
      company: exp.company || undefined, // Name of the company
      startDate: exp.startDate?.toISOString().split("T")[0], // Start date in ISO string format
      endDate: exp.endDate?.toISOString().split("T")[0],   // End date in ISO string format
      description: exp.description || undefined, // Description of job responsibilities
    })),

    // Education mapping: transforms dates to ISO format
    educations: data.educations.map((edu) => ({
      degree: edu.degree || undefined, // Name of the degree
      school: edu.school || undefined, // Educational institution name
      startDate: edu.startDate?.toISOString().split("T")[0], // Start date in ISO string format
      endDate: edu.endDate?.toISOString().split("T")[0],   // End date in ISO string format
    })),

    skills: data.skills,           // List of skills
    borderStyle: data.borderStyle, // Border style for resume design
    colorHex: data.colorHex,       // Hexadecimal color code for styling
    summary: data.summary || undefined, // Professional summary or about section
  };
}
