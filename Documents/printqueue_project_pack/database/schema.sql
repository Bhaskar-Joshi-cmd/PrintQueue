-- PrintQueue database schema for Supabase PostgreSQL
-- Run once in Supabase Dashboard -> SQL Editor.
-- This design uses Express as the only data-access layer. Do not expose a secret key to the browser.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  full_name varchar(100) not null check (char_length(trim(full_name)) between 2 and 100),
  email varchar(255) not null unique,
  password_hash text not null,
  role text not null default 'student' check (role in ('student', 'staff')),
  created_at timestamptz not null default now()
);

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  document_name varchar(120) not null check (char_length(trim(document_name)) between 1 and 120),
  pages integer not null check (pages between 1 and 500),
  copies integer not null default 1 check (copies between 1 and 20),
  print_mode text not null default 'mono' check (print_mode in ('mono', 'color')),
  sides text not null default 'single' check (sides in ('single', 'double')),
  notes varchar(300),
  status text not null default 'queued'
    check (status in ('queued', 'printing', 'ready_for_pickup', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_print_jobs_user_id
  on public.print_jobs(user_id);

create index if not exists idx_print_jobs_status_created_at
  on public.print_jobs(status, created_at);

-- Enable RLS as a safety boundary. This app's browser does not query these tables directly.
-- The backend secret key bypasses RLS, so Express must enforce ownership and role checks.
alter table public.users enable row level security;
alter table public.print_jobs enable row level security;

-- Remove direct table privileges from browser-facing roles for this architecture.
revoke all on table public.users from anon, authenticated;
revoke all on table public.print_jobs from anon, authenticated;

-- The Supabase secret key maps to the elevated server-side service role.
-- Keep that key in server environment variables only.
grant all on table public.users to service_role;
grant all on table public.print_jobs to service_role;
