-- ==============================================================================
-- Migration: 20260911_auth_and_progress.sql
-- Description: Interactive Workbench User Profiles & Progress Tracking with RLS
-- ==============================================================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  callsign text,
  avatar_url text,
  total_stars int default 0 not null,
  updated_at timestamptz default now() not null
);

-- 2. User Progress Table
create table if not exists public.user_progress (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  station_id text not null,
  task_id text not null,
  tier int default 0 not null,
  stars int default 0 not null,
  best_wpm int default 0,
  completed_at timestamptz default now() not null,
  constraint user_station_task_uniq unique (user_id, station_id, task_id)
);

-- Indexes for performance
create index if not exists idx_user_progress_user on public.user_progress(user_id);
create index if not exists idx_user_progress_station on public.user_progress(station_id);

-- 3. Row Level Security (RLS) Enablement
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;

-- 4. RLS Policies for Profiles
-- Users can view their own profile only
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- Users can insert their own profile only
create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

-- Users can update their own profile only
create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 5. RLS Policies for User Progress
-- Users can select ONLY their own progress records. Reading foreign progress is strictly forbidden.
create policy "Users can select own progress"
  on public.user_progress
  for select
  using (auth.uid() = user_id);

-- Users can insert ONLY their own progress records
create policy "Users can insert own progress"
  on public.user_progress
  for insert
  with check (auth.uid() = user_id);

-- Users can update ONLY their own progress records
create policy "Users can update own progress"
  on public.user_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete ONLY their own progress records
create policy "Users can delete own progress"
  on public.user_progress
  for delete
  using (auth.uid() = user_id);

-- 6. Trigger: on_auth_user_created -> Auto-create Profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, callsign, avatar_url, total_stars, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'callsign', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null),
    0,
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
