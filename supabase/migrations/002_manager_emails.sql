-- Add manager_email to teams
alter table public.teams add column if not exists manager_email text unique;

-- Populate all 12 teams
update public.teams set manager_email = 'bfreeman8831@gmail.com' where team_code = 'BRAD';
update public.teams set manager_email = 'd.diano514@gmail.com'   where team_code = 'DAVID';
update public.teams set manager_email = 'jondoyle11@gmail.com'   where team_code = 'DOYLE';
update public.teams set manager_email = 'jsalt07@gmail.com'      where team_code = 'JAKE';
update public.teams set manager_email = 'jcharc1@gmail.com'      where team_code = 'JOE';
update public.teams set manager_email = 'kromano1216@gmail.com'  where team_code = 'KENNY';
update public.teams set manager_email = 'mcharchalis@gmail.com'  where team_code = 'MITCH';
update public.teams set manager_email = 'myslinme@gmail.com'     where team_code = 'MIZ';
update public.teams set manager_email = 'moffajj@gmail.com'      where team_code = 'MOFFA';
update public.teams set manager_email = 'pat.ward86@gmail.com'   where team_code = 'PAT';
update public.teams set manager_email = 'popemlp@gmail.com'      where team_code = 'POPE';
update public.teams set manager_email = 'jeanpiwx@gmail.com'     where team_code = 'WOLF';

-- Update auth trigger: only create public.users row for approved emails.
-- Sets commissioner role for moffajj@gmail.com automatically on first login.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (select 1 from public.teams where manager_email = new.email) then
    insert into public.users (id, email, role)
    values (
      new.id,
      new.email,
      case when new.email = 'moffajj@gmail.com' then 'commissioner' else 'manager' end
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;
