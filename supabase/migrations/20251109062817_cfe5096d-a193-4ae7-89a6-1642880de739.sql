-- Create admin users table for authentication
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create matches table
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_number int GENERATED ALWAYS AS IDENTITY,
  date date NOT NULL,
  day text NOT NULL,
  venue text NOT NULL,
  first_match boolean DEFAULT false,
  group_name text NOT NULL,
  
  -- Team 1
  team1_name text NOT NULL,
  team1_leader text NOT NULL,
  team1_player1_name text NOT NULL,
  team1_player2_name text NOT NULL,
  team1_player1_photo text,
  team1_player2_photo text,
  team1_score int DEFAULT 0,
  
  -- Team 2
  team2_name text NOT NULL,
  team2_leader text NOT NULL,
  team2_player1_name text NOT NULL,
  team2_player2_name text NOT NULL,
  team2_player1_photo text,
  team2_player2_photo text,
  team2_score int DEFAULT 0,
  
  -- Match status
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
  winner text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Create match_sets table for detailed scoring
CREATE TABLE public.match_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES public.matches(id) ON DELETE CASCADE,
  set_number int NOT NULL,
  team1_men1_score int DEFAULT 0,
  team1_men2_score int DEFAULT 0,
  team1_women1_score int DEFAULT 0,
  team1_women2_score int DEFAULT 0,
  team2_men1_score int DEFAULT 0,
  team2_men2_score int DEFAULT 0,
  team2_women1_score int DEFAULT 0,
  team2_women2_score int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.match_sets ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access
CREATE POLICY "Allow public read matches"
  ON public.matches FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read match_sets"
  ON public.match_sets FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated insert matches"
  ON public.matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update matches"
  ON public.matches FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete matches"
  ON public.matches FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert match_sets"
  ON public.match_sets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update match_sets"
  ON public.match_sets FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete match_sets"
  ON public.match_sets FOR DELETE
  TO authenticated
  USING (true);

-- Create storage bucket for player photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('player-photos', 'player-photos', true);

-- Storage policies
CREATE POLICY "Allow public read player photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'player-photos');

CREATE POLICY "Allow authenticated upload player photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'player-photos');

CREATE POLICY "Allow authenticated update player photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'player-photos');

CREATE POLICY "Allow authenticated delete player photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'player-photos');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for matches table
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();