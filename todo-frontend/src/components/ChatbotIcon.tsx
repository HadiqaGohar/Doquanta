import { MessageCircle } from "lucide-react";
import React, { useState } from "react";
import ChatInterface from './ChatInterface';

const ChatbotIcon: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="
          fixed
          bottom-6
          right-6
          w-14
          h-14
          rounded-full
          bg-gradient-to-r
          from-green-300
          to-lime-600
          text-white
          shadow-lg
          hover:shadow-xl
          hover:from-green-400
          hover:to-lime-700
          transition-all
          duration-300
          z-40
          flex
          items-center
          justify-center
          border-2
          border-white
        "
        aria-label="Open chatbot"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-xs text-white">
          3
        </span>
      </button>
      <ChatInterface isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
  
};

export default ChatbotIcon;