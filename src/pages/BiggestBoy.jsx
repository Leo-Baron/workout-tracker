import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  TrophyIcon,
  FireIcon,
  ScaleIcon,
  SparklesIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getPersonalRecords, getWorkoutHistory, getRecordsLast30Days } from '../db/workoutDB';

const COLORS = {
  Léo: '#6366f1',
  Nathan: '#f43f5e'
};

const MEDALS = {
  gold: '🥇',
  silver: '🥈',
};

const categoryTitles = {
  records: {
    icon: <TrophyIcon className="h-6 w-6" />,
    title: "Records sur 30 jours",
    subtitle: "Titan des Forces",
    description: "Les plus hauts sommets atteints ce mois-ci"
  },
  sessionFrequency: {
    icon: <FireIcon className="h-6 w-6" />,
    title: "Moyenne séances/semaine",
    subtitle: "Gardien du Temple des Fibres",
    description: "La constance des 30 derniers jours"
  },
  bestSessions: {
    icon: <SparklesIcon className="h-6 w-6" />,
    title: "Meilleure séance du mois",
    subtitle: "Élu des Charges Mystiques",
    description: "Le jour de gloire des 30 derniers jours"
  },
  totalWeight: {
    icon: <ScaleIcon className="h-6 w-6" />,
    title: "Total soulevé sur 30 jours",
    subtitle: "Perturbateur Gravitationnel",
    description: "La masse déplacée ce mois-ci"
  }
};

