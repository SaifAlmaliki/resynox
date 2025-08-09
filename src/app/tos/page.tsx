/*
 * Terms of Service Page
 *
 * This file defines a **Terms of Service** page for AI Resume Builder.
 *
 * Features:
 * - Provides users with the legal terms governing the use of the service.
 * - Includes sections for subscription plans, account registration, user rights,
 *   and service limitations.
 * - Uses TailwindCSS for consistent styling and layout.
 *
 * Dependencies:
 * - Metadata for setting the page title (Next.js feature).
 * - TailwindCSS utility classes for spacing, typography, and layout.
 */

import { Metadata } from "next";

// Define metadata for the page (used in <head> for SEO purposes)
export const metadata: Metadata = {
  title: "Terms of Service",
};

// Page Component: Terms of Service
export default function Page() {
  return (
    <main className="mx-auto max-w-prose space-y-6 p-3 py-6">
      {/* Page Header */}
      <h1 className="text-center text-2xl font-bold">Terms of Service</h1>
      <p className="text-center text-sm text-muted-foreground">
        Effective Date: Oct 31, 2025
      </p>

      {/* Introduction */}
      <p>
        Welcome to AI Resume Builder. These Terms of Service (&quot;Terms&quot;)
        govern your use of our website and services, including any paid
        subscription plans. By accessing or using AI Resume Builder
        (&quot;the Service&quot;), you agree to be bound by these Terms. If you
        do not agree to these Terms, do not use the Service.
      </p>

      {/* Section 1: Overview */}
      <section>
        <h2 className="text-xl font-semibold">1. Overview</h2>
        <p>
          AI Resume Builder is a SaaS platform providing resume-building tools
          powered by artificial intelligence. We offer both a free tier and paid
          subscription plans. Payments for Paid Plans are processed through
          Stripe, our third-party payment provider.
        </p>
      </section>

      {/* Section 2: Eligibility */}
      <section>
        <h2 className="text-xl font-semibold">2. Eligibility</h2>
        <p>
          You must be at least 18 years old and capable of entering into legally
          binding contracts to use this Service. By accessing the Service, you
          confirm that you meet this eligibility requirement.
        </p>
      </section>

      {/* Section 3: Account Registration */}
      <section>
        <h2 className="text-xl font-semibold">3. Account Registration</h2>
        <p>
          To access some features, including Paid Plans, you must create an
          account. When registering, you agree to provide accurate and current
          information. You are responsible for maintaining the security of your
          account and password.
        </p>
      </section>

      {/* Section 4: Free Tier */}
      <section>
        <h2 className="text-xl font-semibold">4. Free Tier</h2>
        <p>
          Our free tier provides limited access to features, enabling basic
          resume creation. Advanced features and templates require a Paid Plan.
        </p>
      </section>

      {/* Section 5: Paid Subscription Plans */}
      <section>
        <h2 className="text-xl font-semibold">5. Paid Subscription Plans</h2>
        <p>
          If you choose a Paid Plan, payments are securely processed via Stripe.
          By subscribing, you agree to:
        </p>
        <ul className="list-inside list-disc">
          <li>
            <strong>Subscription Fees:</strong> Fees are billed on a recurring
            basis (monthly/annually). Prices may change with prior notice.
          </li>
          <li>
            <strong>Payment Method:</strong> You must provide a valid payment
            method. Subscriptions auto-renew unless canceled.
          </li>
          <li>
            <strong>Refund Policy:</strong> Payments are non-refundable. You can
            cancel anytime and retain access until the billing period ends.
          </li>
        </ul>
      </section>

      {/* Section 6-17: Additional Legal Sections */}
      <section>
        <h2 className="text-xl font-semibold">6. Cancellation of Subscription</h2>
        <p>
          You can cancel your subscription anytime through your account
          settings. The cancellation will take effect at the end of the current
          billing cycle.
        </p>
      </section>

      {/* Additional sections follow the same structure */}
      <section>
        <h2 className="text-xl font-semibold">
          7. Changes to Services and Pricing
        </h2>
        <p>
          We reserve the right to change the Service or adjust pricing. Changes
          will not affect current subscriptions but will apply to renewals.
        </p>
      </section>

      {/* Example for Intellectual Property */}
      <section>
        <h2 className="text-xl font-semibold">9. Intellectual Property</h2>
        <p>
          All content, trademarks, and intellectual property related to AI
          Resume Builder are owned by us. You agree not to infringe on these
          rights.
        </p>
      </section>

      {/* Final Note */}
      <p>
        By using AI Resume Builder, you acknowledge that you have read,
        understood, and agree to these Terms of Service.
      </p>
    </main>
  );
}
