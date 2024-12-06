import ResumePreview from "@/components/ResumePreview"; // Component to render the resume preview
import { cn } from "@/lib/utils"; // Utility for conditional classNames
import { ResumeValues } from "@/lib/validation"; // Type definition for resume data
import BorderStyleButton from "./BorderStyleButton"; // Button to select border styles
import ColorPicker from "./ColorPicker"; // Color picker component for selecting colors

// Type definition for the component's props
interface ResumePreviewSectionProps {
  resumeData: ResumeValues; // Resume data object
  setResumeData: (data: ResumeValues) => void; // Function to update resume data
  className?: string; // Optional additional className for styling
}

// Component to display the resume preview with customization options
export default function ResumePreviewSection({
  resumeData,
  setResumeData,
  className
}: ResumePreviewSectionProps) {
  return (
    <div
      className={cn(
        "group relative hidden w-full md:flex md:w-1/2", // Default styles: hidden on small screens, shown on medium screens and above
        className // Append additional styles if provided
      )}
    >
      {/* Control panel for color and border style, shown on hover */}
      <div className="absolute left-1 top-1 flex flex-none flex-col gap-3 opacity-50 transition-opacity group-hover:opacity-100 lg:left-3 lg:top-3 xl:opacity-100">
        {/* Color Picker to customize resume color */}
        <ColorPicker
          color={resumeData.colorHex} // Current color
          onChange={(color) =>
            setResumeData({ ...resumeData, colorHex: color.hex }) // Update color in resume data
          }
        />
        {/* Button to customize border style */}
        <BorderStyleButton
          borderStyle={resumeData.borderStyle} // Current border style
          onChange={(borderStyle) =>
            setResumeData({ ...resumeData, borderStyle }) // Update border style in resume data
          }
        />
      </div>

      {/* Container for the resume preview */}
      <div className="flex w-full justify-center overflow-y-auto bg-secondary p-3">
        {/* Resume preview rendering */}
        <ResumePreview
          resumeData={resumeData} // Pass current resume data to the preview
          className="max-w-2xl shadow-md" // Set max width and shadow for styling
        />
      </div>
    </div>
  );
}
