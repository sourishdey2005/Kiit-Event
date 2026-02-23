import { createClient } from '@supabase/supabase-js';

// Ensure no trailing spaces or newlines in the strings
const supabaseUrl = 'https://xizdgcgzmnnwlcpxgham.supabase.co'.trim();
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpemRnY2d6bW5ud2xjcHhnaGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzA2NDMsImV4cCI6MjA4NzM0NjY0M30.87VS-VoWZNk4O0JOP-zOeHdec2tmq60_h_J0cs-X_l8'.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials are missing!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export type UserRole = 'student' | 'society_admin' | 'super_admin';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  society_id?: string;
  created_at?: string;
}

export interface Society {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  poster?: string;
  venue: string;
  event_date: string;
  max_limit: number;
  society_id: string;
  created_by: string;
  verified: boolean;
  created_at: string;
}
