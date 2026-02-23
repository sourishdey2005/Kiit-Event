"use client"

import React from 'react';
import { AuthProvider, useAuth } from '@/components/auth/auth-provider';
import { SidebarNav } from '@/components/dashboard/sidebar-nav';
import { TopNav } from '@/components/dashboard/top-nav';
import { Loader2 } from 'lucide-react';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Should be handled by middleware, but adding a fallback
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/50">
      <aside className="w-72 flex-shrink-0 hidden lg:block">
        <SidebarNav role={user.role} />
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}