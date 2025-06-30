import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export function Anonymous() {
  const { createAnonymousSession } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartAnonymous = async () => {
    setIsLoading(true);
    try {
      await createAnonymousSession();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating anonymous session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Heart className="h-8 w-8 text-teal-600" />
            <span className="text-2xl font-bold text-gray-900">MindfulSpace</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Anonymous Mode</h2>
          <p className="mt-2 text-gray-600">
            Use MindfulSpace completely privately without providing any personal information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-teal-600" />
              <span>Complete Privacy Protection</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* What's Included */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">What's included in Anonymous Mode:</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Daily mood tracking and mental health check-ins</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">AI-powered insights and pattern recognition</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Complete library of coping tools and strategies</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Anonymous peer support community</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">Crisis resources and professional referrals</span>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <span className="text-gray-700">All data encrypted and stored locally on your device</span>
                </div>
              </div>
            </div>

            {/* Privacy Details */}
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
              <h4 className="font-medium text-teal-900 mb-2">How Anonymous Mode Works:</h4>
              <ul className="text-sm text-teal-800 space-y-1">
                <li>• No email, name, or personal information required</li>
                <li>• All data encrypted with a unique key stored only on your device</li>
                <li>• Anonymous identifier generated for peer support matching</li>
                <li>• Data cannot be recovered if you lose your device</li>
                <li>• You can upgrade to email registration at any time</li>
              </ul>
            </div>

            {/* Limitations */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900 mb-2">Anonymous Mode Limitations:</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Crisis intervention features are limited without contact information</li>
                    <li>• Data cannot be recovered if you lose access to your device</li>
                    <li>• Cannot sync data across multiple devices</li>
                    <li>• Some advanced features may require email registration</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                onClick={handleStartAnonymous}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Setting up Anonymous Mode...' : 'Start Anonymous Mode'}
              </Button>
              
              <div className="text-center text-sm text-gray-600">
                You can always upgrade to email registration later for enhanced features
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Options */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">or</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register">
              <Button variant="outline" className="w-full sm:w-auto">
                Create Account with Email
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="w-full sm:w-auto">
                Sign In to Existing Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}