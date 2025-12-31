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
} from "lucide-react";
import { useTasks } from "@/features/tasks/hooks";
import { useUser } from "@/features/auth/hooks";
import Link from "next/link";
import ChatbotIcon from "@/components/ChatbotIcon";

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

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            DoQuanta Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.name || user?.email || 'User'}! Here's what's happening with your tasks.
          </p>
          {/* When alarm is ring so show */}
          {/* <p>Notification Active/Disactive</p> */}
        </div>
        <div>
          <button className="bg-[#AADE81] px-4 py-3 rounded-2xl font-black">New Task</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Tasks</p>
              <p className="text-3xl font-bold">{stats?.total || 0}</p>
            </div>
            <div className="bg-blue-400 p-3 rounded-full">
              <ListTodo className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Completed</p>
              <p className="text-3xl font-bold">{stats?.completed || 0}</p>
            </div>
            <div className="bg-green-400 p-3 rounded-full">
              <CheckIcon className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Pending</p>
              <p className="text-3xl font-bold">{stats?.active || 0}</p>
            </div>
            <div className="bg-yellow-400 p-3 rounded-full">
              <Circle className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Urgent</p>
              <p className="text-3xl font-bold">{stats?.active || 0}</p>
            </div>
            <div className="bg-red-400 p-3 rounded-full">
              <Circle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Add search bar with all catogories newest feature and extra needed tools dec inc */}

      {/* Quick Add and Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Quick Add */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Quick Add Task</h2>
            <Plus className="h-5 w-5 text-gray-500" />
          </div>
          <AddTodo />
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Upcoming Tasks
            </h2>
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
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
                    className="mr-3 p-1 rounded-full border-2 border-gray-200 text-transparent hover:border-accent hover:text-accent transition-colors"
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
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Recent Tasks</h2>
          <Link
            href="/dashboard/tasks"
            className="text-blue-600 hover:underline flex items-center"
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
        </div>
        <TaskList />
      </div>
      <ChatbotIcon />
    </div>
  );
}
