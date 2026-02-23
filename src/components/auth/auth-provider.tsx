
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
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return profile;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // 1. Immediate check for mock session
        const mockAdmin = sessionStorage.getItem('mock_admin_user');
        if (mockAdmin) {
          setUser(JSON.parse(mockAdmin));
          setLoading(false);
          return;
        }

        // 2. Supabase Check
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await loadProfile(session.user.id);
          if (profile) setUser(profile);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        if (profile) setUser(profile);
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
      window.location.href = '/dashboard/super-admin';
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;

    if (data.user) {
      const profile = await loadProfile(data.user.id);
      if (profile) {
        setUser(profile);
        const path = profile.role === 'super_admin' ? 'super-admin' : 
                     profile.role === 'society_admin' ? 'society-admin' : 'student';
        router.push(`/dashboard/${path}`);
      }
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
