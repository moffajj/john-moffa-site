-- Add extension_eligible flag to contracts (default true preserves existing rows)
ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS extension_eligible boolean NOT NULL DEFAULT true;

-- Expand status enum to include returning_to_pool
ALTER TABLE public.contracts
  DROP CONSTRAINT IF EXISTS contracts_status_check;
ALTER TABLE public.contracts
  ADD CONSTRAINT contracts_status_check
  CHECK (status IN ('active', 'expired', 'cut', 'returning_to_pool'));

-- Transaction history (raw import — eligibility already computed in seed data)
CREATE TABLE IF NOT EXISTS public.transaction_history (
  id               uuid primary key default gen_random_uuid(),
  player_name      text    NOT NULL,
  nfl_team         text    NOT NULL,
  position         text    NOT NULL,
  transaction_type text    NOT NULL,
  fantasy_team     text    NOT NULL,
  bid              integer,
  transaction_date text    NOT NULL,
  week             integer NOT NULL,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transaction_history ENABLE ROW LEVEL SECURITY;

-- RLS: authenticated users can read; commissioner can insert
CREATE POLICY "txhistory_select" ON public.transaction_history
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "txhistory_insert" ON public.transaction_history
  FOR INSERT WITH CHECK (public.current_user_role() = 'commissioner');

GRANT ALL ON TABLE public.transaction_history TO anon, authenticated, service_role;
