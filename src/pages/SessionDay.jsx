import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, ArrowLeftIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useUser } from '../context/UserContext';
import { saveExercise, getTodayWorkout } from '../db/workoutDB';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function SessionDay() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [workoutType, setWorkoutType] = useState('push');
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    sets: [{
      reps: '',
      weight: ''
    }]
  });
  const [todayWorkout, setTodayWorkout] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const exercisesList = {
    push: ['Développé couché', 'Développé incliné', 'Développé épaules', 'Extensions triceps'],
    pull: ['Tractions', 'Rowing', 'Curl biceps', 'Soulevé de terre']
  };

  useEffect(() => {
    loadTodayWorkout();
  }, [currentUser]);

  const loadTodayWorkout = async () => {
    const workout = await getTodayWorkout(currentUser);
    setTodayWorkout(workout);
    if (workout) {
      setWorkoutType(workout.type);
    }
  };

  const handleSaveExercise = async () => {
    if (!currentExercise.name || currentExercise.sets.length === 0) return;

    // Valider que tous les sets ont des valeurs
    const isValidExercise = currentExercise.sets.every(set => 
      set.reps && set.reps > 0 && set.weight && set.weight > 0
    );

    if (!isValidExercise) {
      alert('Veuillez remplir toutes les répétitions et charges');
      return;
    }

    try {
      setIsSaving(true);
      
      console.log('Saving exercise:', {
        user: currentUser,
        type: workoutType,
        exercise: currentExercise
      });

      await saveExercise({
        user: currentUser,
        type: workoutType
      }, currentExercise);

      // Force un petit délai pour être sûr que la sauvegarde est terminée
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Recharger la séance du jour
      await loadTodayWorkout();

      // Réinitialiser le formulaire
      setCurrentExercise({
        name: '',
        sets: [{
          reps: '',
          weight: ''
        }]
      });

      // Notification de succès
      alert('Mis MUSCLES are getting bigga! 💪');

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'exercice');
    } finally {
      setIsSaving(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-100">Séance du jour</h1>
      </div>

      <div className="mb-6 text-center text-gray-400">
        {format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {['push', 'pull'].map(type => (
          <button
            key={type}
            onClick={() => setWorkoutType(type)}
            disabled={todayWorkout && todayWorkout.type !== type}
            className={`p-4 rounded-xl backdrop-blur-sm transition-all ${
              workoutType === type 
                ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            } ${todayWorkout && todayWorkout.type !== type ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Séance en cours avec nouveau design */}
      {todayWorkout && todayWorkout.exercises && todayWorkout.exercises.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">Séance en cours</h2>
            <span className="text-sm text-gray-400">
              {todayWorkout.type.toUpperCase()}
            </span>
          </div>
          
          <div className="relative">
            {/* Ligne verticale de progression */}
            <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gray-700" />
            
            <div className="space-y-6">
              {todayWorkout.exercises.map((exercise, idx) => (
                <div 
                  key={idx} 
                  className="relative pl-8"
                >
                  {/* Point sur la ligne de progression */}
                  <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-gray-800 border-2 border-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{idx + 1}</span>
                  </div>
                  
                  {/* Carte de l'exercice */}
                  <div className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 
                                shadow-lg shadow-black/20">
                    <h3 className="text-lg font-semibold text-primary mb-3">{exercise.name}</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {exercise.sets.map((set, setIdx) => (
                        <div 
                          key={setIdx}
                          className="bg-gray-900/50 p-2 rounded-lg flex items-center justify-between"
                        >
                          <span className="text-gray-500 text-sm">Série {setIdx + 1}</span>
                          <span className="text-gray-300">
                            <span className="text-primary font-medium">{set.reps}</span> × {set.weight}kg
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formulaire nouvel exercice */}
      <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50 mb-6">
        <select 
          className="w-full p-3 mb-3 rounded-lg bg-gray-700 text-gray-100 border-gray-600"
          value={currentExercise.name}
          onChange={(e) => setCurrentExercise({
            ...currentExercise,
            name: e.target.value
          })}
        >
          <option value="">Choisir un exercice</option>
          {exercisesList[workoutType].map(ex => (
            <option key={ex} value={ex}>{ex}</option>
          ))}
        </select>

        <div className="space-y-2">
          {currentExercise.sets.map((set, setIndex) => (
            <div key={setIndex} className="grid grid-cols-3 gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Reps"
                className="p-3 rounded-lg bg-gray-700 border-gray-600"
                value={set.reps}
                onChange={(e) => {
                  const newSets = [...currentExercise.sets];
                  newSets[setIndex].reps = e.target.value;
                  setCurrentExercise({...currentExercise, sets: newSets});
                }}
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="Kg"
                className="p-3 rounded-lg bg-gray-700 border-gray-600"
                value={set.weight}
                onChange={(e) => {
                  const newSets = [...currentExercise.sets];
                  newSets[setIndex].weight = e.target.value;
                  setCurrentExercise({...currentExercise, sets: newSets});
                }}
              />
              <button 
                className="text-red-400 hover:text-red-300 transition-colors"
                onClick={() => {
                  const newSets = [...currentExercise.sets];
                  newSets.splice(setIndex, 1);
                  setCurrentExercise({...currentExercise, sets: newSets});
                }}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          ))}
        </div>

        <button
          className="w-full p-3 mt-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors 
                     flex items-center justify-center gap-2"
          onClick={() => {
            const newSets = [...currentExercise.sets, { reps: '', weight: '' }];
            setCurrentExercise({...currentExercise, sets: newSets});
          }}
        >
          <PlusIcon className="h-5 w-5" />
          Ajouter une série
        </button>
      </div>

      <button
        onClick={handleSaveExercise}
        disabled={!currentExercise.name || currentExercise.sets.length === 0 || isSaving}
        className="w-full p-4 bg-primary rounded-xl text-white hover:bg-primary-dark 
                   transition-all shadow-lg shadow-primary/25 disabled:opacity-50
                   flex items-center justify-center gap-2"
      >
        {isSaving ? (
          'Sauvegarde...'
        ) : (
          <>
            <CheckIcon className="h-5 w-5" />
            Valider l'exercice
          </>
        )}
      </button>
    </div>
  );
}

export default SessionDay;