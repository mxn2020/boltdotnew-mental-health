// src/components/tools/CrisisResourceCard.tsx

import React from 'react';
import { Phone, MessageCircle, Globe, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { CrisisResource } from '../../lib/copingTools';
import { clsx } from 'clsx';

interface CrisisResourceCardProps {
  resource: CrisisResource;
}

export function CrisisResourceCard({ resource }: CrisisResourceCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hotline':
        return <Phone className="h-5 w-5" />;
      case 'text':
        return <MessageCircle className="h-5 w-5" />;
      case 'chat':
        return <MessageCircle className="h-5 w-5" />;
      case 'website':
        return <Globe className="h-5 w-5" />;
      case 'emergency':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Phone className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency':
        return 'text-red-600 bg-red-100 border-red-200';
      case 'hotline':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'text':
      case 'chat':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'website':
        return 'text-purple-600 bg-purple-100 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'hotline':
        return 'Phone';
      case 'text':
        return 'Text';
      case 'chat':
        return 'Chat';
      case 'website':
        return 'Website';
      case 'emergency':
        return 'Emergency';
      default:
        return type;
    }
  };

  const handleContact = () => {
    if (resource.phone_number) {
      window.open(`tel:${resource.phone_number}`, '_self');
    } else if (resource.website_url) {
      window.open(resource.website_url, '_blank');
    }
  };

  return (
    <Card className={clsx(
      'transition-all duration-200 hover:shadow-md',
      resource.type === 'emergency' && 'border-red-300 bg-red-50'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={clsx(
            'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
            getTypeColor(resource.type)
          )}>
            {getTypeIcon(resource.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {resource.name}
              </h3>
              <span className={clsx(
                'text-xs px-2 py-1 rounded-full font-medium border',
                getTypeColor(resource.type)
              )}>
                {getTypeLabel(resource.type)}
              </span>
            </div>
            
            <p className="text-gray-700 mb-3 leading-relaxed">
              {resource.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
              <span>Available: {resource.availability}</span>
              {resource.language_support.length > 1 && (
                <span>Languages: {resource.language_support.join(', ')}</span>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {resource.phone_number && (
                <Button
                  onClick={() => window.open(`tel:${resource.phone_number}`, '_self')}
                  variant={resource.type === 'emergency' ? 'crisis' : 'primary'}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call {resource.phone_number}
                </Button>
              )}
              
              {resource.website_url && (
                <Button
                  onClick={() => window.open(resource.website_url, '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}