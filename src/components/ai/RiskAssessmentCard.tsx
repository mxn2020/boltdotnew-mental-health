import React from 'react';
import { Shield, AlertTriangle, Phone, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { RiskAssessment } from '../../lib/ai';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

interface RiskAssessmentCardProps {
  assessment: RiskAssessment;
}

export function RiskAssessmentCard({ assessment }: RiskAssessmentCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'crisis':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return <Shield className="h-5 w-5" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      case 'high':
        return <AlertTriangle className="h-5 w-5" />;
      case 'crisis':
        return <Phone className="h-5 w-5" />;
      default:
        return <Shield className="h-5 w-5" />;
    }
  };

  const getRiskTitle = (level: string) => {
    switch (level) {
      case 'low':
        return 'Low Risk Assessment';
      case 'medium':
        return 'Medium Risk Assessment';
      case 'high':
        return 'High Risk Assessment';
      case 'crisis':
        return 'Crisis Risk Assessment';
      default:
        return 'Risk Assessment';
    }
  };

  const getRiskDescription = (level: string) => {
    switch (level) {
      case 'low':
        return 'Your current mental health indicators suggest you are managing well. Continue your positive practices.';
      case 'medium':
        return 'Some indicators suggest increased attention to your mental health would be beneficial.';
      case 'high':
        return 'Several indicators suggest you may benefit from additional support and professional guidance.';
      case 'crisis':
        return 'Immediate professional support is strongly recommended. Please reach out for help right away.';
      default:
        return 'Assessment completed.';
    }
  };

  return (
    <Card className={clsx(
      'transition-all duration-200',
      assessment.risk_level === 'crisis' && 'border-red-300 shadow-lg',
      assessment.risk_level === 'high' && 'border-orange-300',
      assessment.risk_level === 'medium' && 'border-yellow-300',
      assessment.risk_level === 'low' && 'border-green-300'
    )}>
      <CardHeader className={clsx(
        'border-b',
        getRiskColor(assessment.risk_level)
      )}>
        <CardTitle className="flex items-center space-x-3">
          {getRiskIcon(assessment.risk_level)}
          <span>{getRiskTitle(assessment.risk_level)}</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <p className="text-gray-700 leading-relaxed">
          {getRiskDescription(assessment.risk_level)}
        </p>
        
        {assessment.risk_factors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span>Areas of Concern:</span>
            </h4>
            <ul className="space-y-1">
              {assessment.risk_factors.map((factor, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {assessment.protective_factors.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center space-x-2">
              <Heart className="h-4 w-4 text-green-500" />
              <span>Protective Factors:</span>
            </h4>
            <ul className="space-y-1">
              {assessment.protective_factors.map((factor, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {assessment.recommendations && (
          <div className={clsx(
            'p-4 rounded-lg border',
            assessment.risk_level === 'crisis' ? 'bg-red-50 border-red-200' :
            assessment.risk_level === 'high' ? 'bg-orange-50 border-orange-200' :
            assessment.risk_level === 'medium' ? 'bg-yellow-50 border-yellow-200' :
            'bg-green-50 border-green-200'
          )}>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
            <p className="text-sm text-gray-700">{assessment.recommendations}</p>
          </div>
        )}
        
        {assessment.requires_intervention && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <Link to="/crisis" className="flex-1">
              <Button variant="crisis" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                Get Crisis Support
              </Button>
            </Link>
            <Link to="/resources" className="flex-1">
              <Button variant="outline" className="w-full">
                Find Professional Help
              </Button>
            </Link>
          </div>
        )}
        
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
          Assessment completed on {new Date(assessment.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}