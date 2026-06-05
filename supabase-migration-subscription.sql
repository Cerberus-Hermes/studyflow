-- Migration: Add subscription fields to existing users table
-- Run this in Supabase SQL Editor if you have existing data

-- Add subscription columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  ADD COLUMN IF NOT EXISTS ai_credits_used INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_credits_limit INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Create ai_usage table
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL CHECK (tool_type IN ('summary', 'flashcards', 'tasks', 'quiz')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for ai_usage
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy
DROP POLICY IF EXISTS "ai_usage_allow_all" ON ai_usage;
CREATE POLICY "ai_usage_allow_all" ON ai_usage FOR ALL USING (true) WITH CHECK (true);

-- Add index for subscription tier
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage(created_at DESC);

-- Update existing users to have default subscription values
UPDATE users
SET subscription_tier = 'free',
    ai_credits_used = 0,
    ai_credits_limit = 10
WHERE subscription_tier IS NULL;
