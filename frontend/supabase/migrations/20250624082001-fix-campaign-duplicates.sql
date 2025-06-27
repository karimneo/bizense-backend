-- Fix campaign_reports duplicate issue by adding proper unique constraint
-- This ensures upsert works correctly to prevent duplicates

-- First, let's check if we have the required columns with proper indices
CREATE UNIQUE INDEX IF NOT EXISTS campaign_reports_unique_idx 
ON campaign_reports (user_id, campaign_name, reporting_starts) 
WHERE campaign_name IS NOT NULL AND reporting_starts IS NOT NULL;

-- Also add missing columns if they don't exist (from server logs)
ALTER TABLE campaign_reports 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update any null created_at values
UPDATE campaign_reports 
SET created_at = NOW() 
WHERE created_at IS NULL; 