"use client";

import { TaskList } from "@/components/tasks/task-list";
import {
  Circle,
  Filter,
  Search,
  Clock,
  AlertCircle,
  Zap,
  Target,
  Flag,
  Calendar,
  ArrowLeft,
  CheckCircle,
  Star,
  Flame,
  TrendingUp,
  Activity,
  Timer,
  Rocket,
  Focus,
} from "lucide-react";
import { useTasks } from "@/features/tasks/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function PendingTasksPage() {
  const { tasks, stats, isLoading, updateFilters, toggleTaskCompletion } =
    useTasks({ completed: false });
  const [searchQuery, setSearchQuery] = useState("");

  // Filter tasks based on search
  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description &&
        task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Calculate urgency stats
  const now = new Date();
  const overdueTasks = tasks.filter(
    (task) => task.due_date && new Date(task.due_date) < now
  );

  const dueTodayTasks = tasks.filter((task) => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    return dueDate.toDateString() === now.toDateString();
  });

  const highPriorityTasks = tasks.filter((task) => task.priority === "high");

  const handleComplete = (taskId: string) => {
    toggleTaskCompletion.mutate({ id: taskId, completed: true });
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    updateFilters({ search: value });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "from-red-500 via-red-600 to-red-700";
      case "medium":
        return "from-amber-500 via-orange-500 to-red-500";
      case "low":
        return "from-blue-500 via-blue-600 to-indigo-600";
      default:
        return "from-gray-500 via-gray-600 to-gray-700";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Zap className="h-4 w-4" />;
      case "medium":
        return <Flag className="h-4 w-4" />;
      case "low":
        return <Target className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const isOverdue = (dueDate: string | null | undefined) => {
    if (!dueDate) return false;
    return new Date(dueDate) < now;
  };

  const isDueToday = (dueDate: string | null | undefined) => {
    if (!dueDate) return false;
    return new Date(dueDate).toDateString() === now.toDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background Elements - Action-Focused */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-amber-400/10 to-red-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header - Action-Focused */}
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
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 dark:from-white dark:via-orange-200 dark:to-red-200 bg-clip-text text-transparent">
                    Pending Tasks
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Time to take action and make progress! 💪
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.active || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Pending
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {overdueTasks.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Overdue
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {dueTodayTasks.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Today
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards - Urgency Focused */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-orange-100">
                Active Tasks
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Rocket className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {stats?.active || 0}
              </div>
              <p className="text-orange-100 text-sm flex items-center gap-1">
                <Target className="w-4 h-4" />
                Ready to tackle
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-red-100">
                Overdue Tasks
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm animate-pulse">
                <AlertCircle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {overdueTasks.length}
              </div>
              <p className="text-red-100 text-sm flex items-center gap-1">
                <Timer className="w-4 h-4" />
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-amber-100">
                Due Today
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Flame className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {dueTodayTasks.length}
              </div>
              <p className="text-amber-100 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Today's focus
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-purple-100">
                High Priority
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Zap className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {highPriorityTasks.length}
              </div>
              <p className="text-purple-100 text-sm flex items-center gap-1">
                <Star className="w-4 h-4" />
                Critical tasks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 mb-8 animate-slide-up delay-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-orange-400 to-red-600 rounded-xl text-white">
                <Search className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Find Your Tasks
              </span>
              <div className="ml-auto px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full text-xs font-medium text-orange-700 dark:text-orange-300">
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
                  placeholder="Search pending tasks by title or description..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-400 rounded-xl"
                />
              </div>
              <Button
                variant="outline"
                className="flex items-center gap-2 px-6 py-3 h-12 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 border-orange-200 dark:border-orange-800"
              >
                <Filter className="h-4 w-4" />
                Advanced Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks List */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-600 rounded-xl text-white">
                <Focus className="h-5 w-5" />
              </div>
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                Tasks Awaiting Action
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Rocket className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {searchQuery ? "No matching tasks found" : "All caught up!"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Great job! You have no pending tasks right now."}
                </p>
                {!searchQuery && (
                  <Link href="/dashboard/tasks/new">
                    <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      <Target className="h-4 w-4 mr-2" />
                      Create New Task
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task, index) => {
                  const taskIsOverdue = isOverdue(task.due_date);
                  const taskIsDueToday = isDueToday(task.due_date);

                  return (
                    <div
                      key={task.id}
                      className={`group p-6 border rounded-2xl transition-all duration-200 animate-slide-up hover:shadow-lg ${
                        taskIsOverdue
                          ? "bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-200 dark:border-red-800 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30"
                          : taskIsDueToday
                            ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800 hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30"
                            : "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30"
                      }`}
                      style={{ animationDelay: `${500 + index * 50}ms` }}
                    >
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => handleComplete(task.id)}
                          className={`p-2 rounded-xl text-white flex-shrink-0 group-hover:scale-110 transition-all duration-200 ${
                            taskIsOverdue
                              ? "bg-red-500 hover:bg-red-600"
                              : taskIsDueToday
                                ? "bg-amber-500 hover:bg-amber-600"
                                : "bg-blue-500 hover:bg-blue-600"
                          }`}
                        >
                          <Circle className="h-5 w-5" />
                        </button>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">
                                {task.title}
                                {taskIsOverdue && (
                                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                                    OVERDUE
                                  </span>
                                )}
                                {taskIsDueToday && !taskIsOverdue && (
                                  <span className="ml-2 px-2 py-1 bg-amber-500 text-white text-xs rounded-full">
                                    DUE TODAY
                                  </span>
                                )}
                              </h3>
                              {task.description && (
                                <p className="text-gray-600 dark:text-gray-400 mt-2">
                                  {task.description}
                                </p>
                              )}
                            </div>

                            <div
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPriorityColor(task.priority)} text-white`}
                            >
                              {getPriorityIcon(task.priority)}
                              {task.priority} priority
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            {task.due_date && (
                              <span
                                className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                                  taskIsOverdue
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                    : taskIsDueToday
                                      ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                                      : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300"
                                }`}
                              >
                                <Calendar className="h-3 w-3" />
                                <span>
                                  Due:{" "}
                                  {new Date(task.due_date).toLocaleDateString()}
                                </span>
                              </span>
                            )}

                            {task.created_at && (
                              <span className="flex items-center gap-2 px-3 py-1 bg-white/60 dark:bg-gray-800/60 rounded-full text-gray-700 dark:text-gray-300">
                                <Clock className="h-3 w-3" />
                                <span>
                                  Created:{" "}
                                  {new Date(
                                    task.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
