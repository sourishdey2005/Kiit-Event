
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

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
  fic_name?: string;
  contact_email?: string;
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
  societies?: {
    name: string;
  };
}

export interface Registration {
  id: string;
  user_id: string;
  event_id: string;
  created_at: string;
  events?: CampusEvent;
}
