import React from 'react';
import { Users, Calendar, MessageCircle, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { SupportGroup } from '../../lib/peerSupport';
import { clsx } from 'clsx';

interface SupportGroupCardProps {
  group: SupportGroup;
  isMember?: boolean;
  onJoin?: (groupId: string) => void;
  onEnter?: (groupId: string) => void;
}

export function SupportGroupCard({ group, isMember, onJoin, onEnter }: SupportGroupCardProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'anxiety':
        return 'text-orange-600 bg-orange-100';
      case 'depression':
        return 'text-blue-600 bg-blue-100';
      case 'trauma':
        return 'text-purple-600 bg-purple-100';
      case 'addiction':
        return 'text-red-600 bg-red-100';
      case 'grief':
        return 'text-gray-600 bg-gray-100';
      case 'general':
        return 'text-teal-600 bg-teal-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'anxiety':
        return 'Anxiety Support';
      case 'depression':
        return 'Depression Support';
      case 'trauma':
        return 'Trauma Recovery';
      case 'addiction':
        return 'Addiction Recovery';
      case 'grief':
        return 'Grief & Loss';
      case 'general':
        return 'General Support';
      default:
        return category;
    }
  };

  const formatMeetingSchedule = (schedule: any) => {
    if (!schedule || !schedule.days) return 'Schedule TBD';
    
    const days = Array.isArray(schedule.days) ? schedule.days : [schedule.days];
    const time = schedule.time || 'Time TBD';
    
    if (days.includes('daily')) {
      return `Daily at ${time}`;
    }
    
    const dayNames = days.map((day: string) => 
      day.charAt(0).toUpperCase() + day.slice(1)
    ).join(', ');
    
    return `${dayNames} at ${time}`;
  };

  const isNearCapacity = group.current_members >= group.max_members * 0.8;
  const isFull = group.current_members >= group.max_members;

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={clsx(
                  'text-xs px-2 py-1 rounded-full font-medium',
                  getCategoryColor(group.category)
                )}>
                  {getCategoryLabel(group.category)}
                </span>
                {group.is_moderated && (
                  <span className="text-xs px-2 py-1 rounded-full font-medium text-green-600 bg-green-100">
                    <Shield className="h-3 w-3 inline mr-1" />
                    Moderated
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed">
          {group.description}
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1 text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {group.current_members}/{group.max_members} members
              </span>
            </div>
            
            {isNearCapacity && (
              <span className={clsx(
                'text-xs px-2 py-1 rounded-full font-medium',
                isFull ? 'text-red-600 bg-red-100' : 'text-orange-600 bg-orange-100'
              )}>
                {isFull ? 'Full' : 'Almost Full'}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatMeetingSchedule(group.meeting_schedule)}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          {isMember ? (
            <Button
              onClick={() => onEnter?.(group.id)}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Enter Group Chat
            </Button>
          ) : (
            <Button
              onClick={() => onJoin?.(group.id)}
              disabled={isFull}
              className="w-full"
              variant={isFull ? 'outline' : 'primary'}
            >
              <Users className="h-4 w-4 mr-2" />
              {isFull ? 'Group Full' : 'Join Group'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}