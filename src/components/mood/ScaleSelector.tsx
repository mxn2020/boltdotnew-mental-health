//src/components/mood/ScaleSelector.tsx
import React from 'react';
import { clsx } from 'clsx';

interface ScaleSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
  label: string;
  lowLabel: string;
  highLabel: string;
  color?: 'teal' | 'purple' | 'orange' | 'green';
}

export function ScaleSelector({ 
  value, 
  onChange, 
  label, 
  lowLabel, 
  highLabel,
  color = 'teal'
}: ScaleSelectorProps) {
  const colorClasses = {
    teal: 'bg-teal-100 text-teal-700 border-teal-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    orange: 'bg-orange-100 text-orange-700 border-orange-200',
    green: 'bg-green-100 text-green-700 border-green-200',
  };

  return (
    <div className="space-y-3">
      <div className="text-center">
        <h4 className="text-sm font-medium text-gray-900 mb-1">{label}</h4>
        {value && (
          <span className="text-lg font-semibold text-gray-700">{value}/10</span>
        )}
      </div>

      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={clsx(
              'aspect-square rounded-lg border-2 text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1',
              value === num
                ? colorClasses[color]
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300',
              `focus:ring-${color}-500`
            )}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
}