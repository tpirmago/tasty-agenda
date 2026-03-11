-- ============================================================
-- Tasty Agenda — Supabase migrations
-- Run this entire file in Supabase → SQL Editor
-- ============================================================

-- PROFILES
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  family_size integer not null default 2,
  updated_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can upsert own profile"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RECIPES
create table if not exists public.recipes (
  id           text primary key,
  title        text not null,
  image        text,
  ingredients  jsonb not null default '[]',
  instructions text,
  source       text not null default 'custom',  -- 'mealdb' | 'custom'
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  category     text,
  area         text
);

alter table public.recipes enable row level security;

-- Anyone can read mealdb recipes; users can read their own custom recipes
create policy "Read mealdb recipes"
  on public.recipes for select
  using (source = 'mealdb');

create policy "Users can read own custom recipes"
  on public.recipes for select
  using (auth.uid() = created_by);

-- Authenticated users can insert/update recipes
create policy "Authenticated users can upsert recipes"
  on public.recipes for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update recipes"
  on public.recipes for update
  to authenticated
  using (true);

-- Users can delete only their own custom recipes
create policy "Users can delete own recipes"
  on public.recipes for delete
  using (auth.uid() = created_by);

-- WEEKLY PLAN
create table if not exists public.weekly_plan (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  week_start  date not null,
  day         text not null,  -- 'Mon' | 'Tue' | ... | 'Sun'
  meal_type   text not null,  -- 'breakfast' | 'lunch' | 'dinner'
  recipe_id   text not null references public.recipes(id),
  portions    integer not null default 2,
  unique (user_id, week_start, day, meal_type)
);

alter table public.weekly_plan enable row level security;

create policy "Users can manage own plan"
  on public.weekly_plan for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- SHOPPING LIST
create table if not exists public.shopping_list (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  week_start  date not null,
  name        text not null,
  amount      text,
  unit        text,
  checked     boolean not null default false,
  recipe_id   text references public.recipes(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.shopping_list enable row level security;

create policy "Users can manage own shopping list"
  on public.shopping_list for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- STORAGE: recipe-images bucket
insert into storage.buckets (id, name, public)
  values ('recipe-images', 'recipe-images', true)
  on conflict (id) do nothing;

create policy "Authenticated users can upload images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recipe-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public read for recipe images"
  on storage.objects for select
  using (bucket_id = 'recipe-images');

create policy "Users can delete own images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'recipe-images' and auth.uid()::text = (storage.foldername(name))[1]);
