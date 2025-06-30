//src/components/tools/ToolSession.tsx

import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CopingTool, copingToolsService } from '../../lib/copingTools';
import { clsx } from 'clsx';

interface ToolSessionProps {
  tool: CopingTool;
  onClose: () => void;
  onComplete: (effectiveness: number, notes?: string, moodBefore?: number, moodAfter?: number) => void;
}

export function ToolSession({ tool, onClose, onComplete }: ToolSessionProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(tool.duration_minutes * 60);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [effectiveness, setEffectiveness] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = tool.instructions.split('\n').filter(line => line.trim());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeRemaining(tool.duration_minutes * 60);
    setCurrentStep(0);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (effectiveness) {
      await copingToolsService.recordToolUsage({
        tool_id: tool.id,
        mood_before: moodBefore || undefined,
        mood_after: moodAfter || undefined,
        effectiveness_rating: effectiveness,
        notes: notes || undefined,
        duration_used: (tool.duration_minutes * 60) - timeRemaining,
        completed: true,
      });

      onComplete(effectiveness, notes, moodBefore || undefined, moodAfter || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{tool.name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!isCompleted ? (
            <>
              {/* Mood Before (if not set) */}
              {moodBefore === null && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg">
                  <h4 className="font-medium text-teal-900 mb-3">How are you feeling right now? (1-10)</h4>
                  <div className="grid grid-cols-10 gap-2">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setMoodBefore(num)}
                        className="aspect-square rounded-lg border-2 text-sm font-medium transition-all duration-200 hover:scale-105 bg-white border-teal-200 text-teal-600 hover:border-teal-300"
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Timer */}
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-4">
                  {formatTime(timeRemaining)}
                </div>
                <div className="flex justify-center space-x-4">
                  {!isActive ? (
                    <Button onClick={handleStart} disabled={moodBefore === null}>
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  ) : (
                    <Button onClick={handlePause} variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                  )}
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">
                    Step {currentStep + 1} of {steps.length}
                  </h4>
                  <div className="text-sm text-gray-500">
                    {Math.round(((currentStep + 1) / steps.length) * 100)}% complete
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">
                    {steps[currentStep]}
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button 
                    onClick={handlePrevStep} 
                    variant="outline"
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    onClick={handleNextStep}
                    disabled={moodBefore === null}
                  >
                    {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* Completion Form */
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Tool Completed!</h3>
                <p className="text-gray-600">How did this coping tool work for you?</p>
              </div>

              {/* Mood After */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">How are you feeling now? (1-10)</h4>
                <div className="grid grid-cols-10 gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setMoodAfter(num)}
                      className={clsx(
                        'aspect-square rounded-lg border-2 text-sm font-medium transition-all duration-200 hover:scale-105',
                        moodAfter === num
                          ? 'bg-teal-100 text-teal-700 border-teal-200'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Effectiveness Rating */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">How effective was this tool? (1-5 stars)</h4>
                <div className="flex justify-center space-x-2">
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => setEffectiveness(num)}
                      className={clsx(
                        'w-12 h-12 rounded-lg border-2 text-lg transition-all duration-200 hover:scale-105',
                        effectiveness === num
                          ? 'bg-yellow-100 text-yellow-600 border-yellow-200'
                          : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                      )}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <Input
                  label="Notes (Optional)"
                  placeholder="How did this tool help? Any insights or observations?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Complete Button */}
              <Button
                onClick={handleComplete}
                className="w-full"
                disabled={!effectiveness || !moodAfter}
              >
                Save & Complete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}