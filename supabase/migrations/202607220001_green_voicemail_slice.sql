-- First Artiqal content migration slice: Listening to a Voicemail / Green only.
-- Authentication remains owned by the existing application backend.

create extension if not exists pgcrypto;

create table if not exists public.voicemail_levels (
    id uuid primary key,
    activity_slug text not null,
    legacy_level_key text not null,
    title text not null,
    language_code text not null,
    language_name text not null,
    theme_pack_slug text not null,
    theme_pack_name text not null,
    interaction_mode text not null check (interaction_mode in ('single', 'multiple')),
    status text not null check (status in ('draft', 'published')),
    sort_order integer not null check (sort_order >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (activity_slug, legacy_level_key)
);

create table if not exists public.voicemail_items (
    id uuid primary key,
    level_id uuid not null references public.voicemail_levels(id) on delete cascade,
    legacy_item_id text not null,
    title text not null,
    summary text not null default '',
    body_text text not null default '',
    transcript text not null,
    audio_source_url text not null,
    duration_label text,
    letterhead_data jsonb not null default '{}'::jsonb,
    language_code text not null,
    theme_pack_slug text not null,
    interaction_mode text not null check (interaction_mode in ('single', 'multiple')),
    status text not null check (status in ('draft', 'published')),
    sort_order integer not null check (sort_order >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (level_id, legacy_item_id),
    unique (level_id, sort_order)
);

create table if not exists public.voicemail_questions (
    id uuid primary key,
    item_id uuid not null references public.voicemail_items(id) on delete cascade,
    legacy_question_id text not null,
    prompt text not null,
    replay_key text,
    status text not null check (status in ('draft', 'published')),
    sort_order integer not null check (sort_order >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (item_id, legacy_question_id),
    unique (item_id, sort_order)
);

create table if not exists public.voicemail_answer_options (
    id uuid primary key,
    question_id uuid not null references public.voicemail_questions(id) on delete cascade,
    legacy_option_id text not null,
    option_text text not null,
    is_correct boolean not null default false,
    sort_order integer not null check (sort_order >= 0),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (question_id, legacy_option_id),
    unique (question_id, sort_order)
);

create index if not exists voicemail_items_published_order_idx
    on public.voicemail_items (level_id, status, sort_order);
create index if not exists voicemail_questions_published_order_idx
    on public.voicemail_questions (item_id, status, sort_order);
create index if not exists voicemail_answer_options_order_idx
    on public.voicemail_answer_options (question_id, sort_order);

alter table public.voicemail_levels enable row level security;
alter table public.voicemail_items enable row level security;
alter table public.voicemail_questions enable row level security;
alter table public.voicemail_answer_options enable row level security;

-- No client policies are created. The existing backend is the only content
-- reader/writer and uses a server-side service-role credential.
revoke all on public.voicemail_levels from anon, authenticated;
revoke all on public.voicemail_items from anon, authenticated;
revoke all on public.voicemail_questions from anon, authenticated;
revoke all on public.voicemail_answer_options from anon, authenticated;

grant select, insert, update, delete on public.voicemail_levels to service_role;
grant select, insert, update, delete on public.voicemail_items to service_role;
grant select, insert, update, delete on public.voicemail_questions to service_role;
grant select, insert, update, delete on public.voicemail_answer_options to service_role;
