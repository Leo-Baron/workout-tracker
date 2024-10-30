import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeftIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
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

      <div className="space-y-6">
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

            {/* Affichage du commentaire s'il existe */}
            {workout.comment && (
              <div className="mb-4 p-3 bg-gray-700/30 rounded-lg flex items-start gap-2">
                <ChatBubbleBottomCenterTextIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm">{workout.comment}</p>
              </div>
            )}

            {workout.exercises.map((exercise) => (
              <div key={exercise.id} className="mb-4 last:mb-0">
                <h3 className="text-gray-300 font-medium mb-2">{exercise.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {exercise.sets.map((set, idx) => (
                    <div 
                      key={set.id} 
                      className="bg-gray-700/50 p-2 rounded-lg text-sm flex justify-between items-center"
                    >
                      <span className="text-gray-400">Série {idx + 1}</span>
                      <span className="text-gray-200">
                        {set.reps} × {set.weight}kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Calculer et afficher le volume total de la séance */}
            <div className="mt-4 pt-3 border-t border-gray-700/50 flex justify-between items-center text-sm">
              <span className="text-gray-400">Volume total</span>
              <span className="text-primary font-medium">
                {workout.exercises.reduce((total, exercise) => 
                  total + exercise.sets.reduce((setTotal, set) => 
                    setTotal + (set.reps * set.weight), 0
                  ), 0
                ).toLocaleString()} kg
              </span>
            </div>
          </div>
        ))}
        
        {workouts.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            Aucune séance enregistrée
          </div>
        )}
      </div>
    </div>
  );
}

export default History;