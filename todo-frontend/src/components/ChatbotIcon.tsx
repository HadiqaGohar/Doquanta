import { MessageCircle, Sparkles, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import ChatInterface from './ChatInterface';

const ChatbotIcon: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showPulse, setShowPulse] = useState(true);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setShowPulse(false);
  };

  // Show pulse animation periodically to attract attention
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isChatOpen) {
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), 3000);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isChatOpen]);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Pulse rings for attention */}
        {showPulse && !isChatOpen && (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-ping opacity-20"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 animate-ping opacity-30 animation-delay-75"></div>
          </>
        )}
        
        {/* Main button */}
        <button
          onClick={toggleChat}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`
            relative w-16 h-16 rounded-full
            bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600
            hover:from-emerald-500 hover:via-teal-600 hover:to-cyan-700
            text-white shadow-2xl hover:shadow-emerald-500/25
            transition-all duration-500 ease-out
            transform hover:scale-110 active:scale-95
            flex items-center justify-center
            border-2 border-white/20 backdrop-blur-sm
            group overflow-hidden
            ${isChatOpen ? 'rotate-180' : 'rotate-0'}
          `}
          aria-label={isChatOpen ? "Close chat" : "Open AI Assistant"}
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
          
          {/* Sparkle effects */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <Sparkles className={`absolute top-2 right-2 w-3 h-3 text-white/60 transition-all duration-700 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
            <Sparkles className={`absolute bottom-2 left-2 w-2 h-2 text-white/40 transition-all duration-500 delay-100 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
          </div>
          
          {/* Icon with smooth transition */}
          <div className="relative z-10 transition-all duration-300">
            {isChatOpen ? (
              <X className="w-7 h-7 transition-transform duration-300" />
            ) : (
              <MessageCircle className="w-7 h-7 transition-transform duration-300" />
            )}
          </div>
          
          {/* Ripple effect on click */}
          <div className="absolute inset-0 rounded-full bg-white/20 scale-0 group-active:scale-100 transition-transform duration-200"></div>
        </button>

        {/* Tooltip */}
        {isHovered && !isChatOpen && (
          <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap transform transition-all duration-200 animate-in slide-in-from-bottom-2">
            Chat with DoQuanta AI
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}

        {/* Status indicator */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
          <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Chat Interface */}
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default ChatbotIcon;