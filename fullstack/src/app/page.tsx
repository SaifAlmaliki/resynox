import logo from "@/assets/logo.png"; // Import the logo image
import resumePreview from "@/assets/resume-preview.jpg"; // Import the resume preview image
import { Button } from "@/components/ui/button"; // Import the Button component
import Image from "next/image"; // Next.js optimized image component
import Link from "next/link"; // Next.js Link for navigation

/**
 * Home Component: Renders the homepage for the application.
 * Includes a logo, headline, call-to-action button, and resume preview image.
 */
export default function Home() {
  return (
    <main
      className="
        flex min-h-screen flex-col items-center justify-center
        gap-6 bg-gray-100 px-5 py-12 text-center text-gray-900
        md:flex-row md:text-start lg:gap-12
      "
    >
      {/* Left Section: Text Content and Call-to-Action */}
      <div className="max-w-prose space-y-3">
        {/* Logo Image */}
        <Image
          src={logo}
          alt="Logo"
          width={150}
          height={150}
          className="mx-auto md:ms-0"
        />

        {/* Headline */}
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Create Perfect{" "}
          <span
            className="
              inline-block bg-gradient-to-r from-green-600 to-green-400
              bg-clip-text text-transparent
            "
          >
             AI Powered Resume
          </span>{" "}
          in Minutes
        </h1>

        {/* Subheadline/Description */}
        <p className="text-lg text-gray-500">
          Our <span className="font-bold">AI powered resume builder</span> helps you
          design a professional resume in minutes.
        </p>

        {/* Call-to-Action Button */}
        <Button asChild size="lg" variant="premium">
          <Link href="/resumes">Get started</Link>
        </Button>
      </div>

      {/* Right Section: Resume Preview Image */}
      <div>
        <Image
          src={resumePreview}
          alt="Resume preview"
          width={600}
          className="shadow-md lg:rotate-[1.5deg]"
        />
      </div>
    </main>
  );
}
