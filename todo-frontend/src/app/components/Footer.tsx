"use client";
import Link from "next/link";

import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaArrowUp,
  FaHeart,
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "GitHub",
      icon: FaGithub,
      url: "https://github.com",
      color: "hover:text-[#AADE81] hover:border-[#AADE81]",
    },
    {
      name: "LinkedIn",
      icon: FaLinkedin,
      url: "https://linkedin.com",
      color: "hover:text-[#AADE81] hover:border-[#AADE81]",
    },
    {
      name: "Twitter",
      icon: FaTwitter,
      url: "https://twitter.com",
      color: "hover:text-[#AADE81] hover:border-[#AADE81]",
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#282828] text-white py-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        {/* Top Section - Simplified for Todo App */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-gray-400 text-sm">
            © {currentYear} DoQuanta - Stay Productive
          </div>
          <button
          
            onClick={scrollToTop}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
            aria-label="Scroll to top"
          >
            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center group-hover:bg-[#AADE81] transition-colors">
              <FaArrowUp className="w-3 h-3" />
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 pt-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left Side - Made with love */}
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <span>Made with</span>
              <FaHeart className="w-3 h-3 text-red-500 animate-pulse" />
              <span>for productive minds</span>
            </div>

            {/* Right Side - Essential Links */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Link
                href="/privacy"
                className="hover:text-[#AADE81] transition-colors"
              >
                Privacy Policy
              </Link>
              <span>•</span>
              <Link
                href="/terms"
                className="hover:text-[#AADE81] transition-colors"
              >
                Terms
              </Link>
              <span>•</span>
              <Link
                href="/contact"
                className="hover:text-[#AADE81] transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 border border-gray-700 rounded-full text-gray-400 transition-all duration-300 text-sm tracking-wider ${social.color}`}
              aria-label={social.name}
            >
              <social.icon className="w-4 h-4 inline mr-2" />
              {social.name}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}