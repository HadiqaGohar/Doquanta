"use client";

import { useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock,
  Target,
  Star,
  Zap,
  Flag,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Activity,
  Timer,
  Calendar,
  MapPin,
  Bell,
} from "lucide-react";
import { useTasks } from "@/features/tasks/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { tasks, toggleTaskCompletion } = useTasks();

  // Get tasks with due dates
  const tasksWithDueDates = tasks.filter((task) => task.due_date);

  // Function to get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasksWithDueDates.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Calculate calendar stats - moved after getTasksForDate definition
  const today = new Date();
  const todayTasks = getTasksForDate(today);
  const thisWeekTasks = tasksWithDueDates.filter((task) => {
    const taskDate = new Date(task.due_date!);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return taskDate >= weekStart && taskDate <= weekEnd;
  });

  const overdueTasks = tasksWithDueDates.filter((task) => {
    const taskDate = new Date(task.due_date!);
    return taskDate < today && !task.completed;
  });

  const upcomingTasks = tasksWithDueDates
    .filter((task) => {
      const taskDate = new Date(task.due_date!);
      return taskDate > today && !task.completed;
    })
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    );

  // Function to get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // First day of month
    const firstDay = new Date(year, month, 1).getDay();

    // Create array of days
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Function to navigate months
  const prevMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const handleTaskComplete = (taskId: string) => {
    toggleTaskCompletion.mutate({ id: taskId, completed: true });
  };

  const getPriorityColor = (priority: string, completed: boolean = false) => {
    if (completed) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <Zap className="h-3 w-3" />;
      case "medium":
        return <Flag className="h-3 w-3" />;
      case "low":
        return <Target className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const days = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background Elements - Calendar Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header - Calendar Theme */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                  <CalendarIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
                    Calendar View
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Visualize your schedule and plan ahead! 🗓️
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {todayTasks.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Today
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {thisWeekTasks.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  This Week
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {upcomingTasks.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Upcoming
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards - Calendar Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-indigo-100">
                Today's Tasks
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Timer className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{todayTasks.length}</div>
              <p className="text-indigo-100 text-sm flex items-center gap-1">
                <Target className="w-4 h-4" />
                Due today
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-purple-100">
                This Week
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {thisWeekTasks.length}
              </div>
              <p className="text-purple-100 text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Weekly schedule
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">
                Upcoming
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">
                {upcomingTasks.length}
              </div>
              <p className="text-blue-100 text-sm flex items-center gap-1">
                <Star className="w-4 h-4" />
                Future tasks
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
                {overdueTasks.length}
              </div>
              <p className="text-red-100 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Need attention
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Calendar */}
          <Card className="xl:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-400">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl text-white">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                    {monthName} {year}
                  </span>
                </CardTitle>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={prevMonth}
                    className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="px-4 py-2 text-sm font-medium rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
                  >
                    Today
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextMonth}
                    className="p-2 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-gray-600 dark:text-gray-400 py-3 text-sm"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="h-28 rounded-xl"></div>;
                  }

                  const dayTasks = getTasksForDate(day);
                  const isTodayDate = isToday(day);
                  const isSelectedDate = isSelected(day);

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`h-28 rounded-xl p-2 cursor-pointer transition-all duration-200 border-2 ${
                        isTodayDate
                          ? "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border-indigo-300 dark:border-indigo-600"
                          : isSelectedDate
                            ? "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-300 dark:border-purple-600"
                            : "hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                      }`}
                    >
                      <div
                        className={`text-right mb-1 font-medium ${
                          isTodayDate
                            ? "text-indigo-700 dark:text-indigo-300 font-bold"
                            : isSelectedDate
                              ? "text-purple-700 dark:text-purple-300 font-bold"
                              : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {day.getDate()}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            className={`text-xs px-2 py-1 rounded-lg truncate border transition-all duration-200 hover:scale-105 ${getPriorityColor(task.priority, task.completed)}`}
                            title={task.title}
                          >
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(task.priority)}
                              <span className="truncate">{task.title}</span>
                            </div>
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Sidebar - Selected Date & Upcoming */}
          <div className="space-y-6">
            {/* Selected Date Tasks */}
            {selectedDate && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    {selectedDate.toLocaleDateString("default", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getTasksForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CalendarIcon className="w-8 h-8 text-purple-600" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
                        No tasks scheduled
                      </p>
                      <Link href="/dashboard/tasks/new">
                        <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-4 py-2 rounded-xl">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Task
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {getTasksForDate(selectedDate).map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {task.description}
                                </p>
                              )}
                              <div
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority, task.completed)}`}
                              >
                                {getPriorityIcon(task.priority)}
                                {task.priority} priority
                              </div>
                            </div>
                            {!task.completed && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleTaskComplete(task.id.toString())
                                }
                                className="ml-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Upcoming Tasks */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bell className="h-5 w-5 text-blue-600" />
                  Upcoming Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      All caught up!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No upcoming tasks scheduled
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {upcomingTasks.slice(0, 5).map((task) => (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500 rounded-lg text-white flex-shrink-0">
                            <CalendarIcon className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              Due:{" "}
                              {new Date(task.due_date!).toLocaleDateString()}
                            </div>
                          </div>
                          <div
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                          >
                            {task.priority}
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
      </div>
    </div>
  );
}
