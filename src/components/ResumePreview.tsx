import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import useDimensions from "@/hooks/useDimensions";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import { formatDate } from "date-fns";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Badge } from "./ui/badge";

interface ResumePreviewProps {
  resumeData: ResumeValues;
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export default function ResumePreview({ resumeData, contentRef, className }: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(containerRef);

  // Only apply zoom for screen display, not for print
  const screenZoomStyle = React.useMemo(() => {
    if (!width) return { visibility: 'hidden' as const };
    return {
      zoom: (1 / 794) * width,
      visibility: 'visible' as const,
    };
  }, [width]);

  return (
    <div 
      className={cn("aspect-[210/297] h-fit w-full bg-white text-black", className)}
      ref={containerRef}
    >
      <div
        className="space-y-6 p-6 print:p-0 print:space-y-4"
        style={screenZoomStyle}
        ref={contentRef}
        id="resumePreviewContent"
      >
        <PersonalInfoHeader resumeData={resumeData} />
        <SummarySection resumeData={resumeData} />
        <WorkExperienceSection resumeData={resumeData} />
        <EducationSection resumeData={resumeData} />
        <LanguageSkillsSection resumeData={resumeData} />
      </div>
    </div>
  );
}

interface ResumeSectionProps {
  resumeData: ResumeValues;
}

function PersonalInfoHeader({ resumeData }: ResumeSectionProps) {
  const { photo, firstName, lastName, jobTitle, city, country, phone, email, colorHex, borderStyle, skills } = resumeData;

  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo);

  useEffect(() => {
    const objectUrl = photo instanceof File ? URL.createObjectURL(photo) : "";
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc("");
    return () => URL.revokeObjectURL(objectUrl);
  }, [photo]);

  return (
    <div className="flex items-center gap-6 print:gap-4">
      {photoSrc && (
        <Image
          src={photoSrc}
          width={100}
          height={140}
          alt="Author photo"
          className="aspect-[5/7] object-cover print:w-20 print:h-28"
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
      <div className="space-y-2.5 print:space-y-2">
        <div className="space-y-1">
          <p className="text-3xl font-bold print:text-lg print:font-bold" style={{ color: colorHex }}>
            {firstName} {lastName}
          </p>
          <p className="font-medium print:text-sm print:font-medium" style={{ color: colorHex }}>
            {jobTitle}
          </p>
        </div>

        <p className="text-xs text-gray-500 print:text-xs">
          {city}
          {city && country ? ", " : ""}
          {country}
          {(city || country) && (phone || email) ? " • " : ""}
          {[phone, email].filter(Boolean).join(" • ")}
        </p>

        {skills?.length ? (
          <div className="mt-2 flex flex-wrap gap-2 print:gap-1">
            {skills.map((skill, i) => (
              <Badge key={i} variant="secondary" className="print:text-[10pt] print:px-2 print:py-0.5">
                {skill}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SummarySection({ resumeData }: ResumeSectionProps) {
  const { summary, colorHex } = resumeData;

  if (!summary) return null;

  return (
    <>
      <hr className="border-2 print:border-1" style={{ borderColor: colorHex }} />
      <div className="break-inside-avoid space-y-3 print:space-y-2">
        <p className="text-lg font-semibold print:text-base print:font-semibold" style={{ color: colorHex }}>
          Professional Profile
        </p>
        <div className="whitespace-pre-line text-sm print:text-sm">{summary}</div>
      </div>
    </>
  );
}

function WorkExperienceSection({ resumeData }: ResumeSectionProps) {
  const { workExperiences, colorHex } = resumeData;

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0
  );

  if (!workExperiencesNotEmpty?.length) return null;

  return (
    <>
      <hr className="border-2 print:border-1" style={{ borderColor: colorHex }} />
      <div className="space-y-3 print:space-y-2">
        <p className="text-lg font-semibold print:text-base print:font-semibold" style={{ color: colorHex }}>
          Work Experience
        </p>
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold print:text-sm print:font-semibold"
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
            <p className="text-xs font-semibold print:text-xs print:font-semibold">{exp.company}</p>
            <div className="whitespace-pre-line text-xs print:text-xs">{exp.description}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function EducationSection({ resumeData }: ResumeSectionProps) {
  const { educations, colorHex } = resumeData;

  const educationsNotEmpty = educations?.filter(
    (edu) => Object.values(edu).filter(Boolean).length > 0
  );

  if (!educationsNotEmpty?.length) return null;

  return (
    <>
      <hr className="border-2 print:border-1" style={{ borderColor: colorHex }} />
      <div className="space-y-3 print:space-y-2">
        <p className="text-lg font-semibold print:text-base print:font-semibold" style={{ color: colorHex }}>
          Education
        </p>
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold print:text-sm print:font-semibold"
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
            <p className="text-xs font-semibold print:text-xs print:font-semibold">{edu.school}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function LanguageSkillsSection({ resumeData }: ResumeSectionProps) {
  const { languages, colorHex } = resumeData;

  if (!languages?.length) return null;

  return (
    <>
      <hr className="border-2 print:border-1" style={{ borderColor: colorHex }} />
      <div className="break-inside-avoid space-y-3 print:space-y-2">
        <p className="text-lg font-semibold print:text-base print:font-semibold" style={{ color: colorHex }}>
          Languages
        </p>
        <div className="space-y-2 print:space-y-1">
          {languages.map((lang, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-sm print:text-sm">{lang.language}</span>
              <span className="text-xs capitalize print:text-xs">{lang.level}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Removed bottom SkillsSection; skills are now displayed under the header
