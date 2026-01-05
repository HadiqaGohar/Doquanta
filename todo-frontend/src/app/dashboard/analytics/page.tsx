'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Calendar, CheckCircle, Circle, ListTodo, TrendingUp, Users, Activity } from 'lucide-react';
import { useTasks } from '@/features/tasks/hooks';
import { useState, useEffect } from 'react';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

// Mock data for analytics - would be replaced with real API calls
const generateMockAnalyticsData = (tasks: any[]) => {
  const today = new Date();
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today
  });

  const completedTasks = last7Days.map(day => {
    const count = tasks.filter(
      (task: any) =>
        task.completed &&
        format(new Date(task.completed_at || task.updated_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    ).length;
    return {
      date: format(day, 'MMM dd'),
      count
    };
  });

  // Task distribution by priority
  const priorityDistribution = {
    high: tasks.filter((task: any) => task.priority === 'high').length,
    medium: tasks.filter((task: any) => task.priority === 'medium').length,
    low: tasks.filter((task: any) => task.priority === 'low').length,
  };

  // Task distribution by category
  const categoryDistribution = {
    work: tasks.filter((task: any) => task.category === 'work' || task.category === 'Work').length,
    personal: tasks.filter((task: any) => task.category === 'personal' || task.category === 'Personal').length,
    health: tasks.filter((task: any) => task.category === 'health' || task.category === 'Health').length,
    other: tasks.filter((task: any) => !task.category || task.category === 'other' || task.category === 'Other').length,
  };

  return {
    completedTasks,
    priorityDistribution,
    categoryDistribution
  };
};

export default function AnalyticsPage() {
  const { tasks, stats } = useTasks();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    if (tasks) {
      setAnalyticsData(generateMockAnalyticsData(tasks));
    }
  }, [tasks]);

  if (!analyticsData) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-[#AADE81]" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Track your productivity and task completion trends</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg font-medium ${
                timeRange === 'week'
                  ? 'bg-[#AADE81] text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg font-medium ${
                timeRange === 'month'
                  ? 'bg-[#AADE81] text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            <CheckCircle className="h-5 w-5" />
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

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Completion Rate</CardTitle>
            <TrendingUp className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <p className="text-purple-100 text-sm mt-1">Overall completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Completion Chart */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#AADE81]" />
              Task Completion Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 pt-4">
              {analyticsData.completedTasks.map((day: any, index: number) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-gray-500 mb-1">{day.date}</div>
                  <div
                    className="w-full bg-[#AADE81] rounded-t-lg transition-all duration-300 hover:bg-[#9ad870]"
                    style={{ height: `${Math.max(day.count * 15, 10)}px` }}
                  ></div>
                  <div className="text-xs font-medium mt-1">{day.count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Circle className="h-5 w-5 text-[#AADE81]" />
              Tasks by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-red-600">High Priority</span>
                  <span className="text-sm font-medium text-gray-700">{analyticsData.priorityDistribution.high}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-red-600 h-2.5 rounded-full"
                    style={{ width: `${analyticsData.priorityDistribution.high > 0 ? (analyticsData.priorityDistribution.high / (analyticsData.priorityDistribution.high + analyticsData.priorityDistribution.medium + analyticsData.priorityDistribution.low)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-yellow-600">Medium Priority</span>
                  <span className="text-sm font-medium text-gray-700">{analyticsData.priorityDistribution.medium}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-yellow-500 h-2.5 rounded-full"
                    style={{ width: `${analyticsData.priorityDistribution.medium > 0 ? (analyticsData.priorityDistribution.medium / (analyticsData.priorityDistribution.high + analyticsData.priorityDistribution.medium + analyticsData.priorityDistribution.low)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-green-600">Low Priority</span>
                  <span className="text-sm font-medium text-gray-700">{analyticsData.priorityDistribution.low}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${analyticsData.priorityDistribution.low > 0 ? (analyticsData.priorityDistribution.low / (analyticsData.priorityDistribution.high + analyticsData.priorityDistribution.medium + analyticsData.priorityDistribution.low)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-[#AADE81]" />
              Tasks by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-blue-600">Work</span>
                  <span className="text-sm font-medium text-gray-700">{analyticsData.categoryDistribution.work}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{ width: `${analyticsData.categoryDistribution.work > 0 ? (analyticsData.categoryDistribution.work / (analyticsData.categoryDistribution.work + analyticsData.categoryDistribution.personal + analyticsData.categoryDistribution.health + analyticsData.categoryDistribution.other)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-green-600">Personal</span>
                  <span className="text-sm font-medium text-gray-700">{analyticsData.categoryDistribution.personal}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full"
                    style={{ width: `${analyticsData.categoryDistribution.personal > 0 ? (analyticsData.categoryDistribution.personal / (analyticsData.categoryDistribution.work + analyticsData.categoryDistribution.personal + analyticsData.categoryDistribution.health + analyticsData.categoryDistribution.other)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-purple-600">Health</span>
                  <span className="text-sm font-medium text-gray-700">{analyticsData.categoryDistribution.health}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-purple-500 h-2.5 rounded-full"
                    style={{ width: `${analyticsData.categoryDistribution.health > 0 ? (analyticsData.categoryDistribution.health / (analyticsData.categoryDistribution.work + analyticsData.categoryDistribution.personal + analyticsData.categoryDistribution.health + analyticsData.categoryDistribution.other)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">Other</span>
                  <span className="text-sm font-medium text-gray-700">{analyticsData.categoryDistribution.other}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gray-500 h-2.5 rounded-full"
                    style={{ width: `${analyticsData.categoryDistribution.other > 0 ? (analyticsData.categoryDistribution.other / (analyticsData.categoryDistribution.work + analyticsData.categoryDistribution.personal + analyticsData.categoryDistribution.health + analyticsData.categoryDistribution.other)) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Productivity Insights */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#AADE81]" />
              Productivity Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Peak Performance
                </h3>
                <p className="text-blue-700 text-sm mt-1">
                  You complete most tasks on {analyticsData.completedTasks.reduce((max: any, day: any) => day.count > (max.count || 0) ? day : max, {}).date}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Completion Rate
                </h3>
                <p className="text-green-700 text-sm mt-1">
                  Your current completion rate is {stats?.total ? Math.round((stats.completed / stats.total) * 100) : 0}% - Keep up the great work!
                </p>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
                  <Circle className="h-4 w-4" />
                  Focus Area
                </h3>
                <p className="text-yellow-700 text-sm mt-1">
                  {analyticsData.priorityDistribution.high > analyticsData.priorityDistribution.medium + analyticsData.priorityDistribution.low
                    ? 'You have more high priority tasks than medium/low combined. Consider delegating or rescheduling.'
                    : 'Great balance of task priorities!'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}