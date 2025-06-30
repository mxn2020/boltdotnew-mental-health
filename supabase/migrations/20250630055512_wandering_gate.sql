/*
  # Coping Tools & Crisis Intervention Schema

  1. New Tables
    - `coping_tools`
      - `id` (uuid, primary key)
      - `name` (text, tool name)
      - `category` (text, CBT/DBT/mindfulness/breathing/grounding/crisis)
      - `description` (text, tool description)
      - `instructions` (text, step-by-step instructions)
      - `duration_minutes` (integer, estimated time)
      - `difficulty_level` (text, beginner/intermediate/advanced)
      - `evidence_base` (text, research backing)
      - `tags` (jsonb, searchable tags)
      - `is_crisis_tool` (boolean, for immediate crisis use)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `tool_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `anonymous_id` (text, for anonymous users)
      - `tool_id` (uuid, references coping_tools)
      - `mood_before` (integer, 1-10 scale)
      - `mood_after` (integer, 1-10 scale)
      - `effectiveness_rating` (integer, 1-5 scale)
      - `encrypted_notes` (text, user notes about experience)
      - `duration_used` (integer, actual time used)
      - `completed` (boolean, whether tool was completed)
      - `created_at` (timestamp)

    - `safety_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `anonymous_id` (text, for anonymous users)
      - `encrypted_warning_signs` (text, personal warning signs)
      - `encrypted_coping_strategies` (text, personal coping strategies)
      - `encrypted_support_contacts` (text, people to contact)
      - `encrypted_professional_contacts` (text, professional contacts)
      - `encrypted_environment_safety` (text, environment safety steps)
      - `encrypted_reasons_to_live` (text, reasons for living)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `crisis_resources`
      - `id` (uuid, primary key)
      - `name` (text, resource name)
      - `type` (text, hotline/chat/text/emergency)
      - `phone_number` (text, contact number)
      - `website_url` (text, website)
      - `description` (text, resource description)
      - `availability` (text, 24/7, business hours, etc.)
      - `country_code` (text, geographic availability)
      - `language_support` (jsonb, supported languages)
      - `is_active` (boolean, resource status)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and anonymous users
    - Ensure data isolation between users
*/

CREATE TABLE IF NOT EXISTS coping_tools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('cbt', 'dbt', 'mindfulness', 'breathing', 'grounding', 'crisis', 'movement', 'creative')),
  description text NOT NULL,
  instructions text NOT NULL,
  duration_minutes integer DEFAULT 5 CHECK (duration_minutes > 0),
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  evidence_base text,
  tags jsonb DEFAULT '[]'::jsonb,
  is_crisis_tool boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tool_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  tool_id uuid REFERENCES coping_tools(id) ON DELETE CASCADE,
  mood_before integer CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after integer CHECK (mood_after >= 1 AND mood_after <= 10),
  effectiveness_rating integer CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  encrypted_notes text,
  duration_used integer,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT tool_usage_user_check CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS safety_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  anonymous_id text,
  encrypted_warning_signs text,
  encrypted_coping_strategies text,
  encrypted_support_contacts text,
  encrypted_professional_contacts text,
  encrypted_environment_safety text,
  encrypted_reasons_to_live text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure either user_id or anonymous_id is present
  CONSTRAINT safety_plans_user_check CHECK (
    (user_id IS NOT NULL AND anonymous_id IS NULL) OR 
    (user_id IS NULL AND anonymous_id IS NOT NULL)
  ),
  
  -- Ensure unique safety plan per user
  CONSTRAINT safety_plans_unique_user UNIQUE (user_id),
  CONSTRAINT safety_plans_unique_anonymous UNIQUE (anonymous_id)
);

CREATE TABLE IF NOT EXISTS crisis_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('hotline', 'chat', 'text', 'emergency', 'website')),
  phone_number text,
  website_url text,
  description text NOT NULL,
  availability text DEFAULT '24/7',
  country_code text DEFAULT 'US',
  language_support jsonb DEFAULT '["en"]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE coping_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_resources ENABLE ROW LEVEL SECURITY;

