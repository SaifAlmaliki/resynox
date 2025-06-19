import { Mail, MessageCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Navigation */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-green-800 dark:text-green-100 hover:text-green-900 dark:hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We're here to help! Reach out to us for any questions, support, or feedback about RESYNOX.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Email Support Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-green-900/10 dark:bg-green-900/20 flex items-center justify-center">
                <Mail className="h-6 w-6 text-green-800 dark:text-green-100" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Email Support
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get help via email
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                For technical support, feature requests, or general inquiries, please reach out to us at:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <a 
                  href="mailto:resynox24@gmail.com"
                  className="text-green-800 dark:text-green-100 font-semibold text-lg hover:text-green-900 dark:hover:text-white transition-colors"
                >
                  resynox24@gmail.com
                </a>
              </div>
              <a
                href="mailto:resynox24@gmail.com"
                className="inline-flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Mail className="h-4 w-4" />
                Send Email
              </a>
            </div>
          </div>

          {/* Response Time Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Response Time
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  When to expect a reply
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Technical Issues:</strong> Within 24 hours
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>General Inquiries:</strong> Within 48 hours
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Feature Requests:</strong> Within 72 hours
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Before You Contact Us
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check if your question is already answered
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Common Questions:</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• How to create and customize resumes</li>
                <li>• Mock interview features and feedback</li>
                <li>• Cover letter generation process</li>
                <li>• Account and subscription management</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">When Contacting Us, Include:</h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Detailed description of your issue</li>
                <li>• Steps you've already tried</li>
                <li>• Your browser and device information</li>
                <li>• Screenshots if applicable</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ready to get started with RESYNOX?
          </p>
          <Link
            href="/resumes"
            className="inline-flex items-center gap-2 bg-green-800 hover:bg-green-900 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            Start Building Your Resume
          </Link>
        </div>
      </div>
    </div>
  );
} 