import React from 'react';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { AIInsight } from '../../lib/ai';
import { clsx } from 'clsx';

interface InsightCardProps {
  insight: AIInsight;
  showConfidence?: boolean;
}

export function InsightCard({ insight, showConfidence = false }: InsightCardProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'mood_pattern':
        return <TrendingUp className="h-5 w-5" />;
      case 'trigger_analysis':
        return <Target className="h-5 w-5" />;
      case 'progress_summary':
        return <Brain className="h-5 w-5" />;
      case 'recommendation':
        return <Lightbulb className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'mood_pattern':
        return 'text-teal-600 bg-teal-100';
      case 'trigger_analysis':
        return 'text-orange-600 bg-orange-100';
      case 'progress_summary':
        return 'text-purple-600 bg-purple-100';
      case 'recommendation':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getInsightTitle = (type: string) => {
    switch (type) {
      case 'mood_pattern':
        return 'Mood Pattern';
      case 'trigger_analysis':
        return 'Trigger Analysis';
      case 'progress_summary':
        return 'Progress Summary';
      case 'recommendation':
        return 'Recommendation';
      case 'warning':
        return 'Important Notice';
      default:
        return 'Insight';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High confidence';
    if (confidence >= 0.6) return 'Medium confidence';
    return 'Low confidence';
  };

  return (
    <Card className={clsx(
      'transition-all duration-200 hover:shadow-md',
      insight.insight_type === 'warning' && 'border-red-200 bg-red-50'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={clsx(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            getInsightColor(insight.insight_type)
          )}>
            {getInsightIcon(insight.insight_type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {getInsightTitle(insight.insight_type)}
              </h3>
              
              {showConfidence && (
                <span className={clsx(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  getConfidenceColor(insight.confidence_score)
                )}>
                  {getConfidenceText(insight.confidence_score)}
                </span>
              )}
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-3">
              {insight.content}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>
                Analysis period: {new Date(insight.data_period_start).toLocaleDateString()} - {new Date(insight.data_period_end).toLocaleDateString()}
              </span>
              
              {!insight.is_reviewed && insight.insight_type === 'warning' && (
                <span className="text-red-600 font-medium">
                  Requires attention
                </span>
              )}
            </div>
          </div>
        </div>
        
        {insight.insight_type === 'warning' && (
          <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Important:</strong> This insight suggests you may benefit from professional support. 
              Consider reaching out to a mental health professional or crisis resource if you're experiencing distress.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}