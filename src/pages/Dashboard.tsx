import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, TrendingUp, Users, Shield, Plus, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { moodService, MoodStats } from '../lib/mood';
import { aiService, AIInsight } from '../lib/ai';

export function Dashboard() {
  const { user, isAnonymous, profile } = useAuth();
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [recentInsights, setRecentInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResult, todayResult, insightsResult] = await Promise.all([
        moodService.getMoodStats(),
        moodService.getTodaysEntry(),
        aiService.getInsights(3)
      ]);

      if (statsResult.data) {
        setStats(statsResult.data);
      }
      if (todayResult.data) {
        setTodaysEntry(todayResult.data);
      }
      if (insightsResult.data) {
        setRecentInsights(insightsResult.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back{profile?.display_name ? `, ${profile.display_name}` : ''}
            </h1>
            <p className="text-gray-600 mt-1">
              {isAnonymous 
                ? 'You\'re using MindfulSpace in anonymous mode' 
                : 'How are you feeling today?'
              }
            </p>
          </div>
          
          {isAnonymous && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="h-4 w-4" />
              <span>Anonymous Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/checkin">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Daily Check-in</h3>
                  <p className="text-sm text-gray-600">Track your mood</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/mood-history">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mood History</h3>
                  <p className="text-sm text-gray-600">View patterns</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/tools">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Coping Tools</h3>
                  <p className="text-sm text-gray-600">Evidence-based tools</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/support">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Peer Support</h3>
                  <p className="text-sm text-gray-600">Connect safely</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Today's Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading...</p>
                </div>
              ) : todaysEntry ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Check-in Complete!</h3>
                  <p className="text-gray-600 mb-4">
                    Mood: {todaysEntry.mood_score}/10
                    {todaysEntry.energy_level && ` • Energy: ${todaysEntry.energy_level}/10`}
                  </p>
                  <Link to="/mood-history">
                    <Button variant="outline">View History</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't completed today's check-in yet</p>
                  <Link to="/checkin">
                    <Button>Complete Check-in</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading insights...</p>
                </div>
              ) : stats && stats.totalEntries > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-teal-50 rounded-lg">
                      <p className="text-2xl font-bold text-teal-600">{stats.averageMood}</p>
                      <p className="text-sm text-teal-700">Average Mood</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{stats.currentStreak}</p>
                      <p className="text-sm text-purple-700">Day Streak</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">
                      Your mood trend is{' '}
                      <span className={`font-medium ${
                        stats.moodTrend === 'improving' ? 'text-green-600' :
                        stats.moodTrend === 'declining' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {stats.moodTrend === 'improving' ? 'improving' :
                         stats.moodTrend === 'declining' ? 'needs attention' : 'stable'}
                      </span>
                    </p>
                    <Link to="/mood-history">
                      <Button variant="outline" size="sm">View Detailed History</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    Complete a few check-ins to start seeing personalized insights about your mental health patterns
                  </p>
                  <Link to="/checkin">
                    <Button variant="outline">Start Tracking</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Insights Preview */}
          {recentInsights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Recent AI Insights</span>
                  <Link to="/insights">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInsights.slice(0, 2).map((insight) => (
                    <div key={insight.id} className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                      <h4 className="font-medium text-teal-900 mb-2">
                        {insight.insight_type === 'mood_pattern' && 'Mood Pattern'}
                        {insight.insight_type === 'trigger_analysis' && 'Trigger Analysis'}
                        {insight.insight_type === 'recommendation' && 'Recommendation'}
                        {insight.insight_type === 'progress_summary' && 'Progress Summary'}
                        {insight.insight_type === 'warning' && 'Important Notice'}
                      </h4>
                      <p className="text-sm text-teal-800 line-clamp-2">
                        {insight.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Privacy Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mode</span>
                  <span className="text-sm font-medium">
                    {isAnonymous ? 'Anonymous' : 'Email Protected'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Encryption</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Data Retention</span>
                  <span className="text-sm font-medium">
                    {profile?.data_retention_days ? `${profile.data_retention_days} days` : '730 days'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="w-full">
                    Privacy Settings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link 
                  to="/crisis" 
                  className="block p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium text-red-700">Crisis Support</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">24/7 immediate help</p>
                </Link>
                
                <Link 
                  to="/tools" 
                  className="block p-3 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-sm font-medium text-teal-700">Quick Coping Tools</span>
                  </div>
                  <p className="text-xs text-teal-600 mt-1">Breathing & grounding</p>
                </Link>
                
                <Link 
                  to="/support" 
                  className="block p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-purple-700">Peer Support</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">Connect with others</p>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Notice for Anonymous Users */}
          {isAnonymous && (
            <Card>
              <CardHeader>
                <CardTitle>Enhance Your Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Add an email to enable crisis intervention features and data recovery.
                </p>
                <Link to="/settings">
                  <Button variant="outline" size="sm" className="w-full">
                    Add Email
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}