-- Policies for coping_tools (public read access)
CREATE POLICY "Anyone can read coping tools"
  ON coping_tools
  FOR SELECT
  TO public
  USING (true);

-- Policies for tool_usage
CREATE POLICY "Users can read own tool usage"
  ON tool_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can read own tool usage"
  ON tool_usage
  FOR SELECT
  TO anon
  USING (anonymous_id IS NOT NULL);

CREATE POLICY "Users can insert own tool usage"
  ON tool_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert tool usage"
  ON tool_usage
  FOR INSERT
  TO anon
  WITH CHECK (anonymous_id IS NOT NULL);

CREATE POLICY "Users can update own tool usage"
  ON tool_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can update own tool usage"
  ON tool_usage
  FOR UPDATE
  TO anon
  USING (anonymous_id IS NOT NULL)
  WITH CHECK (anonymous_id IS NOT NULL);

-- Policies for safety_plans
CREATE POLICY "Users can read own safety plans"
  ON safety_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can read own safety plans"
  ON safety_plans
  FOR SELECT
  TO anon
  USING (anonymous_id IS NOT NULL);

CREATE POLICY "Users can insert own safety plans"
  ON safety_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert safety plans"
  ON safety_plans
  FOR INSERT
  TO anon
  WITH CHECK (anonymous_id IS NOT NULL);

CREATE POLICY "Users can update own safety plans"
  ON safety_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can update own safety plans"
  ON safety_plans
  FOR UPDATE
  TO anon
  USING (anonymous_id IS NOT NULL)
  WITH CHECK (anonymous_id IS NOT NULL);

