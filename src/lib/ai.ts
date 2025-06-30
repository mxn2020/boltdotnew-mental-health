import { supabase } from './supabase';
import { encryption } from './encryption';
import { MoodEntry } from './mood';

export interface AIInsight {
  id: string;
  user_id?: string;
  anonymous_id?: string;
  insight_type: 'mood_pattern' | 'trigger_analysis' | 'progress_summary' | 'recommendation' | 'warning';
  content: string;
  confidence_score: number;
  data_period_start: string;
  data_period_end: string;
  is_reviewed: boolean;
  created_at: string;
}

export interface PatternAnalysis {
  id: string;
  user_id?: string;
  anonymous_id?: string;
  pattern_type: 'mood_cycle' | 'trigger_correlation' | 'sleep_mood' | 'energy_mood' | 'weekly_pattern' | 'stress_response';
  description: string;
  strength: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'irregular';
  triggers: string[];
  recommendations: string[];
  created_at: string;
  updated_at: string;
}

export interface RiskAssessment {
  id: string;
  user_id?: string;
  anonymous_id?: string;
  risk_level: 'low' | 'medium' | 'high' | 'crisis';
  risk_factors: string[];
  protective_factors: string[];
  recommendations?: string;
  requires_intervention: boolean;
  created_at: string;
}

class AIService {
  private openaiApiKey: string | null = null;

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  private async callOpenAI(prompt: string, maxTokens = 500): Promise<string | null> {
    if (!this.openaiApiKey) {
      console.warn('OpenAI API key not configured. Using fallback analysis.');
      return null;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a compassionate mental health AI assistant. Provide supportive, evidence-based insights while being clear that you are not a replacement for professional care. Always include disclaimers about seeking professional help when appropriate. Be encouraging and non-judgmental.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      return null;
    }
  }

  async analyzeMoodPatterns(entries: MoodEntry[]): Promise<{ insights: AIInsight[]; patterns: PatternAnalysis[] }> {
    if (entries.length < 3) {
      return { insights: [], patterns: [] };
    }

    const insights: AIInsight[] = [];
    const patterns: PatternAnalysis[] = [];

    try {
      // Analyze mood trends
      const moodTrendInsight = await this.analyzeMoodTrend(entries);
      if (moodTrendInsight) {
        insights.push(moodTrendInsight);
      }

      // Analyze trigger patterns
      const triggerPattern = await this.analyzeTriggerPatterns(entries);
      if (triggerPattern) {
        patterns.push(triggerPattern);
      }

      // Analyze sleep-mood correlation
      const sleepMoodPattern = await this.analyzeSleepMoodCorrelation(entries);
      if (sleepMoodPattern) {
        patterns.push(sleepMoodPattern);
      }

      // Generate recommendations
      const recommendationInsight = await this.generateRecommendations(entries);
      if (recommendationInsight) {
        insights.push(recommendationInsight);
      }

      return { insights, patterns };
    } catch (error) {
      console.error('Error analyzing mood patterns:', error);
      return { insights: [], patterns: [] };
    }
  }

  private async analyzeMoodTrend(entries: MoodEntry[]): Promise<AIInsight | null> {
    const recentEntries = entries.slice(0, 7);
    const previousEntries = entries.slice(7, 14);

    if (recentEntries.length < 3) return null;

    const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / recentEntries.length;
    const previousAvg = previousEntries.length > 0 
      ? previousEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / previousEntries.length
      : recentAvg;

    const trend = recentAvg - previousAvg;
    let content: string;
    let confidence: number;

    if (Math.abs(trend) < 0.5) {
      content = `Your mood has been stable over the past week, averaging ${recentAvg.toFixed(1)}/10. Consistency in mood tracking is a positive sign of emotional awareness. Consider maintaining your current routines and coping strategies.`;
      confidence = 0.8;
    } else if (trend > 0) {
      content = `Your mood has improved by ${trend.toFixed(1)} points over the past week (from ${previousAvg.toFixed(1)} to ${recentAvg.toFixed(1)}). This is encouraging progress! Reflect on what positive changes you've made recently and try to maintain them.`;
      confidence = 0.9;
    } else {
      content = `Your mood has declined by ${Math.abs(trend).toFixed(1)} points over the past week. This might be a good time to reach out for support, practice self-care, or consider speaking with a mental health professional if the decline continues.`;
      confidence = 0.85;
    }

    // Add AI-generated insight if available
    if (this.openaiApiKey) {
      const prompt = `Analyze this mood trend data and provide a supportive insight:
        Recent average mood: ${recentAvg.toFixed(1)}/10
        Previous average mood: ${previousAvg.toFixed(1)}/10
        Trend: ${trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable'}
        
        Provide a brief, encouraging insight (2-3 sentences) that acknowledges the trend and offers gentle guidance.`;

      const aiContent = await this.callOpenAI(prompt, 200);
      if (aiContent) {
        content = aiContent;
        confidence = Math.min(confidence + 0.1, 1.0);
      }
    }

    return {
      id: crypto.randomUUID(),
      insight_type: 'mood_pattern',
      content,
      confidence_score: confidence,
      data_period_start: entries[entries.length - 1]?.created_at.split('T')[0] || '',
      data_period_end: entries[0]?.created_at.split('T')[0] || '',
      is_reviewed: false,
      created_at: new Date().toISOString(),
    };
  }

