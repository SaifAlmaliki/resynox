'use client';

import { Button } from "@/components/ui/button";
import { SplineScene } from "@/components/ui/spline-scene";
import { Spotlight } from "@/components/ui/spotlight";
import { ArrowRight, FileText, Mic } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="w-full bg-black/[0.96] relative overflow-hidden rounded-xl shadow-2xl border-0 mb-16">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
          
          <div className="flex flex-col md:flex-row h-[650px] md:h-[600px]">
            <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-start md:justify-center pt-4 md:pt-0">
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600 tracking-tight">
                Your Complete Career Preparation Platform
              </h1>
              
              <p className="mt-6 text-neutral-300 text-lg max-w-lg">
                Create professional resumes and practice interviews with our AI-powered tools.
                Stand out from the crowd with personalized content and feedback.
              </p>
              
              <div className="mt-8">
                <Button 
                  asChild 
                  size="lg" 
                  variant="premium"
                  className="group rounded-full px-8 py-6 text-lg"
                >
                  <Link href="/dashboard">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex-1 relative order-first md:order-last mb-0 md:mb-0 h-[300px] md:h-full">
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full scale-125 md:scale-100"
              />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Resume Builder Feature */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Resume Builder</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a professional resume in minutes with our AI-powered tools. 
              Choose from modern templates and get personalized content suggestions.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/resumes">
                Build Resume <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mock Interview Feature */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <Mic className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Mock Interviews</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Practice with AI-powered interviews and get instant feedback.
              Improve your interview skills with realistic voice-based mock interviews.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/interview">
                Start Interview <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
