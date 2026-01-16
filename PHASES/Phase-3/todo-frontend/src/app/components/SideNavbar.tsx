'use client';

import { useState } from 'react'
import Link from 'next/link'
import { LogOut, Plus, Calendar, CheckCircle, Circle, ListTodo, Archive, ChevronLeft, ChevronRight, Settings2, User2, BarChart3, Menu, MessageCircle, Sparkles } from 'lucide-react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = () => signOut.mutate()

  const navItems = [
    { name: 'Dashboard', icon: HomeIcon, path: '/dashboard', color: 'from-blue-500 to-indigo-600' },
    { name: 'Analytics', icon: BarChart3, path: '/dashboard/analytics', color: 'from-purple-500 to-pink-600' },
    { name: 'All Tasks', icon: ListTodo, path: '/dashboard/tasks', color: 'from-emerald-500 to-teal-600' },
    { name: 'Add Task', icon: Plus, path: '/dashboard/tasks/new', color: 'from-orange-500 to-red-600' },
    { name: 'Completed', icon: CheckCircle, path: '/dashboard/tasks/completed', color: 'from-green-500 to-emerald-600' },
    { name: 'Pending', icon: Circle, path: '/dashboard/tasks/pending', color: 'from-yellow-500 to-orange-600' },
    { name: 'Archived', icon: Archive, path: '/dashboard/tasks/archived', color: 'from-gray-500 to-gray-600' },
    { name: 'Calendar', icon: Calendar, path: '/dashboard/calendar', color: 'from-cyan-500 to-blue-600' },
    { name: 'Profile', icon: User2, path: '/dashboard/profile', color: 'from-indigo-500 to-purple-600' },
    { name: 'Settings', icon: Settings2, path: '/dashboard/settings', color: 'from-slate-500 to-gray-600' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-3 rounded-2xl bg-gradient-to-br from-gray-900 to-black text-white shadow-xl hover:shadow-2xl lg:hidden transition-all duration-300 hover:scale-110"
        onClick={() => setMobileMenuOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl transition-all duration-300 border-r border-gray-700/50
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:${collapsed ? 'w-20' : 'w-64'}`}
        style={{ width: mobileMenuOpen ? '100%' : collapsed ? '5rem' : '16rem' }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 opacity-50"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>

        {/* Toggle Button - only visible on desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-6 right-[-12px] w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all duration-300 lg:block hidden hover:scale-110 z-10"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Close button for mobile */}
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 lg:hidden text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* User Info */}
        <div className="relative p-6 flex flex-col items-center transition-all">
          <div className="flex items-center gap-4 w-full">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">{userName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900 shadow-sm">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mx-auto mt-0.5"></div>
              </div>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-white capitalize truncate">{userName}</h2>
                {userEmail && (
                  <p className="text-sm text-gray-300 truncate flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {userEmail}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative mt-2 space-y-2 p-4 font-medium">
          {navItems.map(({ name, icon: Icon, path, color }, index) => (
            <Link
              key={path}
              href={path}
              className={`group relative flex items-center w-full px-4 py-3 text-gray-300 rounded-2xl transition-all duration-300 hover:text-white hover:bg-white/10 backdrop-blur-sm lg:justify-start ${collapsed ? 'justify-center' : 'justify-start'} hover:scale-105 hover:shadow-lg`}
              onClick={() => setMobileMenuOpen(false)}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Hover gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300`}></div>
              
              {/* Icon with gradient on hover */}
              <div className={`relative p-2 rounded-xl bg-gradient-to-br ${color} opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              
              {!collapsed && (
                <span className="ml-4 font-medium group-hover:translate-x-1 transition-transform duration-300">
                  {name}
                </span>
              )}
              
              {/* Active indicator */}
              <div className="absolute right-2 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}
        </nav>

        {/* Sign Out */}
        <div className={`absolute bottom-6 w-full px-4`}>
          <button
            onClick={() => {
              handleSignOut();
              setMobileMenuOpen(false);
            }}
            className="group relative w-full flex items-center justify-center gap-3 px-4 py-4 text-lg font-bold hover:text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <LogOut className="h-5 w-5 relative z-10" />
            {!collapsed && <span className="relative z-10">Sign Out</span>}
            
            {/* Ripple effect */}
            <div className="absolute inset-0 bg-white/20 scale-0 group-active:scale-100 rounded-2xl transition-transform duration-200"></div>
          </button>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-2 w-1 h-16 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full opacity-30"></div>
        <div className="absolute bottom-32 right-2 w-1 h-12 bg-gradient-to-b from-blue-400 to-purple-500 rounded-full opacity-30"></div>
      </div>
    </>
  );
}

export default SideNavbar;
