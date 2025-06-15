import useDimensions from "@/hooks/useDimensions";
import { cn } from "@/lib/utils";
import { formatDate } from "date-fns";
import React, { useRef } from "react";

interface CoverLetterData {
  title: string;
  content: string;
  jobDescription: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CoverLetterPreviewProps {
  coverLetterData: CoverLetterData;
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export default function CoverLetterPreview({ 
  coverLetterData, 
  contentRef, 
  className 
}: CoverLetterPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(containerRef);

  return (
    <div 
      className={cn("aspect-[210/297] h-fit w-full bg-white text-black", className)}
      ref={containerRef}
    >
      <div
        className={cn("space-y-6 p-8", !width && "invisible")}
        style={{
          zoom: (1 / 794) * width,
        }}
        ref={contentRef}
        id="coverLetterPreviewContent"
      >
        <LetterHeader />
        <LetterContent coverLetterData={coverLetterData} />
        <LetterFooter />
      </div>
    </div>
  );
}

function LetterHeader() {
  const currentDate = formatDate(new Date(), "MMMM d, yyyy");
  
  return (
    <div className="space-y-6">
      {/* Date */}
      <div className="text-right">
        <p className="text-sm text-gray-600">{currentDate}</p>
      </div>
      
      {/* Your Contact Info (Placeholder - can be customized) */}
      <div className="text-sm">
        <p className="font-semibold">[Your Name]</p>
        <p>[Your Address]</p>
        <p>[City, State, ZIP Code]</p>
        <p>[Your Email]</p>
        <p>[Your Phone Number]</p>
      </div>
      
      {/* Recipient Info (Placeholder) */}
      <div className="text-sm">
        <p className="font-semibold">[Hiring Manager's Name]</p>
        <p>[Company Name]</p>
        <p>[Company Address]</p>
        <p>[City, State, ZIP Code]</p>
      </div>
    </div>
  );
}

interface LetterContentProps {
  coverLetterData: CoverLetterData;
}

function LetterContent({ coverLetterData }: LetterContentProps) {
  // Extract company name and position from job description if possible
  const extractJobDetails = (jobDescription: string) => {
    // Simple extraction - you can make this more sophisticated
    const lines = jobDescription.split('\n');
    const firstLine = lines[0] || '';
    
    // Try to extract position and company from the first line
    let position = 'the position';
    let company = 'your company';
    
    if (firstLine.includes('position') || firstLine.includes('role')) {
      position = firstLine.substring(0, 100) + '...';
    }
    
    return { position, company };
  };

  const { position, company } = extractJobDetails(coverLetterData.jobDescription);

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <p className="text-sm">Dear Hiring Manager,</p>
      </div>
      
      {/* Main Content */}
      <div className="space-y-4 text-sm leading-relaxed">
        {coverLetterData.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="text-justify">
            {paragraph.trim()}
          </p>
        ))}
      </div>
      
      {/* Closing */}
      <div className="space-y-4 text-sm">
        <p>
          Thank you for considering my application. I look forward to the opportunity 
          to discuss how my background and enthusiasm can contribute to your team's success.
        </p>
        
        <p>
          Sincerely,
        </p>
        
        <div className="pt-8">
          <p className="font-semibold">[Your Signature]</p>
          <p>[Your Printed Name]</p>
        </div>
      </div>
    </div>
  );
}

function LetterFooter() {
  return (
    <div className="text-xs text-gray-500 text-center pt-8">
      {/* Optional footer content */}
    </div>
  );
} 