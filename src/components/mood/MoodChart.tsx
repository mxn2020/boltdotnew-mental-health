import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { MoodEntry } from '../../lib/mood';

interface MoodChartProps {
  entries: MoodEntry[];
  height?: number;
}

export function MoodChart({ entries, height = 300 }: MoodChartProps) {
  // Prepare data for chart (reverse to show chronological order)
  const chartData = entries
    .slice()
    .reverse()
    .map(entry => ({
      date: entry.created_at,
      mood: entry.mood_score,
      energy: entry.energy_level,
      anxiety: entry.anxiety_level,
      sleep: entry.sleep_quality,
      displayDate: format(parseISO(entry.created_at), 'MMM dd'),
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">
            {format(parseISO(data.date), 'MMMM dd, yyyy')}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              <span>Mood: {data.mood}/10</span>
            </div>
            {data.energy && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Energy: {data.energy}/10</span>
              </div>
            )}
            {data.anxiety && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span>Anxiety: {data.anxiety}/10</span>
              </div>
            )}
            {data.sleep && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Sleep: {data.sleep}/10</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No mood data yet</p>
          <p className="text-sm text-gray-400">Complete a few check-ins to see your mood trends</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="displayDate" 
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            domain={[1, 10]}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Line 
            type="monotone" 
            dataKey="mood" 
            stroke="#14b8a6" 
            strokeWidth={3}
            dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#14b8a6', strokeWidth: 2 }}
          />
          
          {chartData.some(d => d.energy) && (
            <Line 
              type="monotone" 
              dataKey="energy" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
              strokeDasharray="5 5"
            />
          )}
          
          {chartData.some(d => d.anxiety) && (
            <Line 
              type="monotone" 
              dataKey="anxiety" 
              stroke="#f97316" 
              strokeWidth={2}
              dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
              strokeDasharray="5 5"
            />
          )}
          
          {chartData.some(d => d.sleep) && (
            <Line 
              type="monotone" 
              dataKey="sleep" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}