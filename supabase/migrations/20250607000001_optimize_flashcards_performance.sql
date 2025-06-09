-- Migration: optimize_flashcards_performance
-- Description: Adds performance optimizations for flashcard queries
-- Created At: 2025-06-07
-- Author: Performance Optimization
--
-- This migration adds:
-- 1. Composite indexes for common query patterns
-- 2. Optimized random flashcard function for learning mode
-- 3. Performance monitoring views

-- ==================== PERFORMANCE INDEXES ==================== 

-- Composite index for flashcard list queries with filtering
-- Optimizes queries that filter by user_id + creation_type + accepted
create index idx_flashcards_user_creation_accepted 
on flashcards(user_id, creation_type, accepted);

-- Composite index for flashcard list queries with source text filtering
-- Optimizes queries that filter by user_id + source_text_id + accepted
create index idx_flashcards_user_source_accepted 
on flashcards(user_id, source_text_id, accepted);

-- Index for sorting by created_at (most common sort field)
-- Optimizes ORDER BY created_at queries
create index idx_flashcards_user_created_at 
on flashcards(user_id, created_at desc);

-- Index for sorting by front_content (for alphabetical sorting)
-- Optimizes ORDER BY front_content queries
create index idx_flashcards_user_front_content 
on flashcards(user_id, front_content);

-- Partial index for accepted flashcards only (learning mode optimization)
-- Optimizes queries that only need accepted flashcards
create index idx_flashcards_accepted_only 
on flashcards(user_id, created_at desc) 
where accepted = true;

-- ==================== OPTIMIZED FUNCTIONS ==================== 

-- Drop the existing function to replace it
drop function if exists get_random_flashcards(uuid, integer);

-- Optimized function: get_random_flashcards
-- Purpose: Retrieves random accepted flashcards for learning with better performance
create or replace function get_random_flashcards(
    p_user_id uuid,
    p_limit integer default 10
)
returns setof flashcards as $$
begin
    -- Use the partial index for better performance
    -- Only return accepted flashcards for learning
    return query
    select *
    from flashcards
    where user_id = p_user_id 
      and accepted = true
    order by random()
    limit p_limit;
end;
$$ language plpgsql;

-- Function: get_flashcard_stats
-- Purpose: Provides statistics for monitoring and analytics
create or replace function get_flashcard_stats(p_user_id uuid)
returns table(
    total_flashcards bigint,
    accepted_flashcards bigint,
    ai_generated_flashcards bigint,
    manual_flashcards bigint,
    avg_generation_time_ms numeric
) as $$
begin
    return query
    select 
        count(*) as total_flashcards,
        count(*) filter (where accepted = true) as accepted_flashcards,
        count(*) filter (where creation_type = 'ai_generated') as ai_generated_flashcards,
        count(*) filter (where creation_type = 'manual') as manual_flashcards,
        avg(generation_time_ms) filter (where generation_time_ms is not null) as avg_generation_time_ms
    from flashcards
    where user_id = p_user_id;
end;
$$ language plpgsql;

-- ==================== PERFORMANCE MONITORING ==================== 

-- View: flashcard_performance_metrics
-- Purpose: Provides insights into flashcard usage patterns
create or replace view flashcard_performance_metrics as
select 
    date_trunc('day', created_at) as date,
    creation_type,
    count(*) as flashcards_created,
    avg(generation_time_ms) filter (where generation_time_ms is not null) as avg_generation_time,
    count(*) filter (where accepted = true) as accepted_count,
    round(
        (count(*) filter (where accepted = true)::numeric / count(*)::numeric) * 100, 
        2
    ) as acceptance_rate_percent
from flashcards
where created_at >= current_date - interval '30 days'
group by date_trunc('day', created_at), creation_type
order by date desc, creation_type;

-- Grant permissions for the new function and view
grant execute on function get_flashcard_stats(uuid) to authenticated;
grant select on flashcard_performance_metrics to authenticated;

-- ==================== COMMENTS ==================== 

comment on index idx_flashcards_user_creation_accepted is 
'Composite index for filtering flashcards by user, creation type, and acceptance status';

comment on index idx_flashcards_user_source_accepted is 
'Composite index for filtering flashcards by user, source text, and acceptance status';

comment on index idx_flashcards_user_created_at is 
'Index for sorting flashcards by creation date (most common sort)';

comment on index idx_flashcards_user_front_content is 
'Index for sorting flashcards alphabetically by front content';

comment on index idx_flashcards_accepted_only is 
'Partial index for learning mode queries (accepted flashcards only)';

comment on function get_random_flashcards(uuid, integer) is 
'Optimized function to get random accepted flashcards for learning sessions';

comment on function get_flashcard_stats(uuid) is 
'Function to get comprehensive statistics about user flashcards';

comment on view flashcard_performance_metrics is 
'View providing performance metrics and usage patterns for flashcards'; 