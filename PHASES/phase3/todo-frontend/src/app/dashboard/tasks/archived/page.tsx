'use client';

import { Archive, Filter, Search, Calendar, FileText } from 'lucide-react';
import { useTasks } from '@/features/tasks/hooks';

export default function ArchivedTasksPage() {
  // For now, we'll show all tasks since archiving functionality isn't implemented yet
  // In a real app, this would filter for archived tasks
  const { tasks, stats, isLoading, updateFilters } = useTasks();

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Archived Tasks</h1>
        <p className="text-gray-600">Tasks that have been archived</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Archive className="h-6 w-6 text-gray-600" />
            <span className="text-lg font-semibold">
              {tasks.length} archived tasks
            </span>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search archived tasks..."
                className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64"
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <Archive className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No archived tasks</h3>
            <p className="text-gray-500">Tasks you archive will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className="p-4 border rounded-lg bg-gray-50 border-gray-200"
              >
                <div className="flex items-start">
                  <Archive className="h-5 w-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-600 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}