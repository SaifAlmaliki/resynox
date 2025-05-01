'use client';

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SplineScene } from "@/components/ui/spline-scene";
import { Spotlight } from "@/components/ui/spotlight";
import { ArrowRight, CheckCircle, FileCheck, Users, Star, Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * Home Component: Renders the homepage for the application.
 * Features an interactive 3D scene with elegant design elements.
 */
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      {/* Hero Section with 3D Scene */}
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full bg-black/[0.96] relative overflow-hidden rounded-xl shadow-2xl border-0">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
          
          <div className="flex flex-col md:flex-row h-[600px]">
            {/* Left content */}
            <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-center">
              {/* Logo */}
              <div className="mb-6">
                <Image
                  src={logo}
                  alt="Logo"
                  width={100}
                  height={100}
                  className="brightness-200"
                />
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600 tracking-tight">
                AI-Powered Resume Builder
              </h1>
              
              <p className="mt-6 text-neutral-300 text-lg max-w-lg">
                Create professional resumes in minutes with our intuitive AI-powered platform. 
                Stand out from the crowd with beautifully designed templates and personalized content.
              </p>
              
              <div className="mt-8">
                <Button 
                  asChild 
                  size="lg" 
                  variant="premium"
                  className="group rounded-full px-8 py-6 text-lg"
                >
                  <Link href="/resumes">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right content - 3D Scene */}
            <div className="flex-1 relative">
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full"
              />
            </div>
          </div>
        </Card>

        {/* Features Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title="AI-Powered Content"
            description="Let our AI help you craft the perfect resume content tailored to your industry and experience level."
            icon="✨"
          />
          <FeatureCard 
            title="Professional Design"
            description="Our clean, modern template ensures your resume looks professional while remaining ATS-friendly and easy to read."
            icon="🎨"
          />
          <FeatureCard 
            title="Easy Customization"
            description="Customize every aspect of your resume with our intuitive drag-and-drop interface."
            icon="⚡"
          />
        </div>
        
        {/* ATS-Friendly Section */}
        <div className="mt-24 bg-white dark:bg-gray-900 rounded-xl p-8 md:p-12 shadow-lg">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">ATS-Friendly Resumes That Get You Hired</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Our resume builder is designed to help you pass Applicant Tracking Systems (ATS) and land more interviews.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <FileCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Optimized for ATS</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our templates are designed to be easily parsed by ATS software, ensuring your resume gets seen by human recruiters.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Keyword Optimization</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our AI analyzes job descriptions and suggests relevant keywords to include in your resume for better matching.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <Star className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Clean, Scannable Format</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Simple formatting, clear section headings, and proper use of bullet points make your resume easy to scan for both ATS and recruiters.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Smart Content Suggestions</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our AI provides tailored content suggestions based on your industry and role, helping you highlight the most relevant skills and experiences.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Success Stories Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how our resume builder has helped thousands of job seekers land their dream jobs.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Sarah Johnson"
              role="Marketing Manager"
              company="Tech Innovate"
              testimonial="I was struggling to get interviews for months. After using this resume builder, I received 5 interview requests in just two weeks and landed my dream job!"
              rating={5}
            />
            
            <TestimonialCard 
              name="Michael Chen"
              role="Software Engineer"
              company="DataStream"
              testimonial="The AI suggestions were spot-on for my industry. My resume now perfectly highlights my skills, and I got a job offer with a 30% salary increase!"
              rating={5}
            />
            
            <TestimonialCard 
              name="Emily Rodriguez"
              role="Healthcare Administrator"
              company="Central Hospital"
              testimonial="As someone switching careers, I wasn't sure how to present my transferable skills. This tool made it easy, and I successfully transitioned to my new field!"
              rating={5}
            />
          </div>
          
          {/* Removed 'Read More Success Stories' button */}
        </div>
        
        {/* How It Works Section */}
        <div className="mt-24 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Create your professional resume in just 3 easy steps
              </p>
            </div>
            
            <div className="space-y-12">
              <StepCard 
                number="1"
                title="Start with Our Professional Template"
                description="Begin with our clean, ATS-friendly template designed to work well across all industries and job types."
              />
              
              <StepCard 
                number="2"
                title="Fill in Your Details"
                description="Our AI-powered form makes it easy to add your information. Get smart suggestions for skills, achievements, and job descriptions."
              />
              
              <StepCard 
                number="3"
                title="Download & Apply"
                description="Export your polished resume as a PDF, ready to impress employers and pass through ATS systems with flying colors."
              />
            </div>
          </div>
        </div>
        
        {/* Newsletter Subscription */}
        <div className="mt-24 mb-12 bg-black/[0.96] rounded-xl p-8 md:p-12 shadow-lg relative overflow-hidden">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
          
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Get Career Tips & Updates</h2>
              <p className="text-lg text-gray-300 mb-8">
                Subscribe to our newsletter for expert resume advice, job search tips, and exclusive offers.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <Button variant="premium" className="whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                By subscribing, you agree to receive emails from us. You can unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Feature card component
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </Card>
  );
}

// Testimonial card component
function TestimonialCard({ 
  name, 
  role, 
  company, 
  testimonial, 
  rating 
}: { 
  name: string; 
  role: string; 
  company: string; 
  testimonial: string; 
  rating: number 
}) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-900">
      <div className="flex mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        ))}
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-6 italic">&ldquo;{testimonial}&rdquo;</p>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{role} at {company}</p>
      </div>
    </Card>
  );
}

// Step card component
function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-6">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
