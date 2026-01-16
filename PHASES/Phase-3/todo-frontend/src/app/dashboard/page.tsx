"use client";

import { TaskList } from "@/components/tasks/task-list";
import AddTodo from "@/app/components/AddTodo";
import {
  CheckCircle,
  Plus,
  Calendar,
  CheckCircle as CheckIcon,
  Circle,
  ListTodo,
  Archive,
  BarChart3,
  TrendingUp,
  Activity,
  AlertCircle,
  Sparkles,
  Target,
  Clock,
  Zap,
  ArrowRight,
  Star,
  Trophy,
  Flame,
} from "lucide-react";
import { useTasks } from "@/features/tasks/hooks";
import { useUser } from "@/features/auth/hooks";
import Link from "next/link";
import ChatbotIcon from "@/components/ChatbotIcon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useUser();
  const { stats, tasks, toggleTaskCompletion } = useTasks();

  // Get upcoming tasks (due in the next 7 days)
  const upcomingTasks = tasks
    .filter(
      (task) =>
        task.due_date &&
        new Date(task.due_date) >= new Date() &&
        !task.completed
    )
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    )
    .slice(0, 5);

  // Get overdue tasks
  const overdueTasks = tasks
    .filter(
      (task) =>
        task.due_date && new Date(task.due_date) < new Date() && !task.completed
    )
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    )
    .slice(0, 5);

  // Calculate completion rate
  const completionRate = stats?.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
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
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                    {getGreeting()}, {user?.name?.split(" ")[0] || "there"}! 👋
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Ready to conquer your day? Let's make it productive! ✨
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {completionRate}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Complete
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.active || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Active
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.total || 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up">
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
                <Trophy className="h-5 w-5" />
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
                In Progress
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Flame className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {stats?.active || 0}
              </div>
              <p className="text-orange-100 text-sm flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Active tasks
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-500 to-rose-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-300">
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
              <div className="text-3xl font-bold mb-1">
                {stats?.overdue || 0}
              </div>
              <p className="text-red-100 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Quick Add Task - Enhanced */}
          <Card className="xl:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-400">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl text-white">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
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

          {/* Progress Ring */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-purple-600" />
                Progress Today
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="relative w-32 h-32 mb-4">
                <svg
                  className="w-32 h-32 transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="url(#gradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionRate / 100)}`}
                    className="transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient
                      id="gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">
                    {completionRate}%
                  </span>
                </div>
              </div>
              <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
                {completionRate >= 80
                  ? "🎉 Excellent progress!"
                  : completionRate >= 50
                    ? "💪 Keep it up!"
                    : "🚀 Let's get started!"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-l-4 border-l-red-500 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-red-600">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-xl">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <span>Overdue Tasks</span>
                  <div className="ml-auto px-3 py-1 bg-red-100 dark:bg-red-900 rounded-full text-xs font-bold text-red-700 dark:text-red-300 animate-pulse">
                    {overdueTasks.length} urgent
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-center p-4 border rounded-xl bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 group transition-all duration-200 animate-slide-up"
                      style={{ animationDelay: `${600 + index * 100}ms` }}
                    >
                      <button
                        onClick={() =>
                          toggleTaskCompletion.mutate({
                            id: task.id,
                            completed: true,
                          })
                        }
                        className="mr-4 p-2 rounded-full border-2 border-red-300 text-transparent hover:border-red-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200 group-hover:scale-110"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <div className="flex-1">
                        <div className="font-semibold text-red-900 dark:text-red-100">
                          {task.title}
                        </div>
                        <div className="text-sm text-red-700 dark:text-red-300 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Due: {new Date(task.due_date!).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 font-bold animate-pulse">
                          OVERDUE
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Tasks */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Upcoming Tasks
                </span>
                {upcomingTasks.length > 0 && (
                  <div className="ml-auto px-3 py-1 bg-blue-100 dark:bg-blue-900 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                    {upcomingTasks.length} coming up
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map((task, index) => (
                    <div
                      key={task.id}
                      className="flex items-center p-4 border rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 group transition-all duration-200 animate-slide-up"
                      style={{ animationDelay: `${700 + index * 100}ms` }}
                    >
                      <button
                        onClick={() =>
                          toggleTaskCompletion.mutate({
                            id: task.id,
                            completed: true,
                          })
                        }
                        className="mr-4 p-2 rounded-full border-2 border-blue-300 text-transparent hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 group-hover:scale-110"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {task.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(task.due_date!).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    All caught up! 🎉
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    No upcoming tasks scheduled
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl">
                <Activity className="h-5 w-5 text-purple-600" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Recent Activity
              </span>
            </CardTitle>
            <Link
              href="/dashboard/tasks"
              className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardHeader>
          <CardContent>
            <TaskList />
          </CardContent>
        </Card>
      </div>

      <ChatbotIcon />
    </div>
  );
}
