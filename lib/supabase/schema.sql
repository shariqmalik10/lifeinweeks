-- Life in Weeks Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
-- create extension if not exists "uuid-ossp";

-- -- User profiles table (extends auth.users)
-- create table if not exists public.profiles (
--   id uuid references auth.users on delete cascade primary key,
--   email text not null,
--   first_name text,
--   last_name text,
--   birth_date date,
--   avatar_url text,
--   created_at timestamptz default now() not null,
--   updated_at timestamptz default now() not null
-- );

-- -- User settings table
-- create table if not exists public.user_settings (
--   id uuid default uuid_generate_v4() primary key,
--   user_id uuid references auth.users on delete cascade not null unique,
--   dark_mode boolean default false not null,
--   email_notifications boolean default true not null,
--   lifespan_years integer default 90 not null check (lifespan_years >= 50 and lifespan_years <= 120),
--   created_at timestamptz default now() not null,
--   updated_at timestamptz default now() not null
-- );

-- -- Tasks table
-- create table if not exists public.tasks (
--   id uuid default uuid_generate_v4() primary key,
--   user_id uuid references auth.users on delete cascade not null,
--   title text not null check (char_length(title) >= 2 and char_length(title) <= 200),
--   description text check (char_length(description) <= 1000),
--   date date not null,
--   time time,
--   priority text not null check (priority in ('high', 'medium', 'low')),
--   completed boolean default false not null,
--   created_at timestamptz default now() not null,
--   updated_at timestamptz default now() not null
-- );

-- -- Goals table
-- create table if not exists public.goals (
--   id uuid default uuid_generate_v4() primary key,
--   user_id uuid references auth.users on delete cascade not null,
--   title text not null check (char_length(title) >= 2 and char_length(title) <= 100),
--   description text check (char_length(description) <= 500),
--   target_date date not null,
--   progress integer default 0 not null check (progress >= 0 and progress <= 100),
--   color text not null check (color in ('orange', 'blue', 'green', 'purple')),
--   icon text,
--   created_at timestamptz default now() not null,
--   updated_at timestamptz default now() not null
-- );

-- -- Create indexes for better query performance
-- create index if not exists tasks_user_id_idx on public.tasks(user_id);
-- create index if not exists tasks_date_idx on public.tasks(date);
-- create index if not exists tasks_user_date_idx on public.tasks(user_id, date);
-- create index if not exists goals_user_id_idx on public.goals(user_id);
-- create index if not exists profiles_id_idx on public.profiles(id);

-- -- Enable Row Level Security
-- alter table public.profiles enable row level security;
-- alter table public.user_settings enable row level security;
-- alter table public.tasks enable row level security;
-- alter table public.goals enable row level security;

-- -- RLS Policies for profiles
-- create policy "Users can view own profile" 
--   on public.profiles for select 
--   using (auth.uid() = id);

-- create policy "Users can update own profile" 
--   on public.profiles for update 
--   using (auth.uid() = id);

-- create policy "Users can insert own profile" 
--   on public.profiles for insert 
--   with check (auth.uid() = id);

-- -- RLS Policies for user_settings
-- create policy "Users can view own settings" 
--   on public.user_settings for select 
--   using (auth.uid() = user_id);

-- create policy "Users can update own settings" 
--   on public.user_settings for update 
--   using (auth.uid() = user_id);

-- create policy "Users can insert own settings" 
--   on public.user_settings for insert 
--   with check (auth.uid() = user_id);

-- -- RLS Policies for tasks
-- create policy "Users can view own tasks" 
--   on public.tasks for select 
--   using (auth.uid() = user_id);

-- create policy "Users can create own tasks" 
--   on public.tasks for insert 
--   with check (auth.uid() = user_id);

-- create policy "Users can update own tasks" 
--   on public.tasks for update 
--   using (auth.uid() = user_id);

-- create policy "Users can delete own tasks" 
--   on public.tasks for delete 
--   using (auth.uid() = user_id);

-- -- RLS Policies for goals
-- create policy "Users can view own goals" 
--   on public.goals for select 
--   using (auth.uid() = user_id);

-- create policy "Users can create own goals" 
--   on public.goals for insert 
--   with check (auth.uid() = user_id);

-- create policy "Users can update own goals" 
--   on public.goals for update 
--   using (auth.uid() = user_id);

-- create policy "Users can delete own goals" 
--   on public.goals for delete 
--   using (auth.uid() = user_id);

-- -- Function to create profile on user signup
-- create or replace function public.handle_new_user()
-- returns trigger as $$
-- begin
--   insert into public.profiles (id, email)
--   values (new.id, new.email);
  
--   insert into public.user_settings (user_id)
--   values (new.id);
  
--   return new;
-- end;
-- $$ language plpgsql security definer;

-- -- Trigger to create profile on signup
-- drop trigger if exists on_auth_user_created on auth.users;
-- create trigger on_auth_user_created
--   after insert on auth.users
--   for each row execute procedure public.handle_new_user();

-- -- Function to update updated_at timestamp
-- create or replace function public.update_updated_at_column()
-- returns trigger as $$
-- begin
--   new.updated_at = now();
--   return new;
-- end;
-- $$ language plpgsql;

-- -- Triggers for updated_at
-- create trigger update_profiles_updated_at
--   before update on public.profiles
--   for each row execute procedure public.update_updated_at_column();

-- create trigger update_user_settings_updated_at
--   before update on public.user_settings
--   for each row execute procedure public.update_updated_at_column();

-- create trigger update_tasks_updated_at
--   before update on public.tasks
--   for each row execute procedure public.update_updated_at_column();

-- create trigger update_goals_updated_at
--   before update on public.goals
--   for each row execute procedure public.update_updated_at_column();
