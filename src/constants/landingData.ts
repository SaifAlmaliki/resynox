import { BriefcaseIcon, FileText, Mic, TrendingUp, User } from "lucide-react";

export const heroData = {
  title: "Your Complete Career Preparation Platform",
  subtitle: "Create professional resumes and practice interviews with our AI-powered tools. Stand out from the crowd with personalized content and feedback.",
  primaryCTA: {
    text: "Get Started",
    href: "#cta-section"
  },
  secondaryCTA: {
    text: "How It Works",
    href: "#how-it-works"
  },
  splineScene: "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
};

export const statsData = [
  { value: "10,000+", label: "Users" },
  { value: "25,000+", label: "Resumes Created" },
  { value: "50,000+", label: "Mock Interviews" },
  { value: "85%", label: "Success Rate" }
];

export const howItWorksData = {
  title: "How It Works",
  subtitle: "Our platform simplifies your job search preparation with a few easy steps",
  steps: [
    {
      icon: FileText,
      title: "Create Your Resume",
      description: "Build a professional resume with our AI-powered tools and templates",
      step: 1
    },
    {
      icon: FileText,
      title: "Generate Cover Letter",
      description: "Create tailored cover letters based on your resume and job descriptions",
      step: 2
    },
    {
      icon: Mic,
      title: "Practice Interviews",
      description: "Prepare for real interviews with our AI-powered mock interviews",
      step: 3
    },
    {
      icon: TrendingUp,
      title: "Get Feedback",
      description: "Receive detailed feedback and improve your performance",
      step: 4
    }
  ]
};

export const successStoriesData = {
  title: "Success Stories",
  subtitle: "See how our platform has helped job seekers land their dream roles",
  testimonials: [
    {
      name: "Sarah Johnson",
      role: "Software Engineer at Google",
      content: "After practicing with ResynoX's mock interviews, I felt so much more confident during my actual interviews. The feedback was incredibly helpful and I landed my dream job at Google!",
      rating: 5,
      icon: User
    },
    {
      name: "Michael Chen",
      role: "Product Manager at Amazon",
      content: "The resume builder helped me create a standout resume that got me multiple interviews. The templates are modern and professional, and the AI suggestions were spot on.",
      rating: 5,
      icon: User
    },
    {
      name: "Jessica Park",
      role: "UX Designer at Meta",
      content: "I used the resume builder for my career change and it helped me highlight my transferable skills perfectly. I received compliments on my resume in every interview and landed my dream job!",
      rating: 5,
      icon: BriefcaseIcon
    }
  ]
};

export const faqData = {
  title: "Frequently Asked Questions",
  subtitle: "Find answers to common questions about our platform",
  faqs: [
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
  ]
};

export const ctaData = {
  title: "Ready to Boost Your Career?",
  subtitle: "Join thousands of professionals who have transformed their job search with our platform. Get started today and take the first step toward your dream career.",
  ctas: [
    {
      icon: FileText,
      title: "Resume Builder",
      description: "Create a professional resume in minutes with our AI-powered tools. Choose from modern templates and get personalized content suggestions.",
      buttonText: "Build Resume",
      href: "/resumes"
    },
    {
      icon: FileText,
      title: "Cover Letter Generator",
      description: "Generate tailored cover letters based on your resume and job descriptions. Create compelling cover letters that stand out to employers.",
      buttonText: "Create Cover Letter",
      href: "/cover-letters"
    },
    {
      icon: Mic,
      title: "Mock Interviews",
      description: "Practice with AI-powered interviews and get instant feedback. Improve your interview skills with realistic voice-based mock interviews.",
      buttonText: "Start Interview",
      href: "/interview/generate"
    }
  ]
};