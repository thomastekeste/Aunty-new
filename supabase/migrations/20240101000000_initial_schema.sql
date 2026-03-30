-- ============================================================
-- Aunty — Initial Schema
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- USERS
-- ============================================================
create table public.users (
  id                       uuid primary key references auth.users(id) on delete cascade,
  email                    text not null,
  name                     text,
  city                     text,
  water_hardness           text check (water_hardness in ('soft', 'medium', 'hard')) default 'medium',
  subscription_status      text not null default 'free' check (subscription_status in ('free', 'active', 'cancelled')),
  onboarding_complete      boolean not null default false,
  onboarding_step_completed integer not null default 0,
  assigned_aunty_id        text not null default '1',
  expo_push_token          text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own row"    on public.users for select using (auth.uid() = id);
create policy "Users can update own row"  on public.users for update using (auth.uid() = id);
create policy "Users can insert own row"  on public.users for insert with check (auth.uid() = id);

-- ============================================================
-- HAIR PROFILES
-- ============================================================
create table public.hair_profiles (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references public.users(id) on delete cascade,
  curl_type            text,
  porosity             text check (porosity in ('low', 'normal', 'high')),
  elasticity           text check (elasticity in ('low', 'normal', 'high')),
  density              text check (density in ('thin', 'medium', 'thick')),
  texture_description  text,
  visible_concerns     text[] default '{}',
  condition_assessment text,
  wash_frequency       text,
  primary_goal         text,
  past_failures        text[] default '{}',
  heat_use             text,
  relaxer_history      text,
  protective_styling   text,
  scalp_concerns       text[] default '{}',
  time_available       text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (user_id)
);

alter table public.hair_profiles enable row level security;

create policy "Users can manage own hair profile"
  on public.hair_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- PHOTOS
-- ============================================================
create table public.photos (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  storage_path     text not null,
  type             text not null check (type in ('intake_front', 'intake_back', 'intake_closeup', 'checkin')),
  analysis_json    jsonb,
  created_at       timestamptz not null default now()
);

alter table public.photos enable row level security;

create policy "Users can manage own photos"
  on public.photos for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- ROUTINES
-- ============================================================
create table public.routines (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(id) on delete cascade,
  routine_json          jsonb not null,
  council_response_json jsonb,
  is_active             boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (user_id)
);

alter table public.routines enable row level security;

create policy "Users can manage own routine"
  on public.routines for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- CHECK-INS
-- ============================================================
create table public.checkins (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  hosting_aunty_id  text not null,
  initiated_by      text not null check (initiated_by in ('user', 'system')),
  week_number       integer not null default 1,
  ai_analysis_json  jsonb,
  created_at        timestamptz not null default now()
);

alter table public.checkins enable row level security;

create policy "Users can manage own checkins"
  on public.checkins for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- PRODUCT INTERACTIONS
-- ============================================================
create table public.product_interactions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  product_id          text not null,
  action              text not null default 'click',
  affiliate_link_used boolean not null default false,
  created_at          timestamptz not null default now()
);

alter table public.product_interactions enable row level security;

create policy "Users can manage own product interactions"
  on public.product_interactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger trg_hair_profiles_updated_at
  before update on public.hair_profiles
  for each row execute function public.set_updated_at();

create trigger trg_routines_updated_at
  before update on public.routines
  for each row execute function public.set_updated_at();

-- ============================================================
-- STORAGE
-- Create 'hair-photos' bucket in Supabase Dashboard > Storage,
-- or run below (requires storage schema access):
-- ============================================================
insert into storage.buckets (id, name, public)
values ('hair-photos', 'hair-photos', false)
on conflict (id) do nothing;

create policy "Users can upload own photos"
  on storage.objects for insert
  with check (
    bucket_id = 'hair-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own photos"
  on storage.objects for select
  using (
    bucket_id = 'hair-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own photos"
  on storage.objects for delete
  using (
    bucket_id = 'hair-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