export function BiggestBoy() {
  const navigate = useNavigate();
  const [isRecordsVisible, setIsRecordsVisible] = useState(false);
  const [stats, setStats] = useState({
    records: {},
    sessionFrequency: {
      Léo: 0,
      Nathan: 0
    },
    bestSessions: {
      Léo: { volume: 0, date: null },
      Nathan: { volume: 0, date: null }
    },
    totalWeight: {
      Léo: 0,
      Nathan: 0
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const last30Days = subDays(new Date(), 30);
      
      // Charger les historiques des 30 derniers jours
      const [leoHistory, nathanHistory] = await Promise.all([
        getWorkoutHistory('Léo'),
        getWorkoutHistory('Nathan')
      ]);

      // Filtrer pour les 30 derniers jours
      const leoRecent = leoHistory.filter(w => new Date(w.date) >= last30Days);
      const nathanRecent = nathanHistory.filter(w => new Date(w.date) >= last30Days);

      // Charger les records des 30 derniers jours
      const [leoRecords, nathanRecords] = await Promise.all([
        getRecordsLast30Days('Léo'),
        getRecordsLast30Days('Nathan')
      ]);

      // Combiner les records
      const combinedRecords = {};
      const allExercises = new Set([
        ...Object.keys(leoRecords),
        ...Object.keys(nathanRecords)
      ]);

      allExercises.forEach(exercise => {
        combinedRecords[exercise] = {
          Léo: leoRecords[exercise] || null,
          Nathan: nathanRecords[exercise] || null
        };
      });

      // Calculer les statistiques sur les 30 derniers jours
      const leoStats = calculateUserStats(leoRecent);
      const nathanStats = calculateUserStats(nathanRecent);

      setStats({
        records: combinedRecords,
        sessionFrequency: {
          Léo: leoStats.frequency,
          Nathan: nathanStats.frequency
        },
        bestSessions: {
          Léo: leoStats.bestSession,
          Nathan: nathanStats.bestSession
        },
        totalWeight: {
          Léo: leoStats.totalWeight,
          Nathan: nathanStats.totalWeight
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };

  const calculateUserStats = (workouts) => {
    if (!Array.isArray(workouts)) {
      console.error('workouts is not an array:', workouts);
      return {
        frequency: 0,
        bestSession: { volume: 0, date: null },
        totalWeight: 0
      };
    }

    const frequency = (workouts.length / 30) * 7; // Moyenne par semaine sur 30 jours

    let totalWeight = 0;
    let bestSessionVolume = 0;
    let bestSessionDate = null;

    workouts.forEach(workout => {
      if (!workout.exercises) return;
      
      let sessionVolume = 0;
      workout.exercises.forEach(exercise => {
        if (!exercise.sets) return;
        
        exercise.sets.forEach(set => {
          if (!set.weight || !set.reps) return;
          
          const setVolume = set.weight * set.reps;
          sessionVolume += setVolume;
          totalWeight += setVolume;
        });
      });

      if (sessionVolume > bestSessionVolume) {
        bestSessionVolume = sessionVolume;
        bestSessionDate = workout.date;
      }
    });

    return {
      frequency,
      bestSession: {
        volume: bestSessionVolume,
        date: bestSessionDate
      },
      totalWeight: totalWeight / 1000 // Conversion en tonnes
    };
  };

  const determineWinner = (category) => {
    let values = {
      Léo: 0,
      Nathan: 0
    };

    if (category === 'bestSessions') {
      values = {
        Léo: stats[category].Léo.volume,
        Nathan: stats[category].Nathan.volume
      };
    } else {
      values = {
        Léo: stats[category].Léo,
        Nathan: stats[category].Nathan
      };
    }

    return Object.entries(values)
      .sort(([,a], [,b]) => b - a)
      .map(([name], index) => ({
        name,
        medal: index === 0 ? 'gold' : 'silver'
      }));
  };

  const getAchievementTitle = (category, value) => {
    switch(category) {
      case 'sessionFrequency':
        return `${value.toFixed(1)} séances/semaine`;
      case 'bestSessions':
        return `${Math.round(value.volume).toLocaleString()} kg`;
      case 'totalWeight':
        return `${value.toFixed(1)} tonnes`;
      default:
        return '0';
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
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <TrophyIcon className="h-8 w-8 text-yellow-500" />
          Qui est le Biggest Boy ?
        </h1>
      </div>

      <div className="space-y-6">
        {/* Section Records avec le même style que les autres catégories */}
        <div className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50">
          <button 
            onClick={() => setIsRecordsVisible(!isRecordsVisible)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <TrophyIcon className="h-6 w-6" />
              <div>
                <h2 className="text-lg font-bold text-primary">{categoryTitles.records.title}</h2>
                <p className="text-xs text-gray-400">{categoryTitles.records.subtitle}</p>
                <p className="text-xs text-gray-500">{categoryTitles.records.description}</p>
              </div>
            </div>
            <ChevronDownIcon 
              className={`h-5 w-5 transition-transform ${isRecordsVisible ? 'rotate-180' : ''}`}
            />
          </button>

          {isRecordsVisible && (
            <div className="mt-4 grid gap-3">
              {Object.entries(stats.records).map(([exercise, userRecords]) => (
                <div key={exercise} 
                     className="bg-gray-800/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50">
                  <h3 className="text-primary font-medium mb-3">{exercise}</h3>
                  <div className="grid gap-2">
                    {['Léo', 'Nathan'].map(user => {
                      const record = userRecords[user];
                      const maxWeight = Math.max(
                        userRecords.Léo?.weight || 0,
                        userRecords.Nathan?.weight || 0
                      );
                      
                      return (
                        <div 
                          key={user}
                          className={`flex justify-between items-center p-2 rounded-lg ${
                            record?.weight === maxWeight
                              ? 'bg-yellow-500/10 border border-yellow-500/20'
                              : 'bg-gray-700/50'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {record?.weight === maxWeight && (
                              <span className="text-xl">{MEDALS.gold}</span>
                            )}
                            <span style={{ color: COLORS[user] }}>{user}</span>
                          </span>
                          <span className="font-medium">
                            {record 
                              ? `${record.weight}kg (${record.reps[0]} reps)`
                              : '-'
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Autres catégories */}
        {Object.entries(categoryTitles)
          .filter(([key]) => key !== 'records')
          .map(([category, { icon, title, subtitle, description }]) => (
            <div key={category} className="bg-gray-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50">
              <div className="flex items-center gap-2 mb-4">
                {icon}
                <div>
                  <h2 className="text-lg font-bold text-primary">{title}</h2>
                  <p className="text-xs text-gray-400">{subtitle}</p>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              </div>

              <div className="grid gap-3">
                {determineWinner(category).map(({ name, medal }) => (
                  <div 
                    key={name}
                    className={`p-3 rounded-lg ${
                      medal === 'gold' 
                        ? 'bg-yellow-500/10 border border-yellow-500/20' 
                        : 'bg-gray-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{medal === 'gold' ? MEDALS.gold : MEDALS.silver}</span>
                        <span style={{ color: COLORS[name] }}>{name}</span>
                      </span>
                      <span className="font-bold">
                        {getAchievementTitle(category, stats[category][name])}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default BiggestBoy;