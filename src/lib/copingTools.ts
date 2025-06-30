import { supabase } from './supabase';
import { encryption } from './encryption';

export interface CopingTool {
  id: string;
  name: string;
  category: 'cbt' | 'dbt' | 'mindfulness' | 'breathing' | 'grounding' | 'crisis' | 'movement' | 'creative';
  description: string;
  instructions: string;
  duration_minutes: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  evidence_base?: string;
  tags: string[];
  is_crisis_tool: boolean;
  created_at: string;
  updated_at: string;
}

export interface ToolUsage {
  id: string;
  user_id?: string;
  anonymous_id?: string;
  tool_id: string;
  mood_before?: number;
  mood_after?: number;
  effectiveness_rating?: number;
  notes?: string;
  duration_used?: number;
  completed: boolean;
  created_at: string;
}

export interface SafetyPlan {
  id: string;
  user_id?: string;
  anonymous_id?: string;
  warning_signs?: string;
  coping_strategies?: string;
  support_contacts?: string;
  professional_contacts?: string;
  environment_safety?: string;
  reasons_to_live?: string;
  created_at: string;
  updated_at: string;
}

export interface CrisisResource {
  id: string;
  name: string;
  type: 'hotline' | 'chat' | 'text' | 'emergency' | 'website';
  phone_number?: string;
  website_url?: string;
  description: string;
  availability: string;
  country_code: string;
  language_support: string[];
  is_active: boolean;
  created_at: string;
}

