-- Security Fix Migration: Implement role-based access control and fix overly permissive RLS policies

-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 2. Create user_roles table to manage user permissions
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Add RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. Fix overly permissive RLS policies on matches table
DROP POLICY IF EXISTS "Allow authenticated insert matches" ON public.matches;
DROP POLICY IF EXISTS "Allow authenticated update matches" ON public.matches;
DROP POLICY IF EXISTS "Allow authenticated delete matches" ON public.matches;

CREATE POLICY "Admins can insert matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update matches"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete matches"
  ON public.matches FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 6. Fix overly permissive RLS policies on match_sets table
DROP POLICY IF EXISTS "Allow authenticated insert match_sets" ON public.match_sets;
DROP POLICY IF EXISTS "Allow authenticated update match_sets" ON public.match_sets;
DROP POLICY IF EXISTS "Allow authenticated delete match_sets" ON public.match_sets;

CREATE POLICY "Admins can insert match_sets"
  ON public.match_sets FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update match_sets"
  ON public.match_sets FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete match_sets"
  ON public.match_sets FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. Fix overly permissive RLS policies on home_slides table
DROP POLICY IF EXISTS "Allow authenticated insert home_slides" ON public.home_slides;
DROP POLICY IF EXISTS "Allow authenticated update home_slides" ON public.home_slides;
DROP POLICY IF EXISTS "Allow authenticated delete home_slides" ON public.home_slides;

CREATE POLICY "Admins can insert home_slides"
  ON public.home_slides FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update home_slides"
  ON public.home_slides FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete home_slides"
  ON public.home_slides FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 8. Fix overly permissive storage policies
DROP POLICY IF EXISTS "Allow authenticated upload player photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update player photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete player photos" ON storage.objects;

CREATE POLICY "Admins can upload player photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'player-photos' 
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update player photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'player-photos'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete player photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'player-photos'
    AND public.has_role(auth.uid(), 'admin')
  );