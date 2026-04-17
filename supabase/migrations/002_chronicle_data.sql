-- Add chronicle_data column to sessions for storing AI-generated structured output
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS chronicle_data JSONB;
