-- Add player-level scores to matches table for global real-time access
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS team1_player1_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS team1_player2_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS team2_player1_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS team2_player2_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS team1_player1_scores jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS team1_player2_scores jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS team2_player1_scores jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS team2_player2_scores jsonb DEFAULT '[]';

-- Enable realtime for matches table
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;