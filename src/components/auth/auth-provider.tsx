
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

  const loadProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn('Profile not found in database:', error.message);
        return null;
      }
      return profile;
    } catch (e) {
      return null;
    }
  };

  const syncUser = async (sessionUser: any) => {
    const profile = await loadProfile(sessionUser.id);
    if (profile) {
      setUser(profile);
    } else {
      // Fallback if profile trigger hasn't finished
      setUser({
        id: sessionUser.id,
        name: sessionUser.user_metadata?.name || 'User',
        email: sessionUser.email || '',
        role: 'student'
      });
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        const mockAdmin = sessionStorage.getItem('mock_admin_user');
        if (mockAdmin) {
          setUser(JSON.parse(mockAdmin));
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await syncUser(session.user);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await syncUser(session.user);
      } else {
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
          emailRedirectTo: window.location.origin
        }
      });
      
      if (error) throw error;
      return { needsVerification: !!(data.user && !data.session) };
    } catch (err: any) {
      console.error('Sign Up Error:', err);
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        throw new Error("Connection failed: Could not reach Supabase. Please check if the project is active and your internet is connected.");
      }
      throw err;
    }
  };

  const signIn = async (email: string, pass: string) => {
    // Super Admin Bypass for prototyping
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
      router.push('/dashboard/super-admin');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;

      if (data.user) {
        await syncUser(data.user);
      }
    } catch (err: any) {
      console.error('Sign In Error:', err);
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        throw new Error("Connection failed: Could not reach Supabase. Check your project status or network connection.");
      }
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
