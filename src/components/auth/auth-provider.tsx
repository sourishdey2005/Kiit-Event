
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
        // Log error but don't crash; might be a missing row in public.users
        console.warn('Profile record not found in public.users, using fallback.', error.message);
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
      // Fallback user object if the trigger failed to create a public profile
      setUser({
        id: sessionUser.id,
        name: sessionUser.user_metadata?.name || 'User',
        email: sessionUser.email || '',
        role: 'student' // Default fallback role
      });
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // 1. Check for mock admin session
        const mockAdmin = sessionStorage.getItem('mock_admin_user');
        if (mockAdmin) {
          setUser(JSON.parse(mockAdmin));
          setLoading(false);
          return;
        }

        // 2. Check Supabase session
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
      router.push('/dashboard/super-admin');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;

    if (data.user) {
      await syncUser(data.user);
      // Wait a brief moment for state to update then redirect based on role
      // We check sessionUser role directly from profile if possible
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
