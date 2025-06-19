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
                  <span>3 resume templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>5 mock interviews per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>Basic cover letter generator</span>
                </li>
              </ul>
              <button className="w-full py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Get Started Free
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-8 shadow-xl text-white relative transform scale-105 border border-green-700">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <div className="text-4xl font-bold mb-4">$19<span className="text-lg opacity-80">/month</span></div>
                <p className="opacity-90">For serious job seekers</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>Unlimited resume templates</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>Unlimited mock interviews</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>AI-powered cover letters</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>Priority support</span>
                </li>
              </ul>
              <button className="w-full py-3 px-6 rounded-lg bg-white text-green-900 hover:bg-green-50 transition-colors font-medium">
                Start Pro Trial
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                <div className="text-4xl font-bold mb-4">$99<span className="text-lg opacity-80">/month</span></div>
                <p className="opacity-90">For teams and organizations</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>Team collaboration</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>Custom branding</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>Dedicated support</span>
                </li>
              </ul>
              <button className="w-full py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer {...simpleFooterData} />
    </div>
  );
} 