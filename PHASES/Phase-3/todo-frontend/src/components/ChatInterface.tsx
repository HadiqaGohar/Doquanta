'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageCircle, Mic, Paperclip, Maximize, Minimize, Menu, Plus, Moon, Sun, Sparkles, Bot, User, Copy, Edit3, Volume2, VolumeX } from 'lucide-react';
import { useUser } from '@/features/auth/hooks';
import TaskPanel from './TaskPanel';
import { useTheme } from '@/contexts/ThemeContext';
import ChatWelcomeScreen from './ChatWelcomeScreen';
import ChatNotification from './ChatNotification';

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
      content: 'Hello! I\'m your DoQuanta AI assistant. How can I help you today? ✨',
      sender: 'ai',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isCompact, setIsCompact] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    isVisible: boolean;
  }>({ type: 'info', message: '', isVisible: false });
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Play notification sound
  const playNotificationSound = () => {
    if (soundEnabled) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

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
    setIsTyping(true);

    try {
      // Simulate typing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000));

      // API call to backend via Next.js API route
      const response = await fetch('/api/chat/ask-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
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
        playNotificationSound();
        showNotification('success', 'Message sent successfully!');
      } else {
        const errorData = await response.json();
        const aiMessage: Message = {
          id: Date.now().toString(),
          content: `I'm sorry, but I encountered an issue: ${errorData.detail || 'Something went wrong while processing your request. Please try again.'}`,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        showNotification('error', 'Failed to send message. Please try again.');
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
      showNotification('error', 'Connection error. Please check your internet.');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleVoiceInput = () => {
    // In a real app, this would start speech recognition
    showNotification('info', 'Voice input feature coming soon!');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would process the file
      setInputValue(`Uploaded file: ${file.name}`);
      showNotification('success', `File "${file.name}" attached successfully!`);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const toggleCompact = () => {
    setIsCompact(!isCompact);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setNotification({
      type: 'success',
      message: 'Message copied to clipboard!',
      isVisible: true
    });
  };

  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message, isVisible: true });
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed ${isFullScreen ? 'inset-0' : 'bottom-20 right-6'} ${
      isFullScreen 
        ? 'w-screen h-screen max-w-none rounded-none' 
        : isCompact 
          ? 'w-96 h-[32rem]' 
          : 'w-[28rem] h-[36rem]'
    } glass-morphism rounded-2xl shadow-2xl flex z-50 overflow-hidden flex-col transition-all duration-500 ease-out animate-scale-in`}>
      
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-cyan-50/50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-cyan-950/20 animate-gradient-shift"></div>
      
      {/* Main Chat Area */}
      <div className="relative flex-1 flex flex-col min-h-0">
        {/* Enhanced Chat Header */}
        <div className={`${isFullScreen ? 'rounded-none' : 'rounded-t-2xl'} bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white p-4 flex items-center justify-between shrink-0 shadow-lg animate-gradient-shift`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mx-auto mt-0.5"></div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">DoQuanta AI</h3>
              <p className="text-xs text-white/80">
                {isTyping ? (
                  <span className="flex items-center gap-1">
                    <span>Typing</span>
                    <div className="typing-indicator">
                      <div className="w-1 h-1 bg-white/60 rounded-full animate-typing-dots"></div>
                      <div className="w-1 h-1 bg-white/60 rounded-full animate-typing-dots" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1 h-1 bg-white/60 rounded-full animate-typing-dots" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </span>
                ) : 'Online • Ready to help'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover-lift"
              aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover-lift"
              aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
            >
              {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 hover-lift"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Enhanced Messages Container */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-800/50">
          {messages.length <= 1 ? (
            // Show welcome screen when only the initial AI greeting exists
            <ChatWelcomeScreen onQuickAction={(action) => setInputValue(action)} />
          ) : (
            // Show messages when conversation has started
            <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} relative group message-bubble-enter`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 relative transition-all duration-200 hover-lift ${
                      message.sender === 'user'
                        ? 'message-bubble-user text-white rounded-br-md shadow-md'
                        : 'message-bubble-ai text-gray-800 dark:text-gray-200 rounded-bl-md shadow-md'
                    }`}
                  >
                    {/* Message Avatar */}
                    <div className={`absolute -top-2 ${message.sender === 'user' ? '-right-2' : '-left-2'} w-6 h-6 rounded-full flex items-center justify-center text-xs animate-float ${
                      message.sender === 'user' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white animate-gradient-shift'
                    }`}>
                      {message.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>

                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                    <div className={`text-xs mt-2 flex items-center justify-between ${
                      message.sender === 'user' ? 'text-emerald-100' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      
                      {/* Action buttons that appear on hover */}
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity duration-200">
                        <button
                          onClick={() => copyMessage(message.content)}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors hover-lift"
                          aria-label="Copy message"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setInputValue(message.content)}
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors hover-lift"
                          aria-label="Edit message"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Enhanced Loading Animation */}
              {isLoading && (
                <div className="flex justify-start animate-slide-in-bottom">
                  <div className="message-bubble-ai text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-md">
                    <div className="flex items-center space-x-3">
                      <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4 glass-morphism shrink-0">
          <form onSubmit={handleSend} className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full border border-gray-300/50 dark:border-gray-600/50 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 shadow-sm glass-morphism text-gray-900 dark:text-gray-100 transition-all duration-200 hover-lift"
                  disabled={isLoading}
                />
                {/* Character count or typing indicator */}
                {inputValue && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 animate-fade-in">
                    {inputValue.length}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className="p-3 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 border border-gray-300/50 dark:border-gray-600/50 shrink-0 glass-morphism hover-lift"
                  aria-label="Voice input"
                >
                  <Mic className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200 border border-gray-300/50 dark:border-gray-600/50 shrink-0 glass-morphism hover-lift"
                  aria-label="Attach file"
                >
                  <Paperclip className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="button-primary text-white rounded-xl p-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shrink-0 transform transition-all duration-200 active:scale-95"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {['Add task', 'Schedule meeting', 'Set reminder', 'Help'].map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => setInputValue(action)}
                  className="px-3 py-1.5 text-xs glass-morphism hover:bg-gray-200/80 dark:hover:bg-gray-600/80 rounded-full transition-all duration-200 whitespace-nowrap border border-gray-200/50 dark:border-gray-600/50 hover-lift animate-fade-in"
                  style={{ animationDelay: `${['Add task', 'Schedule meeting', 'Set reminder', 'Help'].indexOf(action) * 100}ms` }}
                >
                  {action}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,application/pdf,.txt,.doc,.docx"
      />

      {/* Notification System */}
      <ChatNotification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={() => setNotification(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}