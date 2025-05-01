// Import required libraries, hooks, and components
import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton"; // Enum for border styles
import useDimensions from "@/hooks/useDimensions"; // Custom hook to get container dimensions
import { cn } from "@/lib/utils"; // Utility function for conditional classNames
import { ResumeValues } from "@/lib/validation"; // Type definition for resume data
import { formatDate } from "date-fns"; // Utility to format dates
import Image from "next/image"; // Next.js image component
import React, { useEffect, useRef, useState } from "react"; // React for state and effect hooks
import { Badge } from "./ui/badge"; // Badge component for skills display

// Type definition for props received by the ResumePreview component
interface ResumePreviewProps {
  resumeData: ResumeValues; // Resume data object containing all resume-related fields
  contentRef?: React.Ref<HTMLDivElement>; // Optional reference to the content div, allowing parent components to access it
  className?: string;
}

// Main component: ResumePreview
// This component renders the entire resume preview, scaling it based on container dimensions.
export default function ResumePreview({ resumeData, contentRef, className }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);  // Reference to the container div
  const { width } = useDimensions(containerRef);      // Dynamically get the width of the container

  return (          // Maintain A4 aspect ratio
    <div className={cn("aspect-[210/297] h-fit w-full bg-white text-black", className)} // Append any additional custom classNames
      ref={containerRef} // Attach the ref to measure the container's dimensions
    >
      <div
        className={cn("space-y-6 p-6", !width && "invisible")} // Add padding and hide content if width is not yet calculated
        style={{
          zoom: (1 / 794) * width, // Scale the content proportionally to the container width
        }}
        ref={contentRef} // Attach optional content ref for external interaction
        id="resumePreviewContent" // Assign an ID for DOM manipulation or styling
      >
        {/* Render the various sections of the resume */}
        <PersonalInfoHeader resumeData={resumeData} />
        <SummarySection resumeData={resumeData} />
        <WorkExperienceSection resumeData={resumeData} />
        <EducationSection resumeData={resumeData} />
        <LanguageSkillsSection resumeData={resumeData} />
        <SkillsSection resumeData={resumeData} />
      </div>
    </div>
  );
}

// Reusable type definition for props passed to individual sections
interface ResumeSectionProps {
  resumeData: ResumeValues; // Contains the data specific to the section
}

// Personal Information Header
// Displays the user's profile picture, name, contact info, and job title.
function PersonalInfoHeader({ resumeData }: ResumeSectionProps) {
  const { photo, firstName, lastName, jobTitle, city, country, phone, email, colorHex, borderStyle } = resumeData;

  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo); // Manage the photo URL

  useEffect(() => {
    // Generate a local URL for a photo if it is a File
    const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : "";
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc(""); // Reset if no photo is provided
    return () => URL.revokeObjectURL(objectUrl); // Clean up the local URL
  }, [photo]);

  return (
    <div className="flex items-center gap-6">
      {/* Display profile picture */}
      {photoSrc && (
        <Image
          src={photoSrc}
          width={100}
          height={100}
          alt="Author photo"
          className="aspect-square object-cover" // Maintain aspect ratio and crop if needed
          style={{
            borderRadius:
              borderStyle === BorderStyles.SQUARE
                ? "0px"
                : borderStyle === BorderStyles.CIRCLE
                ? "9999px"
                : "10%", // Apply border style based on user selection
          }}
        />
      )}
      <div className="space-y-2.5">
        {/* Name and Job Title */}
        <div className="space-y-1">
          <p className="text-3xl font-bold" style={{ color: colorHex }}>
            {firstName} {lastName}
          </p>
          <p className="font-medium" style={{ color: colorHex }}>
            {jobTitle}
          </p>
        </div>
        {/* Contact Information */}
        <p className="text-xs text-gray-500">
          {city}
          {city && country ? ", " : ""}
          {country}
          {(city || country) && (phone || email) ? " • " : ""}
          {[phone, email].filter(Boolean).join(" • ")} {/* Concatenate phone and email */}
        </p>
      </div>
    </div>
  );
}

// Summary Section
// Renders a professional summary if provided.
function SummarySection({ resumeData }: ResumeSectionProps) {
  const { summary, colorHex } = resumeData;

  if (!summary) return null; // Return nothing if no summary is available

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} /> {/* Divider */}
      <div className="break-inside-avoid space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Professional Profile
        </p>
        <div className="whitespace-pre-line text-sm">{summary}</div> {/* Preserve line breaks */}
      </div>
    </>
  );
}

// Work Experience Section
// Lists all work experiences, including positions, dates, and descriptions.
function WorkExperienceSection({ resumeData }: ResumeSectionProps) {
  const { workExperiences, colorHex } = resumeData;

  // Filter out empty experiences
  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0
  );

  if (!workExperiencesNotEmpty?.length) return null; // Skip rendering if no valid data

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Work Experience
        </p>
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{exp.position}</span>
              {exp.startDate && (
                <span>
                  {formatDate(exp.startDate, "MM/yyyy")} -{" "}
                  {exp.endDate ? formatDate(exp.endDate, "MM/yyyy") : "Present"}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{exp.company}</p>
            <div className="whitespace-pre-line text-xs">{exp.description}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// Education Section
// Displays the user's educational background, including schools and degrees.
function EducationSection({ resumeData }: ResumeSectionProps) {
  const { educations, colorHex } = resumeData;

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Education
        </p>
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{edu.degree}</span>
              {edu.startDate && (
                <span>
                  {formatDate(edu.startDate, "MM/yyyy")}
                  {edu.endDate ? ` - ${formatDate(edu.endDate, "MM/yyyy")}` : ""}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{edu.school}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// Language skills section component
function LanguageSkillsSection({ resumeData }: ResumeSectionProps) {
  const { languages, colorHex } = resumeData;

  if (!languages?.length) return null;

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <section className="space-y-2">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Languages
        </p>
        <div className="space-y-1">
          {languages.map((lang, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="font-medium">{lang.language}</span>
              <span className="text-gray-600 capitalize">{lang.level}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

// Skills Section
// Renders the list of skills as badges.
function SkillsSection({ resumeData }: ResumeSectionProps) {
  const { skills, colorHex, borderStyle } = resumeData;

  if (!skills?.length) return null; // Skip if no skills are provided

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="break-inside-avoid space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Skills
        </p>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <Badge
              key={index}
              className="rounded-md bg-black text-white hover:bg-black"
              style={{
                backgroundColor: colorHex,
                borderRadius:
                  borderStyle === BorderStyles.SQUARE
                    ? "0px"
                    : borderStyle === BorderStyles.CIRCLE
                    ? "9999px"
                    : "8px", // Style badge corners based on borderStyle
              }}
            >
              {skill}
            </Badge>
          ))}
        </div>
      </div>
    </>
  );
}
