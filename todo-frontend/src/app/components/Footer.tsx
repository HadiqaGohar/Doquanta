"use client";
import Link from "next/link";

import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaArrowUp,
  FaInstagram,
  FaFacebook,
  FaEnvelope,
  FaHeart,
  FaCode,
} from "react-icons/fa";

// Using CSS class for Anton font
const anton = { className: "font-anton" };

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "GitHub",
      icon: FaGithub,
      url: "https://github.com",
      color: "hover:text-gray-300 hover:border-gray-300",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      url: "https://linkedin.com",
      color: "hover:text-blue-400 hover:border-blue-400",
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      url: "https://twitter.com",
      color: "hover:text-sky-400 hover:border-sky-400",
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-gray-900 text-white py-12 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        {/* Top Section - Simplified for Todo App */}
        <div className="flex justify-between items-start mb-12">
          <div className="text-gray-400 text-sm">
            © {currentYear} DoQuanta - Stay Productive
          </div>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
            aria-label="Scroll to top"
          >
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <FaArrowUp className="w-3 h-3" />
            </div>
          </button>
        </div>

        {/* Main Section - Modified for Todo App */}
        <div className="text-center mb-12">
          <div className="mb-8">
            <p className="text-gray-400 text-sm mb-4 tracking-wider">
              READY TO GET ORGANIZED?
            </p>
            <h2
              className={`${anton.className} text-5xl md:text-7xl lg:text-8xl font-bold text-gray-300 tracking-wider hover:text-white transition-colors duration-500 cursor-default`}
            >
              GET STARTED
            </h2>
            <p className="text-gray-500 text-sm mt-4 max-w-2xl mx-auto">
              Join thousands of users who have transformed their productivity with our simple yet powerful todo app.
            </p>
          </div>

          {/* Get Started Button */}
          <div className="mb-8">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              <FaCode className="w-4 h-4" />
              Create Your Account
            </Link>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`px-6 py-3 border border-gray-700 rounded-full text-gray-400 transition-all duration-300 text-sm tracking-wider transform hover:scale-105 ${social.color}`}
                aria-label={social.name}
              >
                <social.icon className="w-4 h-4 inline mr-2" />
                {social.name.toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left Side - Made with love */}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Made with</span>
              <FaHeart className="w-3 h-3 text-red-500 animate-pulse" />
              <span>and</span>
              <FaCode className="w-3 h-3 text-blue-500" />
              <span>for productive minds</span>
            </div>

            {/* Right Side - Links */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Link 
                href="/privacy" 
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link 
                href="/terms" 
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <span>•</span>
              <Link 
                href="/contact" 
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Links Row */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <h4 className="text-gray-300 font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li><Link href="/features" className="hover:text-white">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              <li><Link href="/updates" className="hover:text-white">Updates</Link></li>
              <li><Link href="/download" className="hover:text-white">Download</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-300 font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white">Careers</Link></li>
              <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              <li><Link href="/press" className="hover:text-white">Press</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-300 font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/tutorials" className="hover:text-white">Tutorials</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/status" className="hover:text-white">Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-gray-300 font-semibold mb-3">Connect</h4>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li><Link href="/community" className="hover:text-white">Community</Link></li>
              <li><Link href="/twitter" className="hover:text-white">Twitter</Link></li>
              <li><Link href="/facebook" className="hover:text-white">Facebook</Link></li>
              <li><Link href="/linkedin" className="hover:text-white">LinkedIn</Link></li>
            </ul>
          </div>
        </div>

        {/* Mobile App Badges */}
        <div className="mt-8 flex justify-center gap-4">
          <div className="bg-gray-800 hover:bg-gray-700 transition-colors p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FaCode className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400">Available on</p>
                <p className="text-sm">Web App</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800 hover:bg-gray-700 transition-colors p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-400">Coming soon</p>
                <p className="text-sm">iOS App</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}