import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, RefreshCw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { InsightCard } from '../components/ai/InsightCard';
import { PatternCard } from '../components/ai/PatternCard';
import { RiskAssessmentCard } from '../components/ai/RiskAssessmentCard';
import { aiService, AIInsight, PatternAnalysis, RiskAssessment } from '../lib/ai';
import { moodService } from '../lib/mood';

export function Insights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [patterns, setPatterns] = useState<PatternAnalysis[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const [insightsResult, patternsResult, riskResult] = await Promise.all([
        aiService.getInsights(10),
        aiService.getPatterns(10),
        aiService.getLatestRiskAssessment()
      ]);

      if (insightsResult.data) {
        setInsights(insightsResult.data);
      }
      if (patternsResult.data) {
        setPatterns(patternsResult.data);
      }
      if (riskResult.data) {
        setRiskAssessment(riskResult.data);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewInsights = async () => {
    setAnalyzing(true);
    try {
      // Get recent mood entries for analysis
      const { data: entries } = await moodService.getMoodEntries(30);
      
      if (!entries || entries.length < 3) {
        alert('You need at least 3 mood entries to generate insights. Complete more check-ins first!');
        return;
      }

      // Generate new insights and patterns
      const { insights: newInsights, patterns: newPatterns } = await aiService.analyzeMoodPatterns(entries);
      
      // Generate risk assessment
      const newRiskAssessment = await aiService.assessRisk(entries);

      // Save to database
      if (newInsights.length > 0) {
        await aiService.saveInsights(newInsights);
      }
      if (newPatterns.length > 0) {
        await aiService.savePatterns(newPatterns);
      }
      if (newRiskAssessment) {
        await aiService.saveRiskAssessment(newRiskAssessment);
      }

      // Reload insights
      await loadInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Error generating insights. Please try again later.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your AI insights...</p>
        </div>
      </div>
    );
  }

  const hasAnyData = insights.length > 0 || patterns.length > 0 || riskAssessment;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Insights</h1>
            <p className="text-gray-600">
              Personalized insights and patterns from your mental health data
            </p>
          </div>
          
          <Button
            onClick={generateNewInsights}
            disabled={analyzing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Analyzing...' : 'Generate New Insights'}</span>
          </Button>
        </div>
      </div>

      {/* AI Disclaimer */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">AI-Powered Analysis</p>
            <p>
              These insights are generated using AI analysis of your mood patterns. They are meant to support 
              your self-awareness and are not a substitute for professional mental health care. If you have 
              concerns about your mental health, please consult with a qualified professional.
            </p>
          </div>
        </div>
      </div>

      {!hasAnyData ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Complete a few more mood check-ins to start receiving personalized AI insights about your mental health patterns.
            </p>
            <Button onClick={generateNewInsights} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Generate First Insights'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Risk Assessment */}
          {riskAssessment && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Current Risk Assessment</span>
              </h2>
              <RiskAssessmentCard assessment={riskAssessment} />
            </div>
          )}

          {/* Recent Insights */}
          {insights.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Recent Insights</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} showConfidence />
                ))}
              </div>
            </div>
          )}

          {/* Pattern Analysis */}
          {patterns.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Identified Patterns</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {patterns.map((pattern) => (
                  <PatternCard key={pattern.id} pattern={pattern} />
                ))}
              </div>
            </div>
          )}

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>How AI Insights Work</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-teal-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Pattern Recognition</h4>
                  <p className="text-sm text-gray-600">
                    AI analyzes your mood data to identify trends, cycles, and correlations you might miss.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Trigger Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Identifies which triggers most impact your mood and suggests coping strategies.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Personalized Recommendations</h4>
                  <p className="text-sm text-gray-600">
                    Provides evidence-based suggestions tailored to your specific patterns and needs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}