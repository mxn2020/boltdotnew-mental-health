import { supabase } from './supabase';
import { encryption } from './encryption';

export interface PeerSupporter {
  id: string;
  user_id?: string;
  anonymous_id?: string;
  supporter_level: 'community' | 'experienced' | 'certified';
  experience_months: number;
  specializations: string[];
  availability_hours: any;
  max_concurrent_matches: number;
  current_matches: number;
  total_sessions: number;
  average_rating: number;
  is_active: boolean;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export interface PeerMatch {
  id: string;
  seeker_user_id?: string;
  seeker_anonymous_id?: string;
  supporter_user_id?: string;
  supporter_anonymous_id?: string;
  match_type: 'one-time' | 'ongoing' | 'crisis';
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  match_reason?: string;
  seeker_preferences?: string;
  session_count: number;
  last_interaction: string;
  created_at: string;
  updated_at: string;
}

export interface PeerMessage {
  id: string;
  match_id: string;
  sender_user_id?: string;
  sender_anonymous_id?: string;
  content: string;
  message_type: 'text' | 'system' | 'safety_check';
  is_flagged: boolean;
  flagged_reason?: string;
  created_at: string;
}

export interface SupportGroup {
  id: string;
  name: string;
  description: string;
  category: 'anxiety' | 'depression' | 'trauma' | 'addiction' | 'grief' | 'general';
  max_members: number;
  current_members: number;
  is_moderated: boolean;
  moderator_user_id?: string;
  moderator_anonymous_id?: string;
  meeting_schedule: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  user_id?: string;
  anonymous_id?: string;
  role: 'member' | 'moderator';
  joined_at: string;
  last_active: string;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_user_id?: string;
  sender_anonymous_id?: string;
  content: string;
  message_type: 'text' | 'system' | 'announcement';
  is_flagged: boolean;
  flagged_reason?: string;
  created_at: string;
}

export interface PeerFeedback {
  id: string;
  match_id: string;
  reviewer_user_id?: string;
  reviewer_anonymous_id?: string;
  rating: number;
  feedback?: string;
  feedback_type: 'supporter' | 'seeker';
  created_at: string;
}

class PeerSupportService {
  // Peer Supporter Management
  async becomePeerSupporter(profile: Omit<PeerSupporter, 'id' | 'user_id' | 'anonymous_id' | 'current_matches' | 'total_sessions' | 'average_rating' | 'created_at' | 'updated_at'>): Promise<{ data: PeerSupporter | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      const supporterData: any = {
        supporter_level: profile.supporter_level,
        experience_months: profile.experience_months,
        specializations: profile.specializations,
        availability_hours: profile.availability_hours,
        max_concurrent_matches: profile.max_concurrent_matches,
        is_active: profile.is_active,
      };

      if (user) {
        supporterData.user_id = user.id;
      } else if (anonymousId) {
        supporterData.anonymous_id = anonymousId;
      } else {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .from('peer_supporters')
        .insert(supporterData)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateSupporterProfile(updates: Partial<PeerSupporter>): Promise<{ data: PeerSupporter | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('peer_supporters')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .select()
        .single();

      if (user) {
        query = query.eq('user_id', user.id);
      } else if (anonymousId) {
        query = query.eq('anonymous_id', anonymousId);
      } else {
        throw new Error('No user session found');
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getSupporterProfile(): Promise<{ data: PeerSupporter | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('peer_supporters')
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

  // Peer Matching
  async findPeerSupporter(preferences: {
    match_type: 'one-time' | 'ongoing' | 'crisis';
    specializations?: string[];
    supporter_level?: 'community' | 'experienced' | 'certified';
    reason?: string;
  }): Promise<{ data: PeerMatch | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      // Find available supporters
      let supporterQuery = supabase
        .from('peer_supporters')
        .select('*')
        .eq('is_active', true)
        .lt('current_matches', supabase.raw('max_concurrent_matches'))
        .order('average_rating', { ascending: false });

      if (preferences.supporter_level) {
        supporterQuery = supporterQuery.eq('supporter_level', preferences.supporter_level);
      }

      const { data: supporters, error: supporterError } = await supporterQuery;

      if (supporterError) throw supporterError;

      if (!supporters || supporters.length === 0) {
        return { data: null, error: { message: 'No available supporters found' } };
      }

      // Simple matching algorithm - pick the highest rated available supporter
      // In a real implementation, this would be more sophisticated
      const selectedSupporter = supporters[0];

      // Create match
      const matchData: any = {
        match_type: preferences.match_type,
        status: 'pending',
      };

      if (user) {
        matchData.seeker_user_id = user.id;
      } else if (anonymousId) {
        matchData.seeker_anonymous_id = anonymousId;
      } else {
        throw new Error('No user session found');
      }

      if (selectedSupporter.user_id) {
        matchData.supporter_user_id = selectedSupporter.user_id;
      } else {
        matchData.supporter_anonymous_id = selectedSupporter.anonymous_id;
      }

      // Encrypt sensitive data
      if (preferences.reason) {
        matchData.encrypted_match_reason = encryption.encrypt(preferences.reason);
      }
      if (preferences.specializations) {
        matchData.encrypted_seeker_preferences = encryption.encrypt(JSON.stringify(preferences));
      }

      const { data, error } = await supabase
        .from('peer_matches')
        .insert(matchData)
        .select()
        .single();

      if (error) throw error;

      // Decrypt data for return
      const decryptedMatch: PeerMatch = {
        ...data,
        match_reason: data.encrypted_match_reason ? encryption.decrypt(data.encrypted_match_reason) : undefined,
        seeker_preferences: data.encrypted_seeker_preferences ? encryption.decrypt(data.encrypted_seeker_preferences) : undefined,
      };

      return { data: decryptedMatch, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMyMatches(): Promise<{ data: PeerMatch[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('peer_matches')
        .select('*')
        .order('created_at', { ascending: false });

      if (user) {
        query = query.or(`seeker_user_id.eq.${user.id},supporter_user_id.eq.${user.id}`);
      } else if (anonymousId) {
        query = query.or(`seeker_anonymous_id.eq.${anonymousId},supporter_anonymous_id.eq.${anonymousId}`);
      } else {
        return { data: [], error: null };
      }

      const { data, error } = await query;

      if (error) throw error;

      // Decrypt sensitive data
      const decryptedMatches: PeerMatch[] = data.map(match => ({
        ...match,
        match_reason: match.encrypted_match_reason ? encryption.decrypt(match.encrypted_match_reason) : undefined,
        seeker_preferences: match.encrypted_seeker_preferences ? encryption.decrypt(match.encrypted_seeker_preferences) : undefined,
      }));

      return { data: decryptedMatches, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async updateMatchStatus(matchId: string, status: 'active' | 'completed' | 'cancelled'): Promise<{ data: PeerMatch | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('peer_matches')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;

      // Decrypt data for return
      const decryptedMatch: PeerMatch = {
        ...data,
        match_reason: data.encrypted_match_reason ? encryption.decrypt(data.encrypted_match_reason) : undefined,
        seeker_preferences: data.encrypted_seeker_preferences ? encryption.decrypt(data.encrypted_seeker_preferences) : undefined,
      };

      return { data: decryptedMatch, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Messaging
  async sendMessage(matchId: string, content: string, messageType: 'text' | 'system' | 'safety_check' = 'text'): Promise<{ data: PeerMessage | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      const messageData: any = {
        match_id: matchId,
        encrypted_content: encryption.encrypt(content),
        message_type: messageType,
      };

      if (user) {
        messageData.sender_user_id = user.id;
      } else if (anonymousId) {
        messageData.sender_anonymous_id = anonymousId;
      } else {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .from('peer_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Update last interaction
      await supabase
        .from('peer_matches')
        .update({ last_interaction: new Date().toISOString() })
        .eq('id', matchId);

      // Decrypt data for return
      const decryptedMessage: PeerMessage = {
        ...data,
        content: encryption.decrypt(data.encrypted_content),
      };

      return { data: decryptedMessage, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMessages(matchId: string, limit = 50): Promise<{ data: PeerMessage[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('peer_messages')
        .select('*')
        .eq('match_id', matchId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Decrypt messages
      const decryptedMessages: PeerMessage[] = data.map(message => ({
        ...message,
        content: encryption.decrypt(message.encrypted_content),
      }));

      return { data: decryptedMessages, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Support Groups
  async getSupportGroups(category?: string): Promise<{ data: SupportGroup[] | null; error: any }> {
    try {
      let query = supabase
        .from('support_groups')
        .select('*')
        .eq('is_active', true)
        .order('current_members', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async joinSupportGroup(groupId: string): Promise<{ data: GroupMembership | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      const membershipData: any = {
        group_id: groupId,
        role: 'member',
      };

      if (user) {
        membershipData.user_id = user.id;
      } else if (anonymousId) {
        membershipData.anonymous_id = anonymousId;
      } else {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .from('group_memberships')
        .insert(membershipData)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getMyGroups(): Promise<{ data: (GroupMembership & { group: SupportGroup })[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('group_memberships')
        .select(`
          *,
          support_groups (*)
        `)
        .order('joined_at', { ascending: false });

      if (user) {
        query = query.eq('user_id', user.id);
      } else if (anonymousId) {
        query = query.eq('anonymous_id', anonymousId);
      } else {
        return { data: [], error: null };
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data structure
      const memberships = data.map(membership => ({
        ...membership,
        group: membership.support_groups,
      }));

      return { data: memberships, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async sendGroupMessage(groupId: string, content: string, messageType: 'text' | 'system' | 'announcement' = 'text'): Promise<{ data: GroupMessage | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      const messageData: any = {
        group_id: groupId,
        encrypted_content: encryption.encrypt(content),
        message_type: messageType,
      };

      if (user) {
        messageData.sender_user_id = user.id;
      } else if (anonymousId) {
        messageData.sender_anonymous_id = anonymousId;
      } else {
        throw new Error('No user session found');
      }

      const { data, error } = await supabase
        .from('group_messages')
        .insert(messageData)
        .select()
        .single();

      if (error) throw error;

      // Decrypt data for return
      const decryptedMessage: GroupMessage = {
        ...data,
        content: encryption.decrypt(data.encrypted_content),
      };

      return { data: decryptedMessage, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getGroupMessages(groupId: string, limit = 50): Promise<{ data: GroupMessage[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Decrypt messages
      const decryptedMessages: GroupMessage[] = data.map(message => ({
        ...message,
        content: encryption.decrypt(message.encrypted_content),
      }));

      return { data: decryptedMessages, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Feedback
  async submitFeedback(matchId: string, rating: number, feedback?: string, feedbackType: 'supporter' | 'seeker' = 'supporter'): Promise<{ data: PeerFeedback | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      const feedbackData: any = {
        match_id: matchId,
        rating,
        feedback_type: feedbackType,
      };

      if (user) {
        feedbackData.reviewer_user_id = user.id;
      } else if (anonymousId) {
        feedbackData.reviewer_anonymous_id = anonymousId;
      } else {
        throw new Error('No user session found');
      }

      if (feedback) {
        feedbackData.encrypted_feedback = encryption.encrypt(feedback);
      }

      const { data, error } = await supabase
        .from('peer_feedback')
        .insert(feedbackData)
        .select()
        .single();

      if (error) throw error;

      // Decrypt data for return
      const decryptedFeedback: PeerFeedback = {
        ...data,
        feedback: data.encrypted_feedback ? encryption.decrypt(data.encrypted_feedback) : undefined,
      };

      return { data: decryptedFeedback, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Moderation
  async flagMessage(messageId: string, reason: string, isGroupMessage = false): Promise<{ error: any }> {
    try {
      const table = isGroupMessage ? 'group_messages' : 'peer_messages';
      
      const { error } = await supabase
        .from(table)
        .update({
          is_flagged: true,
          flagged_reason: reason,
        })
        .eq('id', messageId);

      if (error) throw error;

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  // Real-time subscriptions
  subscribeToMatchMessages(matchId: string, callback: (message: PeerMessage) => void) {
    return supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'peer_messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const message = {
            ...payload.new,
            content: encryption.decrypt(payload.new.encrypted_content),
          } as PeerMessage;
          callback(message);
        }
      )
      .subscribe();
  }

  subscribeToGroupMessages(groupId: string, callback: (message: GroupMessage) => void) {
    return supabase
      .channel(`group-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const message = {
            ...payload.new,
            content: encryption.decrypt(payload.new.encrypted_content),
          } as GroupMessage;
          callback(message);
        }
      )
      .subscribe();
  }
}

export const peerSupportService = new PeerSupportService();