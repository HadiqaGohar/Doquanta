'use client';

import { TaskList } from '@/components/tasks/task-list';
import AddTodo from '@/app/components/AddTodo';
import { CheckCircle, Plus, Calendar, CheckCircle as CheckIcon, Circle, ListTodo, Archive } from 'lucide-react';
import { useTasks } from '@/features/tasks/hooks';
import Link from 'next/link';

export default function TasksPage() {
  const { stats } = useTasks();

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">All Tasks</h1>
        <p className="text-gray-600">Manage and organize all your tasks</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <AddTodo />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Your Tasks</h2>
          <div className="flex space-x-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Total: {stats?.total || 0}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              Completed: {stats?.completed || 0}
            </span>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
              Pending: {stats?.active || 0}
            </span>
          </div>
        </div>
        
        <TaskList />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/dashboard/tasks/new" className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center hover:bg-blue-100 transition-colors">
          <Plus className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800">Add New Task</h3>
          <p className="text-sm text-gray-600 mt-1">Create a new task</p>
        </Link>
        
        <Link href="/dashboard/tasks/completed" className="bg-green-50 border border-green-200 rounded-lg p-6 text-center hover:bg-green-100 transition-colors">
          <CheckIcon className="h-10 w-10 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800">Completed Tasks</h3>
          <p className="text-sm text-gray-600 mt-1">View completed tasks</p>
        </Link>
        
        <Link href="/dashboard/tasks/pending" className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center hover:bg-yellow-100 transition-colors">
          <Circle className="h-10 w-10 text-yellow-600 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-800">Pending Tasks</h3>
          <p className="text-sm text-gray-600 mt-1">View pending tasks</p>
        </Link>
      </div>
    </div>
  );
}