import React from 'react';
import { clsx } from 'clsx';

interface MoodOption {
  value: number;
  emoji: string;
  label: string;
  color: string;
}

const moodOptions: MoodOption[] = [
  { value: 1, emoji: '😢', label: 'Very Low', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 2, emoji: '😔', label: 'Low', color: 'bg-red-50 text-red-600 border-red-100' },
  { value: 3, emoji: '😕', label: 'Poor', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 4, emoji: '😐', label: 'Below Average', color: 'bg-orange-50 text-orange-600 border-orange-100' },
  { value: 5, emoji: '😊', label: 'Okay', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 6, emoji: '🙂', label: 'Fair', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
  { value: 7, emoji: '😌', label: 'Good', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 8, emoji: '😄', label: 'Very Good', color: 'bg-green-50 text-green-600 border-green-100' },
  { value: 9, emoji: '😁', label: 'Great', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { value: 10, emoji: '🤩', label: 'Excellent', color: 'bg-teal-50 text-teal-600 border-teal-100' },
];

interface MoodSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  label?: string;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MoodSelector({ 
  value, 
  onChange, 
  label = "How are you feeling?",
  showLabels = true,
  size = 'md'
}: MoodSelectorProps) {
  const selectedMood = moodOptions.find(option => option.value === value);

  return (
    <div className="space-y-4">
      {label && (
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{label}</h3>
          {selectedMood && (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-2xl">{selectedMood.emoji}</span>
              <span className="text-gray-600">{selectedMood.label}</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {moodOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={clsx(
              'flex flex-col items-center justify-center rounded-lg border-2 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2',
              {
                'p-2': size === 'sm',
                'p-3': size === 'md',
                'p-4': size === 'lg',
              },
              value === option.value
                ? option.color
                : 'bg-white border-gray-200 hover:border-gray-300'
            )}
          >
            <span className={clsx(
              'block',
              {
                'text-lg': size === 'sm',
                'text-xl': size === 'md',
                'text-2xl': size === 'lg',
              }
            )}>
              {option.emoji}
            </span>
            {showLabels && (
              <span className={clsx(
                'text-center font-medium mt-1',
                {
                  'text-xs': size === 'sm',
                  'text-sm': size === 'md',
                  'text-base': size === 'lg',
                },
                value === option.value ? 'text-current' : 'text-gray-600'
              )}>
                {option.value}
              </span>
            )}
          </button>
        ))}
      </div>

      {showLabels && (
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>Very Low</span>
          <span>Excellent</span>
        </div>
      )}
    </div>
  );
}