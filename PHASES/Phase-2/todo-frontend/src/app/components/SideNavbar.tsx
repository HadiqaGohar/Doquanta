'use client';

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { LogOut, Plus, Calendar, CheckCircle, Circle, ListTodo, Archive, ChevronLeft, ChevronRight, Settings2, User2 } from 'lucide-react'
import { HomeIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/features/auth/hooks'


type SideNavbarProps = {
  userName?: string;
  userEmail?: string;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
};

function SideNavbar({ userName = 'User', userEmail = 'Email', collapsed, setCollapsed }: SideNavbarProps) {
  const { signOut } = useAuth()

  const handleSignOut = () => signOut.mutate()

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
    { name: 'Analytics', icon: Calendar, path: '/dashboard/analytics' },
    { name: 'All Tasks', icon: ListTodo, path: '/dashboard/tasks' },
    { name: 'Add Task', icon: Plus, path: '/dashboard/tasks/new' },
    { name: 'Completed', icon: CheckCircle, path: '/dashboard/tasks/completed' },
    { name: 'Pending', icon: Circle, path: '/dashboard/tasks/pending' },
    { name: 'Archived', icon: Archive, path: '/dashboard/tasks/archived' },
    { name: 'Calendar', icon: Calendar, path: '/dashboard/calendar' },
    { name: 'Profile', icon: User2, path: '/dashboard/profile' },
    { name: 'Settings', icon: Settings2, path: '/dashboard/settings' },
  ];

  return (
    <div className={`fixed top-0 left-0 z-50 h-full bg-[#1e1b18] text-white shadow-lg transition-all duration-300
      ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-4 right-[-12px] w-6 h-6 bg-[#AADE81] text-black flex items-center justify-center rounded-full shadow-md hover:bg-[#c4f2a1] transition-transform"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>

      {/* User Info */}
      <div className="p-4 flex flex-col items-center transition-all">

        
        <div className="flex items-center gap-3 w-full">
          <div className="h-10 w-10 mt-5 rounded-full overflow-hidden bg-[#AADE81] flex items-center justify-center">
            <span className="text-black font-bold">{userName.charAt(0).toUpperCase()}</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold text-white capitalize">{userName}</h2>
              {userEmail && <p className="text-sm text-gray-300 truncate">{userEmail}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 space-y-2 p-2 font-light">
        {navItems.map(({ name, icon: Icon, path }) => (
          <Link
            key={path}
            href={path}
            className={`flex items-center w-full px-4 py-3 text-lg font-medium rounded-md transition-all hover:bg-[#4a4e48]
              ${collapsed ? 'justify-center' : 'justify-start'}`}
          >
            <Icon className="h-5 w-5 text-gray-300" />
            {!collapsed && <span className="ml-3">{name}</span>}
          </Link>
        ))}
      </nav>

      {/* Sign Out */}
      <div className={`absolute bottom-6 w-full px-4`}>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-lg font-semibold hover:text-white hover:bg-black bg-[#AADE81] text-black rounded-md transition-all"
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

export default SideNavbar;
