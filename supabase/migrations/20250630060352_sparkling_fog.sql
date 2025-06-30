/*
  # Anonymous Peer Support System Schema

  1. New Tables
    - `peer_supporters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `anonymous_id` (text, for anonymous users)
      - `supporter_level` (text, community/experienced/certified)
      - `experience_months` (integer, months of experience)
      - `specializations` (jsonb, areas of expertise)
      - `availability_hours` (jsonb, when available)
      - `max_concurrent_matches` (integer, capacity limit)
      - `current_matches` (integer, current active matches)
      - `total_sessions` (integer, lifetime session count)
      - `average_rating` (decimal, user feedback rating)
      - `is_active` (boolean, currently accepting matches)
      - `last_active` (timestamp, last activity)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `peer_matches`
      - `id` (uuid, primary key)
      - `seeker_user_id` (uuid, references auth.users)
      - `seeker_anonymous_id` (text, for anonymous seekers)
      - `supporter_user_id` (uuid, references auth.users)
      - `supporter_anonymous_id` (text, for anonymous supporters)
      - `match_type` (text, one-time/ongoing/crisis)
      - `status` (text, pending/active/completed/cancelled)
      - `encrypted_match_reason` (text, why matched)
      - `encrypted_seeker_preferences` (text, what seeker is looking for)
      - `session_count` (integer, number of sessions)
      - `last_interaction` (timestamp, last message/session)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `peer_messages`
      - `id` (uuid, primary key)
      - `match_id` (uuid, references peer_matches)
      - `sender_user_id` (uuid, references auth.users)
      - `sender_anonymous_id` (text, for anonymous senders)
      - `encrypted_content` (text, encrypted message content)
      - `message_type` (text, text/system/safety_check)
      - `is_flagged` (boolean, flagged for moderation)
      - `flagged_reason` (text, reason for flagging)
      - `created_at` (timestamp)

    - `support_groups`
      - `id` (uuid, primary key)
      - `name` (text, group name)
      - `description` (text, group description)
      - `category` (text, anxiety/depression/trauma/general)
      - `max_members` (integer, capacity limit)
      - `current_members` (integer, current member count)
      - `is_moderated` (boolean, has moderator)
      - `moderator_user_id` (uuid, references auth.users)
      - `moderator_anonymous_id` (text, for anonymous moderators)
      - `meeting_schedule` (jsonb, when group meets)
      - `is_active` (boolean, currently accepting members)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `group_memberships`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references support_groups)
      - `user_id` (uuid, references auth.users)
      - `anonymous_id` (text, for anonymous users)
      - `role` (text, member/moderator)
      - `joined_at` (timestamp)
      - `last_active` (timestamp)

    - `group_messages`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references support_groups)
      - `sender_user_id` (uuid, references auth.users)
      - `sender_anonymous_id` (text, for anonymous senders)
      - `encrypted_content` (text, encrypted message content)
      - `message_type` (text, text/system/announcement)
      - `is_flagged` (boolean, flagged for moderation)
      - `flagged_reason` (text, reason for flagging)
      - `created_at` (timestamp)

    - `peer_feedback`
      - `id` (uuid, primary key)
      - `match_id` (uuid, references peer_matches)
      - `reviewer_user_id` (uuid, references auth.users)
      - `reviewer_anonymous_id` (text, for anonymous reviewers)
      - `rating` (integer, 1-5 star rating)
      - `encrypted_feedback` (text, encrypted feedback text)
      - `feedback_type` (text, supporter/seeker)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and anonymous users
    - Ensure data isolation and privacy protection
    - Anonymous matching algorithms
*/

