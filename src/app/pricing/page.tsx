import { Metadata } from "next";
import Link from "next/link";
import { FloatingHeader } from "@/components/ui/floating-header";
import { Footer } from "@/components/ui/footer";
import { floatingHeaderData, simpleFooterData } from "@/constants/navigationData";
import { auth } from "@clerk/nextjs/server";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import PricingButtons from "./PricingButtons";

export const metadata: Metadata = {
  title: "Pricing - RESYNOX",
  description: "Choose the perfect plan for your career preparation needs",
};

export default async function PricingPage() {
  const { userId } = await auth();
  const subscriptionLevel = userId ? await getUserSubscriptionLevel(userId) : "free";

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
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Free</h3>
                <div className="text-4xl font-bold mb-4">$0<span className="text-lg opacity-80">/month</span></div>
                <p className="opacity-90">Perfect for getting started</p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>Create resumes — 0pts required</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>Customize layout & colors — 0pts</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-900/20 dark:bg-green-900/40 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-green-800"></div>
                  </div>
                  <span>1 cover letter (manual only)</span>
                </li>
              </ul>
              <div className="mt-auto">
                {subscriptionLevel === "free" ? (
                  <div className="w-full py-3 px-6 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-center font-medium">
                    Current Plan
                  </div>
                ) : (
                  <Link href="/sign-up" className="block w-full py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center font-medium">
                    Get Started Free
                  </Link>
                )}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 shadow-xl text-white relative transform scale-105 border border-blue-700 flex flex-col">
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
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>40 points / month (rollover)</span>
                </li>
              </ul>
              <div className="mt-auto">
                <PricingButtons 
                  plan="pro" 
                  currentSubscription={subscriptionLevel}
                  isAuthenticated={!!userId}
                />
              </div>
            </div>

            {/* Pro Plus Plan */}
            <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-8 shadow-lg border border-green-700 text-white flex flex-col">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Pro Plus</h3>
                <div className="text-4xl font-bold mb-4">$7.99<span className="text-lg opacity-80">/month</span></div>
                <p className="opacity-90">For advanced interview preparation</p>
              </div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>80 points / month (rollover)</span>
                </li>
              </ul>
              <div className="mt-auto">
                <PricingButtons 
                  plan="pro_plus" 
                  currentSubscription={subscriptionLevel}
                  isAuthenticated={!!userId}
                />
              </div>
            </div>
          </div>
          {/* Generic points cost section */}
          <div className="max-w-4xl mx-auto mt-14">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-semibold mb-4 text-center">Points cost for AI actions</h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">Applies to all plans. Unused points roll over.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-900/10 dark:bg-blue-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-800"></div>
                  </div>
                  <span>Cover letter generation — 5 pts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-900/10 dark:bg-blue-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-800"></div>
                  </div>
                  <span>Resume summary — 4 pts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-900/10 dark:bg-blue-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-800"></div>
                  </div>
                  <span>Enhance work experience — 2 pts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-900/10 dark:bg-blue-900/30 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-blue-800"></div>
                  </div>
                  <span>Start voice interview session — 10 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer {...simpleFooterData} />
    </div>
  );
} 