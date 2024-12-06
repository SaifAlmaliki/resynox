// Import required libraries, hooks, and components
import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton"; // Enum for border styles
import useDimensions from "@/hooks/useDimensions"; // Custom hook to get container dimensions
import { cn } from "@/lib/utils"; // Utility function for conditional classNames
import { ResumeValues } from "@/lib/validation"; // Type definition for resume data
import { formatDate } from "date-fns"; // Utility to format dates
import Image from "next/image"; // Next.js image component
import React, { useEffect, useRef, useState } from "react"; // React for state and effect hooks
import { Badge } from "./ui/badge"; // Badge component for skills display

// Type definition for ResumePreview props
interface ResumePreviewProps {
  resumeData: ResumeValues; // Resume data object
  contentRef?: React.Ref<HTMLDivElement>; // Optional reference to the content div
  className?: string;
}

// Main component to render the resume preview
export default function ResumePreview({ resumeData, contentRef, className}: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);  // Reference to the container div
  const { width } = useDimensions(containerRef);      // Get container width using custom hook

  return (
    <div
      className={cn(
        "aspect-[210/297] h-fit w-full bg-white text-black", // Maintain A4 aspect ratio
        className // Append custom classNames
      )}
      ref={containerRef} // Attach ref to container
    >
      <div
        className={cn("space-y-6 p-6", !width && "invisible")} // Hide content if width is not available
        style={{
          zoom: (1 / 794) * width, // Scale the content proportionally to container width
        }}
        ref={contentRef} // Attach content ref for external access
        id="resumePreviewContent"
      >
        {/* Render different sections of the resume */}
        <PersonalInfoHeader resumeData={resumeData} />
        <SummarySection resumeData={resumeData} />
        <WorkExperienceSection resumeData={resumeData} />
        <EducationSection resumeData={resumeData} />
        <SkillsSection resumeData={resumeData} />
      </div>
    </div>
  );
}

// Reusable interface for sections that take resumeData as a prop
interface ResumeSectionProps {
  resumeData: ResumeValues;
}

// Section: Personal Information Header
function PersonalInfoHeader({ resumeData }: ResumeSectionProps) {
  const {photo, firstName, lastName, jobTitle, city, country, phone, email, colorHex, borderStyle} = resumeData;

  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo); // Manage photo source URL

  useEffect(() => {
    // Generate a local URL for File-type photos
    const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : "";
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc("");
    return () => URL.revokeObjectURL(objectUrl); // Revoke the URL on cleanup
  }, [photo]);

  return (
    <div className="flex items-center gap-6">
      {/* Display photo if available */}
      {photoSrc && (
        <Image
          src={photoSrc}
          width={100}
          height={100}
          alt="Author photo"
          className="aspect-square object-cover"
          style={{
            borderRadius:
              borderStyle === BorderStyles.SQUARE
                ? "0px"
                : borderStyle === BorderStyles.CIRCLE
                ? "9999px"
                : "10%",
          }}
        />
      )}
      <div className="space-y-2.5">
        {/* Name and job title */}
        <div className="space-y-1">
          <p className="text-3xl font-bold" style={{ color: colorHex }}>
            {firstName} {lastName}
          </p>
          <p className="font-medium" style={{ color: colorHex }}>
            {jobTitle}
          </p>
        </div>
        {/* Contact information */}
        <p className="text-xs text-gray-500">
          {city}
          {city && country ? ", " : ""}
          {country}
          {(city || country) && (phone || email) ? " • " : ""}
          {[phone, email].filter(Boolean).join(" • ")}
        </p>
      </div>
    </div>
  );
}

// Section: Summary
function SummarySection({ resumeData }: ResumeSectionProps) {
  const { summary, colorHex } = resumeData;

  if (!summary) return null; // Skip if no summary is provided

  return (
    <>
      <hr className="border-2" style={{ borderColor: colorHex }} />
      <div className="break-inside-avoid space-y-3">
        <p className="text-lg font-semibold" style={{ color: colorHex }}>
          Professional Profile
        </p>
        <div className="whitespace-pre-line text-sm">{summary}</div>
      </div>
    </>
  );
}

// Section: Work Experience
function WorkExperienceSection({ resumeData }: ResumeSectionProps) {
  const { workExperiences, colorHex } = resumeData;

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0 // Remove empty entries
  );

  if (!workExperiencesNotEmpty?.length) return null;

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

// Section: Education
function EducationSection({ resumeData }: ResumeSectionProps) {
  const { educations, colorHex } = resumeData;

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0 // Remove empty entries
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

// Section: Skills
function SkillsSection({ resumeData }: ResumeSectionProps) {
  const { skills, colorHex, borderStyle } = resumeData;

  if (!skills?.length) return null;

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
                    : "8px",
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
