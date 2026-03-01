-- Life in Weeks — Full Database Schema (reference)
-- For migration from an existing DB, use migration.sql instead.

-- 0. Extensions
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. Profiles (extends auth.users)
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null unique,
  full_name   text,
  first_name  text,
  last_name   text,
  birth_date  date,
  avatar_url  text,
  timezone    text default 'UTC',
  preferences jsonb default '{}'::jsonb,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────────
-- 2. User Settings
-- ────────────────────────────────────────────────────────────
create table if not exists public.user_settings (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references auth.users on delete cascade not null unique,
  dark_mode           boolean default false not null,
  email_notifications boolean default true not null,
  lifespan_years      integer default 90 not null
                        check (lifespan_years >= 50 and lifespan_years <= 120),
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────────
-- 3. Tasks
-- ────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references auth.users on delete cascade not null,
  title       text not null
                check (char_length(title) >= 1 and char_length(title) <= 200),
  description text check (char_length(description) <= 1000),
  date        date not null,
  time        time,
  priority    text not null check (priority in ('high', 'medium', 'low')),
  completed   boolean default false not null,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────────
-- 4. Goals
-- ────────────────────────────────────────────────────────────
create table if not exists public.goals (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references auth.users on delete cascade not null,
  title               text not null
                        check (char_length(title) >= 2 and char_length(title) <= 100),
  description         text check (char_length(description) <= 500),
  target_date         date not null,
  progress            integer default 0 not null
                        check (progress >= 0 and progress <= 100),
  color               text not null
                        check (color in ('orange', 'blue', 'green', 'purple')),
  icon                text,
  category            text check (category in (
                        'health', 'finance', 'career', 'personal', 'skill', 'leisure'
                      )),
  target_metric       text check (char_length(target_metric) <= 50),
  reminder_frequency  text default 'none'
                        check (reminder_frequency in (
                          'none', 'daily', 'weekly', 'biweekly', 'monthly'
                        )),
  completed           boolean default false not null,
  completed_at        timestamptz,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);

-- ────────────────────────────────────────────────────────────
-- 5. Invite codes
-- ────────────────────────────────────────────────────────────
create table if not exists public.invite_codes (
  id          uuid default uuid_generate_v4() primary key,
  code        text not null unique,
  used        boolean default false not null,
  used_by     uuid references auth.users on delete set null,
  created_at  timestamptz default now() not null
);
