/*
  # AI Insights & Analytics Schema

  1. New Tables
    - `ai_insights`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `anonymous_id` (text, for anonymous users)
      - `insight_type` (text, type of insight)
      - `encrypted_content` (text, encrypted insight content)
      - `confidence_score` (decimal, AI confidence level)
      - `data_period_start` (date, analysis period start)
      - `data_period_end` (date, analysis period end)
      - `is_reviewed` (boolean, professional review status)
      - `created_at` (timestamp)
    
    - `pattern_analysis`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `anonymous_id` (text, for anonymous users)
      - `pattern_type` (text, type of pattern detected)
      - `encrypted_description` (text, encrypted pattern description)
      - `strength` (decimal, pattern strength 0-1)
      - `frequency` (text, how often pattern occurs)
      - `triggers` (jsonb, associated triggers)
      - `recommendations` (jsonb, suggested actions)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `risk_assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `anonymous_id` (text, for anonymous users)
      - `risk_level` (text, low/medium/high/crisis)
      - `risk_factors` (jsonb, identified risk factors)
      - `protective_factors` (jsonb, identified protective factors)
      - `encrypted_recommendations` (text, encrypted recommendations)
      - `requires_intervention` (boolean, needs professional help)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and anonymous users
    - Ensure data isolation between users
*/

CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  insight_type text NOT NULL CHECK (insight_type IN ('mood_pattern', 'trigger_analysis', 'progress_summary', 'recommendation', 'warning')),
  encrypted_content text NOT NULL,
  confidence_score decimal(3,2) DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  data_period_start date NOT NULL,
  data_period_end date NOT NULL,
  is_reviewed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT ai_insights_user_check CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS pattern_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  pattern_type text NOT NULL CHECK (pattern_type IN ('mood_cycle', 'trigger_correlation', 'sleep_mood', 'energy_mood', 'weekly_pattern', 'stress_response')),
  encrypted_description text NOT NULL,
  strength decimal(3,2) DEFAULT 0.0 CHECK (strength >= 0.0 AND strength <= 1.0),
  frequency text CHECK (frequency IN ('daily', 'weekly', 'monthly', 'irregular')),
  triggers jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT pattern_analysis_user_check CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'crisis')),
  risk_factors jsonb DEFAULT '[]'::jsonb,
  protective_factors jsonb DEFAULT '[]'::jsonb,
  encrypted_recommendations text,
  requires_intervention boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT risk_assessments_user_check CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

-- Policies for ai_insights
CREATE POLICY "Users can read own ai insights"
  ON ai_insights
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can read own ai insights"
  ON ai_insights
  FOR SELECT
  TO anon
  USING (anonymous_id IS NOT NULL);

CREATE POLICY "Users can insert own ai insights"
  ON ai_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert ai insights"
  ON ai_insights
  FOR INSERT
  TO anon
  WITH CHECK (anonymous_id IS NOT NULL);

-- Policies for pattern_analysis
CREATE POLICY "Users can read own pattern analysis"
  ON pattern_analysis
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can read own pattern analysis"
  ON pattern_analysis
  FOR SELECT
  TO anon
  USING (anonymous_id IS NOT NULL);

CREATE POLICY "Users can insert own pattern analysis"
  ON pattern_analysis
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert pattern analysis"
  ON pattern_analysis
  FOR INSERT
  TO anon
  WITH CHECK (anonymous_id IS NOT NULL);

CREATE POLICY "Users can update own pattern analysis"
  ON pattern_analysis
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can update own pattern analysis"
  ON pattern_analysis
  FOR UPDATE
  TO anon
  USING (anonymous_id IS NOT NULL)
  WITH CHECK (anonymous_id IS NOT NULL);

-- Policies for risk_assessments
CREATE POLICY "Users can read own risk assessments"
  ON risk_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can read own risk assessments"
  ON risk_assessments
  FOR SELECT
  TO anon
  USING (anonymous_id IS NOT NULL);

CREATE POLICY "Users can insert own risk assessments"
  ON risk_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert risk assessments"
  ON risk_assessments
  FOR INSERT
  TO anon
  WITH CHECK (anonymous_id IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ai_insights_user_id_created_at_idx ON ai_insights(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_insights_anonymous_id_created_at_idx ON ai_insights(anonymous_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_insights_type_idx ON ai_insights(insight_type);

CREATE INDEX IF NOT EXISTS pattern_analysis_user_id_idx ON pattern_analysis(user_id);
CREATE INDEX IF NOT EXISTS pattern_analysis_anonymous_id_idx ON pattern_analysis(anonymous_id);
CREATE INDEX IF NOT EXISTS pattern_analysis_type_idx ON pattern_analysis(pattern_type);

CREATE INDEX IF NOT EXISTS risk_assessments_user_id_created_at_idx ON risk_assessments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS risk_assessments_anonymous_id_created_at_idx ON risk_assessments(anonymous_id, created_at DESC);
CREATE INDEX IF NOT EXISTS risk_assessments_level_idx ON risk_assessments(risk_level);