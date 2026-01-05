import { useState, useEffect } from 'react';
import { Check, Edit3, Trash2, Calendar, Clock } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description?: string;
  
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: string;
  updatedAt?: string;
}

interface TaskPanelProps {
  onTaskAction: (taskId: number, action: 'complete' | 'edit' | 'delete', updatedTask?: Partial<Task>) => void;
  tasks: Task[];
}

export default function TaskPanel({ onTaskAction, tasks }: TaskPanelProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  // Group tasks by status
  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  // Toggle task details expansion
  const toggleTaskDetails = (taskId: number) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 w-80 flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          Your Tasks
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {/* Pending Tasks Section */}
        {pendingTasks.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2 py-1">Pending ({pendingTasks.length})</h4>
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-3 transition-all ${
                    task.priority === 'high' ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-900/20' :
                    task.priority === 'medium' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900/50 dark:bg-yellow-900/20' :
                    'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button
                        onClick={() => onTaskAction(task.id, 'complete')}
                        className="mt-0.5 flex-shrink-0"
                        aria-label="Complete task"
                      >
                        <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600">
                          {task.completed && <Check className="w-3 h-3 text-green-600" />}
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 dark:text-gray-200 truncate">{task.title}</div>
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => toggleTaskDetails(task.id)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        aria-label="Toggle details"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onTaskAction(task.id, 'delete')}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        aria-label="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {expandedTaskId === task.id && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                      {task.description && <p className="mb-1">{task.description}</p>}
                      <div className="text-xs flex gap-2">
                        <span className={`px-2 py-0.5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-2 py-1">Completed ({completedTasks.length})</h4>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50 rounded-lg p-3 opacity-75"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="mt-0.5 flex-shrink-0">
                        <div className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center bg-green-500">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 dark:text-gray-200 truncate line-through">{task.title}</div>
                        {task.dueDate && (
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => toggleTaskDetails(task.id)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
                        aria-label="Toggle details"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onTaskAction(task.id, 'delete')}
                        className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        aria-label="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {expandedTaskId === task.id && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
                      {task.description && <p className="mb-1">{task.description}</p>}
                      <div className="text-xs flex gap-2">
                        <span className={`px-2 py-0.5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="h-10 w-10 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs mt-1">Add a task using the chat</p>
          </div>
        )}
      </div>
    </div>
  );
}