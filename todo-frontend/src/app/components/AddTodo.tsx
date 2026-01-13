'use client';

import { useState } from 'react';
import { Plus, Calendar, Flag, Tag, Sparkles, Zap } from 'lucide-react';
import { useUser } from '@/features/auth/hooks';
import { useTasks } from '@/features/tasks/hooks';
import { categoryOptions, priorityOptions } from '@/features/tasks/config';
import { TaskCategory, TaskPriority } from '@/features/tasks/types';

export default function AddTodo() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useUser();
  const { addTask } = useTasks();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim() && user?.id) {
      let parsedDate = null;
      if (dueDate) {
        const [y, m, d] = dueDate.split('-').map(Number);
        parsedDate = new Date(y, m - 1, d);
      }
      
      addTask.mutate({
        title: title.trim(),
        description: '',
        category: category as TaskCategory,
        priority: priority as TaskPriority,
        due_date: parsedDate,
      }, {
        onSuccess: () => {
          setTitle('');
          setCategory('other');
          setPriority('medium');
          setDueDate('');
          setIsExpanded(false);
        }
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-pink-500';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'low': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '🏠';
      case 'health': return '🏃';
      case 'learning': return '📚';
      case 'shopping': return '🛒';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Main Input */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder="✨ What would you like to accomplish?"
                className="w-full px-6 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
              />
              {title && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                  {title.length}/100
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={addTask.isPending || !title.trim()}
              className={`px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 font-semibold transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                addTask.isPending ? 'animate-pulse' : ''
              }`}
            >
              {addTask.isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add Task
                </>
              )}
            </button>
          </div>
        </div>

        {/* Expanded Options */}
        <div className={`transition-all duration-500 ease-out overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {/* Category Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 shadow-md hover:shadow-lg transition-all duration-200 appearance-none cursor-pointer"
                >
                  {categoryOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {getCategoryIcon(opt.value)} {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Priority Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Flag className="w-4 h-4" />
                Priority
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 shadow-md hover:shadow-lg transition-all duration-200 appearance-none cursor-pointer"
                >
                  {priorityOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value === 'high' ? '🔥' : opt.value === 'medium' ? '⚡' : '🌱'} {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getPriorityColor(priority)}`}></div>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 shadow-md hover:shadow-lg transition-all duration-200"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">Quick add:</span>
            {[
              { text: "📧 Check emails", category: "work", priority: "medium" },
              { text: "🏃 Morning workout", category: "health", priority: "high" },
              { text: "🛒 Buy groceries", category: "shopping", priority: "low" },
              { text: "📚 Read for 30 min", category: "learning", priority: "medium" }
            ].map((quick, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setTitle(quick.text);
                  setCategory(quick.category);
                  setPriority(quick.priority);
                }}
                className="px-3 py-1.5 text-xs bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900 dark:hover:to-purple-900 text-gray-700 dark:text-gray-300 rounded-full transition-all duration-200 hover:shadow-md transform hover:scale-105"
              >
                {quick.text}
              </button>
            ))}
          </div>

          {/* Collapse Button */}
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4 transform rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Less options
            </button>
          </div>
        </div>
      </form>

      {/* Success Animation */}
      {addTask.isSuccess && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Task added successfully! 🎉</span>
          </div>
        </div>
      )}
    </div>
  );
}