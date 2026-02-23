"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  CheckCircle,
  PlusCircle,
  Search,
  Ticket
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';

interface SidebarNavProps {
  role: 'student' | 'society_admin' | 'super_admin';
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();

  const routes = {
    student: [
      { name: 'Dashboard', href: '/dashboard/student', icon: LayoutDashboard },
      { name: 'Discover Events', href: '/dashboard/student/events', icon: Search },
      { name: 'My Tickets', href: '/dashboard/student/tickets', icon: Ticket },
      { name: 'Societies', href: '/dashboard/student/societies', icon: Users },
    ],
    society_admin: [
      { name: 'Dashboard', href: '/dashboard/society-admin', icon: LayoutDashboard },
      { name: 'Manage Events', href: '/dashboard/society-admin/events', icon: Calendar },
      { name: 'Create Event', href: '/dashboard/society-admin/events/new', icon: PlusCircle },
      { name: 'Attendees', href: '/dashboard/society-admin/participants', icon: Users },
      { name: 'Notifications', href: '/dashboard/society-admin/announcements', icon: Bell },
    ],
    super_admin: [
      { name: 'Overview', href: '/dashboard/super-admin', icon: LayoutDashboard },
      { name: 'Manage Societies', href: '/dashboard/super-admin/societies', icon: Users },
      { name: 'Approvals', href: '/dashboard/super-admin/approvals', icon: CheckCircle },
      { name: 'Analytics', href: '/dashboard/super-admin/analytics', icon: BarChart3 },
      { name: 'System Settings', href: '/dashboard/super-admin/settings', icon: Settings },
    ],
  };

  const activeRoutes = routes[role] || [];

  return (
    <div className="flex flex-col h-full bg-white border-r dark:bg-slate-900 shadow-sm">
      <div className="p-6">
        <Link href={`/dashboard/${role.replace('_', '-')}`} className="flex items-center">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-primary/20">
            <Calendar className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-primary tracking-tight">
            EventSphere
          </h1>
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 pt-4">
        {activeRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 group",
              pathname === route.href
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:bg-slate-50 hover:text-primary"
            )}
          >
            <route.icon className={cn(
              "w-5 h-5 mr-3 transition-transform group-hover:scale-110",
              pathname === route.href ? "text-white" : "text-slate-400 group-hover:text-primary"
            )} />
            {route.name}
          </Link>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t space-y-2">
        <button
          onClick={() => signOut()}
          className="flex items-center w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
        >
          <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
