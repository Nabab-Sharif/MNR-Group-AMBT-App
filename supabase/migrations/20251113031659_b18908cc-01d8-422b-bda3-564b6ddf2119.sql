-- Drop existing RLS policies on matches
DROP POLICY IF EXISTS "Anyone can view matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can insert matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can update matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can delete matches" ON public.matches;

-- Drop existing RLS policies on home_slides
DROP POLICY IF EXISTS "Anyone can view slides" ON public.home_slides;
DROP POLICY IF EXISTS "Admins can insert slides" ON public.home_slides;
DROP POLICY IF EXISTS "Admins can update slides" ON public.home_slides;
DROP POLICY IF EXISTS "Admins can delete slides" ON public.home_slides;

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admins can upload player photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view player photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update player photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete player photos" ON storage.objects;

-- Create new RLS policies for matches
CREATE POLICY "Anyone can view matches"
ON public.matches
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete matches"
ON public.matches
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create new RLS policies for home_slides
CREATE POLICY "Anyone can view slides"
ON public.home_slides
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert slides"
ON public.home_slides
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update slides"
ON public.home_slides
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete slides"
ON public.home_slides
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create new storage policies
CREATE POLICY "Admins can upload player photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'player-photos' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Anyone can view player photos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'player-photos');

CREATE POLICY "Admins can update player photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'player-photos' AND
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  bucket_id = 'player-photos' AND
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete player photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'player-photos' AND
  public.has_role(auth.uid(), 'admin')
);