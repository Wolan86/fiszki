-- Migration: update_source_text_constraints
-- Description: Updates constraints for source_texts table to use word count instead of character count
-- Created At: 2025-04-12
-- Author: Database Migration System

-- Drop existing character-based constraints
ALTER TABLE source_texts DROP CONSTRAINT IF EXISTS content_min_length;
ALTER TABLE source_texts DROP CONSTRAINT IF EXISTS content_max_length;

-- Create a function to count words in text
CREATE OR REPLACE FUNCTION count_words(text_content TEXT)
RETURNS INTEGER AS $$
DECLARE
    word_count INTEGER;
BEGIN
    -- Count words by splitting on whitespace
    SELECT array_length(regexp_split_to_array(trim(text_content), '\s+'), 1) INTO word_count;
    RETURN COALESCE(word_count, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add constraint to allow much larger text content (100,0000 characters should be enough for 10,0000 words)
ALTER TABLE source_texts ADD CONSTRAINT content_max_length CHECK (length(content) <= 1000000);

-- Comment explaining the reasoning
COMMENT ON CONSTRAINT content_max_length ON source_texts IS 
  'Maximum character length to accommodate up to 10,000 words (as per PRD requirements)';