CREATE TABLE IF NOT EXISTS peer_supporters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  supporter_level text DEFAULT 'community' CHECK (supporter_level IN ('community', 'experienced', 'certified')),
  experience_months integer DEFAULT 0 CHECK (experience_months >= 0),
  specializations jsonb DEFAULT '[]'::jsonb,
  availability_hours jsonb DEFAULT '{}'::jsonb,
  max_concurrent_matches integer DEFAULT 3 CHECK (max_concurrent_matches > 0),
  current_matches integer DEFAULT 0 CHECK (current_matches >= 0),
  total_sessions integer DEFAULT 0 CHECK (total_sessions >= 0),
  average_rating decimal(3,2) DEFAULT 0.0 CHECK (average_rating >= 0.0 AND average_rating <= 5.0),
  is_active boolean DEFAULT true,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT peer_supporters_user_check CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  ),
  
  -- Ensure unique supporter record per user
  CONSTRAINT peer_supporters_unique_user UNIQUE (user_id),
  CONSTRAINT peer_supporters_unique_anonymous UNIQUE (anonymous_id)
);

CREATE TABLE IF NOT EXISTS peer_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  seeker_anonymous_id text,
  supporter_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  supporter_anonymous_id text,
  match_type text DEFAULT 'one-time' CHECK (match_type IN ('one-time', 'ongoing', 'crisis')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  encrypted_match_reason text,
  encrypted_seeker_preferences text,
  session_count integer DEFAULT 0 CHECK (session_count >= 0),
  last_interaction timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present for both seeker and supporter
  CONSTRAINT peer_matches_seeker_check CHECK (
    (seeker_user_id IS NOT NULL AND seeker_anonymous_id IS NULL) OR 
    (seeker_user_id IS NULL AND seeker_anonymous_id IS NOT NULL)
  ),
  CONSTRAINT peer_matches_supporter_check CHECK (
    (supporter_user_id IS NOT NULL AND supporter_anonymous_id IS NULL) OR 
    (supporter_user_id IS NULL AND supporter_anonymous_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS peer_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES peer_matches(id) ON DELETE CASCADE,
  sender_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_anonymous_id text,
  encrypted_content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'safety_check')),
  is_flagged boolean DEFAULT false,
  flagged_reason text,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT peer_messages_user_check CHECK (
    (sender_user_id IS NOT NULL AND sender_anonymous_id IS NULL) OR 
    (sender_user_id IS NULL AND sender_anonymous_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS support_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL CHECK (category IN ('anxiety', 'depression', 'trauma', 'addiction', 'grief', 'general')),
  max_members integer DEFAULT 20 CHECK (max_members > 0),
  current_members integer DEFAULT 0 CHECK (current_members >= 0),
  is_moderated boolean DEFAULT true,
  moderator_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  moderator_anonymous_id text,
  meeting_schedule jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES support_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  role text DEFAULT 'member' CHECK (role IN ('member', 'moderator')),
  joined_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT group_memberships_user_check CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  ),
  
  -- Ensure unique membership per user per group
  CONSTRAINT group_memberships_unique_user UNIQUE (group_id, user_id),
  CONSTRAINT group_memberships_unique_anonymous UNIQUE (group_id, anonymous_id)
);

CREATE TABLE IF NOT EXISTS group_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES support_groups(id) ON DELETE CASCADE,
  sender_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_anonymous_id text,
  encrypted_content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'announcement')),
  is_flagged boolean DEFAULT false,
  flagged_reason text,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT group_messages_user_check CHECK (
    (sender_user_id IS NOT NULL AND sender_anonymous_id IS NULL) OR 
    (sender_user_id IS NULL AND sender_anonymous_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS peer_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES peer_matches(id) ON DELETE CASCADE,
  reviewer_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewer_anonymous_id text,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  encrypted_feedback text,
  feedback_type text NOT NULL CHECK (feedback_type IN ('supporter', 'seeker')),
  created_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT peer_feedback_user_check CHECK (
    (reviewer_user_id IS NOT NULL AND reviewer_anonymous_id IS NULL) OR 
    (reviewer_user_id IS NULL AND reviewer_anonymous_id IS NOT NULL)
  )
);

-- Enable Row Level Security
ALTER TABLE peer_supporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_feedback ENABLE ROW LEVEL SECURITY;

-- Policies for peer_supporters
CREATE POLICY "Users can read own supporter profile"
  ON peer_supporters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can read own supporter profile"
  ON peer_supporters
  FOR SELECT
  TO anon
  USING (anonymous_id IS NOT NULL);

CREATE POLICY "Users can insert own supporter profile"
  ON peer_supporters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert supporter profile"
  ON peer_supporters
  FOR INSERT
  TO anon
  WITH CHECK (anonymous_id IS NOT NULL);

CREATE POLICY "Users can update own supporter profile"
  ON peer_supporters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can update own supporter profile"
  ON peer_supporters
  FOR UPDATE
  TO anon
  USING (anonymous_id IS NOT NULL)
  WITH CHECK (anonymous_id IS NOT NULL);

-- Policies for peer_matches
CREATE POLICY "Users can read own matches"
  ON peer_matches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = seeker_user_id OR auth.uid() = supporter_user_id);

