import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Heart, Clock, BookOpen, Sparkles, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { MoodSelector } from '../components/mood/MoodSelector';
import { ScaleSelector } from '../components/mood/ScaleSelector';
import { moodService } from '../lib/mood';

const quickCheckInSchema = z.object({
  mood_score: z.number().min(1).max(10),
});

const detailedCheckInSchema = z.object({
  mood_score: z.number().min(1).max(10),
  energy_level: z.number().min(1).max(10).optional(),
  anxiety_level: z.number().min(1).max(10).optional(),
  sleep_quality: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  triggers: z.string().optional(),
  gratitude: z.string().optional(),
});

type QuickCheckInForm = z.infer<typeof quickCheckInSchema>;
type DetailedCheckInForm = z.infer<typeof detailedCheckInSchema>;

export function CheckIn() {
  const navigate = useNavigate();
  const [checkInType, setCheckInType] = useState<'quick' | 'detailed'>('quick');
  const [isLoading, setIsLoading] = useState(false);
  const [todaysEntry, setTodaysEntry] = useState<any>(null);
  const [loadingToday, setLoadingToday] = useState(true);

  const quickForm = useForm<QuickCheckInForm>({
    resolver: zodResolver(quickCheckInSchema),
  });

  const detailedForm = useForm<DetailedCheckInForm>({
    resolver: zodResolver(detailedCheckInSchema),
  });

  useEffect(() => {
    checkTodaysEntry();
  }, []);

  const checkTodaysEntry = async () => {
    setLoadingToday(true);
    const { data } = await moodService.getTodaysEntry();
    setTodaysEntry(data);
    setLoadingToday(false);
  };

  const onQuickSubmit = async (data: QuickCheckInForm) => {
    setIsLoading(true);
    try {
      const { error } = await moodService.createMoodEntry({
        mood_score: data.mood_score,
        check_in_type: 'quick',
      });

      if (error) {
        console.error('Error submitting check-in:', error);
        return;
      }

      navigate('/dashboard', { 
        state: { message: 'Quick check-in completed! 🎉' }
      });
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onDetailedSubmit = async (data: DetailedCheckInForm) => {
    setIsLoading(true);
    try {
      const triggers = data.triggers 
        ? data.triggers.split(',').map(t => t.trim()).filter(Boolean)
        : undefined;

      const { error } = await moodService.createMoodEntry({
        mood_score: data.mood_score,
        energy_level: data.energy_level,
        anxiety_level: data.anxiety_level,
        sleep_quality: data.sleep_quality,
        notes: data.notes,
        triggers,
        gratitude: data.gratitude,
        check_in_type: 'detailed',
      });

      if (error) {
        console.error('Error submitting check-in:', error);
        return;
      }

      navigate('/dashboard', { 
        state: { message: 'Detailed check-in completed! 🌟' }
      });
    } catch (error) {
      console.error('Error submitting check-in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingToday) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (todaysEntry) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-gray-900">Check-in Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">
              You've already completed your check-in today. Great job staying consistent with your mental health tracking!
            </p>
            
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h3 className="font-medium text-teal-900 mb-2">Today's Check-in Summary</h3>
              <div className="space-y-2 text-sm text-teal-800">
                <p>Mood: {todaysEntry.mood_score}/10</p>
                {todaysEntry.energy_level && <p>Energy: {todaysEntry.energy_level}/10</p>}
                {todaysEntry.anxiety_level && <p>Anxiety: {todaysEntry.anxiety_level}/10</p>}
                {todaysEntry.sleep_quality && <p>Sleep Quality: {todaysEntry.sleep_quality}/10</p>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => navigate('/mood-history')}
                variant="outline"
              >
                View Mood History
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
              >
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Check-in</h1>
        <p className="text-gray-600">
          Take a moment to reflect on how you're feeling today
        </p>
      </div>

      {/* Check-in Type Selection */}
      <div className="mb-8">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => setCheckInType('quick')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              checkInType === 'quick'
                ? 'bg-teal-100 text-teal-700 border-2 border-teal-200'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span>Quick Check-in (30 seconds)</span>
          </button>
          <button
            onClick={() => setCheckInType('detailed')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              checkInType === 'detailed'
                ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span>Detailed Check-in (3-5 minutes)</span>
          </button>
        </div>
      </div>

      {/* Quick Check-in Form */}
      {checkInType === 'quick' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-teal-600" />
              <span>Quick Check-in</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={quickForm.handleSubmit(onQuickSubmit)} className="space-y-8">
              <MoodSelector
                value={quickForm.watch('mood_score') || null}
                onChange={(value) => quickForm.setValue('mood_score', value)}
                label="How are you feeling right now?"
              />

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={!quickForm.watch('mood_score') || isLoading}
                  className="px-8"
                >
                  {isLoading ? 'Saving...' : 'Complete Quick Check-in'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Detailed Check-in Form */}
      {checkInType === 'detailed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-purple-600" />
              <span>Detailed Check-in</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={detailedForm.handleSubmit(onDetailedSubmit)} className="space-y-8">
              {/* Mood */}
              <div>
                <MoodSelector
                  value={detailedForm.watch('mood_score') || null}
                  onChange={(value) => detailedForm.setValue('mood_score', value)}
                  label="How are you feeling right now?"
                />
              </div>

              {/* Additional Scales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScaleSelector
                  value={detailedForm.watch('energy_level') || null}
                  onChange={(value) => detailedForm.setValue('energy_level', value)}
                  label="Energy Level"
                  lowLabel="Exhausted"
                  highLabel="Energized"
                  color="green"
                />
                
                <ScaleSelector
                  value={detailedForm.watch('anxiety_level') || null}
                  onChange={(value) => detailedForm.setValue('anxiety_level', value)}
                  label="Anxiety Level"
                  lowLabel="Calm"
                  highLabel="Very Anxious"
                  color="orange"
                />
                
                <ScaleSelector
                  value={detailedForm.watch('sleep_quality') || null}
                  onChange={(value) => detailedForm.setValue('sleep_quality', value)}
                  label="Sleep Quality"
                  lowLabel="Poor"
                  highLabel="Excellent"
                  color="purple"
                />
              </div>

              {/* Journal Prompts */}
              <div className="space-y-6">
                <div>
                  <Input
                    label="What's on your mind? (Optional)"
                    placeholder="Share your thoughts, feelings, or experiences..."
                    {...detailedForm.register('notes')}
                    helperText="This is a safe space to express yourself"
                  />
                </div>

                <div>
                  <Input
                    label="Any triggers or stressors today? (Optional)"
                    placeholder="Work stress, relationship issues, health concerns..."
                    {...detailedForm.register('triggers')}
                    helperText="Separate multiple triggers with commas"
                  />
                </div>

                <div>
                  <Input
                    label="What are you grateful for today? (Optional)"
                    placeholder="Small moments, people, experiences..."
                    {...detailedForm.register('gratitude')}
                    helperText="Gratitude can help shift perspective and improve mood"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  disabled={!detailedForm.watch('mood_score') || isLoading}
                  className="px-8"
                >
                  {isLoading ? 'Saving...' : 'Complete Detailed Check-in'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Encouragement */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-teal-50 px-4 py-2 rounded-lg">
          <Sparkles className="h-4 w-4 text-teal-600" />
          <span>Every check-in is a step toward better mental health awareness</span>
        </div>
      </div>
    </div>
  );
}