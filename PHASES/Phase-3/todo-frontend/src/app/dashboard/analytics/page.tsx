"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Circle,
  ListTodo,
  TrendingUp,
  Users,
  Activity,
  Target,
  Zap,
  Trophy,
  Clock,
  Star,
  Flame,
  ArrowUp,
  ArrowDown,
  Sparkles,
  PieChart,
  LineChart,
  AlertCircle,
} from "lucide-react";
import { useTasks } from "@/features/tasks/hooks";
import { useState, useEffect } from "react";
import {
  format,
  subDays,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { Task } from "@/features/tasks/types";

// Type definitions
interface CompletedTaskData {
  date: string;
  count: number;
}

interface PriorityDistribution {
  high: number;
  medium: number;
  low: number;
}

interface CategoryDistribution {
  work: number;
  personal: number;
  health: number;
  learning: number;
  shopping: number;
  other: number;
}

interface AnalyticsData {
  completedTasks: CompletedTaskData[];
  priorityDistribution: PriorityDistribution;
  categoryDistribution: CategoryDistribution;
  overdueTasks: Task[];
}

interface TaskStats {
  total: number;
  completed: number;
  active: number;
  overdue?: number;
}

// Mock data for analytics - would be replaced with real API calls
const generateMockAnalyticsData = (tasks: Task[]): AnalyticsData => {
  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  const completedTasks: CompletedTaskData[] = last7Days.map((day) => {
    const count = tasks.filter(
      (task: Task) =>
        task.completed &&
        format(
          new Date(task.updated_at || task.created_at),
          "yyyy-MM-dd"
        ) === format(day, "yyyy-MM-dd")
    ).length;
    return {
      date: format(day, "MMM dd"),
      count,
    };
  });

  // Task distribution by priority
  const priorityDistribution: PriorityDistribution = {
    high: tasks.filter((task: Task) => task.priority === "high").length,
    medium: tasks.filter((task: Task) => task.priority === "medium").length,
    low: tasks.filter((task: Task) => task.priority === "low").length,
  };

  // Task distribution by category
  const categoryDistribution: CategoryDistribution = {
    work: tasks.filter(
      (task: Task) => task.category === "work"
    ).length,
    personal: tasks.filter(
      (task: Task) =>
        task.category === "personal"
    ).length,
    health: tasks.filter(
      (task: Task) => task.category === "health"
    ).length,
    learning: tasks.filter(
      (task: Task) =>
        task.category === "learning"
    ).length,
    shopping: tasks.filter(
      (task: Task) =>
        task.category === "finance" // Mapping finance to shopping/finance
    ).length,
    other: tasks.filter(
      (task: Task) =>
        !task.category || task.category === "other"
    ).length,
  };

  // Get overdue tasks
  const overdueTasks: Task[] = tasks.filter(
    (task: Task) =>
      task.due_date && new Date(task.due_date) < new Date() && !task.completed
  );

  return {
    completedTasks,
    priorityDistribution,
    categoryDistribution,
    overdueTasks,
  };
};

export default function AnalyticsPage() {
  const { tasks, stats } = useTasks();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");

  useEffect(() => {
    if (tasks && Array.isArray(tasks)) {
      setAnalyticsData(generateMockAnalyticsData(tasks as Task[]));
    }
  }, [tasks]);

  const completionRate: number = stats?.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;
  const productivityScore: number = Math.min(
    100,
    Math.round((completionRate + (stats?.completed || 0) * 2) / 2)
  );

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Loading analytics data...
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item: number) => (
              <div
                key={item}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl animate-pulse"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg ">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Track your productivity and discover insights ✨
                  </p>
                </div>
              </div>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2 p-1 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <button
                onClick={() => setTimeRange("week")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  timeRange === "week"
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  timeRange === "month"
                    ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                This Month
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                Active Tasks
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
              <div className="text-3xl font-bold mb-1">
                {stats?.overdue || 0}
              </div>
              <p className="text-red-100 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Need attention
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-400">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-purple-100">
                Success Rate
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{completionRate}%</div>
              <p className="text-purple-100 text-sm flex items-center gap-1">
                {completionRate >= 80 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                Overall completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Productivity Score */}
        <div className="mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Productivity Score
                </span>
                <div className="ml-auto px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full text-sm font-bold text-indigo-700 dark:text-indigo-300">
                  {productivityScore}/100
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
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
                      stroke="url(#productivityGradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - productivityScore / 100)}`}
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient
                        id="productivityGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="100%"
                      >
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800 dark:text-white">
                      {productivityScore}
                    </span>
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {productivityScore >= 80
                        ? "🚀 Excellent productivity!"
                        : productivityScore >= 60
                          ? "💪 Good momentum!"
                          : productivityScore >= 40
                            ? "📈 Building habits!"
                            : "🌱 Getting started!"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Based on completion rate and task volume
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Enhanced Task Completion Chart */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-xl">
                  <LineChart className="h-5 w-5 text-blue-600" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Task Completion Trend
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 pt-4 px-2">
                {analyticsData.completedTasks.map(
                  (day: CompletedTaskData, index: number) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1 group"
                    >
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
                        {day.date}
                      </div>
                      <div className="relative w-full flex justify-center">
                        <div
                          className="w-8 bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-indigo-700 shadow-lg group-hover:shadow-xl transform group-hover:scale-110"
                          style={{ height: `${Math.max(day.count * 20, 8)}px` }}
                        ></div>
                      </div>
                      <div className="text-sm font-bold mt-2 text-gray-700 dark:text-gray-300">
                        {day.count}
                      </div>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Priority Distribution */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-600">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 rounded-xl">
                  <PieChart className="h-5 w-5 text-red-600" />
                </div>
                <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Tasks by Priority
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
                      <span className="text-sm font-semibold text-red-600">
                        🔥 High Priority
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 px-2 py-1 bg-red-100 dark:bg-red-900 rounded-full">
                      {analyticsData.priorityDistribution.high}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-1000 ease-out shadow-sm"
                      style={{
                        width: `${analyticsData.priorityDistribution.high > 0 ? (analyticsData.priorityDistribution.high / (analyticsData.priorityDistribution.high + analyticsData.priorityDistribution.medium + analyticsData.priorityDistribution.low)) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-yellow-600">
                        ⚡ Medium Priority
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                      {analyticsData.priorityDistribution.medium}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out delay-200 shadow-sm"
                      style={{
                        width: `${analyticsData.priorityDistribution.medium > 0 ? (analyticsData.priorityDistribution.medium / (analyticsData.priorityDistribution.high + analyticsData.priorityDistribution.medium + analyticsData.priorityDistribution.low)) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-green-600">
                        🌱 Low Priority
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300 px-2 py-1 bg-green-100 dark:bg-green-900 rounded-full">
                      {analyticsData.priorityDistribution.low}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out delay-400 shadow-sm"
                      style={{
                        width: `${analyticsData.priorityDistribution.low > 0 ? (analyticsData.priorityDistribution.low / (analyticsData.priorityDistribution.high + analyticsData.priorityDistribution.medium + analyticsData.priorityDistribution.low)) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Tasks Section */}
        {analyticsData.overdueTasks.length > 0 && (
          <div className="mb-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border-l-4 border-l-red-500 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-600 animate-pulse" />
                  </div>
                  <span className="bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    🚨 Overdue Tasks - Need Immediate Attention
                  </span>
                  <div className="ml-auto px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900 rounded-full text-sm font-bold text-red-700 dark:text-red-300 animate-pulse">
                    {analyticsData.overdueTasks.length} overdue
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.overdueTasks
                    .slice(0, 6)
                    .map((task: Task, index: number) => (
                      <div
                        key={task.id}
                        className="p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200/50 dark:border-red-700/50 hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-200 animate-slide-up"
                        style={{ animationDelay: `${700 + index * 100}ms` }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-red-900 dark:text-red-100 text-sm line-clamp-2">
                            {task.title}
                          </h4>
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              task.priority === "high"
                                ? "bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200"
                                : task.priority === "medium"
                                  ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200"
                                  : "bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200"
                            }`}
                          >
                            {task.priority}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
                          <Clock className="w-3 h-3" />
                          <span className="font-medium">
                            Due:{" "}
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString()
                              : "No date"}
                          </span>
                          <span className="ml-auto px-2 py-1 bg-red-200 dark:bg-red-800 rounded-full font-bold animate-pulse">
                            {task.due_date
                              ? Math.ceil(
                                  (new Date().getTime() -
                                    new Date(task.due_date).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )
                              : 0}{" "}
                            days late
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
                {analyticsData.overdueTasks.length > 6 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      And {analyticsData.overdueTasks.length - 6} more overdue
                      tasks...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Enhanced Category Distribution */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-xl">
                  <Target className="h-5 w-5 text-purple-600" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Tasks by Category
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(analyticsData.categoryDistribution).map(
                  ([category, count], index: number) => {
                    const total: number = Object.values(
                      analyticsData.categoryDistribution
                    ).reduce((a: number, b: number) => a + b, 0);
                    const percentage: number =
                      total > 0 ? ((count as number) / total) * 100 : 0;
                    const categoryIcons: { [key: string]: string } = {
                      work: "💼",
                      personal: "🏠",
                      health: "🏃",
                      learning: "📚",
                      shopping: "🛒",
                      other: "📝",
                    };
                    const categoryColors: { [key: string]: string } = {
                      work: "from-blue-500 to-blue-600",
                      personal: "from-green-500 to-emerald-600",
                      health: "from-purple-500 to-purple-600",
                      learning: "from-indigo-500 to-indigo-600",
                      shopping: "from-pink-500 to-pink-600",
                      other: "from-gray-500 to-gray-600",
                    };

                    return (
                      <div key={category} className="group">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {categoryIcons[category]}
                            </span>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                              {category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {percentage.toFixed(1)}%
                            </span>
                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                              {count}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`bg-gradient-to-r ${categoryColors[category]} h-2 rounded-full transition-all duration-1000 ease-out shadow-sm`}
                            style={{
                              width: `${percentage}%`,
                              animationDelay: `${index * 100}ms`,
                            }}
                          ></div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Productivity Insights */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 rounded-xl">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Productivity Insights
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
                  <h3 className="font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4" />
                    Peak Performance Day
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    You complete most tasks on{" "}
                    <span className="font-semibold">
                      {
                        analyticsData.completedTasks.reduce(
                          (max: CompletedTaskData, day: CompletedTaskData) =>
                            day.count > (max.count || 0) ? day : max,
                          { date: "N/A", count: 0 }
                        ).date
                      }
                    </span>
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/50">
                  <h3 className="font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4" />
                    Success Rate
                  </h3>
                  <p className="text-emerald-700 dark:text-emerald-300 text-sm">
                    Your completion rate is{" "}
                    <span className="font-semibold">{completionRate}%</span> -
                    {completionRate >= 80
                      ? " Outstanding work! 🎉"
                      : completionRate >= 60
                        ? " Great progress! 💪"
                        : " Keep building momentum! 🚀"}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50">
                  <h3 className="font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4" />
                    Focus Recommendation
                  </h3>
                  <p className="text-purple-700 dark:text-purple-300 text-sm">
                    {analyticsData.priorityDistribution.high >
                    analyticsData.priorityDistribution.medium +
                      analyticsData.priorityDistribution.low
                      ? "🎯 Consider breaking down high-priority tasks into smaller chunks for better progress."
                      : "✨ Great balance of task priorities! Your workflow looks well-organized."}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border border-orange-200/50 dark:border-orange-700/50">
                  <h3 className="font-bold text-orange-800 dark:text-orange-200 flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4" />
                    Time Management
                  </h3>
                  <p className="text-orange-700 dark:text-orange-300 text-sm">
                    {stats?.active && stats.active > 5
                      ? "⏰ You have many active tasks. Consider focusing on 3-5 key items daily."
                      : "👍 Good task load management! You're maintaining a healthy workflow."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