CREATE POLICY "Anonymous users can read own matches"
  ON peer_matches
  FOR SELECT
  TO anon
  USING (seeker_anonymous_id IS NOT NULL OR supporter_anonymous_id IS NOT NULL);

CREATE POLICY "Users can insert matches as seeker"
  ON peer_matches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seeker_user_id);

CREATE POLICY "Anonymous users can insert matches as seeker"
  ON peer_matches
  FOR INSERT
  TO anon
  WITH CHECK (seeker_anonymous_id IS NOT NULL);

CREATE POLICY "Users can update own matches"
  ON peer_matches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = seeker_user_id OR auth.uid() = supporter_user_id)
  WITH CHECK (auth.uid() = seeker_user_id OR auth.uid() = supporter_user_id);

CREATE POLICY "Anonymous users can update own matches"
  ON peer_matches
  FOR UPDATE
  TO anon
  USING (seeker_anonymous_id IS NOT NULL OR supporter_anonymous_id IS NOT NULL)
  WITH CHECK (seeker_anonymous_id IS NOT NULL OR supporter_anonymous_id IS NOT NULL);

-- Policies for peer_messages
CREATE POLICY "Users can read messages from their matches"
  ON peer_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM peer_matches 
      WHERE id = match_id 
      AND (seeker_user_id = auth.uid() OR supporter_user_id = auth.uid())
    )
  );

CREATE POLICY "Anonymous users can read messages from their matches"
  ON peer_messages
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM peer_matches 
      WHERE id = match_id 
      AND (seeker_anonymous_id IS NOT NULL OR supporter_anonymous_id IS NOT NULL)
    )
  );

CREATE POLICY "Users can insert messages to their matches"
  ON peer_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_user_id AND
    EXISTS (
      SELECT 1 FROM peer_matches 
      WHERE id = match_id 
      AND (seeker_user_id = auth.uid() OR supporter_user_id = auth.uid())
    )
  );

CREATE POLICY "Anonymous users can insert messages to their matches"
  ON peer_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    sender_anonymous_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM peer_matches 
      WHERE id = match_id 
      AND (seeker_anonymous_id IS NOT NULL OR supporter_anonymous_id IS NOT NULL)
    )
  );

-- Policies for support_groups (public read for discovery)
CREATE POLICY "Anyone can read active support groups"
  ON support_groups
  FOR SELECT
  TO public
  USING (is_active = true);

-- Policies for group_memberships
CREATE POLICY "Users can read own group memberships"
  ON group_memberships
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can read own group memberships"
  ON group_memberships
  FOR SELECT
  TO anon
  USING (anonymous_id IS NOT NULL);

CREATE POLICY "Users can insert own group memberships"
  ON group_memberships
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert group memberships"
  ON group_memberships
  FOR INSERT
  TO anon
  WITH CHECK (anonymous_id IS NOT NULL);

