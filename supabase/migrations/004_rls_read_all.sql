-- Widen SELECT policies so any signed-in user can read all rows.
-- Managers can now view every team's roster, contracts, and cap — not just their own.
-- Write policies (INSERT/UPDATE/DELETE) are unchanged; route handlers use the
-- service-role admin client anyway, which bypasses RLS.

-- users: any authenticated user can read all rows
DROP POLICY IF EXISTS "users_select" ON public.users;
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- teams: any authenticated user can read all teams
DROP POLICY IF EXISTS "teams_select" ON public.teams;
CREATE POLICY "teams_select" ON public.teams
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- contracts: any authenticated user can read all contracts
DROP POLICY IF EXISTS "contracts_select" ON public.contracts;
CREATE POLICY "contracts_select" ON public.contracts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- cut_penalties: any authenticated user can read all penalties
DROP POLICY IF EXISTS "cut_penalties_select" ON public.cut_penalties;
CREATE POLICY "cut_penalties_select" ON public.cut_penalties
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- transaction_history (added in 003): any authenticated user can read
DROP POLICY IF EXISTS "transaction_history_select" ON public.transaction_history;
CREATE POLICY "transaction_history_select" ON public.transaction_history
  FOR SELECT USING (auth.uid() IS NOT NULL);
