'use client';

import { 
  Archive, 
  Filter, 
  Search, 
  Calendar, 
  FileText,
  ArrowLeft,
  History,
  FolderOpen,
  Clock,
  Database,
  BookOpen,
  Layers,
  Package,
  Star,
  TrendingUp,
  Activity,
  RotateCcw,
  Trash2,
  Eye
} from 'lucide-react';
import { useTasks } from '@/features/tasks/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useState } from 'react';

export default function ArchivedTasksPage() {
  // For now, we'll show completed tasks as archived since archiving functionality isn't implemented yet
  // In a real app, this would filter for archived tasks
  const { tasks, stats, isLoading, updateFilters, toggleTaskCompletion } = useTasks({ completed: true });
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate archive stats
  const totalArchived = tasks.length;
  const thisMonthArchived = tasks.filter(task => {
    if (!task.completed_at) return false;
    const completedDate = new Date(task.completed_at);
    const now = new Date();
    return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear();
  }).length;

  const thisYearArchived = tasks.filter(task => {
    if (!task.completed_at) return false;
    const completedDate = new Date(task.completed_at);
    const now = new Date();
    return completedDate.getFullYear() === now.getFullYear();
  }).length;

  const oldestTask = tasks.reduce((oldest, task) => {
    if (!task.completed_at) return oldest;
    if (!oldest || new Date(task.completed_at) < new Date(oldest.completed_at)) {
      return task;
    }
    return oldest;
  }, null as any);

  const handleRestore = (taskId: string) => {
    toggleTaskCompletion.mutate({ id: taskId, completed: false });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    updateFilters({ search: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background Elements - Archive Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-slate-400/20 to-gray-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-gray-400/10 to-slate-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header - Archive Theme */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard/tasks">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Tasks
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                  <Archive className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-gray-800 dark:from-white dark:via-slate-200 dark:to-gray-200 bg-clip-text text-transparent">
                    Archived Tasks
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Your historical task collection and achievements 🗃️
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">
                  {totalArchived}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Archived
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {thisMonthArchived}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  This Month
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {thisYearArchived}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  This Year
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards - Archive Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-500 via-slate-600 to-gray-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-100">
                Total Archived
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Database className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{totalArchived}</div>
              <p className="text-slate-100 text-sm flex items-center gap-1">
                <Package className="w-4 h-4" />
                Total collection
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-indigo-100">
                This Month
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{thisMonthArchived}</div>
              <p className="text-indigo-100 text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Recent additions
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-gray-500 via-gray-600 to-slate-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-gray-100">
                This Year
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{thisYearArchived}</div>
              <p className="text-gray-100 text-sm flex items-center gap-1">
                <Star className="w-4 h-4" />
                Annual progress
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">
                Archive History
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <History className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {oldestTask ? new Date(oldestTask.completed_at).getFullYear() : new Date().getFullYear()}
              </div>
              <p className="text-blue-100 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Since year
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 mb-8 animate-slide-up delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-slate-400 to-gray-600 rounded-xl text-white">
                <Search className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Search Archive
              </span>
              <div className="ml-auto px-3 py-1 bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-900 dark:to-gray-900 rounded-full text-xs font-medium text-slate-700 dark:text-slate-300">
                {filteredTasks.length} found
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-4 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search archived tasks by title or description..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-slate-500 dark:focus:border-slate-400 rounded-xl"
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-6 py-3 h-12 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/20 border-slate-200 dark:border-slate-800"
              >
                <Filter className="h-4 w-4" />
                Advanced Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Archived Tasks List */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-gray-400 to-slate-600 rounded-xl text-white">
                <FolderOpen className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Historical Collection
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-slate-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Archive className="h-6 w-6 text-slate-500" />
                  </div>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-gray-100 dark:from-slate-900 dark:to-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Archive className="w-12 h-12 text-slate-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {searchQuery ? 'No matching archived tasks' : 'No archived tasks yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Complete some tasks to build your archive collection!'
                  }
                </p>
                {!searchQuery && (
                  <Link href="/dashboard/tasks">
                    <Button className="bg-gradient-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Active Tasks
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task, index) => (
                  <div 
                    key={task.id} 
                    className="group p-6 border rounded-2xl bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20 border-slate-200 dark:border-slate-800 hover:from-slate-100 hover:to-gray-100 dark:hover:from-slate-900/30 dark:hover:to-gray-900/30 transition-all duration-200 animate-slide-up"
                    style={{ animationDelay: `${500 + index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-slate-500 rounded-xl text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                        <Archive className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-gray-600 dark:text-gray-400 mt-2">
                                {task.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestore(task.id)}
                              className="hover:bg-slate-100 dark:hover:bg-slate-900/30 rounded-xl"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Restore
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="hover:bg-slate-100 dark:hover:bg-slate-900/30 rounded-xl"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          {task.due_date && (
                            <span className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-gray-700 dark:text-gray-300">
                              <Calendar className="h-3 w-3 text-slate-600" />
                              <span>
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            </span>
                          )}
                          
                          {task.completed_at && (
                            <span className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-gray-700 dark:text-gray-300">
                              <History className="h-3 w-3 text-slate-600" />
                              <span>
                                Archived: {new Date(task.completed_at).toLocaleDateString()}
                              </span>
                            </span>
                          )}
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.priority === 'high' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                            task.priority === 'medium' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {task.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}