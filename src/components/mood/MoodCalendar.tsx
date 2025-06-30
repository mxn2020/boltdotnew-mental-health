//src/components/mood/MoodCalendar.tsx

import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { clsx } from 'clsx';
import { MoodEntry } from '../../lib/mood';

interface MoodCalendarProps {
  entries: MoodEntry[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
}

export function MoodCalendar({ entries, selectedDate, onDateSelect }: MoodCalendarProps) {
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getMoodForDate = (date: Date) => {
    return entries.find(entry => 
      isSameDay(new Date(entry.created_at), date)
    );
  };

  const getMoodColor = (moodScore: number) => {
    if (moodScore >= 8) return 'bg-teal-500';
    if (moodScore >= 6) return 'bg-green-500';
    if (moodScore >= 4) return 'bg-yellow-500';
    if (moodScore >= 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <p className="text-sm text-gray-600">Your mood tracking calendar</p>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map(day => {
          const moodEntry = getMoodForDate(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect?.(day)}
              className={clsx(
                'aspect-square rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 relative',
                {
                  'bg-gray-50 text-gray-400': !moodEntry && !isTodayDate,
                  'bg-gray-100 text-gray-600 border-2 border-gray-300': isTodayDate && !moodEntry,
                  'ring-2 ring-teal-500 ring-offset-2': isSelected,
                }
              )}
            >
              <span className={clsx(
                'absolute inset-0 flex items-center justify-center',
                moodEntry ? 'text-white' : 'text-current'
              )}>
                {format(day, 'd')}
              </span>
              
              {moodEntry && (
                <div className={clsx(
                  'absolute inset-0 rounded-lg',
                  getMoodColor(moodEntry.mood_score)
                )} />
              )}
              
              {isTodayDate && !moodEntry && (
                <div className="absolute inset-0 rounded-lg border-2 border-teal-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Fair</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Good</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Great</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-teal-500 rounded"></div>
            <span>Excellent</span>
          </div>
        </div>
      </div>
    </div>
  );
}