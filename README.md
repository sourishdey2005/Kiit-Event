# KIIT EventSphere

This is a NextJS-based Smart Campus Event & Society Management System.

## Project Setup

1. **Environment Variables**: Ensure your `.env` file contains the correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **Setup Backend**: Run the **Master SQL Script** provided below in your Supabase SQL Editor.
3. **Run Locally**:
   ```bash
   npm run dev
   ```

## Master SQL Script

Run this script in your Supabase SQL Editor to initialize all tables, triggers, and permissions:

```sql
-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'society_admin', 'super_admin')),
  society_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.societies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fic_name TEXT,
  contact_email TEXT UNIQUE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  poster TEXT,
  venue TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_limit INTEGER DEFAULT 100,
  society_id UUID REFERENCES public.societies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.users(id),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, event_id)
);

-- 2. User Sync Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  soc_id UUID;
BEGIN
  SELECT id INTO soc_id FROM public.societies WHERE contact_email = NEW.email LIMIT 1;
  IF soc_id IS NOT NULL THEN
    INSERT INTO public.users (id, name, email, role, society_id)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Society Admin'), NEW.email, 'society_admin', soc_id);
    UPDATE public.societies SET created_by = NEW.id WHERE id = soc_id;
  ELSE
    INSERT INTO public.users (id, name, email, role)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'User'), NEW.email, 'student');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RLS Policies (Bypass-Friendly)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow All Users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow All Societies" ON public.societies FOR ALL USING (true);
CREATE POLICY "Allow All Events" ON public.events FOR ALL USING (true);
CREATE POLICY "Allow All Registrations" ON public.registrations FOR ALL USING (true);
```

## Features
- **Student Dashboard**: Discover events, register, and view tickets.
- **Society Admin**: Create events, use AI for descriptions, and track attendance.
- **Super Admin**: Approve events, manage societies, and view system-wide analytics.
