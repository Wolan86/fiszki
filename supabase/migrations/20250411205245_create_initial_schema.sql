-- Migration: create_initial_schema
-- Description: Creates the initial database schema for Fiszki AI application
-- Created At: 2025-04-11
-- Author: Database Migration System
--
-- This migration creates the following:
-- 1. source_texts table for storing text content used to generate flashcards
-- 2. flashcards table for storing the actual flashcard data
-- 3. Necessary indexes, triggers, functions, and security policies

-- ==================== TABLES ==================== 

-- Table: source_texts
-- Purpose: Stores text content that will be used to generate flashcards
create table source_texts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    content text not null,
    created_at timestamp with time zone default now() not null,
    
    -- Ensures content is of reasonable length (between 1000 and 10000 characters)
    constraint content_min_length check (length(content) >= 1000),
    constraint content_max_length check (length(content) <= 10000)
);

-- Index to improve query performance when filtering by user_id
create index idx_source_texts_user_id on source_texts(user_id);

-- Custom enum type for tracking how flashcards were created
create type flashcard_creation_type as enum ('ai_generated', 'ai_edited', 'manual');

-- Table: flashcards
-- Purpose: Stores flashcard data with front and back content
create table flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    source_text_id uuid references source_texts(id) on delete set null,
    front_content text not null,
    back_content text not null,
    creation_type flashcard_creation_type null,
    accepted boolean default true,
    generation_time_ms integer,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    
    -- Ensure both sides of flashcard have content
    constraint non_empty_front check (length(front_content) > 0),
    constraint non_empty_back check (length(back_content) > 0),
    
    -- Validation rules based on creation type
    constraint valid_generation_time check (
        (creation_type in ('ai_generated', 'ai_edited') and generation_time_ms is not null) or
        (creation_type = 'manual' and generation_time_ms is null)
    ),
    constraint valid_source_text check (
        (creation_type in ('ai_generated', 'ai_edited') and source_text_id is not null) or
        (creation_type = 'manual')
    )
);

-- Indexes to improve query performance
create index idx_flashcards_user_id on flashcards(user_id);
create index idx_flashcards_source_text_id on flashcards(source_text_id);
create index idx_flashcards_creation_type on flashcards(creation_type);

-- ==================== TRIGGERS ==================== 

-- Function: update_flashcard_timestamp
-- Purpose: Automatically updates the updated_at field when a flashcard is modified
create or replace function update_flashcard_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger to automatically update timestamps
create trigger set_flashcard_timestamp
before update on flashcards
for each row
execute function update_flashcard_timestamp();

-- ==================== FUNCTIONS ==================== 

-- Function: get_random_flashcards
-- Purpose: Retrieves a random set of flashcards for a specific user
create or replace function get_random_flashcards(
    p_user_id uuid,
    p_limit integer default 10
)
returns setof flashcards as $$
begin
    return query
    select *
    from flashcards
    where user_id = p_user_id
    order by random()
    limit p_limit;
end;
$$ language plpgsql;

-- ==================== ROW LEVEL SECURITY ==================== 

-- Enable row level security on all tables
alter table source_texts enable row level security;
alter table flashcards enable row level security;

-- RLS policies for source_texts table

-- Policy: source_texts_select_policy
-- Purpose: Controls who can view source texts
-- Only the owner (authenticated user) can view their own source texts
create policy source_texts_select_policy on source_texts
    for select
    using (auth.uid() = user_id);

-- Policy: source_texts_insert_policy
-- Purpose: Controls who can add new source texts
-- Only authenticated users can add source texts and they must be the owner
create policy source_texts_insert_policy on source_texts
    for insert
    with check (auth.uid() = user_id);

-- Policy: source_texts_update_policy
-- Purpose: Controls who can modify existing source texts
-- Only the owner can update their own source texts
create policy source_texts_update_policy on source_texts
    for update
    using (auth.uid() = user_id);

-- Policy: source_texts_delete_policy
-- Purpose: Controls who can delete source texts
-- Only the owner can delete their own source texts
create policy source_texts_delete_policy on source_texts
    for delete
    using (auth.uid() = user_id);

-- RLS policies for flashcards table

-- Policy: flashcards_select_policy
-- Purpose: Controls who can view flashcards
-- Only the owner (authenticated user) can view their own flashcards
create policy flashcards_select_policy on flashcards
    for select
    using (auth.uid() = user_id);

-- Policy: flashcards_insert_policy
-- Purpose: Controls who can add new flashcards
-- Only authenticated users can add flashcards and they must be the owner
create policy flashcards_insert_policy on flashcards
    for insert
    with check (auth.uid() = user_id);

-- Policy: flashcards_update_policy
-- Purpose: Controls who can modify existing flashcards
-- Only the owner can update their own flashcards
create policy flashcards_update_policy on flashcards
    for update
    using (auth.uid() = user_id);

-- Policy: flashcards_delete_policy
-- Purpose: Controls who can delete flashcards
-- Only the owner can delete their own flashcards
create policy flashcards_delete_policy on flashcards
    for delete
    using (auth.uid() = user_id);

-- Note: Separate policies for anon role are not created as this app
-- requires authentication for all operations on these tables 