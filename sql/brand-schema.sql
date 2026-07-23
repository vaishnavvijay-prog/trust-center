-- Per-brand schema for a shared Supabase project.
--
-- Several trust centers can live in one Supabase project by giving each brand
-- its own Postgres schema. The app scopes its client to a single schema via
-- TRUST_DB_SCHEMA (see src/lib/supabase.ts), so brands cannot see each other.
--
-- Run this once per brand in the SQL editor, changing the schema name.
-- A single-brand project needs nothing here — it uses `public`.
--
-- After running, add the schema to Project Settings -> API -> Exposed schemas,
-- otherwise PostgREST returns "The schema must be one of the following".

-- ---------------------------------------------------------------------------
-- Change this line per brand: zuro | dashverge | astridex
-- ---------------------------------------------------------------------------
create schema if not exists zuro;

create table if not exists zuro.document_requests (
  id text primary key,
  email text not null,
  document text not null,
  company text not null,
  message text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists zuro.trust_configs (
  id text primary key,
  yaml text not null,
  updated_at timestamptz not null default now()
);

-- Only service_role gets access. The app is server-side and uses that key.
-- anon and authenticated are deliberately granted nothing, so putting this
-- schema on the Data API does not make document requests (which hold visitor
-- emails) publicly readable.
grant usage on schema zuro to service_role;
grant all privileges on all tables in schema zuro to service_role;
alter default privileges in schema zuro grant all on tables to service_role;

-- Defence in depth: even with the grants above, RLS is on and there are no
-- policies, so every role except service_role (which bypasses RLS) is denied.
alter table zuro.document_requests enable row level security;
alter table zuro.trust_configs enable row level security;
