-- Add individual player score arrays to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS team1_p1_scores int[] DEFAULT ARRAY[]::int[],
ADD COLUMN IF NOT EXISTS team1_p2_scores int[] DEFAULT ARRAY[]::int[],
ADD COLUMN IF NOT EXISTS team2_p1_scores int[] DEFAULT ARRAY[]::int[],
ADD COLUMN IF NOT EXISTS team2_p2_scores int[] DEFAULT ARRAY[]::int[],
ADD COLUMN IF NOT EXISTS match_time text;

-- Update the updated_at timestamp
UPDATE public.matches SET updated_at = now() WHERE updated_at IS NOT NULL;
