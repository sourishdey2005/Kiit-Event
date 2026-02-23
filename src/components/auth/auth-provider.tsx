"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, AppUser, UserRole } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser(profile);
        }
      } else {
        // Special case for Super Admin Hardcoded Logic
        const storedUser = localStorage.getItem('kiit_event_session');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };

    fetchSession();
  }, []);

  const signIn = async (email: string, pass: string) => {
    // Super Admin Bypass
    if (email === 'admin@kiit' && pass === 'admin@kiit') {
      const adminUser: AppUser = {
        id: 'super-admin-uuid',
        name: 'Super Admin',
        email: 'admin@kiit',
        role: 'super_admin'
      };
      setUser(adminUser);
      localStorage.setItem('kiit_event_session', JSON.stringify(adminUser));
      router.push('/dashboard/super-admin');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      setUser(profile);
      if (profile.role === 'student') router.push('/dashboard/student');
      else if (profile.role === 'society_admin') router.push('/dashboard/society-admin');
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('kiit_event_session');
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};