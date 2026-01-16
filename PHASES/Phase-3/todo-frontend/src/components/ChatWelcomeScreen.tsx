import React from "react";
import {
  Sparkles,
  MessageCircle,
  Zap,
  Brain,
  Clock,
  Target,
} from "lucide-react";

interface ChatWelcomeScreenProps {
  onQuickAction: (action: string) => void;
}

const ChatWelcomeScreen: React.FC<ChatWelcomeScreenProps> = ({
  onQuickAction,
}) => {
  const quickActions = [
    {
      icon: Target,
      title: "Add a task",
      description: "Create a new todo item",
      action: "Add task: ",
      color: "from-emerald-400 to-teal-500",
    },
    {
      icon: Clock,
      title: "Set reminder",
      description: "Schedule a notification",
      action: "Set reminder for ",
      color: "from-blue-400 to-cyan-500",
    },
    {
      icon: Brain,
      title: "Ask AI",
      description: "Get help with anything",
      action: "Help me with ",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: Zap,
      title: "Quick action",
      description: "Automate your workflow",
      action: "Create a workflow for ",
      color: "from-orange-400 to-red-500",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      {/* Welcome Header */}
      <div className="mb-8 ">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg animate-gradient-shift">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Welcome to DoQuanta AI
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Your intelligent assistant is ready to help you manage tasks, set
          reminders, and boost your productivity.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md mb-6">
        {quickActions.map((action, index) => (
          <button
            key={action.title}
            onClick={() => onQuickAction(action.action)}
            className={`p-4 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 hover-lift animate-scale-in`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <action.icon className="w-6 h-6 mx-auto mb-2" />
            <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
            <p className="text-xs opacity-90">{action.description}</p>
          </button>
        ))}
      </div>

      {/* Features List */}
      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 animate-slide-in-bottom">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
          <span>Natural language task creation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
          <span>Smart scheduling and reminders</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          <span>Intelligent productivity insights</span>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-6 animate-bounce-gentle">
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
          Try saying something like:
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            "Add meeting tomorrow at 2pm",
            "Remind me to call John",
            "What's on my schedule?",
          ].map((example, index) => (
            <button
              key={example}
              onClick={() => onQuickAction(example)}
              className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors animate-fade-in"
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              "{example}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatWelcomeScreen;
