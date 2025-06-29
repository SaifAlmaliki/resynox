import { Metadata } from "next";
import { FloatingHeader } from "@/components/ui/floating-header";
import { Footer } from "@/components/ui/footer";
import { floatingHeaderData, simpleFooterData } from "@/constants/navigationData";

export const metadata: Metadata = {
  title: "Pricing - RESYNOX",
  description: "Choose the perfect plan for your career preparation needs",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <FloatingHeader {...floatingHeaderData} />
      
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Select the perfect plan to accelerate your career journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-bold mb-4">$0<span className="text-lg opacity-80">/month</span></div>
                <p className="opacity-90">Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>1 resume</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>1 cover letter (manual only)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>ATS-friendly resume format</span>
                </li>
              </ul>
              <button className="w-full py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Get Started Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 shadow-xl text-white relative transform scale-105 border border-blue-700">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-4">$3.99<span className="text-lg opacity-80">/month</span></div>
                <p className="opacity-90">For serious job seekers</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>Unlimited resumes</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>3 cover letters</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>AI-powered resume enhancement</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>AI cover letters matching job descriptions</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>Format and coloring customizations</span>
                </li>
              </ul>
              <button className="w-full py-3 px-6 rounded-lg bg-white text-blue-900 hover:bg-blue-50 transition-colors font-medium">
                Start Pro Trial
              </button>
            </div>

            {/* Pro Plus Plan */}
            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-8 shadow-lg border border-green-700 text-white">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro Plus</h3>
                <div className="text-4xl font-bold mb-4">$7.99<span className="text-lg opacity-80">/month</span></div>
                <p className="opacity-90">For advanced interview preparation</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>10 cover letters</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>5 voice agent interviews per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>AI interview feedback & analysis</span>
                </li>
              </ul>
              <button className="w-full py-3 px-6 rounded-lg bg-white text-green-900 hover:bg-green-50 transition-colors font-medium">
                Get Pro Plus
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer {...simpleFooterData} />
    </div>
  );
} 