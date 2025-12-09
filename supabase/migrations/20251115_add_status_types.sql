-- Update matches table status constraint to include 'today' and 'tomorrow'
ALTER TABLE public.matches
DROP CONSTRAINT matches_status_check;

ALTER TABLE public.matches
ADD CONSTRAINT matches_status_check CHECK (status IN ('upcoming', 'today', 'tomorrow', 'live', 'completed'));
