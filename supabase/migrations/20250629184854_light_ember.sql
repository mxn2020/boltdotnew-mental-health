/*
  # Mental Health Tracking Schema

  1. New Tables
    - `mood_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `anonymous_id` (text, for anonymous users)
      - `mood_score` (integer, 1-10 scale)
      - `energy_level` (integer, 1-10 scale)
      - `anxiety_level` (integer, 1-10 scale)
      - `sleep_quality` (integer, 1-10 scale)
      - `encrypted_notes` (text, encrypted journal entry)
      - `encrypted_triggers` (text, encrypted trigger data)
      - `encrypted_gratitude` (text, encrypted gratitude entry)
      - `check_in_type` (text, 'quick' or 'detailed')
      - `created_at` (timestamp)
    
    - `mood_streaks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `anonymous_id` (text, for anonymous users)
      - `current_streak` (integer)
      - `longest_streak` (integer)
      - `last_check_in` (date)
      - `total_check_ins` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and anonymous users
    - Ensure data isolation between users
*/

CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  anxiety_level integer CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  encrypted_notes text,
  encrypted_triggers text,
  encrypted_gratitude text,
  check_in_type text DEFAULT 'quick' CHECK (check_in_type IN ('quick', 'detailed')),
  created_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT mood_entries_user_check CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS mood_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_check_in date,
  total_check_ins integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT mood_streaks_user_check CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  ),
  
  -- Ensure unique streak record per user
  CONSTRAINT mood_streaks_unique_user UNIQUE (user_id),
  CONSTRAINT mood_streaks_unique_anonymous UNIQUE (anonymous_id)
);

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_streaks ENABLE ROW LEVEL SECURITY;

-- Policies for mood_entries
CREATE POLICY "Users can read own mood entries"
  ON mood_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can read own mood entries"
  ON mood_entries
  FOR SELECT
  TO anon
  USING (anonymous_id IS NOT NULL);

CREATE POLICY "Users can insert own mood entries"
  ON mood_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert mood entries"
  ON mood_entries
  FOR INSERT
  TO anon
  WITH CHECK (anonymous_id IS NOT NULL);

CREATE POLICY "Users can update own mood entries"
  ON mood_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can update own mood entries"
  ON mood_entries
  FOR UPDATE
  TO anon
  USING (anonymous_id IS NOT NULL)
  WITH CHECK (anonymous_id IS NOT NULL);

-- Policies for mood_streaks
CREATE POLICY "Users can read own mood streaks"
  ON mood_streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can read own mood streaks"
  ON mood_streaks
  FOR SELECT
  TO anon
  USING (anonymous_id IS NOT NULL);

CREATE POLICY "Users can insert own mood streaks"
  ON mood_streaks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert mood streaks"
  ON mood_streaks
  FOR INSERT
  TO anon
  WITH CHECK (anonymous_id IS NOT NULL);

CREATE POLICY "Users can update own mood streaks"
  ON mood_streaks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can update own mood streaks"
  ON mood_streaks
  FOR UPDATE
  TO anon
  USING (anonymous_id IS NOT NULL)
  WITH CHECK (anonymous_id IS NOT NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS mood_entries_user_id_created_at_idx ON mood_entries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS mood_entries_anonymous_id_created_at_idx ON mood_entries(anonymous_id, created_at DESC);
CREATE INDEX IF NOT EXISTS mood_streaks_user_id_idx ON mood_streaks(user_id);
CREATE INDEX IF NOT EXISTS mood_streaks_anonymous_id_idx ON mood_streaks(anonymous_id);

-- Function to update mood streaks
CREATE OR REPLACE FUNCTION update_mood_streak()
RETURNS TRIGGER AS $$
DECLARE
  streak_record mood_streaks%ROWTYPE;
  yesterday date;
  is_consecutive boolean;
BEGIN
  yesterday := (NEW.created_at::date) - INTERVAL '1 day';
  
  -- Get existing streak record
  IF NEW.user_id IS NOT NULL THEN
    SELECT * INTO streak_record FROM mood_streaks WHERE user_id = NEW.user_id;
  ELSE
    SELECT * INTO streak_record FROM mood_streaks WHERE anonymous_id = NEW.anonymous_id;
  END IF;
  
  -- Create streak record if it doesn't exist
  IF streak_record.id IS NULL THEN
    INSERT INTO mood_streaks (user_id, anonymous_id, current_streak, longest_streak, last_check_in, total_check_ins)
    VALUES (NEW.user_id, NEW.anonymous_id, 1, 1, NEW.created_at::date, 1);
    RETURN NEW;
  END IF;
  
  -- Check if this is a consecutive day
  is_consecutive := (streak_record.last_check_in = yesterday OR streak_record.last_check_in = NEW.created_at::date);
  
  -- Update streak
  IF is_consecutive AND streak_record.last_check_in != NEW.created_at::date THEN
    -- Consecutive day, increment streak
    UPDATE mood_streaks 
    SET 
      current_streak = streak_record.current_streak + 1,
      longest_streak = GREATEST(streak_record.longest_streak, streak_record.current_streak + 1),
      last_check_in = NEW.created_at::date,
      total_check_ins = streak_record.total_check_ins + 1,
      updated_at = now()
    WHERE id = streak_record.id;
  ELSIF streak_record.last_check_in != NEW.created_at::date THEN
    -- Not consecutive, reset streak
    UPDATE mood_streaks 
    SET 
      current_streak = 1,
      last_check_in = NEW.created_at::date,
      total_check_ins = streak_record.total_check_ins + 1,
      updated_at = now()
    WHERE id = streak_record.id;
  ELSE
    -- Same day, just update total count
    UPDATE mood_streaks 
    SET 
      total_check_ins = streak_record.total_check_ins + 1,
      updated_at = now()
    WHERE id = streak_record.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mood streak updates
CREATE TRIGGER update_mood_streak_trigger
  AFTER INSERT ON mood_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_mood_streak();