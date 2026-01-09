'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useUser } from '@/features/auth/hooks';
import { useTasks } from '@/features/tasks/hooks';
import { categoryOptions, priorityOptions } from '@/features/tasks/config';
import { TaskCategory, TaskPriority } from '@/features/tasks/types';


export default function AddTodo() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState<string>('');
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
        }
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
        />
        <button
          type="submit"
          disabled={addTask.isPending}
          className={`bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center ${addTask.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Plus className="h-5 w-5 mr-2" />
          {addTask.isPending ? 'Adding...' : 'Add'}
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex flex-col flex-1">
          <label className="text-xs font-semibold text-gray-500 mb-1 ml-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-gray-900"
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col flex-1">
          <label className="text-xs font-semibold text-gray-500 mb-1 ml-1">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-gray-900"
          >
            {priorityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col flex-1">
          <label className="text-xs font-semibold text-gray-500 mb-1 ml-1">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white text-gray-900"
          />
        </div>
      </div>
    </form>
  );
}