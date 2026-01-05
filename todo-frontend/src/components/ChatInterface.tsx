'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Mic, Paperclip, Maximize, Minimize, Menu, Plus, Moon, Sun } from 'lucide-react';
import { useUser } from '@/features/auth/hooks';
import TaskPanel from './TaskPanel';
import { useTheme } from '@/contexts/ThemeContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  reminderTime?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  recurrenceInterval?: number;
  recurrenceEndDate?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
}

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatInterface({ isOpen, onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your DoQuanta AI assistant. How can I help you today?',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCompact, setIsCompact] = useState(true); // New state for compact mode
  // Removed sidebar functionality and chat history since we're making a compact interface
  const [tasks, setTasks] = useState<Task[]>([]);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Task management functions
  const handleTaskAction = (taskId: number, action: 'complete' | 'edit' | 'delete', updatedTask?: Partial<Task>) => {
    if (action === 'complete') {
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      ));
    } else if (action === 'edit' && updatedTask) {
      setTasks(prev => prev.map(task =>
        task.id === taskId ? { ...task, ...updatedTask } : task
      ));
    } else if (action === 'delete') {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  // Function to extract task information from AI response
  const extractTaskFromResponse = (content: string): Partial<Task> | null => {
    // Pattern matching to extract task information from AI response
    const taskMatch = content.match(/(?:created|added|Task) "([^"]+)"(?: has been)?(?: successfully)?/i);
    if (taskMatch) {
      const title = taskMatch[1];

      // Extract due date if mentioned
      const dueDateMatch = content.match(/due date:?\s*([^,.\n]+)/i);
      let dueDate: string | undefined;
      if (dueDateMatch) {
        const dueDateStr = dueDateMatch[1].trim();
        // Try to parse the date string
        const parsedDate = new Date(dueDateStr);
        if (!isNaN(parsedDate.getTime())) {
          dueDate = parsedDate.toISOString();
        }
      }

      // Extract reminder time if mentioned
      const reminderMatch = content.match(/reminder:?\s*([^,.\n]+)/i);
      let reminderTime: string | undefined;
      if (reminderMatch) {
        const reminderStr = reminderMatch[1].trim();
        // Try to parse the time string
        const parsedTime = new Date(reminderStr);
        if (!isNaN(parsedTime.getTime())) {
          reminderTime = parsedTime.toISOString();
        }
      }

      // Extract priority if mentioned
      let priority: 'low' | 'medium' | 'high' | undefined;
      if (content.toLowerCase().includes('high priority') || content.toLowerCase().includes('priority: high')) {
        priority = 'high';
      } else if (content.toLowerCase().includes('low priority') || content.toLowerCase().includes('priority: low')) {
        priority = 'low';
      } else if (content.toLowerCase().includes('medium priority') || content.toLowerCase().includes('priority: medium')) {
        priority = 'medium';
      }

      // Extract category if mentioned
      const categoryMatch = content.match(/category:?\s*([^,.\n]+)/i);
      let category: string | undefined;
      if (categoryMatch) {
        category = categoryMatch[1].trim();
      }

      // Extract recurring information if mentioned
      let isRecurring: boolean | undefined;
      if (content.toLowerCase().includes('recurring') || content.toLowerCase().includes('repeat')) {
        isRecurring = true;
      }

      return {
        title,
        completed: false,
        priority: priority || 'medium',
        category: category || 'general',
        dueDate,
        reminderTime,
        isRecurring,
        createdAt: new Date().toISOString()
      };
    }
    return null;
  };

  // Function to determine if AI needs clarification
  const needsClarification = (userInput: string): boolean => {
    // Check if the input is too vague or ambiguous
    const vaguePhrases = [
      'something', 'that thing', 'the thing', 'it', 'that',
      'um', 'uh', 'kind of', 'sort of', 'maybe'
    ];

    const lowerInput = userInput.toLowerCase();
    return vaguePhrases.some(phrase => lowerInput.includes(phrase));
  };

  // Function to suggest priority gently
  const suggestPriority = (userInput: string): 'low' | 'medium' | 'high' | null => {
    if (userInput.toLowerCase().includes('urgent') ||
        userInput.toLowerCase().includes('asap') ||
        userInput.toLowerCase().includes('immediately')) {
      return 'high';
    } else if (userInput.toLowerCase().includes('later') ||
               userInput.toLowerCase().includes('eventually')) {
      return 'low';
    }
    return null;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // API call to backend via Next.js API route
      const response = await fetch('/api/chat/ask-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          // Removed session_id since we're not using chat history
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Format the AI response to be short and scannable
        let formattedContent = data.message?.content || 'I\'m sorry, I didn\'t understand that.';

        // Ensure the response follows the clean, professional tone and is scannable
        if (formattedContent.includes('Task')) {
          // Format task confirmation messages to be clear and concise
          formattedContent = formattedContent.replace(/Task "(.+)" has been (created|added) successfully!/, '✅ $1 added');
          formattedContent = formattedContent.replace(/Task "(.+)" has been (completed|marked as complete)!/, '✅ $1 completed');
          formattedContent = formattedContent.replace(/Task "(.+)" has been (deleted|removed)!/, '🗑 $1 deleted');
          formattedContent = formattedContent.replace(/Task "(.+)" has been (updated|modified)!/, '✏ $1 updated');

          // Additional formatting for other task operations
          formattedContent = formattedContent.replace(/Tasks? "(.+)" (have been|has been) (completed|marked as complete)/, '✅ $1 completed');
          formattedContent = formattedContent.replace(/Tasks? "(.+)" (have been|has been) (deleted|removed)/, '🗑 $1 deleted');
        }

        // Format other common AI responses to be more concise
        if (formattedContent.includes('meeting') || formattedContent.includes('appointment')) {
          formattedContent = formattedContent.replace(/(Meeting|Appointment) "(.+)" has been added for (.+)/, '📅 $2 on $3');
          formattedContent = formattedContent.replace(/(Meeting|Appointment) added for (.+)/, '📅 Meeting on $2');
        }

        // Ensure responses are concise and scannable
        const sentences = formattedContent.split('. ');
        if (sentences.length > 2) {
          // If there are multiple sentences, only show the first one or two for scannability
          formattedContent = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '...' : '');
        }

        // Extract task information from the AI response and add to tasks list
        const newTask = extractTaskFromResponse(formattedContent);
        if (newTask) {
          // Determine priority based on user input
          const prioritySuggestion = suggestPriority(inputValue);
          const finalPriority = prioritySuggestion || (newTask.priority || 'medium');

          // Generate a new ID for the task
          const newTaskId = Math.max(0, ...tasks.map(t => t.id)) + 1;
          const taskToAdd: Task = {
            id: newTaskId,
            title: newTask.title || 'New Task',
            completed: newTask.completed || false,
            priority: finalPriority,
            category: newTask.category || 'general',
            createdAt: newTask.createdAt || new Date().toISOString(),
            description: newTask.description,
            dueDate: newTask.dueDate,
            reminderTime: newTask.reminderTime,
            isRecurring: newTask.isRecurring,
            recurrencePattern: newTask.recurrencePattern,
            recurrenceInterval: newTask.recurrenceInterval,
            recurrenceEndDate: newTask.recurrenceEndDate
          };
          setTasks(prev => [...prev, taskToAdd]);

          // If a priority suggestion was made, add a gentle notification to the chat
          if (prioritySuggestion) {
            const priorityNotification: Message = {
              id: Date.now().toString(),
              content: `💡 I marked this as ${prioritySuggestion} priority. Adjust if needed.`,
              sender: 'ai',
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, priorityNotification]);
          }
        }

        const aiMessage: Message = {
          id: Date.now().toString(),
          content: formattedContent,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorData = await response.json();
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: `I'm sorry, but I encountered an issue: ${errorData.detail || 'Something went wrong while processing your request. Please try again.'}`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: 'It seems I\'m having trouble connecting to the AI service. This could be due to:\n• Network connectivity issues\n• Server temporarily unavailable\n• API rate limits\n\nPlease check your internet connection and try again in a moment.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
      // Removed saving chat history since we're not using chat sessions
    }
  };

  const handleVoiceInput = () => {
    // In a real app, this would start speech recognition
    alert('Voice input would start here. This is a placeholder for speech recognition functionality.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would process the file
      setInputValue(`Uploaded file: ${file.name}`);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const toggleCompact = () => {
    setIsCompact(!isCompact);
  };


  if (!isOpen) return null;

  return (
    <div className={`fixed ${isFullScreen ? 'top-0 left-0' : 'bottom-4 right-4'} ${isFullScreen ? 'w-screen h-screen max-w-none rounded-none' : isCompact ? 'w-full max-w-xs h-[50vh]' : 'w-full max-w-lg h-[70vh]'} bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 flex z-50 overflow-hidden flex-col`}>
      {/* Main Chat Area - No sidebar for compact view */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat Header */}
        <div className={`${isFullScreen ? 'rounded-none' : 'rounded-t-xl md:rounded-none'} bg-gradient-to-r from-[#aade81] to-[#8bc34a] text-white p-3 md:p-4 flex items-center justify-between shrink-0`}>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="font-bold text-sm md:text-base">DoQuanta AI Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={toggleCompact}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label={isCompact ? "Expand chat" : "Compact chat"}
            >
              {isCompact ? <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                <path d="M21 16h-3a2 2 0 0 1-2 2v3"></path>
                <path d="M8 21v-3a2 2 0 0 1 2-2h3"></path>
              </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
                <path d="M12 3v6"></path>
              </svg>}
            </button> */}
            {/* <button
              onClick={toggleTheme}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button> */}
            <button
              onClick={toggleFullScreen}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
            >
              
              {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 bg-gray-50 dark:bg-gray-700">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} relative group`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 md:px-4 md:py-3 relative ${
                  message.sender === 'user'
                    ? 'bg-[#aade81] text-white rounded-br-none'
                    : 'bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-200 dark:border-gray-600 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm md:text-base">{message.content}</div>
                <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-[#e6f7e0]' : 'text-gray-500 dark:text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                {/* Action buttons that appear on hover */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                  <button
                    onClick={() => navigator.clipboard.writeText(message.content)}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-gray-500"
                    aria-label="Copy message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => setInputValue(message.content)}
                    className="p-1 rounded hover:bg-black/10 dark:hover:bg-gray-500"
                    aria-label="Edit message"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none px-3 py-2 md:px-4 md:py-3 border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Thinking...</span>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="border-t border-gray-200 dark:border-gray-600 p-3 md:p-4 bg-white dark:bg-gray-800 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a task or ask something…"
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#aade81] focus:border-transparent shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={isLoading}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleVoiceInput}
                className="p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600 shrink-0"
                aria-label="Voice input"
              >
                <Mic className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-[#aade81] text-gray-900 rounded-xl p-3 hover:bg-[#8bc34a] disabled:opacity-50 transition-colors shadow-sm shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Task Panel - Hidden on mobile by default, can be toggled */}
      {/* <div className="hidden md:flex">
        <TaskPanel onTaskAction={handleTaskAction} tasks={tasks} />
      </div> */}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,.txt,.doc,.docx"
      />
    </div>
  );
}