//src/pages/Landing.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Users, Brain, Phone, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export function Landing() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Your Mental Health,
                <span className="text-teal-600"> Your Privacy</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                A compassionate mental health companion that provides daily mood tracking, 
                AI-powered insights, and anonymous peer support—all while keeping your data completely private.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Your Journey
                </Button>
              </Link>
              <Link to="/anonymous">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Try Anonymously
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-teal-600" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-teal-600" />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-teal-600" />
                <span>Evidence-Based</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crisis Support Banner */}
      <section className="bg-red-50 border-y border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <Phone className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Need immediate support?</h3>
                <p className="text-sm text-red-700">Crisis resources are available 24/7</p>
              </div>
            </div>
            <Link to="/crisis">
              <Button variant="crisis">
                Get Crisis Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Comprehensive Mental Health Support
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Evidence-based tools and insights designed to help you understand and improve your mental wellbeing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Daily Check-ins */}
            <Card>
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Daily Check-ins</h3>
                <p className="text-gray-600">
                  Track your mood, energy, and mental health patterns with gentle, 
                  intuitive daily assessments that take just 30 seconds.
                </p>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">AI-Powered Insights</h3>
                <p className="text-gray-600">
                  Discover patterns in your mental health data with ethical AI that provides 
                  personalized insights while respecting your privacy.
                </p>
              </CardContent>
            </Card>

            {/* Peer Support */}
            <Card>
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Anonymous Peer Support</h3>
                <p className="text-gray-600">
                  Connect with others who understand your journey through secure, 
                  anonymous peer support and community discussions.
                </p>
              </CardContent>
            </Card>

            {/* Coping Tools */}
            <Card>
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Evidence-Based Tools</h3>
                <p className="text-gray-600">
                  Access a library of proven coping strategies including CBT, DBT, 
                  mindfulness, and breathing exercises.
                </p>
              </CardContent>
            </Card>

            {/* Crisis Detection */}
            <Card>
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Crisis Support</h3>
                <p className="text-gray-600">
                  Intelligent crisis detection with immediate access to professional 
                  resources and emergency support when you need it most.
                </p>
              </CardContent>
            </Card>

            {/* Privacy First */}
            <Card>
              <CardContent className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Privacy First</h3>
                <p className="text-gray-600">
                  Your mental health data is encrypted end-to-end. Use anonymously 
                  or with email—you control your privacy level.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Your Privacy is Our Priority
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We believe mental health support should never compromise your privacy. 
              That's why we've built MindfulSpace with privacy-first architecture.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">End-to-End Encryption</h3>
                <p className="text-gray-600">
                  All your mental health data is encrypted on your device before being stored. 
                  Even we can't access your personal information.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Anonymous Options</h3>
                <p className="text-gray-600">
                  Use MindfulSpace completely anonymously—no email required. 
                  Upgrade to email registration only if you want crisis support features.
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">You Control Your Data</h3>
                <p className="text-gray-600">
                  Set your own data retention periods, export your data anytime, 
                  or delete everything with one click. Your data, your choice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Start Your Mental Health Journey Today
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of people who are taking control of their mental wellbeing 
            with compassionate, private, evidence-based support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Create Account
              </Button>
            </Link>
            <Link to="/anonymous">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Start Anonymously
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            Free forever for core features. No credit card required.
          </p>
        </div>
      </section>
    </div>
  );
}