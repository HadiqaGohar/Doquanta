'use client';

import { useState } from 'react';
import { useUser } from '@/features/auth/hooks';
import { useTasks } from '@/features/tasks/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Smartphone, 
  Globe, 
  Trash2,
  ArrowLeft,
  Settings as SettingsIcon,
  Save,
  Key,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Zap,
  Database,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Star,
  Target,
  Activity,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useUser();
  const { deleteAllTasks, stats } = useTasks();
  
  // Settings state
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState({
    taskReminders: true,
    dailyDigest: false,
    taskUpdates: true,
    soundEnabled: true,
    emailNotifications: true
  });
  const [privacy, setPrivacy] = useState({
    twoFactorAuth: false,
    dataCollection: true,
    analytics: true
  });

  // Calculate user stats for display
  const totalTasks = stats?.total || 0;
  const completedTasks = stats?.completed || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleClearAllTasks = async () => {
    if (confirm("Are you ABSOLUTELY sure? This will delete ALL your tasks permanently. This action cannot be undone.")) {
      try {
        await deleteAllTasks.mutateAsync();
        toast.success("All tasks have been deleted.");
      } catch (error) {
        console.error("Failed to delete tasks", error);
        toast.error("Failed to delete tasks. Please try again.");
      }
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you would update the user profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    toast.success("Data export started! You'll receive an email when ready.");
  };

  const handleImportData = () => {
    toast("Import functionality would be implemented here");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Animated Background Elements - Settings Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-slate-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-slate-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-slate-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Enhanced Header - Settings Theme */}
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
                <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-gentle">
                  <SettingsIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-slate-800 to-indigo-800 dark:from-white dark:via-slate-200 dark:to-indigo-200 bg-clip-text text-transparent">
                    Settings ⚙️
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Customize your experience and manage preferences! 🎛️
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="flex items-center gap-4 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-600">
                  {totalTasks}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total Tasks
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {completionRate}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Success Rate
                </div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {completedTasks}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Completed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards - Settings Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="group relative overflow-hidden bg-gradient-to-br from-slate-500 via-slate-600 to-gray-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-slate-100">
                Account Settings
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <User className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">Profile</div>
              <p className="text-slate-100 text-sm flex items-center gap-1">
                <Target className="w-4 h-4" />
                Personal info
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-indigo-100">
                Appearance
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Palette className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">Theme</div>
              <p className="text-indigo-100 text-sm flex items-center gap-1">
                <Star className="w-4 h-4" />
                Customization
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-blue-100">
                Notifications
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Bell className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">Alerts</div>
              <p className="text-blue-100 text-sm flex items-center gap-1">
                <Activity className="w-4 h-4" />
                Stay informed
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0 animate-slide-up delay-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
              <CardTitle className="text-sm font-medium text-red-100">
                Security
              </CardTitle>
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Shield className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold mb-1">Privacy</div>
              <p className="text-red-100 text-sm flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Stay secure
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Settings Tabs */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 animate-slide-up delay-400">
          <CardContent className="p-6">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
                <TabsTrigger value="account" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="appearance" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                  <Palette className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="privacy" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy
                </TabsTrigger>
                <TabsTrigger value="system" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm">
                  <Database className="h-4 w-4 mr-2" />
                  System
                </TabsTrigger>
              </TabsList>
              
              {/* Account Settings */}
              <TabsContent value="account" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-blue-600" />
                        Profile Information
                      </CardTitle>
                      <CardDescription>
                        Update your account details and personal information.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Display Name</Label>
                        <Input 
                          id="name" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <Input 
                          id="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled 
                          className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl h-12"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email address cannot be changed.</p>
                      </div>
                      <Button 
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl h-12"
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
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border border-red-200/50 dark:border-red-800/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Shield className="h-5 w-5 text-red-600" />
                        Security Settings
                      </CardTitle>
                      <CardDescription>
                        Manage your password and security preferences.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-gray-800/60">
                        <div className="space-y-1">
                          <Label className="font-medium">Two-Factor Authentication</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account.</p>
                        </div>
                        <Switch 
                          checked={privacy.twoFactorAuth}
                          onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, twoFactorAuth: checked }))}
                        />
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full rounded-xl h-12 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Appearance Settings */}
              <TabsContent value="appearance" className="space-y-6 mt-6">
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200/50 dark:border-purple-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Palette className="h-5 w-5 text-purple-600" />
                      Theme Preferences
                    </CardTitle>
                    <CardDescription>
                      Customize how your dashboard looks and feels.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div 
                        className={`flex flex-col items-center space-y-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          theme === 'light' 
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500' 
                            : 'bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                        }`}
                        onClick={() => setTheme('light')}
                      >
                        <div className="w-full h-20 rounded-lg bg-white border-2 border-gray-200 shadow-sm flex items-center justify-center">
                          <Sun className="h-8 w-8 text-yellow-500" />
                        </div>
                        <Label className="font-medium">Light Mode</Label>
                        <p className="text-xs text-center text-gray-600 dark:text-gray-400">Clean and bright interface</p>
                      </div>
                      
                      <div 
                        className={`flex flex-col items-center space-y-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          theme === 'dark' 
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500' 
                            : 'bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                        }`}
                        onClick={() => setTheme('dark')}
                      >
                        <div className="w-full h-20 rounded-lg bg-gray-900 border border-gray-700 shadow-sm flex items-center justify-center">
                          <Moon className="h-8 w-8 text-blue-400" />
                        </div>
                        <Label className="font-medium">Dark Mode</Label>
                        <p className="text-xs text-center text-gray-600 dark:text-gray-400">Easy on the eyes</p>
                      </div>
                      
                      <div 
                        className={`flex flex-col items-center space-y-3 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                          theme === 'system' 
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500' 
                            : 'bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                        }`}
                        onClick={() => setTheme('system')}
                      >
                        <div className="w-full h-20 rounded-lg bg-gradient-to-r from-white to-gray-900 border border-gray-300 shadow-sm flex items-center justify-center">
                          <Monitor className="h-8 w-8 text-gray-600" />
                        </div>
                        <Label className="font-medium">System</Label>
                        <p className="text-xs text-center text-gray-600 dark:text-gray-400">Matches your device</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications" className="space-y-6 mt-6">
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bell className="h-5 w-5 text-green-600" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>
                      Choose what you want to be notified about and how.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-gray-800/60">
                        <div className="space-y-1">
                          <Label className="font-medium flex items-center gap-2">
                            <Zap className="h-4 w-4 text-green-600" />
                            Task Reminders
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when tasks are due soon.</p>
                        </div>
                        <Switch 
                          checked={notifications.taskReminders}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, taskReminders: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-gray-800/60">
                        <div className="space-y-1">
                          <Label className="font-medium flex items-center gap-2">
                            <Star className="h-4 w-4 text-green-600" />
                            Daily Digest
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Receive a summary of your tasks every morning.</p>
                        </div>
                        <Switch 
                          checked={notifications.dailyDigest}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, dailyDigest: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-gray-800/60">
                        <div className="space-y-1">
                          <Label className="font-medium flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            Task Updates
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Get notified when a task is updated or completed.</p>
                        </div>
                        <Switch 
                          checked={notifications.taskUpdates}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, taskUpdates: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-gray-800/60">
                        <div className="space-y-1">
                          <Label className="font-medium flex items-center gap-2">
                            {notifications.soundEnabled ? <Volume2 className="h-4 w-4 text-green-600" /> : <VolumeX className="h-4 w-4 text-gray-400" />}
                            Sound Notifications
                          </Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Play sounds for important notifications.</p>
                        </div>
                        <Switch 
                          checked={notifications.soundEnabled}
                          onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, soundEnabled: checked }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Privacy Settings */}
              <TabsContent value="privacy" className="space-y-6 mt-6">
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200/50 dark:border-orange-800/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5 text-orange-600" />
                      Privacy & Data
                    </CardTitle>
                    <CardDescription>
                      Control how your data is used and shared.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-gray-800/60">
                      <div className="space-y-1">
                        <Label className="font-medium">Data Collection</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Allow collection of usage data to improve the service.</p>
                      </div>
                      <Switch 
                        checked={privacy.dataCollection}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, dataCollection: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/60 dark:bg-gray-800/60">
                      <div className="space-y-1">
                        <Label className="font-medium">Analytics</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Help us understand how you use the app.</p>
                      </div>
                      <Switch 
                        checked={privacy.analytics}
                        onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, analytics: checked }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* System Settings */}
              <TabsContent value="system" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-800/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Globe className="h-5 w-5 text-blue-600" />
                        Language & Region
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="font-medium">Language</Label>
                        <select className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-4 py-2 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                          <option>English (US)</option>
                          <option>Spanish</option>
                          <option>French</option>
                          <option>German</option>
                          <option>Japanese</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="font-medium">Time Zone</Label>
                        <select className="flex h-12 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 px-4 py-2 text-sm focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                          <option>UTC-8 (Pacific Time)</option>
                          <option>UTC-5 (Eastern Time)</option>
                          <option>UTC+0 (GMT)</option>
                          <option>UTC+1 (Central European Time)</option>
                        </select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-800/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Database className="h-5 w-5 text-indigo-600" />
                        Data Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        onClick={handleExportData}
                        variant="outline" 
                        className="w-full rounded-xl h-12 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Data
                      </Button>
                      
                      <Button 
                        onClick={handleImportData}
                        variant="outline" 
                        className="w-full rounded-xl h-12 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Danger Zone */}
                <Card className="border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Danger Zone
                    </CardTitle>
                    <CardDescription>
                      Destructive actions that cannot be undone.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50/50 dark:bg-red-900/10">
                      <div className="space-y-1">
                        <Label className="text-red-900 dark:text-red-100 font-medium">Clear All Tasks</Label>
                        <p className="text-sm text-red-700 dark:text-red-300">Permanently delete all your tasks. This action is irreversible.</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        onClick={handleClearAllTasks}
                        disabled={deleteAllTasks.isPending}
                        className="rounded-xl"
                      >
                        {deleteAllTasks.isPending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Clearing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All Tasks
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
