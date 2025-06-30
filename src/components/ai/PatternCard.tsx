//src/components/ai/PatternCard.tsx

import React from 'react';
import { Target, Repeat, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { PatternAnalysis } from '../../lib/ai';
import { clsx } from 'clsx';

interface PatternCardProps {
  pattern: PatternAnalysis;
}

export function PatternCard({ pattern }: PatternCardProps) {
  const getPatternIcon = (type: string) => {
    switch (type) {
      case 'mood_cycle':
        return <Repeat className="h-5 w-5" />;
      case 'trigger_correlation':
        return <Target className="h-5 w-5" />;
      case 'sleep_mood':
        return <Calendar className="h-5 w-5" />;
      case 'energy_mood':
        return <TrendingUp className="h-5 w-5" />;
      case 'weekly_pattern':
        return <Calendar className="h-5 w-5" />;
      case 'stress_response':
        return <Target className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const getPatternColor = (type: string) => {
    switch (type) {
      case 'mood_cycle':
        return 'text-purple-600 bg-purple-100';
      case 'trigger_correlation':
        return 'text-orange-600 bg-orange-100';
      case 'sleep_mood':
        return 'text-blue-600 bg-blue-100';
      case 'energy_mood':
        return 'text-green-600 bg-green-100';
      case 'weekly_pattern':
        return 'text-teal-600 bg-teal-100';
      case 'stress_response':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPatternTitle = (type: string) => {
    switch (type) {
      case 'mood_cycle':
        return 'Mood Cycle';
      case 'trigger_correlation':
        return 'Trigger Pattern';
      case 'sleep_mood':
        return 'Sleep & Mood';
      case 'energy_mood':
        return 'Energy & Mood';
      case 'weekly_pattern':
        return 'Weekly Pattern';
      case 'stress_response':
        return 'Stress Response';
      default:
        return 'Pattern';
    }
  };

  const getStrengthText = (strength: number) => {
    if (strength >= 0.8) return 'Very Strong';
    if (strength >= 0.6) return 'Strong';
    if (strength >= 0.4) return 'Moderate';
    return 'Weak';
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 0.8) return 'text-green-600 bg-green-100';
    if (strength >= 0.6) return 'text-teal-600 bg-teal-100';
    if (strength >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              getPatternColor(pattern.pattern_type)
            )}>
              {getPatternIcon(pattern.pattern_type)}
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {getPatternTitle(pattern.pattern_type)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={clsx(
              'text-xs px-2 py-1 rounded-full font-medium',
              getStrengthColor(pattern.strength)
            )}>
              {getStrengthText(pattern.strength)}
            </span>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {pattern.frequency}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed">
          {pattern.description}
        </p>
        
        {pattern.triggers.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Related Triggers:</h4>
            <div className="flex flex-wrap gap-2">
              {pattern.triggers.map((trigger, index) => (
                <span
                  key={index}
                  className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full"
                >
                  {trigger}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {pattern.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
            <ul className="space-y-1">
              {pattern.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          Pattern identified on {new Date(pattern.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}