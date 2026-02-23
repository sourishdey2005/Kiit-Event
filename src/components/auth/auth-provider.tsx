"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, AppUser } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

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
        } else {
          const storedUser = localStorage.getItem('kiit_event_session');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (err) {
        console.error('Session fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) setUser(profile);
      } else {
        setUser(null);
        localStorage.removeItem('kiit_event_session');
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
          data: { name }
        }
      });
      
      if (error) throw error;
      
      if (data.user && !data.session) {
        // Email confirmation is likely enabled
        throw new Error("Registration successful! Please check your email to verify your account before logging in.");
      }

      if (data.user && data.session) {
        router.push('/dashboard/student');
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        throw new Error("Network error: Could not reach Supabase. Please check your internet connection or project status.");
      }
      throw err;
    }
  };

  const signIn = async (email: string, pass: string) => {
    // Admin bypass for local testing
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
      if (err.message === 'Failed to fetch') {
        throw new Error("Network error: Could not reach Supabase. Please check your internet connection or project status.");
      }
      throw err;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('kiit_event_session');
    setUser(null);
    router.push('/');
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
