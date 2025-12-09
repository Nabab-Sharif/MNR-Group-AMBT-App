-- Add department and unit/office fields for players
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS team1_player1_department TEXT,
ADD COLUMN IF NOT EXISTS team1_player1_unit TEXT,
ADD COLUMN IF NOT EXISTS team1_player2_department TEXT,
ADD COLUMN IF NOT EXISTS team1_player2_unit TEXT,
ADD COLUMN IF NOT EXISTS team2_player1_department TEXT,
ADD COLUMN IF NOT EXISTS team2_player1_unit TEXT,
ADD COLUMN IF NOT EXISTS team2_player2_department TEXT,
ADD COLUMN IF NOT EXISTS team2_player2_unit TEXT;