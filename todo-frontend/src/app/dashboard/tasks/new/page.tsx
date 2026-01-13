"use client";

import { useState } from "react";
import { useTasks } from "@/features/tasks/hooks";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Calendar,
  Clock,
  Flag,
  Bell,
  Sparkles,
  Target,
  Zap,
  ArrowLeft,
  CheckCircle,
  Star,
  Trophy,
  Flame,
  Activity,
} from "lucide-react";
import { TaskPriority } from "@/features/tasks/types";

export default function AddTaskPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [reminderTime, setReminderTime] = useState("");
  const { addTask } = useTasks();
  const router = useRouter();

  const quickTemplates = [
    {
      title: "Meeting Preparation",
      description: "Prepare agenda and materials for upcoming meeting",
      priority: "high",
      icon: Target,
      color: "from-red-500 via-red-600 to-red-700",
    },
    {
      title: "Code Review",
      description: "Review pull requests and provide feedback",
      priority: "medium",
      icon: Activity,
      color: "from-amber-500 via-orange-500 to-red-500",
    },
    {
      title: "Documentation Update",
      description: "Update project documentation and guides",
      priority: "low",
      icon: Star,
      color: "from-emerald-500 via-emerald-600 to-teal-600",
    },
    {
      title: "Bug Fix",
      description: "Investigate and fix reported issue",
      priority: "high",
      icon: Zap,
      color: "from-red-500 via-pink-500 to-rose-600",
    },
  ];

  const applyTemplate = (template: (typeof quickTemplates)[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setPriority(template.priority);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Please enter a task title");
      return;
    }

    // Combine date and time if both are present, or use just date/time appropriately
    let finalReminderTime = null;
    if (reminderTime) {
      // If we have a due date, assume reminder is on that day at that time.
      // If no due date, assume reminder is today at that time (or just pass the time string if API handles it, but API expects ISO).
      // Simplest: combine dueDate + reminderTime if both exist.
      if (dueDate) {
        finalReminderTime = new Date(`${dueDate}T${reminderTime}`);
      } else {
        // If no due date, use today's date with the time
        // Get local date string instead of ISO (which is UTC)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const today = `${year}-${month}-${day}`;
        finalReminderTime = new Date(`${today}T${reminderTime}`);
      }
    }

    let parsedDueDate = null;
    if (dueDate) {
      const [y, m, d] = dueDate.split("-").map(Number);
      parsedDueDate = new Date(y, m - 1, d);
    }

    addTask.mutate({
      title: title.trim(),
      description,
      priority: priority as TaskPriority,
      due_date: parsedDueDate,
      reminder_time: finalReminderTime,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setReminderTime("");

    // Redirect back to tasks
    router.push("/dashboard/tasks");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background Elements - Matching Dashboard */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-orange-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header - Matching Dashboard Style */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/tasks")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50 backdrop-blur-sm rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tasks
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg ">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                    Create New Task
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Transform your ideas into actionable tasks
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  <Plus className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  New Task
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  <Target className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Focused
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  <Sparkles className="w-6 h-6 mx-auto" />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Productive
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Templates Cards - Matching Dashboard Stats Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickTemplates.map((template, index) => {
            const TemplateIcon = template.icon;
            return (
              <Card
                key={index}
                onClick={() => applyTemplate(template)}
                className={`group relative overflow-hidden bg-gradient-to-br ${template.color} text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up cursor-pointer`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-medium text-white/90">
                    {template.title}
                  </CardTitle>
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TemplateIcon className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-white/80 text-sm mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium backdrop-blur-sm">
                      {template.priority} priority
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Form - Enhanced */}
          <Card className="xl:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-400">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                  <Target className="h-5 w-5" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Task Details
                </span>
                <div className="ml-auto px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full text-xs font-medium text-blue-700 dark:text-blue-300">
                  ⚡ Quick Create
                </div>
              </CardTitle>
              <CardDescription>
                Fill in the information for your new task
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <div className="p-2 bg-blue-500 rounded-xl text-white">
                      <Target className="h-4 w-4" />
                    </div>
                    Basic Information
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="title"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Task Title *
                      </Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What needs to be accomplished?"
                        required
                        className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl h-12 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="priority"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Priority Level
                      </Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger
                          id="priority"
                          className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 rounded-xl h-12"
                        >
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              Low Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="medium">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              Medium Priority
                            </div>
                          </SelectItem>
                          <SelectItem value="high">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              High Priority
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/50">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <div className="p-2 bg-purple-500 rounded-xl text-white">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    Additional Details
                  </h3>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide more context and details about this task..."
                      rows={4}
                      className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl resize-none"
                    />
                  </div>
                </div>

                {/* Schedule Section */}
                <div className="space-y-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/50">
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <div className="p-2 bg-emerald-500 rounded-xl text-white">
                      <Clock className="h-4 w-4" />
                    </div>
                    Schedule & Reminders
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="dueDate"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Due Date
                      </Label>
                      <div className="relative">
                        <Input
                          id="dueDate"
                          type="date"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="pl-12 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl h-12"
                        />
                        <Calendar className="absolute left-4 top-4 h-4 w-4 text-gray-500" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="reminderTime"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Reminder Time
                      </Label>
                      <div className="relative">
                        <Input
                          id="reminderTime"
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="pl-12 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-emerald-500 dark:focus:border-emerald-400 rounded-xl h-12"
                        />
                        <Bell className="absolute left-4 top-4 h-4 w-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/tasks")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={addTask.isPending}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {addTask.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Task
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Sidebar - Tips & Progress */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg text-white flex-shrink-0">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                      Be Specific
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Clear, specific titles help you stay focused and
                      motivated.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-500 rounded-lg text-white flex-shrink-0">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                      Set Deadlines
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Due dates create urgency and help prioritize your work.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500 rounded-lg text-white flex-shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                      Use Templates
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click the template cards above for quick task creation.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