  private async analyzeTriggerPatterns(entries: MoodEntry[]): Promise<PatternAnalysis | null> {
    const entriesWithTriggers = entries.filter(entry => entry.triggers && entry.triggers.length > 0);
    
    if (entriesWithTriggers.length < 2) return null;

    // Count trigger frequency and correlate with mood
    const triggerMoodMap: { [key: string]: { count: number; totalMood: number; avgMood: number } } = {};

    entriesWithTriggers.forEach(entry => {
      entry.triggers?.forEach(trigger => {
        const normalizedTrigger = trigger.toLowerCase().trim();
        if (!triggerMoodMap[normalizedTrigger]) {
          triggerMoodMap[normalizedTrigger] = { count: 0, totalMood: 0, avgMood: 0 };
        }
        triggerMoodMap[normalizedTrigger].count++;
        triggerMoodMap[normalizedTrigger].totalMood += entry.mood_score;
      });
    });

    // Calculate average mood for each trigger
    Object.keys(triggerMoodMap).forEach(trigger => {
      triggerMoodMap[trigger].avgMood = triggerMoodMap[trigger].totalMood / triggerMoodMap[trigger].count;
    });

    // Find most frequent and most impactful triggers
    const sortedByFrequency = Object.entries(triggerMoodMap)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 3);

    const sortedByImpact = Object.entries(triggerMoodMap)
      .sort(([,a], [,b]) => a.avgMood - b.avgMood)
      .slice(0, 3);

    if (sortedByFrequency.length === 0) return null;

    const mostFrequentTrigger = sortedByFrequency[0];
    const strength = Math.min(mostFrequentTrigger[1].count / entriesWithTriggers.length, 1.0);

    let description = `You've identified "${mostFrequentTrigger[0]}" as a trigger ${mostFrequentTrigger[1].count} times, with an average mood of ${mostFrequentTrigger[1].avgMood.toFixed(1)}/10 when this occurs.`;

    const recommendations = [
      'Practice mindfulness when you notice this trigger arising',
      'Develop a specific coping strategy for this situation',
      'Consider what you can control vs. what you cannot in these situations',
      'Track your response to this trigger to identify what helps most'
    ];

