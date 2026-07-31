-- Add acquisition_type to contracts
-- Values: 'Drafted' | 'Free Agent' | 'Trade' | 'Under Contract'
-- NULL is valid for system-generated contracts (extensions).

ALTER TABLE public.contracts
  ADD COLUMN IF NOT EXISTS acquisition_type text
  CHECK (acquisition_type IN ('Drafted', 'Free Agent', 'Trade', 'Under Contract'));
