import React from 'react';
import { Clock, Star, Users, BookOpen, Zap, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { CopingTool } from '../../lib/copingTools';
import { clsx } from 'clsx';

interface ToolCardProps {
  tool: CopingTool;
  onUse: (tool: CopingTool) => void;
  effectiveness?: number;
  usageCount?: number;
}

export function ToolCard({ tool, onUse, effectiveness, usageCount }: ToolCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breathing':
        return <Zap className="h-5 w-5" />;
      case 'mindfulness':
        return <Star className="h-5 w-5" />;
      case 'grounding':
        return <Users className="h-5 w-5" />;
      case 'cbt':
        return <BookOpen className="h-5 w-5" />;
      case 'dbt':
        return <BookOpen className="h-5 w-5" />;
      case 'crisis':
        return <Shield className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'breathing':
        return 'text-teal-600 bg-teal-100';
      case 'mindfulness':
        return 'text-purple-600 bg-purple-100';
      case 'grounding':
        return 'text-green-600 bg-green-100';
      case 'cbt':
        return 'text-blue-600 bg-blue-100';
      case 'dbt':
        return 'text-indigo-600 bg-indigo-100';
      case 'crisis':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'text-green-600 bg-green-100';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-100';
      case 'advanced':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'cbt':
        return 'CBT';
      case 'dbt':
        return 'DBT';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  return (
    <Card className={clsx(
      'transition-all duration-200 hover:shadow-md',
      tool.is_crisis_tool && 'border-red-200 bg-red-50'
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              getCategoryColor(tool.category)
            )}>
              {getCategoryIcon(tool.category)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{tool.name}</h3>
              {tool.is_crisis_tool && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  Crisis Tool
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={clsx(
              'text-xs px-2 py-1 rounded-full font-medium',
              getCategoryColor(tool.category)
            )}>
              {getCategoryLabel(tool.category)}
            </span>
            <span className={clsx(
              'text-xs px-2 py-1 rounded-full font-medium',
              getDifficultyColor(tool.difficulty_level)
            )}>
              {tool.difficulty_level}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed">
          {tool.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{tool.duration_minutes} min</span>
            </div>
            
            {effectiveness && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{effectiveness.toFixed(1)}/5</span>
              </div>
            )}
            
            {usageCount && (
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>Used {usageCount}x</span>
              </div>
            )}
          </div>
        </div>
        
        {tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tool.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {tool.tags.length > 4 && (
              <span className="text-xs text-gray-500">
                +{tool.tags.length - 4} more
              </span>
            )}
          </div>
        )}
        
        {tool.evidence_base && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Evidence Base:</strong> {tool.evidence_base}
            </p>
          </div>
        )}
        
        <Button
          onClick={() => onUse(tool)}
          className="w-full"
          variant={tool.is_crisis_tool ? 'crisis' : 'primary'}
        >
          {tool.is_crisis_tool ? 'Use Crisis Tool' : 'Start Tool'}
        </Button>
      </CardContent>
    </Card>
  );
}