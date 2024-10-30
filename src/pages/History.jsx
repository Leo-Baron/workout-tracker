// src/pages/History.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getWorkoutHistory } from '../db/workoutDB';
import { useUser } from '../context/UserContext';

export function History() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    loadWorkouts();
  }, [currentUser]);

  const loadWorkouts = async () => {
    const history = await getWorkoutHistory(currentUser);
    setWorkouts(history);
  };

  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/home')}
          className="mr-4 text-primary hover:text-primary-dark transition-colors"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-100">Historique</h1>
      </div>

      <div className="space-y-4">
        {workouts.map((workout) => (
          <div 
            key={workout.id} 
            className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50"
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-medium">
                {workout.type.toUpperCase()}
              </span>
              <span className="text-gray-400">
                {format(new Date(workout.date), 'dd MMMM yyyy', { locale: fr })}
              </span>
            </div>

            {workout.exercises.map((exercise) => (
              <div key={exercise.id} className="mb-3 last:mb-0">
                <h3 className="text-gray-300 mb-2">{exercise.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {exercise.sets.map((set, idx) => (
                    <div 
                      key={set.id} 
                      className="bg-gray-700/50 p-2 rounded-lg text-sm"
                    >
                      <span className="text-gray-400">Série {idx + 1}:</span>
                      {' '}
                      {set.reps} × {set.weight}kg
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}