    // Add AI-generated analysis if available
    if (this.openaiApiKey) {
      const prompt = `Analyze this trigger pattern and provide supportive guidance:
        Most frequent trigger: "${mostFrequentTrigger[0]}" (${mostFrequentTrigger[1].count} times)
        Average mood when triggered: ${mostFrequentTrigger[1].avgMood.toFixed(1)}/10
        
        Provide a brief analysis and 2-3 specific, actionable recommendations for managing this trigger.`;

      const aiContent = await this.callOpenAI(prompt, 300);
      if (aiContent) {
        const lines = aiContent.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          description = lines[0];
          if (lines.length > 1) {
            recommendations.splice(0, recommendations.length, ...lines.slice(1).map(line => line.replace(/^[-•]\s*/, '')));
          }
        }
      }
    }

    return {
      id: crypto.randomUUID(),
      pattern_type: 'trigger_correlation',
      description,
      strength,
      frequency: mostFrequentTrigger[1].count >= entriesWithTriggers.length * 0.5 ? 'weekly' : 'irregular',
      triggers: sortedByFrequency.map(([trigger]) => trigger),
      recommendations,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private async analyzeSleepMoodCorrelation(entries: MoodEntry[]): Promise<PatternAnalysis | null> {
    const entriesWithSleep = entries.filter(entry => entry.sleep_quality && entry.sleep_quality > 0);
    
    if (entriesWithSleep.length < 5) return null;

    // Calculate correlation between sleep and mood
    const sleepMoodPairs = entriesWithSleep.map(entry => ({
      sleep: entry.sleep_quality!,
      mood: entry.mood_score
    }));

    // Simple correlation calculation
    const n = sleepMoodPairs.length;
    const sumSleep = sleepMoodPairs.reduce((sum, pair) => sum + pair.sleep, 0);
    const sumMood = sleepMoodPairs.reduce((sum, pair) => sum + pair.mood, 0);
    const sumSleepMood = sleepMoodPairs.reduce((sum, pair) => sum + (pair.sleep * pair.mood), 0);
    const sumSleepSq = sleepMoodPairs.reduce((sum, pair) => sum + (pair.sleep * pair.sleep), 0);
    const sumMoodSq = sleepMoodPairs.reduce((sum, pair) => sum + (pair.mood * pair.mood), 0);

    const correlation = (n * sumSleepMood - sumSleep * sumMood) / 
      Math.sqrt((n * sumSleepSq - sumSleep * sumSleep) * (n * sumMoodSq - sumMood * sumMood));

    if (Math.abs(correlation) < 0.3) return null; // Weak correlation

    const avgSleep = sumSleep / n;
    const avgMood = sumMood / n;
    const strength = Math.abs(correlation);

    let description: string;
    const recommendations: string[] = [];

    if (correlation > 0.3) {
      description = `There's a positive correlation (${(correlation * 100).toFixed(0)}%) between your sleep quality and mood. Better sleep tends to lead to better mood days.`;
      recommendations.push(
        'Prioritize consistent sleep schedule',
        'Create a relaxing bedtime routine',
        'Limit screen time before bed',
        'Consider sleep hygiene practices'
      );
    } else {
      description = `There's a negative correlation between your sleep and mood patterns. This might indicate sleep disruption during stressful periods.`;
      recommendations.push(
        'Practice stress management before bedtime',
        'Consider relaxation techniques for better sleep',
        'Track what affects your sleep quality',
        'Speak with a healthcare provider about sleep concerns'
      );
    }

    return {
      id: crypto.randomUUID(),
      pattern_type: 'sleep_mood',
      description,
      strength,
      frequency: 'daily',
      triggers: [],
      recommendations,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  private async generateRecommendations(entries: MoodEntry[]): Promise<AIInsight | null> {
    const recentEntries = entries.slice(0, 7);
    const avgMood = recentEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / recentEntries.length;

    let content: string;
    let confidence = 0.8;

    if (avgMood >= 7) {
      content = `Your mood has been consistently positive this week! To maintain this wellbeing: continue your current self-care practices, celebrate your progress, and consider what specific activities or routines are contributing to your positive mood.`;
    } else if (avgMood >= 5) {
      content = `Your mood has been moderate this week. Consider incorporating more activities that bring you joy, practicing mindfulness or gratitude, and ensuring you're getting adequate rest and social connection.`;
    } else {
      content = `Your mood has been lower this week. This is a good time to prioritize self-care, reach out to supportive friends or family, and consider speaking with a mental health professional if these feelings persist.`;
    }

    // Add AI-generated recommendations if available
    if (this.openaiApiKey) {
      const moodData = recentEntries.map(entry => ({
        mood: entry.mood_score,
        energy: entry.energy_level,
        anxiety: entry.anxiety_level,
        sleep: entry.sleep_quality,
        hasNotes: !!entry.notes,
        hasTriggers: !!(entry.triggers && entry.triggers.length > 0)
      }));

      const prompt = `Based on this week's mood data, provide 3-4 specific, actionable recommendations:
        Average mood: ${avgMood.toFixed(1)}/10
        Data points: ${JSON.stringify(moodData)}
        
        Provide personalized, evidence-based suggestions that are encouraging and practical.`;

      const aiContent = await this.callOpenAI(prompt, 400);
      if (aiContent) {
        content = aiContent;
        confidence = 0.9;
      }
    }

    return {
      id: crypto.randomUUID(),
      insight_type: 'recommendation',
      content,
      confidence_score: confidence,
      data_period_start: entries[entries.length - 1]?.created_at.split('T')[0] || '',
      data_period_end: entries[0]?.created_at.split('T')[0] || '',
      is_reviewed: false,
      created_at: new Date().toISOString(),
    };
  }

  async assessRisk(entries: MoodEntry[]): Promise<RiskAssessment | null> {
    if (entries.length < 3) return null;

    const recentEntries = entries.slice(0, 7);
    const avgMood = recentEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / recentEntries.length;
    const moodVariability = this.calculateVariability(recentEntries.map(e => e.mood_score));
    
    const riskFactors: string[] = [];
    const protectiveFactors: string[] = [];
    let riskLevel: 'low' | 'medium' | 'high' | 'crisis' = 'low';
    let requiresIntervention = false;

    // Assess risk factors
    if (avgMood < 3) {
      riskFactors.push('Consistently low mood scores');
      riskLevel = 'high';
    } else if (avgMood < 5) {
      riskFactors.push('Below-average mood scores');
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    if (moodVariability > 2.5) {
      riskFactors.push('High mood variability');
      riskLevel = riskLevel === 'low' ? 'medium' : riskLevel;
    }

    // Check for concerning patterns in notes (basic keyword detection)
    const concerningKeywords = ['hopeless', 'worthless', 'suicide', 'kill myself', 'end it all', 'no point', 'give up'];
    const hasConceringContent = recentEntries.some(entry => 
      entry.notes && concerningKeywords.some(keyword => 
        entry.notes!.toLowerCase().includes(keyword)
      )
    );

    if (hasConceringContent) {
      riskFactors.push('Concerning language in journal entries');
      riskLevel = 'crisis';
      requiresIntervention = true;
    }

    // Assess protective factors
    if (recentEntries.length >= 5) {
      protectiveFactors.push('Consistent mood tracking');
    }

    if (recentEntries.some(entry => entry.gratitude)) {
      protectiveFactors.push('Practicing gratitude');
    }

    if (avgMood >= 6) {
      protectiveFactors.push('Generally positive mood');
    }

    // Only create assessment if there are significant risk factors
    if (riskFactors.length === 0 && riskLevel === 'low') {
      return null;
    }

    let recommendations = '';
    if (riskLevel === 'crisis') {
      recommendations = 'Immediate professional support recommended. Please contact a crisis hotline or emergency services.';
    } else if (riskLevel === 'high') {
      recommendations = 'Consider reaching out to a mental health professional for support and guidance.';
    } else if (riskLevel === 'medium') {
      recommendations = 'Focus on self-care, social connection, and monitor mood patterns closely.';
    }

    return {
      id: crypto.randomUUID(),
      risk_level: riskLevel,
      risk_factors: riskFactors,
      protective_factors: protectiveFactors,
      recommendations,
      requires_intervention: requiresIntervention,
      created_at: new Date().toISOString(),
    };
  }

  private calculateVariability(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  async saveInsights(insights: AIInsight[]): Promise<void> {
    if (insights.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      const insightsToSave = insights.map(insight => ({
        user_id: user?.id,
        anonymous_id: user ? null : anonymousId,
        insight_type: insight.insight_type,
        encrypted_content: encryption.encrypt(insight.content),
        confidence_score: insight.confidence_score,
        data_period_start: insight.data_period_start,
        data_period_end: insight.data_period_end,
        is_reviewed: insight.is_reviewed,
      }));

      const { error } = await supabase
        .from('ai_insights')
        .insert(insightsToSave);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving insights:', error);
    }
  }

  async savePatterns(patterns: PatternAnalysis[]): Promise<void> {
    if (patterns.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      const patternsToSave = patterns.map(pattern => ({
        user_id: user?.id,
        anonymous_id: user ? null : anonymousId,
        pattern_type: pattern.pattern_type,
        encrypted_description: encryption.encrypt(pattern.description),
        strength: pattern.strength,
        frequency: pattern.frequency,
        triggers: pattern.triggers,
        recommendations: pattern.recommendations,
      }));

      const { error } = await supabase
        .from('pattern_analysis')
        .insert(patternsToSave);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving patterns:', error);
    }
  }

  async saveRiskAssessment(assessment: RiskAssessment): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      const assessmentToSave = {
        user_id: user?.id,
        anonymous_id: user ? null : anonymousId,
        risk_level: assessment.risk_level,
        risk_factors: assessment.risk_factors,
        protective_factors: assessment.protective_factors,
        encrypted_recommendations: assessment.recommendations ? encryption.encrypt(assessment.recommendations) : null,
        requires_intervention: assessment.requires_intervention,
      };

      const { error } = await supabase
        .from('risk_assessments')
        .insert(assessmentToSave);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving risk assessment:', error);
    }
  }

  async getInsights(limit = 10): Promise<{ data: AIInsight[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('ai_insights')
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

      // Decrypt content
      const decryptedInsights: AIInsight[] = data.map(insight => ({
        ...insight,
        content: encryption.decrypt(insight.encrypted_content),
      }));

      return { data: decryptedInsights, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getPatterns(limit = 10): Promise<{ data: PatternAnalysis[] | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('pattern_analysis')
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

      // Decrypt content
      const decryptedPatterns: PatternAnalysis[] = data.map(pattern => ({
        ...pattern,
        description: encryption.decrypt(pattern.encrypted_description),
      }));

      return { data: decryptedPatterns, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  async getLatestRiskAssessment(): Promise<{ data: RiskAssessment | null; error: any }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const anonymousId = localStorage.getItem('mh_anonymous_id');

      let query = supabase
        .from('risk_assessments')
        .select('*')
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
        const assessment = data[0];
        const decryptedAssessment: RiskAssessment = {
          ...assessment,
          recommendations: assessment.encrypted_recommendations 
            ? encryption.decrypt(assessment.encrypted_recommendations) 
            : undefined,
        };
        return { data: decryptedAssessment, error: null };
      }

      return { data: null, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

export const aiService = new AIService();