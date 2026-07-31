-- Allow cut penalties that have no associated contract
-- (e.g. penalties carried over from players cut in a prior season who are no longer on any roster)
ALTER TABLE public.cut_penalties
  ALTER COLUMN contract_id DROP NOT NULL;

-- Store the player's name so orphan penalties can still be displayed
ALTER TABLE public.cut_penalties
  ADD COLUMN IF NOT EXISTS player_name text;
