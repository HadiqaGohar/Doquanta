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
  AlertCircle
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
        task.due_date &&
        new Date(task.due_date) < new Date() &&
        !task.completed
    )
    .sort(
      (a, b) =>
        new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    )
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            DoQuanta Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || user?.email || 'User'}! Here's what's happening with your tasks.
          </p>
        </div>
       
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Tasks</CardTitle>
            <ListTodo className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total || 0}</div>
            <p className="text-blue-100 text-sm mt-1">All tasks created</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Completed</CardTitle>
            <CheckIcon className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.completed || 0}</div>
            <p className="text-green-100 text-sm mt-1">Tasks finished</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-yellow-100">Pending</CardTitle>
            <Circle className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.active || 0}</div>
            <p className="text-yellow-100 text-sm mt-1">Tasks in progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-100">Overdue</CardTitle>
            <AlertCircle className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.overdue || 0}</div>
            <p className="text-red-100 text-sm mt-1">Tasks past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Add and Upcoming/Overdue Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Add */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#AADE81]" />
              Quick Add Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddTodo />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <Card className="bg-white shadow-lg border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Overdue Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center p-3 border rounded-lg bg-red-50 hover:bg-red-100 group transition-colors"
                    >
                      <button
                        onClick={() =>
                          toggleTaskCompletion.mutate({
                            id: task.id,
                            completed: true,
                          })
                        }
                        className="mr-3 p-1 rounded-full border-2 border-red-200 text-transparent hover:border-red-500 hover:text-red-500 transition-colors"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <div className="flex-1">
                        <div className="font-medium text-red-900">{task.title}</div>
                        <div className="text-sm text-red-700 font-semibold">
                          Due: {new Date(task.due_date!).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs bg-red-200 text-red-800 font-bold">
                        Late
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Tasks */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#AADE81]" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 group"
                    >
                      <button
                        onClick={() =>
                          toggleTaskCompletion.mutate({
                            id: task.id,
                            completed: true,
                          })
                        }
                        className="mr-3 p-1 rounded-full border-2 border-gray-200 text-transparent hover:border-[#AADE81] hover:text-[#AADE81] transition-colors"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-500">
                          Due: {new Date(task.due_date!).toLocaleDateString()}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No upcoming tasks
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Tasks */}
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#AADE81]" />
            Recent Tasks
          </CardTitle>
          <Link
            href="/dashboard/tasks"
            className="text-blue-600 hover:underline flex items-center text-sm"
          >
            View All
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </CardHeader>
        <CardContent>
          <TaskList />
        </CardContent>
      </Card>
      <ChatbotIcon />
    </div>
  );
}
