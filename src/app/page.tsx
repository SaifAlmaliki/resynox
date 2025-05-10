'use client';

import { Button } from "@/components/ui/button";
import { SplineScene } from "@/components/ui/spline-scene";
import { Spotlight } from "@/components/ui/spotlight";
import { ArrowRight, BriefcaseIcon, CheckCircle, ChevronDown, FileText, Mic, Star, TrendingUp, User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="w-full bg-black/[0.96] relative overflow-hidden rounded-xl shadow-2xl border-0 mb-16">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="white"
          />
          
          <div className="flex flex-col md:flex-row h-[750px] md:h-[600px]">
            <div className="flex-1 p-8 md:p-12 relative z-10 flex flex-col justify-start md:justify-center pt-4 md:pt-0">
              <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600 tracking-tight">
                Your Complete Career Preparation Platform
              </h1>
              
              <p className="mt-6 text-neutral-300 text-lg max-w-lg">
                Create professional resumes and practice interviews with our AI-powered tools.
                Stand out from the crowd with personalized content and feedback.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  size="lg" 
                  variant="premium"
                  className="group rounded-full px-8 py-6 text-lg"
                >
                  <a href="#cta-section">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="group rounded-full px-8 py-6 text-lg bg-transparent border-white text-white hover:bg-white/20 hover:text-white"
                >
                  <a href="#how-it-works">
                    How It Works
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex-1 relative order-first md:order-last mb-0 md:mb-0 h-[350px] md:h-full">
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="w-full h-full scale-125 md:scale-100"
              />
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">10,000+</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">25,000+</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Resumes Created</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">50,000+</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Mock Interviews</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-green-600 dark:text-green-400">85%</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Success Rate</p>
            </div>
          </div>
        </div>



        {/* How It Works Section */}
        <div id="how-it-works" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our platform simplifies your job search preparation with a few easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 mx-auto">
                <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Create Your Resume</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build a professional resume with our AI-powered tools and templates
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 mx-auto">
                <Mic className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Practice Interviews</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Prepare for real interviews with our AI-powered mock interviews
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Get Feedback</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Receive detailed feedback and improve your performance
              </p>
            </div>
          </div>
        </div>

        {/* Success Stories Section */}
        <div className="mb-16 bg-green-50 dark:bg-green-900/20 rounded-xl p-8 shadow-md">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how our platform has helped job seekers land their dream roles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold">Sarah Johnson</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Software Engineer at Google</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                "After practicing with ResynoX's mock interviews, I felt so much more confident during my actual interviews. The feedback was incredibly helpful and I landed my dream job at Google!"
              </p>
              <div className="flex text-yellow-400">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                  <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold">Michael Chen</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Product Manager at Amazon</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                "The resume builder helped me create a standout resume that got me multiple interviews. The templates are modern and professional, and the AI suggestions were spot on."
              </p>
              <div className="flex text-yellow-400">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
                  <BriefcaseIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold">Jessica Park</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">UX Designer at Meta</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                "I used the resume builder for my career change and it helped me highlight my transferable skills perfectly. I received compliments on my resume in every interview and landed my dream job!"
              </p>
              <div className="flex text-yellow-400">
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
                <Star className="h-5 w-5 fill-current" />
              </div>
            </div>
          </div>
        </div>



        {/* FAQ Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Find answers to common questions about our platform
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                question: "How does the AI-powered interview practice work?",
                answer: "Our AI-powered interview practice simulates real interview scenarios based on the job role you select. You'll receive questions tailored to your experience level and industry, and get detailed feedback on your responses, including suggestions for improvement."
              },
              {
                question: "Can I customize my resume template?",
                answer: "Yes! Our resume builder offers multiple customization options. You can choose from various templates, color schemes, fonts, and layouts to create a resume that matches your personal style while maintaining professional standards."
              },
              {
                question: "Is there a limit to how many mock interviews I can do?",
                answer: "Free users can access a limited number of mock interviews per month. Premium subscribers get unlimited access to all interview types and receive more detailed feedback and analysis."
              },
              {
                question: "How secure is my personal information?",
                answer: "We take data security very seriously. All your personal information and resume data are encrypted and stored securely. We never share your information with third parties without your explicit consent."
              },
              {
                question: "Can I download my resume in different formats?",
                answer: "Yes, you can download your resume in PDF, DOCX, and other formats to ensure compatibility with various application systems."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown className={`h-5 w-5 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-6 pb-4 ${openFaq === index ? 'block' : 'hidden'}`}>
                  <p className="text-gray-600 dark:text-gray-400">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div id="cta-section" className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-8 shadow-md text-white mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Ready to Boost Your Career?</h2>
            <p className="max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their job search with our platform.
              Get started today and take the first step toward your dream career.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Resume Builder CTA */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-md border border-white/20 text-center hover:bg-white/15 transition-colors flex flex-col h-full">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mb-4 mx-auto">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Resume Builder</h3>
              <p className="text-white/80 mb-auto">
                Create a professional resume in minutes with our AI-powered tools. 
                Choose from modern templates and get personalized content suggestions.
              </p>
              <div className="mt-6">
                <Button 
                  asChild 
                  size="lg"
                  variant="secondary"
                  className="w-full group rounded-full px-6 py-4 text-green-600 bg-white hover:bg-gray-100"
                >
                  <Link href="/resumes">
                    Build Resume <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Mock Interview CTA */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-md border border-white/20 text-center hover:bg-white/15 transition-colors flex flex-col h-full">
              <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center mb-4 mx-auto">
                <Mic className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mock Interviews</h3>
              <p className="text-white/80 mb-auto">
                Practice with AI-powered interviews and get instant feedback.
                Improve your interview skills with realistic voice-based mock interviews.
              </p>
              <div className="mt-6">
                <Button 
                  asChild 
                  size="lg"
                  variant="secondary"
                  className="w-full group rounded-full px-6 py-4 text-green-600 bg-white hover:bg-gray-100"
                >
                  <Link href="/interview/generate">
                    Start Interview <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
