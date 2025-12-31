import { MessageCircle } from "lucide-react";
import React from "react";

interface ChatbotIconProps {
  onClick?: () => void;
}

const ChatbotIcon: React.FC<ChatbotIconProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        fixed
        bottom-6
        right-6
        w-14
        h-14
        rounded-full
        bg-gradient-to-r
        from-blue-500
        to-purple-600
        text-white
        shadow-lg
        hover:shadow-xl
        hover:from-blue-600
        hover:to-purple-700
        transition-all
        duration-300
        z-50
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
  );
};

export default ChatbotIcon;