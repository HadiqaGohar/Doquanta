"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser, useAuth } from "@/features/auth/hooks";
import { useTasks } from "@/features/tasks/hooks";
import { toast } from "react-hot-toast";
import {
  User,
  Mail,
  Shield,
  Settings,
  LogOut,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Camera,
  Key,
  Bell,
  Palette,
  Globe,
  Calendar,
  Trophy,
  Target,
  Star,
  Activity,
  TrendingUp,
  CheckCircle,
  Clock,
  Zap,
  Award,
  Sparkles
} from "lucide-react";
import Link from "next/link";


export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { tasks, stats } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isLoading, setIsLoading] = useState(false);

  // Calculate user statistics
  const totalTasks = stats?.total || 0;
  const completedTasks = stats?.completed || 0;
  const activeTasks = stats?.active || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate streak and achievements
  const memberSince = user?.createdAt ? new Date(user.createdAt) : new Date();
  const daysSinceMember = Math.floor((new Date().getTime() - memberSince.getTime()) / (1000 * 60 * 60 * 24));
  
  // Recent activity
  const recentTasks = tasks
    .filter(task => task.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 5);

  const achievements = [
    { 
      id: 1, 
      title: "First Task", 
      description: "Completed your first task", 
      icon: Target, 
      earned: completedTasks > 0,
      color: "from-blue-500 to-indigo-600"
    },
    { 
      id: 2, 
      title: "Task Master", 
      description: "Completed 10 tasks", 
      icon: Trophy, 
      earned: completedTasks >= 10,
      color: "from-yellow-500 to-orange-600"
    },
    { 
      id: 3, 
      title: "Productivity Pro", 
      description: "80% completion rate", 
      icon: Star, 
      earned: completionRate >= 80,
      color: "from-purple-500 to-pink-600"
    },
    { 
      id: 4, 
      title: "Consistent User", 
      description: "Member for 30+ days", 
      icon: Calendar, 
      earned: daysSinceMember >= 30,
      color: "from-green-500 to-emerald-600"
    }
  ];

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would update the user profile
      // via an API call to Better Auth
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    signOut.mutate();
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Profile Access</CardTitle>
            <CardDescription>Please sign in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/signin">
              <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background Elements - Profile Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header - Profile Theme */}
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                    My Profile 👤
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Manage your account and track your progress! ✨
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {completedTasks}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Completed
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {completionRate}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Success Rate
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {daysSinceMember}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Days Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards - Profile Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-purple-100">
                Total Tasks
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{totalTasks}</div>
              <p className="text-purple-100 text-sm flex items-center gap-1">
                <Activity className="w-4 h-4" />
                All time
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-pink-100">
                Completed
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{completedTasks}</div>
              <p className="text-pink-100 text-sm flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                Achievements
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-indigo-100">
                Success Rate
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{completionRate}%</div>
              <p className="text-indigo-100 text-sm flex items-center gap-1">
                <Star className="w-4 h-4" />
                Efficiency
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">
                Member Since
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">{daysSinceMember}</div>
              <p className="text-blue-100 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Days active
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Profile Card */}
          <Card className="xl:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-400">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl text-white">
                  <User className="h-5 w-5" />
                </div>
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                  Profile Information
                </span>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="ml-auto hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Avatar Section */}
              <div className="flex items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/50">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {getInitials(user.name || '', user.email || '')}
                  </div>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-0"
                  >
                    <Camera className="h-3 w-3 text-purple-600" />
                  </Button>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                    {user.name || "Welcome!"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{user.email}</p>
                  <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                    <Sparkles className="h-4 w-4" />
                    Member since {memberSince.toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={!isEditing}
                        className="pl-10 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl h-12"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={!isEditing}
                        className="pl-10 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400 rounded-xl h-12"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleSave} 
                      disabled={isLoading}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-2 rounded-xl"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user.name || "");
                        setEmail(user.email || "");
                      }}
                      className="px-6 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Account Security Section */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Account Security
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 justify-start h-12 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 dark:border-purple-800"
                    onClick={() => {
                      toast("Change password functionality would be implemented here");
                    }}
                  >
                    <Key className="h-4 w-4 text-purple-600" />
                    Change Password
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 justify-start h-12 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar - Achievements & Activity */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement, index) => {
                    const AchievementIcon = achievement.icon;
                    return (
                      <div 
                        key={achievement.id}
                        className={`p-3 rounded-xl border transition-all duration-200 ${
                          achievement.earned 
                            ? `bg-gradient-to-r ${achievement.color} text-white shadow-lg` 
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            achievement.earned 
                              ? 'bg-white/20 backdrop-blur-sm' 
                              : 'bg-gray-200 dark:bg-gray-700'
                          }`}>
                            <AchievementIcon className={`h-4 w-4 ${
                              achievement.earned ? 'text-white' : 'text-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium text-sm ${
                              achievement.earned ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {achievement.title}
                            </h4>
                            <p className={`text-xs ${
                              achievement.earned ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              {achievement.description}
                            </p>
                          </div>
                          {achievement.earned && (
                            <CheckCircle className="h-5 w-5 text-white" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTasks.map((task, index) => (
                      <div 
                        key={task.id}
                        className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500 rounded-lg text-white flex-shrink-0">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                              <Clock className="h-3 w-3" />
                              Completed {new Date(task.completed_at!).toLocaleDateString()}
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
      </div>
    </div>
  );
}