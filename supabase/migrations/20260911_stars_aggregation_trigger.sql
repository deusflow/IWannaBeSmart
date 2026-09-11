-- ==============================================================================
-- Migration: 20260911_stars_aggregation_trigger.sql
-- Description: Aggregate total stars from user_progress into profiles
-- ==============================================================================

create or replace function public.update_user_total_stars()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_user_id uuid;
  computed_stars int;
begin
  -- Determine affected user_id based on operation
  if (tg_op = 'DELETE') then
    target_user_id := old.user_id;
  else
    target_user_id := new.user_id;
  end if;

  -- Calculate total stars across all station tasks for this user
  select coalesce(sum(stars), 0)
  into computed_stars
  from public.user_progress
  where user_id = target_user_id;

  -- Update profiles table
  update public.profiles
  set
    total_stars = computed_stars,
    updated_at = now()
  where id = target_user_id;

  if (tg_op = 'DELETE') then
    return old;
  end if;
  return new;
end;
$$;

-- Drop trigger if it exists
drop trigger if exists on_user_progress_stars_changed on public.user_progress;

-- Bind trigger on INSERT, UPDATE of stars, or DELETE
create trigger on_user_progress_stars_changed
  after insert or update of stars or delete
  on public.user_progress
  for each row
  execute function public.update_user_total_stars();
