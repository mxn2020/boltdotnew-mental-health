import React from 'react';
import { MessageCircle, Clock, User, CheckCircle, X, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { PeerMatch } from '../../lib/peerSupport';
import { clsx } from 'clsx';
import { format, parseISO } from 'date-fns';

interface PeerMatchCardProps {
  match: PeerMatch;
  isSupporter: boolean;
  onAccept?: (matchId: string) => void;
  onDecline?: (matchId: string) => void;
  onMessage?: (matchId: string) => void;
  onComplete?: (matchId: string) => void;
  onRate?: (matchId: string) => void;
}

export function PeerMatchCard({ 
  match, 
  isSupporter, 
  onAccept, 
  onDecline, 
  onMessage, 
  onComplete,
  onRate 
}: PeerMatchCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'one-time':
        return 'One-time Support';
      case 'ongoing':
        return 'Ongoing Support';
      case 'crisis':
        return 'Crisis Support';
      default:
        return type;
    }
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'crisis':
        return 'text-red-600 bg-red-100';
      case 'ongoing':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-teal-600 bg-teal-100';
    }
  };

  return (
    <Card className={clsx(
      'transition-all duration-200 hover:shadow-md',
      match.match_type === 'crisis' && 'border-red-200 bg-red-50'
    )}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isSupporter ? 'Support Request' : 'Your Match'}
              </h3>
              <p className="text-sm text-gray-600">
                {format(parseISO(match.created_at), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={clsx(
              'text-xs px-2 py-1 rounded-full font-medium',
              getMatchTypeColor(match.match_type)
            )}>
              {getMatchTypeLabel(match.match_type)}
            </span>
            <span className={clsx(
              'text-xs px-2 py-1 rounded-full font-medium',
              getStatusColor(match.status)
            )}>
              {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {match.match_reason && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {isSupporter ? 'Why they need support:' : 'Your request:'}
            </h4>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
              {match.match_reason}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{match.session_count} sessions</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>
                Last: {format(parseISO(match.last_interaction), 'MMM dd')}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          {match.status === 'pending' && isSupporter && (
            <>
              <Button
                onClick={() => onAccept?.(match.id)}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Match
              </Button>
              <Button
                onClick={() => onDecline?.(match.id)}
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </>
          )}

          {match.status === 'active' && (
            <>
              <Button
                onClick={() => onMessage?.(match.id)}
                className="flex-1"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Message
              </Button>
              <Button
                onClick={() => onComplete?.(match.id)}
                variant="outline"
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </>
          )}

          {match.status === 'completed' && (
            <Button
              onClick={() => onRate?.(match.id)}
              variant="outline"
              className="w-full"
            >
              <Star className="h-4 w-4 mr-2" />
              Rate Experience
            </Button>
          )}

          {match.status === 'pending' && !isSupporter && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">
                Waiting for a supporter to accept your request...
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}