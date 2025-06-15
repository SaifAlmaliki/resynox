import Link from "next/link";
import { Github, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-xl font-bold">RESYNOX</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your complete career preparation platform. Create professional resumes, 
                practice interviews, and generate compelling cover letters with AI-powered tools.
              </p>
              <div className="flex space-x-4">
                <Link 
                  href="#" 
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link 
                  href="#" 
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link 
                  href="#" 
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <Github className="w-5 h-5" />
                </Link>
                <Link 
                  href="mailto:support@resynox.com" 
                  className="text-gray-400 hover:text-green-400 transition-colors duration-200"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Product Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/resumes" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Resume Builder
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/cover-letters" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Cover Letters
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/interview" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Mock Interviews
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/billing" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/about" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/careers" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/blog" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <ul className="space-y-3">
                <li>
                  <Link 
                    href="/help" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/tos" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/security" 
                    className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                  >
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Signup Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <h4 className="text-lg font-semibold mb-2">Stay Updated</h4>
              <p className="text-gray-400 text-sm">
                Get the latest career tips and product updates delivered to your inbox.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-w-[250px]"
              />
              <button className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-lg font-medium transition-all duration-200 whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <p>&copy; 2024 Resynox. All rights reserved.</p>
              <div className="hidden md:flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>San Francisco, CA</span>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>support@resynox.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
} 