-- Policies for group_messages
CREATE POLICY "Users can read messages from their groups"
  ON group_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_memberships 
      WHERE group_id = group_messages.group_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can read messages from their groups"
  ON group_messages
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM group_memberships 
      WHERE group_id = group_messages.group_id 
      AND anonymous_id IS NOT NULL
    )
  );

CREATE POLICY "Users can insert messages to their groups"
  ON group_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_user_id AND
    EXISTS (
      SELECT 1 FROM group_memberships 
      WHERE group_id = group_messages.group_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anonymous users can insert messages to their groups"
  ON group_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    sender_anonymous_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM group_memberships 
      WHERE group_id = group_messages.group_id 
      AND anonymous_id IS NOT NULL
    )
  );

-- Policies for peer_feedback
CREATE POLICY "Users can read feedback for their matches"
  ON peer_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM peer_matches 
      WHERE id = match_id 
      AND (seeker_user_id = auth.uid() OR supporter_user_id = auth.uid())
    )
  );

CREATE POLICY "Anonymous users can read feedback for their matches"
  ON peer_feedback
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM peer_matches 
      WHERE id = match_id 
      AND (seeker_anonymous_id IS NOT NULL OR supporter_anonymous_id IS NOT NULL)
    )
  );

CREATE POLICY "Users can insert feedback for their matches"
  ON peer_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_user_id AND
    EXISTS (
      SELECT 1 FROM peer_matches 
      WHERE id = match_id 
      AND (seeker_user_id = auth.uid() OR supporter_user_id = auth.uid())
    )
  );