class CopingToolsService {
  async getCopingTools(category?: string, isCrisis?: boolean): Promise<{ data: CopingTool[] | null; error: any }> {
    try {
      let query = supabase
        .from('coping_tools')
        .select('*')
        .order('name');

      if (category) {
        query = query.eq('category', category);
      }

      if (isCrisis !== undefined) {
        query = query.eq('is_crisis_tool', isCrisis);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCopingTool(id: string): Promise<{ data: CopingTool | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('coping_tools')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async recordToolUsage(usage: Omit<ToolUsage, 'id' | 'user_id' | 'anonymous_id' | 'created_at'>): Promise<{ data: ToolUsage | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      const encryptedData: any = {
        tool_id: usage.tool_id,
        mood_before: usage.mood_before,
        mood_after: usage.mood_after,
        effectiveness_rating: usage.effectiveness_rating,
        duration_used: usage.duration_used,
        completed: usage.completed,
      };

      if (user) {
        encryptedData.user_id = user.id;
      } else if (anonymousId) {
        encryptedData.anonymous_id = anonymousId;
      } else {
        throw new Error('No user session found');
      }

      // Encrypt sensitive fields
      if (usage.notes) {
        encryptedData.encrypted_notes = encryption.encrypt(usage.notes);
      }

      const { data, error } = await supabase
        .from('tool_usage')
        .insert(encryptedData)
        .select()
        .single();

      if (error) throw error;

      // Decrypt data for return
      const decryptedUsage: ToolUsage = {
        ...data,
        notes: data.encrypted_notes ? encryption.decrypt(data.encrypted_notes) : undefined,
      };

      return { data: decryptedUsage, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getToolUsageHistory(limit = 20): Promise<{ data: ToolUsage[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('tool_usage')
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
      const decryptedUsage: ToolUsage[] = data.map(usage => ({
        ...usage,
        notes: usage.encrypted_notes ? encryption.decrypt(usage.encrypted_notes) : undefined,
      }));

      return { data: decryptedUsage, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getToolEffectiveness(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('tool_usage')
        .select(`
          tool_id,
          effectiveness_rating,
          mood_before,
          mood_after,
          coping_tools (name, category)
        `)
        .not('effectiveness_rating', 'is', null);

      if (user) {
        query = query.eq('user_id', user.id);
      } else if (anonymousId) {
        query = query.eq('anonymous_id', anonymousId);
      } else {
        return { data: [], error: null };
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate effectiveness stats
      const toolStats = data.reduce((acc: any, usage: any) => {
        const toolId = usage.tool_id;
        if (!acc[toolId]) {
          acc[toolId] = {
            tool_name: usage.coping_tools.name,
            category: usage.coping_tools.category,
            usage_count: 0,
            avg_effectiveness: 0,
            avg_mood_improvement: 0,
            total_effectiveness: 0,
            total_mood_improvement: 0,
          };
        }

        acc[toolId].usage_count++;
        acc[toolId].total_effectiveness += usage.effectiveness_rating;
        
        if (usage.mood_before && usage.mood_after) {
          acc[toolId].total_mood_improvement += (usage.mood_after - usage.mood_before);
        }

        return acc;
      }, {});

      // Calculate averages
      const effectivenessData = Object.values(toolStats).map((stats: any) => ({
        ...stats,
        avg_effectiveness: stats.total_effectiveness / stats.usage_count,
        avg_mood_improvement: stats.total_mood_improvement / stats.usage_count,
      }));

      return { data: effectivenessData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getSafetyPlan(): Promise<{ data: SafetyPlan | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('safety_plans')
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

      if (data) {
        // Decrypt sensitive data
        const decryptedPlan: SafetyPlan = {
          ...data,
          warning_signs: data.encrypted_warning_signs ? encryption.decrypt(data.encrypted_warning_signs) : undefined,
          coping_strategies: data.encrypted_coping_strategies ? encryption.decrypt(data.encrypted_coping_strategies) : undefined,
          support_contacts: data.encrypted_support_contacts ? encryption.decrypt(data.encrypted_support_contacts) : undefined,
          professional_contacts: data.encrypted_professional_contacts ? encryption.decrypt(data.encrypted_professional_contacts) : undefined,
          environment_safety: data.encrypted_environment_safety ? encryption.decrypt(data.encrypted_environment_safety) : undefined,
          reasons_to_live: data.encrypted_reasons_to_live ? encryption.decrypt(data.encrypted_reasons_to_live) : undefined,
        };

        return { data: decryptedPlan, error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async saveSafetyPlan(plan: Omit<SafetyPlan, 'id' | 'user_id' | 'anonymous_id' | 'created_at' | 'updated_at'>): Promise<{ data: SafetyPlan | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      const encryptedData: any = {};

      if (user) {
        encryptedData.user_id = user.id;
      } else if (anonymousId) {
        encryptedData.anonymous_id = anonymousId;
      } else {
        throw new Error('No user session found');
      }

      // Encrypt sensitive fields
      if (plan.warning_signs) {
        encryptedData.encrypted_warning_signs = encryption.encrypt(plan.warning_signs);
      }
      if (plan.coping_strategies) {
        encryptedData.encrypted_coping_strategies = encryption.encrypt(plan.coping_strategies);
      }
      if (plan.support_contacts) {
        encryptedData.encrypted_support_contacts = encryption.encrypt(plan.support_contacts);
      }
      if (plan.professional_contacts) {
        encryptedData.encrypted_professional_contacts = encryption.encrypt(plan.professional_contacts);
      }
      if (plan.environment_safety) {
        encryptedData.encrypted_environment_safety = encryption.encrypt(plan.environment_safety);
      }
      if (plan.reasons_to_live) {
        encryptedData.encrypted_reasons_to_live = encryption.encrypt(plan.reasons_to_live);
      }

      // Check if safety plan exists
      const existingPlan = await this.getSafetyPlan();

      let data, error;

      if (existingPlan.data) {
        // Update existing plan
        ({ data, error } = await supabase
          .from('safety_plans')
          .update({ ...encryptedData, updated_at: new Date().toISOString() })
          .eq('id', existingPlan.data.id)
          .select()
          .single());
      } else {
        // Create new plan
        ({ data, error } = await supabase
          .from('safety_plans')
          .insert(encryptedData)
          .select()
          .single());
      }

      if (error) throw error;

      // Decrypt data for return
      const decryptedPlan: SafetyPlan = {
        ...data,
        warning_signs: data.encrypted_warning_signs ? encryption.decrypt(data.encrypted_warning_signs) : undefined,
        coping_strategies: data.encrypted_coping_strategies ? encryption.decrypt(data.encrypted_coping_strategies) : undefined,
        support_contacts: data.encrypted_support_contacts ? encryption.decrypt(data.encrypted_support_contacts) : undefined,
        professional_contacts: data.encrypted_professional_contacts ? encryption.decrypt(data.encrypted_professional_contacts) : undefined,
        environment_safety: data.encrypted_environment_safety ? encryption.decrypt(data.encrypted_environment_safety) : undefined,
        reasons_to_live: data.encrypted_reasons_to_live ? encryption.decrypt(data.encrypted_reasons_to_live) : undefined,
      };

      return { data: decryptedPlan, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getCrisisResources(type?: string): Promise<{ data: CrisisResource[] | null; error: any }> {
    try {
      let query = supabase
        .from('crisis_resources')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const copingToolsService = new CopingToolsService();