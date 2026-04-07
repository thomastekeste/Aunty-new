-- =====================================================
-- Aunty Curl Council — Initial Database Schema
-- =====================================================

-- ─── Users ──────────────────────────────────────────

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  city text,
  water_hardness text check (water_hardness in ('soft', 'moderate', 'hard')),
  subscription_status text not null default 'free' check (subscription_status in ('free', 'active', 'cancelled')),
  onboarding_complete boolean not null default false,
  onboarding_step text,
  preferred_aunty_id text,
  expo_push_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Hair Profiles ──────────────────────────────────

create table if not exists public.hair_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  curl_type text,
  porosity text check (porosity in ('low', 'normal', 'high')),
  elasticity text check (elasticity in ('low', 'normal', 'high')),
  density text check (density in ('thin', 'medium', 'thick')),
  primary_goal text,
  secondary_goals text[] default '{}',
  wash_frequency text,
  heat_use text,
  relaxer_history boolean default false,
  color_treated boolean default false,
  protective_styling boolean default false,
  scalp_concerns text[] default '{}',
  time_available text,
  failed_attempts text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Routines ───────────────────────────────────────

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  routine_json jsonb not null,
  council_response_json jsonb,
  week_number integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Check-ins ──────────────────────────────────────

create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  hosting_aunty_id text not null,
  week_number integer not null default 1,
  mood text check (mood in ('great', 'good', 'okay', 'struggling')),
  notes text,
  photo_uri text,
  aunty_response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Photos ─────────────────────────────────────────

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  storage_path text not null,
  analysis_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Indexes ────────────────────────────────────────

create index if not exists idx_hair_profiles_user on public.hair_profiles(user_id);
create index if not exists idx_routines_user_active on public.routines(user_id, is_active);
create index if not exists idx_checkins_user on public.checkins(user_id);
create index if not exists idx_checkins_user_week on public.checkins(user_id, week_number);
create index if not exists idx_photos_user on public.photos(user_id);

-- ─── Row Level Security ─────────────────────────────

alter table public.users enable row level security;
alter table public.hair_profiles enable row level security;
alter table public.routines enable row level security;
alter table public.checkins enable row level security;
alter table public.photos enable row level security;

-- Users: can read/update own row
create policy "Users can read own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert own data"
  on public.users for insert
  with check (auth.uid() = id);

-- Hair profiles: can read/write own
create policy "Users can read own hair profile"
  on public.hair_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own hair profile"
  on public.hair_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own hair profile"
  on public.hair_profiles for update
  using (auth.uid() = user_id);

-- Routines: can read/write own
create policy "Users can read own routines"
  on public.routines for select
  using (auth.uid() = user_id);

create policy "Users can insert own routines"
  on public.routines for insert
  with check (auth.uid() = user_id);

create policy "Users can update own routines"
  on public.routines for update
  using (auth.uid() = user_id);

-- Check-ins: can read/write own
create policy "Users can read own checkins"
  on public.checkins for select
  using (auth.uid() = user_id);

create policy "Users can insert own checkins"
  on public.checkins for insert
  with check (auth.uid() = user_id);

-- Photos: can read/write own
create policy "Users can read own photos"
  on public.photos for select
  using (auth.uid() = user_id);

create policy "Users can insert own photos"
  on public.photos for insert
  with check (auth.uid() = user_id);

-- ─── Storage Buckets ────────────────────────────────

insert into storage.buckets (id, name, public)
values ('hair-photos', 'hair-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', false)
on conflict (id) do nothing;

-- Storage policies: users can upload/read their own files
create policy "Users can upload own hair photos"
  on storage.objects for insert
  with check (
    bucket_id = 'hair-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own hair photos"
  on storage.objects for select
  using (
    bucket_id = 'hair-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can upload own progress photos"
  on storage.objects for insert
  with check (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read own progress photos"
  on storage.objects for select
  using (
    bucket_id = 'progress-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
