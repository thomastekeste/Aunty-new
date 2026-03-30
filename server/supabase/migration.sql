-- ============================================================
-- AUNTY — THE CURL COUNCIL
-- Full Supabase Migration
-- Run this once in the Supabase SQL editor
-- ============================================================

-- Auto-update updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- USERS
-- ============================================================
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  zip_code text,
  city text,
  country text,
  water_hardness text,
  subscription_tier text default 'free',
  revenuecat_id text,
  onboarding_complete boolean default false,
  expo_push_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger users_updated_at before update on users
  for each row execute function update_updated_at();

alter table users enable row level security;

create policy "Users can read own record" on users
  for select using (auth.uid() = id);

create policy "Users can update own record" on users
  for update using (auth.uid() = id);

create policy "Service role bypasses RLS" on users
  using (auth.role() = 'service_role');

-- ============================================================
-- HAIR PROFILES
-- ============================================================
create table if not exists hair_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  curl_type text,
  curl_type_crown text,
  curl_type_nape text,
  porosity text,
  density text,
  scalp_condition text,
  damage_level text,
  hair_length text,
  previously_relaxed boolean,
  transitioning boolean,
  primary_goal text,
  wash_frequency text,
  heat_use text,
  protective_styles text,
  water_situation text,
  failed_before text[],
  scalp_concerns text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger hair_profiles_updated_at before update on hair_profiles
  for each row execute function update_updated_at();

alter table hair_profiles enable row level security;

create policy "Users can manage own hair profile" on hair_profiles
  for all using (auth.uid() = user_id);

-- ============================================================
-- HAIR PROFILE VERSIONS
-- ============================================================
create table if not exists hair_profile_versions (
  id uuid primary key default gen_random_uuid(),
  hair_profile_id uuid references hair_profiles(id),
  user_id uuid references users(id),
  snapshot jsonb not null,
  version_number integer,
  created_at timestamptz default now()
);

alter table hair_profile_versions enable row level security;

create policy "Users can read own versions" on hair_profile_versions
  for select using (auth.uid() = user_id);

-- ============================================================
-- INTAKE RESPONSES
-- ============================================================
create table if not exists intake_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  session_id uuid,
  question_key text not null,
  answer_value text not null,
  answer_type text,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

alter table intake_responses enable row level security;

create policy "Users can manage own intake responses" on intake_responses
  for all using (auth.uid() = user_id);

-- ============================================================
-- PHOTOS
-- ============================================================
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  photo_url text not null,
  photo_type text,
  upload_session text,
  week_number integer,
  analysis_json jsonb,
  curl_type_detected text,
  porosity_detected text,
  damage_detected text,
  analysis_confidence text,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

alter table photos enable row level security;

create policy "Users can manage own photos" on photos
  for all using (auth.uid() = user_id);

-- ============================================================
-- ROUTINES
-- ============================================================
create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  routine_json jsonb not null,
  generated_by_aunties text[],
  curl_type_at_generation text,
  porosity_at_generation text,
  version_number integer default 1,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create trigger routines_updated_at before update on routines
  for each row execute function update_updated_at();

alter table routines enable row level security;

create policy "Users can manage own routines" on routines
  for all using (auth.uid() = user_id);

-- ============================================================
-- COUNCIL MESSAGES
-- ============================================================
create table if not exists council_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  routine_id uuid references routines(id),
  aunty_id text not null,
  message_text text not null,
  prompt_used text,
  model_used text,
  intake_data_snapshot jsonb,
  photo_analysis_snapshot jsonb,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

alter table council_messages enable row level security;

create policy "Users can read own council messages" on council_messages
  for select using (auth.uid() = user_id);

-- ============================================================
-- CHECKINS
-- ============================================================
create table if not exists checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  routine_id uuid references routines(id),
  checkin_week integer not null,
  routine_followed text,
  moisture_rating integer check (moisture_rating between 1 and 5),
  frizz_rating integer check (frizz_rating between 1 and 5),
  condition_rating integer check (condition_rating between 1 and 5),
  progress_photo_id uuid references photos(id),
  aunty_response_aunty text,
  aunty_response_text text,
  products_used text[],
  notes text,
  notification_sent_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

alter table checkins enable row level security;

create policy "Users can manage own checkins" on checkins
  for all using (auth.uid() = user_id);

-- ============================================================
-- PRODUCT INTERACTIONS
-- ============================================================
create table if not exists product_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  routine_id uuid references routines(id),
  product_name text not null,
  brand text,
  aunty_recommended_by text,
  curl_type_context text,
  shown boolean default true,
  clicked boolean default false,
  clicked_at timestamptz,
  purchased boolean default false,
  purchased_at timestamptz,
  user_rating integer check (user_rating between 1 and 5),
  affiliate_link text,
  created_at timestamptz default now(),
  deleted_at timestamptz
);

alter table product_interactions enable row level security;

create policy "Users can manage own product interactions" on product_interactions
  for all using (auth.uid() = user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  notification_type text,
  week_number integer,
  sent_at timestamptz,
  opened boolean default false,
  opened_at timestamptz,
  created_at timestamptz default now()
);

alter table notifications enable row level security;

create policy "Users can read own notifications" on notifications
  for select using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_intake_responses_user_id on intake_responses(user_id);
create index if not exists idx_intake_responses_question_key on intake_responses(question_key);
create index if not exists idx_photos_user_id on photos(user_id);
create index if not exists idx_photos_photo_type on photos(photo_type);
create index if not exists idx_checkins_user_id on checkins(user_id);
create index if not exists idx_checkins_week on checkins(checkin_week);
create index if not exists idx_checkins_followed on checkins(routine_followed);
create index if not exists idx_product_interactions_name on product_interactions(product_name);
create index if not exists idx_product_interactions_brand on product_interactions(brand);
create index if not exists idx_council_messages_aunty_id on council_messages(aunty_id);
create index if not exists idx_hair_profiles_curl_type on hair_profiles(curl_type);
create index if not exists idx_hair_profiles_porosity on hair_profiles(porosity);

-- ============================================================
-- STORAGE BUCKETS
-- (Run separately in Supabase dashboard Storage section
--  or via Supabase Management API)
--
-- bucket: hair-photos
--   public: false, max 10mb, jpeg/png/webp
--   path: {user_id}/{session_type}/{timestamp}_{photo_type}.jpg
--
-- bucket: progress-photos
--   public: false, max 10mb, jpeg/png/webp
--   path: {user_id}/week_{week_number}/{timestamp}.jpg
-- ============================================================
