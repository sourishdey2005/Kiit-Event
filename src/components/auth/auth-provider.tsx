
"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, AppUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<{ needsVerification: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Check for mock admin session (Synchronous-like check)
        const mockAdmin = sessionStorage.getItem('mock_admin_user');
        if (mockAdmin) {
          const parsed = JSON.parse(mockAdmin);
          setUser(parsed);
          setLoading(false);
          return;
        }

        // 2. Check Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.warn('Supabase session error:', sessionError.message);
        }

        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error('Error fetching profile:', profileError);
          } else if (profile) {
            setUser(profile);
          }
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          setUser(profile);
        }
      } else {
        // Only clear if there's no mock session
        if (!sessionStorage.getItem('mock_admin_user')) {
          setUser(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, pass: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { name },
          emailRedirectTo: `${window.location.origin}/dashboard/student`
        }
      });
      
      if (error) throw error;
      
      if (data.user && !data.session) {
        return { needsVerification: true };
      }

      return { needsVerification: false };
    } catch (err: any) {
      throw err;
    }
  };

  const signIn = async (email: string, pass: string) => {
    // SUPER ADMIN BYPASS
    if (email === 'admin@kiit' && pass === 'admin@kiit') {
      const adminUser: AppUser = {
        id: 'super-admin-fixed-id',
        name: 'Super Admin',
        email: 'admin@kiit',
        role: 'super_admin'
      };
      sessionStorage.setItem('mock_admin_user', JSON.stringify(adminUser));
      setUser(adminUser);
      setLoading(false);
      // Use window.location for a clean redirect for mock sessions
      window.location.href = '/dashboard/super-admin';
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          setUser(profile);
          if (profile.role === 'student') router.push('/dashboard/student');
          else if (profile.role === 'society_admin') router.push('/dashboard/society-admin');
          else if (profile.role === 'super_admin') router.push('/dashboard/super-admin');
        }
      }
    } catch (err: any) {
      throw err;
    }
  };

  const signOut = async () => {
    sessionStorage.removeItem('mock_admin_user');
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
