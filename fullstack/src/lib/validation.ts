// Import the zod library for schema validation
import { z } from "zod";

// Utility schema for optional trimmed strings
// Allows strings, empty strings, or undefined values
export const optionalString = z.string().trim().optional().or(z.literal(""));

// Schema for general information like title and description
export const generalInfoSchema = z.object({
  title: optionalString,        // Optional title field
  description: optionalString,  // Optional description field
});

// Type inference for general information
export type GeneralInfoValues = z.infer<typeof generalInfoSchema>;

// Schema for personal information such as name, contact details, and photo
export const personalInfoSchema = z.object({
  firstName: optionalString,  // Optional first name
  lastName: optionalString,   // Optional last name
  jobTitle: optionalString,   // Optional job title
  city: optionalString,       // Optional city
  country: optionalString,    // Optional country
  phone: optionalString,      // Optional phone number
  email: optionalString,      // Optional email address
  photo: z
    .custom<File | undefined>() // Custom type for files or undefined
    .refine(
      (file) =>
        !file || (file instanceof File && file.type.startsWith("image/")), // Ensures the file is an image if provided
      "Must be an image file"
    )
    .refine(
      (file) => !file || file.size <= 1024 * 1024 * 4, // Restricts file size to a maximum of 4MB
      "File must be less than 4MB"
    )
});

// Type inference for personal information
export type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

// Schema for work experience details
export const workExperienceSchema = z.object({
  workExperiences: z
    .array(
      z.object({
        position: optionalString,     // Optional job position
        company: optionalString,      // Optional company name
        startDate: optionalString,    // Optional start date
        endDate: optionalString,      // Optional end date
        description: optionalString,  // Optional job description
      })
    )
    .optional(), // Work experiences can be undefined
});

// Type inference for work experience details
export type WorkExperienceValues = z.infer<typeof workExperienceSchema>;

// Single work experience type
// 1. `z.infer<typeof workExperienceSchema>`: Infers the TypeScript type from the Zod schema `workExperienceSchema`.
// 2. `["workExperiences"]`: Accesses the `workExperiences` property on the inferred type. This should be an array or optional array.
// 3. `[number]`: Indexes into the array type to get the type of a single element in that array.
// 4. `NonNullable<...>`: Ensures that the type cannot be null or undefined.

// In summary, this type definition extracts the individual work experience item type from
// an array of `workExperiences` defined by the Zod schema, and ensures it cannot be null or undefined.
export type WorkExperience = NonNullable<
  z.infer<typeof workExperienceSchema>["workExperiences"]
>[number];


// Schema for education details
export const educationSchema = z.object({
  educations: z
    .array(
      z.object({
        degree: optionalString, // Optional degree
        school: optionalString, // Optional school name
        startDate: optionalString, // Optional start date
        endDate: optionalString, // Optional end date
      })
    )
    .optional(), // Education details can be undefined
});

// Type inference for education details
export type EducationValues = z.infer<typeof educationSchema>;

// Schema for skills
export const skillsSchema = z.object({
  skills: z.array(z.string().trim()).optional(), // Array of trimmed strings or undefined
});

// Type inference for skills
export type SkillsValues = z.infer<typeof skillsSchema>;

// Schema for a summary field
export const summarySchema = z.object({
  summary: optionalString, // Optional summary field
});

// Type inference for the summary field
export type SummaryValues = z.infer<typeof summarySchema>;

// Schema for cover letter fields
export const coverLetterSchema = z.object({
  jobDescription: optionalString,  // Make jobDescription optional
  coverLetter: optionalString,
});

// Type inference for cover letter
export type CoverLetterValues = z.infer<typeof coverLetterSchema>;

// Comprehensive schema for a resume, combining all the above schemas
export const resumeSchema = z.object({
  ...generalInfoSchema.shape,     // Unpacks all fields from `generalInfoSchema`
  ...personalInfoSchema.shape,    // Unpacks all fields from `personalInfoSchema`
  ...workExperienceSchema.shape,  // Unpacks all fields from `workExperienceSchema`
  ...educationSchema.shape,       // Unpacks all fields from `educationSchema`
  ...skillsSchema.shape,          // Unpacks all fields from `skillsSchema`
  ...summarySchema.shape,         // Unpacks all fields from `summarySchema`
  ...coverLetterSchema.shape,     // Unpacks all fields from `coverLetterSchema`
  id: z.string().optional(),
  photo: z.union([z.custom<File>(), z.string(), z.null()]).optional(),
  colorHex: optionalString,       // Adds an optional `colorHex` field
  borderStyle: optionalString,    // Adds an optional `borderStyle` field
});

// Type inference for the resume schema
export type ResumeValues = Omit<z.infer<typeof resumeSchema>, "photo"> & {
  id?: string; // Optional ID for the resume
  photo?: File | string | null; // Flexible type for the photo
};

// Schema for generating work experience with validation rules
export const generateWorkExperienceSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Required") // Minimum 1 character
    .min(20, "Must be at least 20 characters"), // Minimum descriptive length
});

// Type inference for the generate work experience input
export type GenerateWorkExperienceInput = z.infer<
  typeof generateWorkExperienceSchema
>;

// Schema for generating a summary, reusing fields from other schemas
export const generateSummarySchema = z.object({
  jobTitle: optionalString,       // Optional job title
  ...workExperienceSchema.shape,  // Reuse work experience fields
  ...educationSchema.shape,       // Reuse education fields
  ...skillsSchema.shape,          // Reuse skills fields
});

// Type inference for the generate summary input
export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>;
