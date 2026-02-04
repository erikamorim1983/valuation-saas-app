-- Create a table for public profiles using Supabase patterns
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  company_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert to authenticated with check (auth.uid() IS NOT NULL AND auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update to authenticated using (auth.uid() IS NOT NULL AND auth.uid() = id);

-- Handle new user signup automatically
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- User Profiles Table (Consultant vs Business Owner)
create table user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  user_type text not null check (user_type in ('consultant', 'business_owner')),
  full_name text not null,
  phone text,
  company_name text,
  specialization text,
  professional_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  onboarding_completed boolean default false,
  
  constraint full_name_length check (char_length(full_name) >= 2)
);

-- RLS for User Profiles
alter table user_profiles enable row level security;

create policy "Users can view own profile." on user_profiles
  for select to authenticated using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can insert own profile." on user_profiles
  for insert to authenticated with check (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can update own profile." on user_profiles
  for update to authenticated using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can delete own profile." on user_profiles
  for delete to authenticated using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Trigger for user_profiles updated_at
create trigger on_user_profile_updated
  before update on user_profiles
  for each row execute procedure public.handle_updated_at();


-- Companies Table (Consultants can have multiple, Business Owners limited to 1)
create table companies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_by uuid references auth.users on delete cascade,
  name text not null,
  website text,
  industry text not null,
  sub_industry text not null,
  founding_year integer not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint company_name_length check (char_length(name) >= 2),
  constraint description_length check (char_length(description) >= 10)
);

-- RLS for Companies
alter table companies enable row level security;

create policy "Users can view own company." on companies
  for select to authenticated using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can insert own company." on companies
  for insert to authenticated with check (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can update own company." on companies
  for update to authenticated using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can delete own company." on companies
  for delete to authenticated using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Trigger to update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger on_company_updated
  before update on companies
  for each row execute procedure public.handle_updated_at();


-- Valuations Table
create type valuation_status as enum ('draft', 'completed', 'archived');

create table valuations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- The core data
  financial_data jsonb not null default '{}'::jsonb,
  valuation_result jsonb,
  
  -- Metadata
  company_name text,
  sector text,
  currency text default 'USD',
  status valuation_status default 'draft',

  constraint financial_data_is_object check (jsonb_typeof(financial_data) = 'object')
);

-- RLS for Valuations
alter table valuations enable row level security;

create policy "Users can view own valuations." on valuations
  for select to authenticated using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can insert own valuations." on valuations
  for insert to authenticated with check (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can update own valuations." on valuations
  for update to authenticated using (auth.uid() IS NOT NULL AND auth.uid() = user_id);

create policy "Users can delete own valuations." on valuations
  for delete to authenticated using (auth.uid() IS NOT NULL AND auth.uid() = user_id);
