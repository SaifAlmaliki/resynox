import useDimensions from "@/hooks/useDimensions";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";

interface CoverLetterPreviewProps {
  coverLetter: {
    title: string | null;
    jobDescription: string;
    content: string;
    resume?: {
      firstName: string | null;
      lastName: string | null;
      email: string | null;
      phone: string | null;
      city: string | null;
      country: string | null;
    } | null;
    parsedMetadata?: {
      basicInfo?: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        city?: string;
        country?: string;
      };
    };
  };
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export default function CoverLetterPreview({ coverLetter, contentRef, className }: CoverLetterPreviewProps) {
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

  // Get creator information
  const getCreatorInfo = () => {
    if (coverLetter.resume) {
      return {
        firstName: coverLetter.resume.firstName || '',
        lastName: coverLetter.resume.lastName || '',
        email: coverLetter.resume.email || '',
        phone: coverLetter.resume.phone || '',
        city: coverLetter.resume.city || '',
        country: coverLetter.resume.country || '',
      };
    }
    
    if (coverLetter.parsedMetadata?.basicInfo) {
      return {
        firstName: coverLetter.parsedMetadata.basicInfo.firstName || '',
        lastName: coverLetter.parsedMetadata.basicInfo.lastName || '',
        email: coverLetter.parsedMetadata.basicInfo.email || '',
        phone: coverLetter.parsedMetadata.basicInfo.phone || '',
        city: coverLetter.parsedMetadata.basicInfo.city || '',
        country: coverLetter.parsedMetadata.basicInfo.country || '',
      };
    }
    
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      country: '',
    };
  };

  const creatorInfo = getCreatorInfo();
  const hasCreatorInfo = creatorInfo.firstName || creatorInfo.lastName || creatorInfo.email;

  // Get job title from job description
  const getJobTitle = () => {
    if (coverLetter.title) return coverLetter.title;
    const firstLine = coverLetter.jobDescription.split('\n')[0];
    return firstLine || 'Cover Letter';
  };

  return (
    <div 
      className={cn("aspect-[210/297] h-fit w-full bg-white text-black", className)}
      ref={containerRef}
    >
      <div
        className="space-y-6 p-6 print:p-0 print:space-y-4"
        style={screenZoomStyle}
        ref={contentRef}
        id="coverLetterPreviewContent"
      >
        {/* Header with creator information */}
        {hasCreatorInfo && (
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div>
                {creatorInfo.firstName && creatorInfo.lastName && (
                  <h1 className="text-2xl font-bold text-gray-900">
                    {creatorInfo.firstName} {creatorInfo.lastName}
                  </h1>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {new Date().toISOString().slice(0, 10).split('-').reverse().join('/')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Job Title */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            {getJobTitle()}
          </h2>
        </div>

        {/* Cover Letter Content */}
        <div className="space-y-4">
          {coverLetter.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-sm leading-relaxed text-gray-800">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Signature */}
        {hasCreatorInfo && (
          <div className="pt-4">
            <p className="text-sm text-gray-800">
              Sincerely,
            </p>
            <p className="text-sm font-medium text-gray-900 mt-2">
              {creatorInfo.firstName} {creatorInfo.lastName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