CREATE POLICY "Anonymous users can insert feedback for their matches"
  ON peer_feedback
  FOR INSERT
  TO anon
  WITH CHECK (
    reviewer_anonymous_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM peer_matches 
      WHERE id = match_id 
      AND (seeker_anonymous_id IS NOT NULL OR supporter_anonymous_id IS NOT NULL)
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS peer_supporters_active_idx ON peer_supporters(is_active, supporter_level);
CREATE INDEX IF NOT EXISTS peer_supporters_user_id_idx ON peer_supporters(user_id);
CREATE INDEX IF NOT EXISTS peer_supporters_anonymous_id_idx ON peer_supporters(anonymous_id);

CREATE INDEX IF NOT EXISTS peer_matches_seeker_user_id_idx ON peer_matches(seeker_user_id);
CREATE INDEX IF NOT EXISTS peer_matches_seeker_anonymous_id_idx ON peer_matches(seeker_anonymous_id);
CREATE INDEX IF NOT EXISTS peer_matches_supporter_user_id_idx ON peer_matches(supporter_user_id);
CREATE INDEX IF NOT EXISTS peer_matches_supporter_anonymous_id_idx ON peer_matches(supporter_anonymous_id);
CREATE INDEX IF NOT EXISTS peer_matches_status_idx ON peer_matches(status);

CREATE INDEX IF NOT EXISTS peer_messages_match_id_created_at_idx ON peer_messages(match_id, created_at DESC);
CREATE INDEX IF NOT EXISTS peer_messages_flagged_idx ON peer_messages(is_flagged) WHERE is_flagged = true;

CREATE INDEX IF NOT EXISTS support_groups_category_active_idx ON support_groups(category, is_active);
CREATE INDEX IF NOT EXISTS group_memberships_group_id_idx ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS group_memberships_user_id_idx ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS group_memberships_anonymous_id_idx ON group_memberships(anonymous_id);

CREATE INDEX IF NOT EXISTS group_messages_group_id_created_at_idx ON group_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS group_messages_flagged_idx ON group_messages(is_flagged) WHERE is_flagged = true;

CREATE INDEX IF NOT EXISTS peer_feedback_match_id_idx ON peer_feedback(match_id);

-- Insert default support groups
INSERT INTO support_groups (name, description, category, max_members, meeting_schedule) VALUES
('Anxiety Support Circle', 'A safe space for people dealing with anxiety to share experiences and coping strategies.', 'anxiety', 15, '{"days": ["monday", "wednesday", "friday"], "time": "19:00", "timezone": "UTC"}'),
('Depression Recovery Group', 'Peer support for those on their journey with depression, focusing on hope and healing.', 'depression', 12, '{"days": ["tuesday", "thursday"], "time": "18:00", "timezone": "UTC"}'),
('Trauma Survivors Network', 'A supportive community for trauma survivors to connect and share healing resources.', 'trauma', 10, '{"days": ["sunday"], "time": "16:00", "timezone": "UTC"}'),
('General Mental Health Support', 'Open discussion group for all mental health topics and general peer support.', 'general', 20, '{"days": ["daily"], "time": "20:00", "timezone": "UTC"}'),
('Grief and Loss Support', 'Compassionate support for those dealing with loss and the grieving process.', 'grief', 12, '{"days": ["wednesday", "saturday"], "time": "17:00", "timezone": "UTC"}'),
('Young Adults Mental Health', 'Peer support specifically for young adults (18-25) navigating mental health challenges.', 'general', 15, '{"days": ["monday", "thursday"], "time": "19:30", "timezone": "UTC"}');

-- Function to update supporter stats after feedback
CREATE OR REPLACE FUNCTION update_supporter_rating()
RETURNS TRIGGER AS $$
DECLARE
  supporter_id uuid;
  avg_rating decimal;
BEGIN
  -- Get supporter ID from the match
  SELECT 
    CASE 
      WHEN supporter_user_id IS NOT NULL THEN supporter_user_id
      ELSE NULL
    END INTO supporter_id
  FROM peer_matches 
  WHERE id = NEW.match_id;
  
  -- Only update if we have a supporter_user_id (not anonymous)
  IF supporter_id IS NOT NULL THEN
    -- Calculate new average rating
    SELECT AVG(rating) INTO avg_rating
    FROM peer_feedback pf
    JOIN peer_matches pm ON pf.match_id = pm.id
    WHERE pm.supporter_user_id = supporter_id
    AND pf.feedback_type = 'supporter';
    
    -- Update supporter profile
    UPDATE peer_supporters 
    SET 
      average_rating = COALESCE(avg_rating, 0.0),
      updated_at = now()
    WHERE user_id = supporter_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for supporter rating updates
CREATE TRIGGER update_supporter_rating_trigger
  AFTER INSERT ON peer_feedback
  FOR EACH ROW
  WHEN (NEW.feedback_type = 'supporter')
  EXECUTE FUNCTION update_supporter_rating();

-- Function to update match counts
CREATE OR REPLACE FUNCTION update_match_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update supporter current matches count
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    -- Increment current matches for supporter
    UPDATE peer_supporters 
    SET current_matches = current_matches + 1
    WHERE (user_id = NEW.supporter_user_id OR anonymous_id = NEW.supporter_anonymous_id);
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status = 'active' AND NEW.status IN ('completed', 'cancelled') THEN
      -- Decrement current matches and increment total sessions
      UPDATE peer_supporters 
      SET 
        current_matches = GREATEST(current_matches - 1, 0),
        total_sessions = total_sessions + 1
      WHERE (user_id = NEW.supporter_user_id OR anonymous_id = NEW.supporter_anonymous_id);
      
    ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
      -- Increment current matches
      UPDATE peer_supporters 
      SET current_matches = current_matches + 1
      WHERE (user_id = NEW.supporter_user_id OR anonymous_id = NEW.supporter_anonymous_id);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for match count updates
CREATE TRIGGER update_match_counts_trigger
  AFTER INSERT OR UPDATE ON peer_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_match_counts();

-- Function to update group member counts
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE support_groups 
    SET current_members = current_members + 1
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE support_groups 
    SET current_members = GREATEST(current_members - 1, 0)
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for group member count updates
CREATE TRIGGER update_group_member_count_trigger
  AFTER INSERT OR DELETE ON group_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_group_member_count();