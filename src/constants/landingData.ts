import { BriefcaseIcon, FileText, Mail, Mic, TrendingUp, User, Target, Zap, Shield, Award, Clock, Users } from "lucide-react";

export const heroData = {
  title: "Stop Sending Resumes Into The Void",
  subtitle: "Join 500+ professionals who've transformed their job search with AI-powered resumes that actually get past ATS systems, cover letters that hiring managers love, and interview practice that builds real confidence.",
  primaryCTA: {
    text: "Start Building Your ATS-Friendly Resume",
    href: "#cta-section"
  },
  secondaryCTA: {
    text: "See How It Works",
    href: "#how-it-works"
  }
};

export const statsData = [
  { value: "500+", label: "Professionals Hired" },
  { value: "1,200+", label: "ATS-Friendly Resumes" },
  { value: "800+", label: "Successful Interviews" },
  { value: "92%", label: "Interview Success Rate" }
];

export const howItWorksData = {
  title: "Your Complete Career Success System",
  subtitle: "From resume creation to job offer - everything you need to stand out in today's competitive job market.",
  steps: [
    {
      icon: FileText,
      title: "Create ATS-Optimized Resumes",
      description: "AI-powered resume builder that ensures your resume gets past Applicant Tracking Systems. Professional templates with keyword optimization and industry-specific formatting.",
      step: 1
    },
    {
      icon: Mail,
      title: "Generate Tailored Cover Letters",
      description: "One-click cover letters that perfectly align your experience with job requirements. AI analyzes job descriptions and creates compelling narratives that hiring managers notice.",
      step: 2
    },
    {
      icon: Mic,
      title: "Practice Real Voice Interviews",
      description: "Realistic AI-powered voice interviews that prepare you for actual job interviews. Get instant feedback on your responses, body language, and communication skills.",
      step: 3
    },
    {
      icon: TrendingUp,
      title: "Track Progress & Improve",
      description: "Comprehensive analytics and feedback to track your improvement. See your interview scores, resume performance, and get actionable insights to accelerate your career growth.",
      step: 4
    }
  ]
};

export const successStoriesData = {
  title: "Real People, Real Results",
  subtitle: "See how professionals like you have transformed their careers and landed dream jobs",
  testimonials: [
    {
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      content: "I was sending out 50+ applications with no responses. After using Resynox's ATS-optimized resume builder, I got 8 interviews in 2 weeks and landed my dream job at Google!",
      rating: 5,
      icon: User
    },
    {
      name: "Michael Chen",
      role: "Product Manager at Amazon",
      content: "The AI cover letter generator is incredible. It perfectly matched my experience to each job description. I went from 0% response rate to getting interviews at top tech companies.",
      rating: 5,
      icon: User
    },
    {
      name: "Jessica Park",
      role: "UX Designer at Meta",
      content: "The voice interview practice gave me the confidence I needed. I practiced with the AI until I felt comfortable, and it showed in my real interviews. I received multiple offers!",
      rating: 5,
      icon: BriefcaseIcon
    }
  ]
};

export const faqData = {
  title: "Frequently Asked Questions",
  subtitle: "Everything you need to know about transforming your job search with AI",
  faqs: [
    {
      question: "How does Resynox ensure my resume gets past ATS systems?",
      answer: "Our AI analyzes thousands of successful resumes and job descriptions to identify the exact keywords, formatting, and structure that ATS systems look for. We optimize your resume for maximum visibility and ensure it ranks high in applicant tracking systems."
    },
    {
      question: "Can the AI really create personalized cover letters?",
      answer: "Yes! Our AI analyzes both your resume and the specific job description to create cover letters that highlight relevant experience, match company culture, and address specific requirements. Each cover letter is unique and tailored to the position."
    },
    {
      question: "How realistic are the voice interview simulations?",
      answer: "Our AI-powered interviews use advanced natural language processing and realistic voice synthesis to create authentic interview experiences. You'll face real questions, get natural follow-ups, and receive detailed feedback on your responses, communication style, and confidence."
    },
    {
      question: "What makes Resynox different from other resume builders?",
      answer: "Unlike basic resume builders, Resynox combines ATS optimization, AI-powered content generation, and realistic interview practice in one platform. We focus on getting you hired, not just creating pretty documents."
    },
    {
      question: "How quickly can I see results?",
      answer: "Most users see immediate improvements in their application response rates within 1-2 weeks of using our ATS-optimized resumes and tailored cover letters. Interview confidence typically improves after just 2-3 practice sessions."
    }
  ]
};

export const ctaData = {
  title: "Ready to Stop Being Ignored by ATS Systems?",
  subtitle: "Join professionals who've transformed their job search from frustrating to successful. Get the tools you need to stand out and get hired.",
  ctas: [
    {
      icon: FileText,
      title: "ATS-Optimized Resume Builder",
      description: "Create resumes that actually get past Applicant Tracking Systems. AI-powered content, professional templates, and keyword optimization.",
      buttonText: "Build Your Resume",
      href: "/resumes"
    },
    {
      icon: Mail,
      title: "AI Cover Letter Generator",
      description: "Generate compelling cover letters that match your resume to job requirements. Stand out from generic applications.",
      buttonText: "Create Cover Letter",
      href: "/cover-letters"
    },
    {
      icon: Mic,
      title: "Voice Interview Practice",
      description: "Practice with realistic AI interviews. Build confidence and get detailed feedback to ace your real interviews.",
      buttonText: "Start Practicing",
      href: "/interview/generate"
    }
  ]
};

// New section for key benefits
export const benefitsData = {
  title: "Why Resynox Works When Others Don't",
  subtitle: "The science behind our success rate",
  benefits: [
    {
      icon: Target,
      title: "ATS Optimization",
      description: "Our AI ensures your resume gets past Applicant Tracking Systems with the right keywords, formatting, and structure.",
      stat: "94% ATS Pass Rate"
    },
    {
      icon: Zap,
      title: "AI-Powered Content",
      description: "Generate professional content that highlights your achievements and matches job requirements perfectly.",
      stat: "3x More Interviews"
    },
    {
      icon: Shield,
      title: "Interview Confidence",
      description: "Practice with realistic AI interviews until you feel confident and prepared for any question.",
      stat: "92% Success Rate"
    },
    {
      icon: Clock,
      title: "Time-Saving",
      description: "Create professional resumes and cover letters in minutes, not hours. Focus on what matters most.",
      stat: "80% Time Saved"
    }
  ]
};

// Video section data
export const videoData = {
  title: "See Resynox in Action",
  subtitle: "",
  videoUrl: "https://youtu.be/jDOFzCE-eYI"
};

// New section for social proof
export const socialProofData = {
  title: "Trusted by Professionals Worldwide",
  subtitle: "Join thousands of successful job seekers",
  logos: [
    "Google", "Amazon", "Meta", "Microsoft", "Apple", "Netflix"
  ],
  stats: [
    { value: "10,000+", label: "Resumes Created" },
    { value: "5,000+", label: "Interviews Practiced" },
    { value: "2,500+", label: "Jobs Landed" }
  ]
};