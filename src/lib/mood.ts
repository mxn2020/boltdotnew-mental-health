import { supabase } from './supabase';
import { encryption } from './encryption';

export interface MoodEntry {
  id: string;
  user_id?: string;
  anonymous_id?: string;
  mood_score: number;
  energy_level?: number;
  anxiety_level?: number;
  sleep_quality?: number;
  notes?: string;
  triggers?: string[];
  gratitude?: string;
  check_in_type: 'quick' | 'detailed';
  created_at: string;
}

export interface MoodStreak {
  id: string;
  user_id?: string;
  anonymous_id?: string;
  current_streak: number;
  longest_streak: number;
  last_check_in: string;
  total_check_ins: number;
  created_at: string;
  updated_at: string;
}

export interface MoodStats {
  averageMood: number;
  moodTrend: 'improving' | 'declining' | 'stable';
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn: string | null;
}

class MoodService {
  private getUserIdentifier() {
    const anonymousId = localStorage.getItem('mh_anonymous_id');
    return {
      user_id: supabase.auth.getUser().then(({ data }) => data.user?.id),
      anonymous_id: anonymousId
    };
  }

  async createMoodEntry(entry: Omit<MoodEntry, 'id' | 'user_id' | 'anonymous_id' | 'created_at'>): Promise<{ data: MoodEntry | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      // Encrypt sensitive data
      const encryptedData: any = {
        mood_score: entry.mood_score,
        energy_level: entry.energy_level,
        anxiety_level: entry.anxiety_level,
        sleep_quality: entry.sleep_quality,
        check_in_type: entry.check_in_type,
      };

      if (user) {
        encryptedData.user_id = user.id;
      } else if (anonymousId) {
        encryptedData.anonymous_id = anonymousId;
      } else {
        throw new Error('No user session found');
      }

      // Encrypt sensitive fields
      if (entry.notes) {
        encryptedData.encrypted_notes = encryption.encrypt(entry.notes);
      }
      if (entry.triggers && entry.triggers.length > 0) {
        encryptedData.encrypted_triggers = encryption.encrypt(JSON.stringify(entry.triggers));
      }
      if (entry.gratitude) {
        encryptedData.encrypted_gratitude = encryption.encrypt(entry.gratitude);
      }

      const { data, error } = await supabase
        .from('mood_entries')
        .insert(encryptedData)
        .select()
        .single();

      if (error) throw error;

      // Decrypt data for return
      const decryptedEntry: MoodEntry = {
        ...data,
        notes: data.encrypted_notes ? encryption.decrypt(data.encrypted_notes) : undefined,
        triggers: data.encrypted_triggers ? JSON.parse(encryption.decrypt(data.encrypted_triggers)) : undefined,
        gratitude: data.encrypted_gratitude ? encryption.decrypt(data.encrypted_gratitude) : undefined,
      };

      return { data: decryptedEntry, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMoodEntries(limit = 30): Promise<{ data: MoodEntry[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('mood_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (user) {
        query = query.eq('user_id', user.id);
      } else if (anonymousId) {
        query = query.eq('anonymous_id', anonymousId);
      } else {
        return { data: [], error: null };
      }

      const { data, error } = await query;

      if (error) throw error;

      // Decrypt sensitive data
      const decryptedEntries: MoodEntry[] = data.map(entry => ({
        ...entry,
        notes: entry.encrypted_notes ? encryption.decrypt(entry.encrypted_notes) : undefined,
        triggers: entry.encrypted_triggers ? JSON.parse(encryption.decrypt(entry.encrypted_triggers)) : undefined,
        gratitude: entry.encrypted_gratitude ? encryption.decrypt(entry.encrypted_gratitude) : undefined,
      }));

      return { data: decryptedEntries, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMoodStreak(): Promise<{ data: MoodStreak | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('mood_streaks')
        .select('*')
        .single();

      if (user) {
        query = query.eq('user_id', user.id);
      } else if (anonymousId) {
        query = query.eq('anonymous_id', anonymousId);
      } else {
        return { data: null, error: null };
      }

      const { data, error } = await query;

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMoodStats(): Promise<{ data: MoodStats | null; error: any }> {
    try {
      const [entriesResult, streakResult] = await Promise.all([
        this.getMoodEntries(30),
        this.getMoodStreak()
      ]);

      if (entriesResult.error) throw entriesResult.error;
      if (streakResult.error) throw streakResult.error;

      const entries = entriesResult.data || [];
      const streak = streakResult.data;

      if (entries.length === 0) {
        return {
          data: {
            averageMood: 0,
            moodTrend: 'stable',
            totalEntries: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastCheckIn: null
          },
          error: null
        };
      }

      // Calculate average mood
      const averageMood = entries.reduce((sum, entry) => sum + entry.mood_score, 0) / entries.length;

      // Calculate trend (compare last 7 days to previous 7 days)
      const recentEntries = entries.slice(0, 7);
      const previousEntries = entries.slice(7, 14);
      
      let moodTrend: 'improving' | 'declining' | 'stable' = 'stable';
      
      if (recentEntries.length > 0 && previousEntries.length > 0) {
        const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / recentEntries.length;
        const previousAvg = previousEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / previousEntries.length;
        
        const difference = recentAvg - previousAvg;
        if (difference > 0.5) moodTrend = 'improving';
        else if (difference < -0.5) moodTrend = 'declining';
      }

      const stats: MoodStats = {
        averageMood: Math.round(averageMood * 10) / 10,
        moodTrend,
        totalEntries: streak?.total_check_ins || entries.length,
        currentStreak: streak?.current_streak || 0,
        longestStreak: streak?.longest_streak || 0,
        lastCheckIn: entries[0]?.created_at || null
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getTodaysEntry(): Promise<{ data: MoodEntry | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      const today = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('mood_entries')
        .select('*')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)
        .order('created_at', { ascending: false })
        .limit(1);

      if (user) {
        query = query.eq('user_id', user.id);
      } else if (anonymousId) {
        query = query.eq('anonymous_id', anonymousId);
      } else {
        return { data: null, error: null };
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        const entry = data[0];
        const decryptedEntry: MoodEntry = {
          ...entry,
          notes: entry.encrypted_notes ? encryption.decrypt(entry.encrypted_notes) : undefined,
          triggers: entry.encrypted_triggers ? JSON.parse(encryption.decrypt(entry.encrypted_triggers)) : undefined,
          gratitude: entry.encrypted_gratitude ? encryption.decrypt(entry.encrypted_gratitude) : undefined,
        };
        return { data: decryptedEntry, error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const moodService = new MoodService();