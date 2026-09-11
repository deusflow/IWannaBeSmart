-- ==============================================================================
-- Migration: 20260911_google_oauth_profile_sync.sql
-- Description: Improve handle_new_user() to extract avatar and callsign from Google OAuth
-- ==============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  extracted_callsign text;
  extracted_avatar text;
begin
  -- 1. Extract callsign with cascading fallback: callsign -> full_name -> name -> email prefix
  extracted_callsign := coalesce(
    new.raw_user_meta_data->>'callsign',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  -- 2. Extract avatar with cascading fallback: avatar_url -> picture
  extracted_avatar := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    null
  );

  -- 3. Upsert into public.profiles
  insert into public.profiles (id, email, callsign, avatar_url, total_stars, updated_at)
  values (
    new.id,
    new.email,
    extracted_callsign,
    extracted_avatar,
    0,
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    callsign = coalesce(public.profiles.callsign, excluded.callsign),
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url),
    updated_at = now();

  return new;
end;
$$;
