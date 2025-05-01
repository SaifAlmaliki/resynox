import { Prisma } from "@prisma/client";     // Prisma client for interacting with the database
import { ResumeValues } from "./validation"; // Type definition for resume data from the validation module

// Define the props interface for components in the editor
export interface EditorFormProps {
  resumeData: ResumeValues; // The resume data object that follows the `ResumeValues` type
  setResumeData: (data: ResumeValues) => void; // Function to update the resume data
}

// Define an object specifying related data to include when fetching a resume from the database
export const resumeDataInclude = {
  workExperiences: true, // Include related work experience data
  educations: true,      // Include related education data
  languages: true,       // Include related language skills data
} satisfies Prisma.ResumeInclude; // Ensure the object satisfies Prisma's `ResumeInclude` type

// Type definition for server-side resume data, including related fields
export type ResumeServerData = Prisma.ResumeGetPayload<{
  include: typeof resumeDataInclude; // Use `resumeDataInclude` to specify which related data to include
}>;
