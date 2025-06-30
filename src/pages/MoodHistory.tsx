//src/pages/MoodHistory.tsx
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { TrendingUp, Calendar, BarChart3, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { MoodChart } from '../components/mood/MoodChart';
import { MoodCalendar } from '../components/mood/MoodCalendar';
import { moodService, MoodEntry, MoodStats } from '../lib/mood';

export function MoodHistory() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [viewMode, setViewMode] = useState<'chart' | 'calendar'>('chart');

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
    setLoading(true);
    try {
      const [entriesResult, statsResult] = await Promise.all([
        moodService.getMoodEntries(30),
        moodService.getMoodStats()
      ]);

      if (entriesResult.data) {
        setEntries(entriesResult.data);
      }
      if (statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error loading mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'declining':
        return <TrendingUp className="h-5 w-5 text-red-600 transform rotate-180" />;
      default:
        return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'declining':
        return 'Needs attention';
      default:
        return 'Stable';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your mood history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mood History</h1>
        <p className="text-gray-600">
          Track your mental health patterns and celebrate your progress
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Mood</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.averageMood}/10</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  {getTrendIcon(stats.moodTrend)}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trend</p>
                  <p className={`text-lg font-semibold ${getTrendColor(stats.moodTrend)}`}>
                    {getTrendText(stats.moodTrend)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Streak</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
                  <p className="text-xs text-gray-500">days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Check-ins</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="mb-6">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'chart'
                ? 'bg-teal-100 text-teal-700 border-2 border-teal-200'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Chart View</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'calendar'
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Calendar View</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart/Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {viewMode === 'chart' ? 'Mood Trends' : 'Mood Calendar'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === 'chart' ? (
                <MoodChart entries={entries} height={400} />
              ) : (
                <MoodCalendar 
                  entries={entries} 
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Entries */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No check-ins yet</p>
                  <p className="text-sm text-gray-400">
                    Complete your first check-in to start tracking your mood patterns
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {format(parseISO(entry.created_at), 'MMM dd, yyyy')}
                        </span>
                        <span className="text-lg font-bold text-teal-600">
                          {entry.mood_score}/10
                        </span>
                      </div>
                      
                      {(entry.energy_level || entry.anxiety_level || entry.sleep_quality) && (
                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-2">
                          {entry.energy_level && (
                            <div>Energy: {entry.energy_level}/10</div>
                          )}
                          {entry.anxiety_level && (
                            <div>Anxiety: {entry.anxiety_level}/10</div>
                          )}
                          {entry.sleep_quality && (
                            <div>Sleep: {entry.sleep_quality}/10</div>
                          )}
                        </div>
                      )}
                      
                      {entry.notes && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {entry.notes}
                        </p>
                      )}
                      
                      {entry.gratitude && (
                        <p className="text-sm text-green-600 italic mt-1">
                          Grateful for: {entry.gratitude}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Insights */}
      {entries.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Insights & Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Weekly Summary</h4>
                  <p className="text-sm text-gray-600">
                    {stats && stats.moodTrend === 'improving' && 
                      "Your mood has been improving over the past week. Keep up the great work!"
                    }
                    {stats && stats.moodTrend === 'declining' && 
                      "Your mood has been declining recently. Consider reaching out for support or trying some coping strategies."
                    }
                    {stats && stats.moodTrend === 'stable' && 
                      "Your mood has been stable recently. Consistency is a positive sign!"
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Streak Achievement</h4>
                  <p className="text-sm text-gray-600">
                    {stats && stats.currentStreak > 0 ? (
                      `You're on a ${stats.currentStreak}-day check-in streak! Your longest streak is ${stats.longestStreak} days.`
                    ) : (
                      "Start a new check-in streak today to build healthy tracking habits."
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}