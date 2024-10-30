import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, ArrowLeftIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useUser } from '../context/UserContext';
import { saveExercise, getTodayWorkout, getCustomExercises, addCustomExercise } from '../db/workoutDB';
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
  const [comment, setComment] = useState('');
  const [customExercises, setCustomExercises] = useState({ push: [], pull: [] });
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');

  const defaultExercises = {
    push: ['Développé couché', 'Développé incliné', 'Développé épaules', 'Extensions triceps'],
    pull: ['Tractions', 'Rowing', 'Curl biceps', 'Soulevé de terre']
  };

  useEffect(() => {
    loadTodayWorkout();
    loadCustomExercises();
  }, [currentUser]);

  const loadCustomExercises = async () => {
    const pushExercises = await getCustomExercises(currentUser, 'push');
    const pullExercises = await getCustomExercises(currentUser, 'pull');
    setCustomExercises({
      push: pushExercises.map(e => e.name),
      pull: pullExercises.map(e => e.name)
    });
  };

  const loadTodayWorkout = async () => {
    const workout = await getTodayWorkout(currentUser);
    setTodayWorkout(workout);
    if (workout) {
      setWorkoutType(workout.type);
      setComment(workout.comment || '');
    }
  };

  const handleAddCustomExercise = async () => {
    if (newExerciseName.trim()) {
      await addCustomExercise(currentUser, workoutType, newExerciseName.trim());
      await loadCustomExercises();
      setNewExerciseName('');
      setShowAddExercise(false);
    }
  };

  const handleSaveExercise = async () => {
    if (!currentExercise.name || currentExercise.sets.length === 0) return;

    const isValidExercise = currentExercise.sets.every(set => 
      set.reps && set.reps > 0 && set.weight && set.weight > 0
    );

    if (!isValidExercise) {
      alert('Veuillez remplir toutes les répétitions et charges');
      return;
    }

    try {
      setIsSaving(true);
      
      await saveExercise({
        user: currentUser,
        type: workoutType,
        comment: comment
      }, currentExercise);

      await loadTodayWorkout();

      setCurrentExercise({
        name: '',
        sets: [{
          reps: '',
          weight: ''
        }]
      });

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde de l\'exercice');
    } finally {
      setIsSaving(false);
    }
  };

  const allExercises = {
    push: [...defaultExercises.push, ...customExercises.push],
    pull: [...defaultExercises.pull, ...customExercises.pull]
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

      {/* Type de séance */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {['push', 'pull'].map(type => (
          <button
            key={type}
            onClick={() => setWorkoutType(type)}
            className={`p-4 rounded-xl backdrop-blur-sm transition-all ${
              workoutType === type 
                ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Commentaire de séance */}
      <div className="mb-6">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Commentaire de séance (optionnel)"
          className="w-full p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-100 placeholder-gray-500"
          rows="2"
        />
      </div>

      {/* Séance en cours */}
      {todayWorkout && todayWorkout.exercises && todayWorkout.exercises.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-gray-300">Séance en cours</h2>
          <div className="bg-gray-800/30 rounded-xl p-4 space-y-4">
            {todayWorkout.exercises.map((exercise, idx) => (
              <div key={idx} className="bg-gray-800/50 p-3 rounded-lg">
                <h3 className="font-medium text-primary mb-2">{exercise.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {exercise.sets.map((set, setIdx) => (
                    <div key={setIdx} className="text-sm text-gray-400">
                      {set.reps} reps × {set.weight}kg
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nouvel exercice */}
      <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50 mb-6">
        <div className="flex justify-between items-center mb-3">
          <select 
            className="flex-1 p-3 rounded-lg bg-gray-700 text-gray-100 border-gray-600 mr-2"
            value={currentExercise.name}
            onChange={(e) => setCurrentExercise({
              ...currentExercise,
              name: e.target.value
            })}
          >
            <option value="">Choisir un exercice</option>
            {allExercises[workoutType].map(ex => (
              <option key={ex} value={ex}>{ex}</option>
            ))}
          </select>
          
          <button
            onClick={() => setShowAddExercise(true)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
          </button>
        </div>

        {showAddExercise && (
          <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
            <input
              type="text"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="Nom du nouvel exercice"
              className="w-full p-2 mb-2 rounded bg-gray-600 text-gray-100"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddCustomExercise}
                className="flex-1 p-2 bg-primary rounded text-white"
              >
                Ajouter
              </button>
              <button
                onClick={() => {
                  setShowAddExercise(false);
                  setNewExerciseName('');
                }}
                className="p-2 bg-gray-600 rounded text-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

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