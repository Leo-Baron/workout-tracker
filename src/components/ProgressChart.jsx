import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function ProgressChart({ data, exercise }) {
    // Transformer et trier les données par date
    const chartData = data
      .map(workout => {
        const exerciseData = workout.exercises.find(ex => ex.name === exercise);
        if (!exerciseData) return null;
  
        const maxWeight = Math.max(...exerciseData.sets.map(set => set.weight));
        const date = new Date(workout.date);
  
        return {
          date,
          formattedDate: format(date, 'd MMM', { locale: fr }),
          poids: maxWeight
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.date - b.date); // Tri croissant par date
  
    return (
      <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
        <h3 className="text-lg font-semibold mb-4">{exercise} - Progression</h3>
        <LineChart width={350} height={200} data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="formattedDate" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937',
              borderColor: '#374151',
              borderRadius: '0.75rem'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="poids" 
            stroke="#6366f1" 
            activeDot={{ r: 8 }}
            name="Charge (kg)"
          />
        </LineChart>
      </div>
    );
  }