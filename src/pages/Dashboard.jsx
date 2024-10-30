// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUser } from '../context/UserContext';
import { getWorkoutHistory, getPersonalRecords } from '../db/workoutDB';

export function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [workoutData, setWorkoutData] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [personalRecords, setPersonalRecords] = useState({});
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    volumeTotal: 0
  });

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      // Charger l'historique des séances
      const history = await getWorkoutHistory(currentUser);
      setWorkoutData(history);

      // Charger les records personnels
      const records = await getPersonalRecords(currentUser);
      setPersonalRecords(records);

      // Calculer les statistiques globales
      calculateStats(history);

      // Définir l'exercice sélectionné par défaut
      if (Object.keys(records).length > 0 && !selectedExercise) {
        setSelectedExercise(Object.keys(records)[0]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const calculateStats = (workouts) => {
    let volumeTotal = 0;

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          volumeTotal += set.weight * set.reps;
        });
      });
    });

    setStats({
      totalWorkouts: workouts.length,
      volumeTotal
    });
  };

  const getProgressionData = (exerciseName) => {
    const data = [];
    workoutData.forEach(workout => {
      workout.exercises.forEach(exercise => {
        if (exercise.name === exerciseName) {
          const maxSet = exercise.sets.reduce((max, set) => 
            (set.weight > max.weight) ? set : max
          , { weight: 0 });

          if (maxSet.weight > 0) {
            data.push({
              date: workout.date,
              poids: maxSet.weight,
              reps: maxSet.reps
            });
          }
        }
      });
    });

    // Trier les données par date
    return data.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const formatRecordDisplay = (record) => {
    if (!record) return 'Pas de données';
    const repsStr = record.reps
      .sort((a, b) => b - a) // Trier par ordre décroissant
      .map(r => `${r} reps`)
      .join(', ');
    return `${record.weight}kg (${repsStr})`;
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
        <h1 className="text-2xl font-bold text-gray-100">Tableau de Bord</h1>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
          <h3 className="text-sm text-gray-400">Séances totales</h3>
          <p className="text-2xl font-bold text-primary">{stats.totalWorkouts}</p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
          <h3 className="text-sm text-gray-400">Volume total</h3>
          <p className="text-2xl font-bold text-primary">
            {Math.round(stats.volumeTotal).toLocaleString()} kg
          </p>
        </div>
      </div>

      {/* Records personnels */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Records Personnels</h2>
        <div className="bg-gray-800/50 rounded-xl backdrop-blur-sm border border-gray-700/50">
          {Object.entries(personalRecords).map(([exercise, record]) => (
            <div key={exercise} className="p-4 border-b border-gray-700/50 last:border-0">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">{exercise}</span>
                <span className="font-medium text-primary">
                  {formatRecordDisplay(record)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique de progression */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Progression</h2>
        <select
          className="w-full p-3 mb-4 rounded-lg bg-gray-700 text-gray-100 border-gray-600"
          value={selectedExercise}
          onChange={(e) => setSelectedExercise(e.target.value)}
        >
          {Object.keys(personalRecords).map(exercise => (
            <option key={exercise} value={exercise}>{exercise}</option>
          ))}
        </select>
        
        {selectedExercise && (
          <div className="bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-gray-700/50">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getProgressionData(selectedExercise)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => format(new Date(date), 'dd/MM', { locale: fr })}
                  stroke="#9CA3AF"
                />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    borderColor: '#374151',
                    borderRadius: '0.75rem'
                  }}
                  formatter={(value, name) => [
                    `${value} ${name === 'poids' ? 'kg' : 'reps'}`,
                    name === 'poids' ? 'Charge' : 'Répétitions'
                  ]}
                  labelFormatter={(date) => format(new Date(date), 'dd MMMM yyyy', { locale: fr })}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="poids"
                  name="Charge"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="reps"
                  name="Répétitions"
                  stroke="#34d399"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;