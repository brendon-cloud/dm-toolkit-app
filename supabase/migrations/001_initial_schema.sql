-- ================================================================
-- The DM Toolkit — Archivist Database Schema
-- Migration 001: Initial schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ================================================================

-- ── Extensions ──
create extension if not exists "uuid-ossp";

-- ── Profiles (extends Supabase Auth users) ──
create table public.profiles (
  id                uuid references auth.users(id) on delete cascade primary key,
  email             text not null,
  plan              text not null default 'free' check (plan in ('free', 'pro')),
  trial_ends_at     timestamptz default (now() + interval '14 days'),
  stripe_customer_id text unique,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Campaigns ──
create table public.campaigns (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  setting      text,
  world_notes  text,
  cover_color  text not null default '#7c5ce8',
  archived     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── Sessions ──
create table public.sessions (
  id             uuid primary key default uuid_generate_v4(),
  campaign_id    uuid not null references public.campaigns(id) on delete cascade,
  session_number integer,
  title          text,
  date           date,
  raw_notes      text,
  audio_url      text,
  processed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ── Chronicle Sections (AI output per session) ──
create table public.chronicle_sections (
  id            uuid primary key default uuid_generate_v4(),
  session_id    uuid not null references public.sessions(id) on delete cascade,
  section_type  text not null check (section_type in (
    'chronicle', 'npcs', 'encounters', 'quests', 'loot', 'mysteries', 'next_session'
  )),
  data          jsonb not null default '{}',
  display_order integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ── Entities (persistent across sessions) ──
create table public.entities (
  id                uuid primary key default uuid_generate_v4(),
  campaign_id       uuid not null references public.campaigns(id) on delete cascade,
  type              text not null check (type in ('npc', 'location', 'faction', 'item', 'event')),
  name              text not null,
  description       text,
  data              jsonb not null default '{}',
  session_first_seen uuid references public.sessions(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Entity Relationships (for lore map, Phase 3) ──
create table public.relationships (
  id              uuid primary key default uuid_generate_v4(),
  campaign_id     uuid not null references public.campaigns(id) on delete cascade,
  from_entity_id  uuid not null references public.entities(id) on delete cascade,
  to_entity_id    uuid not null references public.entities(id) on delete cascade,
  label           text not null,
  strength        integer default 1 check (strength between 1 and 5),
  created_at      timestamptz not null default now()
);

-- ── Processing Jobs ──
create table public.processing_jobs (
  id           uuid primary key default uuid_generate_v4(),
  session_id   uuid not null references public.sessions(id) on delete cascade,
  status       text not null default 'queued' check (status in ('queued', 'processing', 'done', 'failed')),
  error        text,
  started_at   timestamptz,
  completed_at timestamptz,
  created_at   timestamptz not null default now()
);

-- ================================================================
-- Row Level Security (RLS)
-- Users can only access their own data.
-- ================================================================

alter table public.profiles          enable row level security;
alter table public.campaigns         enable row level security;
alter table public.sessions          enable row level security;
alter table public.chronicle_sections enable row level security;
alter table public.entities          enable row level security;
alter table public.relationships     enable row level security;
alter table public.processing_jobs   enable row level security;

-- ── Profiles ──
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- ── Campaigns ──
create policy "Users can CRUD own campaigns"
  on public.campaigns for all using (auth.uid() = user_id);

-- ── Sessions ──
create policy "Users can CRUD own sessions"
  on public.sessions for all
  using (campaign_id in (
    select id from public.campaigns where user_id = auth.uid()
  ));

-- ── Chronicle Sections ──
create policy "Users can CRUD own chronicle sections"
  on public.chronicle_sections for all
  using (session_id in (
    select s.id from public.sessions s
    join public.campaigns c on s.campaign_id = c.id
    where c.user_id = auth.uid()
  ));

-- ── Entities ──
create policy "Users can CRUD own entities"
  on public.entities for all
  using (campaign_id in (
    select id from public.campaigns where user_id = auth.uid()
  ));

-- ── Relationships ──
create policy "Users can CRUD own relationships"
  on public.relationships for all
  using (campaign_id in (
    select id from public.campaigns where user_id = auth.uid()
  ));

-- ── Processing Jobs ──
create policy "Users can view own processing jobs"
  on public.processing_jobs for select
  using (session_id in (
    select s.id from public.sessions s
    join public.campaigns c on s.campaign_id = c.id
    where c.user_id = auth.uid()
  ));

-- ================================================================
-- Indexes (performance)
-- ================================================================

create index idx_campaigns_user_id      on public.campaigns(user_id);
create index idx_sessions_campaign_id   on public.sessions(campaign_id);
create index idx_chronicle_session_id   on public.chronicle_sections(session_id);
create index idx_entities_campaign_id   on public.entities(campaign_id);
create index idx_jobs_session_id        on public.processing_jobs(session_id);
create index idx_jobs_status            on public.processing_jobs(status);

-- ================================================================
-- Updated_at triggers
-- ================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_campaigns_updated_at before update on public.campaigns
  for each row execute procedure public.set_updated_at();
create trigger set_sessions_updated_at before update on public.sessions
  for each row execute procedure public.set_updated_at();
create trigger set_entities_updated_at before update on public.entities
  for each row execute procedure public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
