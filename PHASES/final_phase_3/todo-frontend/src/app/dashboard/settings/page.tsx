'use client';

import { useUser } from '@/features/auth/hooks';
import { useTasks } from '@/features/tasks/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Shield, Palette, Smartphone, Globe, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useUser();
  const { deleteAllTasks } = useTasks();

  const handleClearAllTasks = async () => {
    if (confirm("Are you ABSOLUTELY sure? This will delete ALL your tasks permanently. This action cannot be undone.")) {
      try {
        await deleteAllTasks.mutateAsync();
        alert("All tasks have been deleted.");
      } catch (error) {
        console.error("Failed to delete tasks", error);
        alert("Failed to delete tasks. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and application preferences.</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your account details and personal information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" defaultValue={user?.name || ''} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" defaultValue={user?.email || ''} disabled />
                <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
              </div>
              <div className="flex justify-end pt-4">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
                <Switch />
              </div>
              <div className="pt-4">
                 <Button variant="outline">Change Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Preferences
              </CardTitle>
              <CardDescription>
                Customize how DoQuanta looks on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center space-y-2 cursor-pointer">
                  <div className="w-full h-24 rounded-lg border-2 border-primary bg-white shadow-sm"></div>
                  <Label>Light</Label>
                </div>
                <div className="flex flex-col items-center space-y-2 cursor-pointer">
                  <div className="w-full h-24 rounded-lg border border-gray-200 bg-gray-950 shadow-sm"></div>
                  <Label>Dark</Label>
                </div>
                <div className="flex flex-col items-center space-y-2 cursor-pointer">
                  <div className="w-full h-24 rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-950 shadow-sm"></div>
                  <Label>System</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose what you want to be notified about.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get notified when tasks are due soon.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a summary of your tasks every morning.</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Task Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified when a task is updated or completed.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* System Settings */}
        <TabsContent value="system" className="space-y-4 mt-6">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language & Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Language</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                   <option>English (US)</option>
                   <option>Spanish</option>
                   <option>French</option>
                </select>
              </div>
            </CardContent>
           </Card>

           <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Destructive actions that cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-100 rounded-lg bg-red-50">
                <div className="space-y-0.5">
                  <Label className="text-red-900">Clear All Tasks</Label>
                  <p className="text-sm text-red-700">Permanently delete all your tasks. This action is irreversible.</p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={handleClearAllTasks}
                  disabled={deleteAllTasks.isPending}
                >
                  {deleteAllTasks.isPending ? "Clearing..." : "Clear All Tasks"}
                </Button>
              </div>
            </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
