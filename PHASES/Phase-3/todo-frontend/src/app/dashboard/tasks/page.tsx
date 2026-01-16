"use client";

import { TaskList } from "@/components/tasks/task-list";
import { TaskGrid } from "@/components/tasks/task-grid";
import { TaskListFiltered } from "@/components/tasks/task-list-filtered";
import AddTodo from "@/app/components/AddTodo";
import { Task } from "@/features/tasks/types";
import {
  CheckCircle,
  Plus,
  Calendar,
  CheckCircle as CheckIcon,
  Circle,
  ListTodo,
  Archive,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Clock,
  AlertCircle,
  Star,
  Zap,
  Target,
  Sparkles,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useTasks } from "@/features/tasks/hooks";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskStats {
  total: number;
  completed: number;
  active: number;
  overdue?: number;
}

interface FilterOptions {
  search: string;
  priority: "all" | "high" | "medium" | "low";
  category: "all" | string;
  status: "all" | "completed" | "pending" | "overdue";
  sortBy: "created_at" | "due_date" | "priority" | "title";
  sortOrder: "asc" | "desc";
}

export default function TasksPage() {
  const { stats, tasks, toggleTaskCompletion } = useTasks();
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filters, setFilters] = useState<FilterOptions>({
    search: "",
    priority: "all",
    category: "all",
    status: "all",
    sortBy: "created_at",
    sortOrder: "desc",
  });

  // Get unique categories from tasks
  const categories = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];
    const uniqueCategories = [
      ...new Set(tasks.map((task: Task) => task.category).filter(Boolean)),
    ];
    return uniqueCategories;
  }, [tasks]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return [];

    let filtered = tasks.filter((task: Task) => {
      // Search filter
      if (
        filters.search &&
        !task.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Priority filter
      if (filters.priority !== "all" && task.priority !== filters.priority) {
        return false;
      }

      // Category filter
      if (filters.category !== "all" && task.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status === "completed" && !task.completed) return false;
      if (filters.status === "pending" && task.completed) return false;
      if (filters.status === "overdue") {
        const isOverdue =
          task.due_date &&
          new Date(task.due_date) < new Date() &&
          !task.completed;
        if (!isOverdue) return false;
      }

      return true;
    });

    // Sort tasks
    filtered.sort((a: Task, b: Task) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case "due_date":
          aValue = a.due_date ? new Date(a.due_date).getTime() : 0;
          bValue = b.due_date ? new Date(b.due_date).getTime() : 0;
          break;
        default:
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tasks, filters]);

  // Calculate overdue tasks
  const overdueTasks = useMemo(() => {
    if (!tasks || !Array.isArray(tasks)) return 0;
    return tasks.filter(
      (task: Task) =>
        task.due_date && new Date(task.due_date) < new Date() && !task.completed
    ).length;
  }, [tasks]);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ListTodo className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                    All Tasks
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Manage and organize all your tasks efficiently ✨
                  </p>
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 p-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  viewMode === "list"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                <List className="w-4 h-4" />
                List
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Grid
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">
                Total Tasks
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <ListTodo className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{stats?.total || 0}</div>
              <p className="text-blue-100 text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                All tasks created
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-emerald-100">
                Completed
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {stats?.completed || 0}
              </div>
              <p className="text-emerald-100 text-sm flex items-center gap-1">
                <Star className="w-4 h-4" />
                Tasks finished
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-orange-100">
                Active
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {stats?.active || 0}
              </div>
              <p className="text-orange-100 text-sm flex items-center gap-1">
                <Zap className="w-4 h-4" />
                In progress
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-red-100">
                Overdue
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm animate-pulse">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{overdueTasks}</div>
              <p className="text-red-100 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Add Task */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 mb-8 animate-slide-up delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl text-white">
                <Plus className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Quick Add Task
              </span>
              <div className="ml-auto px-3 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-300">
                ⚡ Fast Track
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddTodo />
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 mb-8 animate-slide-up delay-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl">
                <Filter className="h-5 w-5 text-purple-600" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Filter & Search Tasks
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    handleFilterChange("priority", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 transition-all duration-200"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">🔥 High</option>
                  <option value="medium">⚡ Medium</option>
                  <option value="low">🌱 Low</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={filters.category}
                  onChange={(e) =>
                    handleFilterChange("category", e.target.value)
                  }
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 transition-all duration-200"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category: string) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 transition-all duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="completed">✅ Completed</option>
                  <option value="overdue">🚨 Overdue</option>
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <div className="flex gap-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    className="flex-1 px-3 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-gray-900 dark:text-gray-100 transition-all duration-200 text-sm"
                  >
                    <option value="created_at">Date</option>
                    <option value="title">Title</option>
                    <option value="priority">Priority</option>
                    <option value="due_date">Due Date</option>
                  </select>
                  <button
                    onClick={() =>
                      handleFilterChange(
                        "sortOrder",
                        filters.sortOrder === "asc" ? "desc" : "asc"
                      )
                    }
                    className="px-3 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/80 transition-all duration-200"
                  >
                    {filters.sortOrder === "asc" ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Display */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 mb-8 animate-slide-up delay-600">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-xl">
                  <Target className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Your Tasks ({filteredTasks.length})
                </span>
              </div>
              <div className="flex items-center gap-4">
                {/* Task Counter Controls */}
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                  <button
                    onClick={() => {
                      const activeTasks = filteredTasks.filter(
                        (t) => !t.completed
                      );
                      if (activeTasks.length > 0) {
                        const firstTask = activeTasks[0];
                        toggleTaskCompletion.mutate({
                          id: firstTask.id,
                          completed: true,
                        });
                      }
                    }}
                    disabled={
                      filteredTasks.filter((t) => !t.completed).length === 0
                    }
                    className="w-6 h-6 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                    title="Mark next task as completed"
                  >
                    +
                  </button>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {filteredTasks.filter((t) => t.completed).length} /{" "}
                    {filteredTasks.length}
                  </span>
                  <button
                    onClick={() => {
                      const completedTasks = filteredTasks.filter(
                        (t) => t.completed
                      );
                      if (completedTasks.length > 0) {
                        const firstTask = completedTasks[0];
                        toggleTaskCompletion.mutate({
                          id: firstTask.id,
                          completed: false,
                        });
                      }
                    }}
                    disabled={
                      filteredTasks.filter((t) => t.completed).length === 0
                    }
                    className="w-6 h-6 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                    title="Mark task as incomplete"
                  >
                    -
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>
                    Showing {filteredTasks.length} of {stats?.total || 0} tasks
                  </span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === "list" ? (
              <TaskListFiltered tasks={filteredTasks} />
            ) : (
              <TaskGrid tasks={filteredTasks} />
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up delay-700">
          <Link href="/dashboard/tasks/new" className="group">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Add New Task
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a new task with detailed options
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/tasks/completed" className="group">
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <CheckIcon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Completed Tasks
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and manage completed tasks
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/tasks/pending" className="group">
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Circle className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2">
                  Pending Tasks
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Focus on tasks that need attention
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
