import { BriefcaseIcon, FileText, Mic, TrendingUp, User } from "lucide-react";

export const heroData = {
  title: "Build. Tailor. Practice. Get Hired.",
  subtitle: "Resynox is your AI career co‑pilot. Create a standout resume, generate tailored cover letters, and practice real voice interviews—with instant, actionable feedback.",
  primaryCTA: {
    text: "Start Free",
    href: "#cta-section"
  },
  secondaryCTA: {
    text: "See How It Works",
    href: "#how-it-works"
  },
  splineScene: "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
};

export const statsData = [
  { value: "500+", label: "Users" },
  { value: "1,200+", label: "Resumes Created" },
  { value: "800+", label: "Mock Interviews" },
  { value: "92%", label: "Success Rate" }
];

export const howItWorksData = {
  title: "Everything you need:end to end",
  subtitle: "Go from a blank page to interview‑ready in minutes, not weeks.",
  steps: [
    {
      icon: FileText,
      title: "Create Your Resume",
      description: "AI drafting for summaries and experience bullets. Beautiful, customizable templates with drag‑and‑drop sections.",
      step: 1
    },
    {
      icon: FileText,
      title: "Generate Cover Letter",
      description: "Instant, role‑specific cover letters tailored to your resume and target job description.",
      step: 2
    },
    {
      icon: Mic,
      title: "Practice Interviews",
      description: "Realistic voice interviews powered by ElevenLabs. Natural back‑and‑forth conversation.",
      step: 3
    },
    {
      icon: TrendingUp,
      title: "Get Feedback",
      description: "Structured scoring and clear next steps. Track progress across sessions and improve fast.",
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
  title: "Ready to get more interviews?",
  subtitle: "Join professionals who turned applications into offers with AI‑powered resumes, tailored cover letters, and real voice interview practice.",
  ctas: [
    {
      icon: FileText,
      title: "Resume Builder",
      description: "Create a professional resume in minutes. AI writing assistance, modern templates, color & layout controls.",
      buttonText: "Build Resume",
      href: "/resumes"
    },
    {
      icon: FileText,
      title: "Cover Letter Generator",
      description: "One‑click, tailored cover letters aligned with your resume and the job you want.",
      buttonText: "Create Cover Letter",
      href: "/cover-letters"
    },
    {
      icon: Mic,
      title: "Mock Interviews",
      description: "Practice realistic voice interviews and get actionable feedback with clear scores.",
      buttonText: "Start Interview",
      href: "/interview/generate"
    }
  ]
};