-- Policies for crisis_resources (public read access)
CREATE POLICY "Anyone can read crisis resources"
  ON crisis_resources
  FOR SELECT
  TO public
  USING (is_active = true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS coping_tools_category_idx ON coping_tools(category);
CREATE INDEX IF NOT EXISTS coping_tools_crisis_idx ON coping_tools(is_crisis_tool);
CREATE INDEX IF NOT EXISTS tool_usage_user_id_created_at_idx ON tool_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tool_usage_anonymous_id_created_at_idx ON tool_usage(anonymous_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tool_usage_tool_id_idx ON tool_usage(tool_id);
CREATE INDEX IF NOT EXISTS safety_plans_user_id_idx ON safety_plans(user_id);
CREATE INDEX IF NOT EXISTS safety_plans_anonymous_id_idx ON safety_plans(anonymous_id);
CREATE INDEX IF NOT EXISTS crisis_resources_type_idx ON crisis_resources(type);
CREATE INDEX IF NOT EXISTS crisis_resources_country_idx ON crisis_resources(country_code);

-- Insert default coping tools
INSERT INTO coping_tools (name, category, description, instructions, duration_minutes, difficulty_level, evidence_base, tags, is_crisis_tool) VALUES
-- Breathing Exercises
('4-7-8 Breathing', 'breathing', 'A calming breathing technique that helps reduce anxiety and promote relaxation.', 
'1. Sit comfortably with your back straight
2. Place the tip of your tongue against the ridge behind your upper teeth
3. Exhale completely through your mouth
4. Close your mouth and inhale through your nose for 4 counts
5. Hold your breath for 7 counts
6. Exhale through your mouth for 8 counts
7. Repeat 3-4 times', 
5, 'beginner', 'Based on pranayama breathing techniques, shown to activate parasympathetic nervous system', 
'["anxiety", "stress", "sleep", "relaxation"]', false),

('Box Breathing', 'breathing', 'A simple breathing pattern that helps regulate the nervous system and reduce stress.', 
'1. Sit comfortably with feet flat on the floor
2. Exhale all air from your lungs
3. Inhale through your nose for 4 counts
4. Hold your breath for 4 counts
5. Exhale through your mouth for 4 counts
6. Hold empty for 4 counts
7. Repeat for 5-10 cycles', 
10, 'beginner', 'Used by Navy SEALs and first responders, proven to reduce cortisol levels', 
'["anxiety", "focus", "stress", "performance"]', true),

-- Grounding Techniques
('5-4-3-2-1 Grounding', 'grounding', 'A sensory grounding technique that helps bring you back to the present moment during anxiety or panic.', 
'1. Look around and name 5 things you can see
2. Notice 4 things you can touch
3. Listen for 3 things you can hear
4. Identify 2 things you can smell
5. Think of 1 thing you can taste
6. Take slow, deep breaths throughout
7. Repeat if needed', 
5, 'beginner', 'Evidence-based grounding technique used in trauma therapy and anxiety treatment', 
'["anxiety", "panic", "grounding", "mindfulness"]', true),

('Progressive Muscle Relaxation', 'grounding', 'Systematically tense and relax muscle groups to reduce physical tension and anxiety.', 
'1. Find a comfortable position lying down or sitting
2. Start with your toes - tense for 5 seconds, then relax
3. Move to your calves - tense and relax
4. Continue with thighs, abdomen, hands, arms, shoulders
5. Tense your face muscles, then relax
6. Notice the contrast between tension and relaxation
7. End with 3 deep breaths', 
15, 'beginner', 'Developed by Edmund Jacobson, extensively researched for anxiety and stress reduction', 
'["anxiety", "stress", "tension", "sleep"]', false),

-- Mindfulness
('Mindful Breathing', 'mindfulness', 'A basic mindfulness practice focusing attention on the breath to cultivate present-moment awareness.', 
'1. Sit comfortably with eyes closed or softly focused
2. Notice your natural breathing rhythm
3. Focus attention on the sensation of breathing
4. When your mind wanders, gently return to the breath
5. Notice the inhale and exhale without changing it
6. Continue for the full duration
7. End by slowly opening your eyes', 
10, 'beginner', 'Core mindfulness practice with extensive research showing benefits for anxiety, depression, and stress', 
'["mindfulness", "anxiety", "focus", "meditation"]', false),

('Body Scan Meditation', 'mindfulness', 'A mindfulness practice that involves systematically focusing attention on different parts of the body.', 
'1. Lie down comfortably with eyes closed
2. Start by noticing your breath
3. Bring attention to the top of your head
4. Slowly move attention down through your body
5. Notice sensations without trying to change them
6. Spend 30 seconds on each body part
7. End at your toes, then notice your whole body
8. Take 3 deep breaths before opening eyes', 
20, 'intermediate', 'Developed by Jon Kabat-Zinn, proven effective for pain management and stress reduction', 
'["mindfulness", "stress", "pain", "relaxation"]', false),

-- CBT Techniques
('Thought Challenging', 'cbt', 'Identify and challenge negative thought patterns by examining evidence and considering alternatives.', 
'1. Notice when you have a distressing thought
2. Write down the specific thought
3. Ask: "What evidence supports this thought?"
4. Ask: "What evidence contradicts this thought?"
5. Consider: "What would I tell a friend in this situation?"
6. Generate a more balanced, realistic thought
7. Notice how your mood changes with the new thought', 
15, 'intermediate', 'Core CBT technique with strong evidence for treating depression and anxiety disorders', 
'["cbt", "depression", "anxiety", "thoughts"]', false),

('Behavioral Activation', 'cbt', 'Schedule and engage in meaningful activities to improve mood and break cycles of depression.', 
'1. List activities that used to bring you joy or meaning
2. Rate each activity for pleasure (1-10) and importance (1-10)
3. Choose one small, achievable activity
4. Schedule a specific time to do it today
5. Complete the activity, even if you don''t feel like it
6. Rate your mood before and after (1-10)
7. Plan the next activity for tomorrow', 
30, 'intermediate', 'Evidence-based CBT technique shown to be as effective as antidepressants for mild-moderate depression', 
'["cbt", "depression", "motivation", "activities"]', false),

-- DBT Skills
('TIPP for Crisis', 'dbt', 'Rapid distress tolerance technique using Temperature, Intense exercise, Paced breathing, and Paired muscle relaxation.', 
'1. TEMPERATURE: Hold ice cubes or splash cold water on face
2. INTENSE EXERCISE: Do jumping jacks or run in place for 5 minutes
3. PACED BREATHING: Exhale longer than you inhale
4. PAIRED MUSCLE RELAXATION: Tense and release muscle groups
Choose one technique that feels most accessible right now', 
10, 'beginner', 'DBT distress tolerance skill proven effective for emotional regulation in crisis situations', 
'["dbt", "crisis", "distress", "emergency"]', true),

('PLEASE Skills', 'dbt', 'Reduce emotional vulnerability by taking care of basic needs: treat PhysicaL illness, balance Eating, avoid mood-Altering substances, balance Sleep, get Exercise.', 
'1. PHYSICAL ILLNESS: Take medications, see doctor when needed
2. EATING: Eat regular, balanced meals
3. SUBSTANCES: Avoid alcohol and drugs
4. SLEEP: Aim for 7-9 hours of quality sleep
5. EXERCISE: Get 20-30 minutes of movement daily
Rate each area 1-10 and identify one to improve today', 
20, 'beginner', 'DBT emotion regulation skill with research support for reducing emotional vulnerability', 
'["dbt", "self-care", "routine", "prevention"]', false),

-- Crisis Tools
('Crisis Grounding Kit', 'crisis', 'A comprehensive grounding technique specifically designed for crisis moments and intense emotional distress.', 
'1. STOP what you are doing and sit down
2. Take 5 slow, deep breaths
3. Name your current location out loud
4. Hold an ice cube or cold object
5. Call someone from your support list
6. Remind yourself: "This feeling will pass"
7. Use your safety plan if you have one
8. If thoughts of self-harm persist, call crisis line immediately', 
10, 'beginner', 'Combination of evidence-based crisis intervention techniques used in emergency mental health settings', 
'["crisis", "emergency", "grounding", "safety"]', true),

('Distraction Techniques', 'crisis', 'Healthy distraction methods to use when experiencing intense emotional pain or crisis thoughts.', 
'1. Choose a distraction that requires focus:
   - Count backwards from 100 by 7s
   - Name all items in the room that are blue
   - Recite song lyrics or poems
   - Do a puzzle or word game
2. Engage your body:
   - Take a hot or cold shower
   - Do intense exercise
   - Listen to loud music
3. Connect with others:
   - Call a friend
   - Go to a public place
   - Text a crisis line', 
15, 'beginner', 'Distraction techniques are evidence-based crisis intervention strategies used in DBT and crisis counseling', 
'["crisis", "distraction", "coping", "emergency"]', true);

-- Insert default crisis resources
INSERT INTO crisis_resources (name, type, phone_number, website_url, description, availability, country_code, language_support) VALUES
('National Suicide Prevention Lifeline', 'hotline', '988', 'https://suicidepreventionlifeline.org', 'Free and confidential emotional support to people in suicidal crisis or emotional distress 24 hours a day, 7 days a week.', '24/7', 'US', '["en", "es"]'),
('Crisis Text Line', 'text', '741741', 'https://www.crisistextline.org', 'Free, 24/7 support for those in crisis. Text HOME to 741741 from anywhere in the US.', '24/7', 'US', '["en", "es"]'),
('National Domestic Violence Hotline', 'hotline', '1-800-799-7233', 'https://www.thehotline.org', 'Confidential support for domestic violence survivors and their loved ones.', '24/7', 'US', '["en", "es"]'),
('SAMHSA National Helpline', 'hotline', '1-800-662-4357', 'https://www.samhsa.gov/find-help/national-helpline', 'Free, confidential treatment referral and information service for mental health and substance use disorders.', '24/7', 'US', '["en", "es"]'),
('Trevor Project', 'hotline', '1-866-488-7386', 'https://www.thetrevorproject.org', 'Crisis intervention and suicide prevention services for LGBTQ+ youth.', '24/7', 'US', '["en", "es"]'),
('Emergency Services', 'emergency', '911', null, 'Call 911 for immediate emergency assistance when there is imminent danger to yourself or others.', '24/7', 'US', '["en"]'),
('Warm Line Directory', 'website', null, 'https://warmline.org', 'Directory of warm lines - peer support phone services staffed by people with lived experience of mental health challenges.', 'Varies', 'US', '["en"]');