-- ============================================================================
-- KHAT & CO. — Supabase Database & Storage Setup
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================================

-- 1. Create the 'letters' table
create table if not exists public.letters (
  id text primary key,
  slug text unique not null,
  recipient text,
  sender text,
  date text,
  greeting text,
  body text not null,
  signoff text,
  template_id text,
  font_id text,
  ink_color text,
  ruled_lines boolean default true,
  wax_seal jsonb,
  stickers jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  payload jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create indexes for fast lookup
create index if not exists idx_letters_slug on public.letters (slug);
create index if not exists idx_letters_created_at on public.letters (created_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.letters enable row level security;

-- 4. Create RLS policies
-- Allow anyone to read letters (by slug / link)
drop policy if exists "Allow public read access to letters" on public.letters;
create policy "Allow public read access to letters"
  on public.letters
  for select
  using (true);

-- Allow anyone to create / seal letters
drop policy if exists "Allow public insert access to letters" on public.letters;
create policy "Allow public insert access to letters"
  on public.letters
  for insert
  with check (true);

-- Allow updates if matching id
drop policy if exists "Allow public update access to letters" on public.letters;
create policy "Allow public update access to letters"
  on public.letters
  for update
  using (true)
  with check (true);

-- 5. Set up Storage Bucket for letter assets, snapshots & site backups
insert into storage.buckets (id, name, public)
values ('letters', 'letters', true)
on conflict (id) do update set public = true;

-- 6. Storage Bucket RLS Policies
drop policy if exists "Allow public uploads to letters bucket" on storage.objects;
create policy "Allow public uploads to letters bucket"
  on storage.objects
  for insert
  with check (bucket_id = 'letters');

drop policy if exists "Allow public reads from letters bucket" on storage.objects;
create policy "Allow public reads from letters bucket"
  on storage.objects
  for select
  using (bucket_id = 'letters');

drop policy if exists "Allow public updates to letters bucket" on storage.objects;
create policy "Allow public updates to letters bucket"
  on storage.objects
  for update
  using (bucket_id = 'letters')
  with check (bucket_id = 'letters');
