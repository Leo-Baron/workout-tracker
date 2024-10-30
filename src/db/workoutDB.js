import Dexie from 'dexie';
import { subDays } from 'date-fns';

export const db = new Dexie('GainzHub');

db.version(2).stores({
    workouts: '++id, user, date, type, comment',
    exercises: '++id, workoutId, name, timestamp',
    sets: '++id, exerciseId, reps, weight',
    customExercises: '++id, type, name, user' // Nouvelle table
  }).upgrade(tx => {
    // Migration des données pour ajouter le champ commentaire
    return tx.workouts.toCollection().modify(workout => {
      if (!workout.comment) workout.comment = '';
    });
  });

// Fonction utilitaire pour réinitialiser la base
export const resetDatabase = async () => {
  await db.delete();
  await db.open();
};

// Fonction pour exporter les données
export const exportDatabase = async () => {
  const users = ['Léo', 'Nathan'];
  let allData = {};
  
  for (const user of users) {
    const workouts = await getWorkoutHistory(user);
    allData[user] = workouts;
  }
  
  return allData;
};

// Fonction pour importer les données
export const importDatabase = async (data) => {
  await db.transaction('rw', [db.workouts, db.exercises, db.sets], async () => {
    // Effacer les données existantes
    await db.workouts.clear();
    await db.exercises.clear();
    await db.sets.clear();
    
    // Importer les nouvelles données
    for (const user of Object.keys(data)) {
      for (const workout of data[user]) {
        const workoutId = await db.workouts.add({
          user: workout.user,
          date: workout.date,
          type: workout.type
        });
        
        for (const exercise of workout.exercises) {
          const exerciseId = await db.exercises.add({
            workoutId,
            name: exercise.name,
            timestamp: exercise.timestamp
          });
          
          for (const set of exercise.sets) {
            await db.sets.add({
              exerciseId,
              reps: set.reps,
              weight: set.weight
            });
          }
        }
      }
    }
  });
};

// Fonction pour vérifier l'état de la base
export const checkDatabase = async () => {
  const workouts = await db.workouts.count();
  const exercises = await db.exercises.count();
  const sets = await db.sets.count();
  
  return {
    workouts,
    exercises,
    sets,
    isEmpty: workouts === 0
  };
};

export const getTodayWorkout = async (user) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const workouts = await db.workouts
      .where('user')
      .equals(user)
      .filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= today && workoutDate < tomorrow;
      })
      .toArray();

    if (workouts.length === 0) return null;

    const workout = workouts[0];
    const exercises = await db.exercises
      .where('workoutId')
      .equals(workout.id)
      .toArray();

    const exercisesWithSets = await Promise.all(exercises.map(async (exercise) => {
      const sets = await db.sets
        .where('exerciseId')
        .equals(exercise.id)
        .toArray();
      return { ...exercise, sets };
    }));

    return { ...workout, exercises: exercisesWithSets };
  } catch (error) {
    console.error('Erreur lors de la récupération de la séance du jour:', error);
    return null;
  }
};

// Modification de la fonction existante pour inclure le commentaire
export const saveExercise = async (workoutData, exercise) => {
    try {
      console.log('Starting saveExercise:', { workoutData, exercise });
      
      let workout = await getTodayWorkout(workoutData.user);
      let workoutId;
  
      if (!workout) {
        workoutId = await db.workouts.add({
          user: workoutData.user,
          date: new Date(),
          type: workoutData.type,
          comment: workoutData.comment || ''
        });
        console.log('Created new workout:', workoutId);
      } else {
        workoutId = workout.id;
        // Mise à jour du type et du commentaire si nécessaire
        await db.workouts.update(workoutId, {
          type: workoutData.type,
          comment: workoutData.comment || workout.comment || ''
        });
        console.log('Updated existing workout:', workoutId);
      }
  
      const exerciseId = await db.exercises.add({
        workoutId,
        name: exercise.name,
        timestamp: new Date()
      });
  
      const setPromises = exercise.sets
        .filter(set => set.reps && set.weight)
        .map(set => 
          db.sets.add({
            exerciseId,
            reps: parseInt(set.reps),
            weight: parseFloat(set.weight)
          })
        );
  
      await Promise.all(setPromises);
      console.log('Saved all sets');
  
      return exerciseId;
    } catch (error) {
      console.error('Error in saveExercise:', error);
      throw error;
    }
  };
// Fonctions pour gérer les exercices personnalisés
export const addCustomExercise = async (user, type, name) => {
    await db.customExercises.add({ user, type, name });
  };
  
  export const getCustomExercises = async (user, type) => {
    return await db.customExercises
      .where({ user, type })
      .toArray();
  };
  
  export const deleteCustomExercise = async (id) => {
    await db.customExercises.delete(id);
  };
export const getWorkoutHistory = async (user) => {
  try {
    const workouts = await db.workouts
      .where('user')
      .equals(user)
      .reverse()
      .toArray();

    const fullWorkouts = await Promise.all(workouts.map(async (workout) => {
      const exercises = await db.exercises
        .where('workoutId')
        .equals(workout.id)
        .toArray();

      const exercisesWithSets = await Promise.all(exercises.map(async (exercise) => {
        const sets = await db.sets
          .where('exerciseId')
          .equals(exercise.id)
          .toArray();
        return { ...exercise, sets };
      }));

      return { ...workout, exercises: exercisesWithSets };
    }));

    return fullWorkouts;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
};

export const getRecordsLast30Days = async (user) => {
  try {
    const last30Days = subDays(new Date(), 30);
    
    // Récupérer uniquement les workouts des 30 derniers jours
    const workouts = await db.workouts
      .where('user')
      .equals(user)
      .filter(workout => new Date(workout.date) >= last30Days)
      .toArray();

    const workoutIds = workouts.map(w => w.id);
    const records = {};
    
    // Récupérer tous les exercices des 30 derniers jours
    const exercises = await db.exercises
      .where('workoutId')
      .anyOf(workoutIds)
      .toArray();

    for (const exercise of exercises) {
      const sets = await db.sets
        .where('exerciseId')
        .equals(exercise.id)
        .toArray();

      if (sets.length > 0) {
        const maxWeight = Math.max(...sets.map(s => s.weight));
        const setsWithMaxWeight = sets.filter(s => s.weight === maxWeight);
        
        if (!records[exercise.name] || maxWeight > records[exercise.name].weight) {
          records[exercise.name] = {
            weight: maxWeight,
            reps: setsWithMaxWeight.map(s => s.reps)
          };
        }
      }
    }

    return records;
  } catch (error) {
    console.error('Erreur lors de la récupération des records 30j:', error);
    return {};
  }
};
export const getPersonalRecords = async (user) => {
    try {
      const workouts = await db.workouts
        .where('user')
        .equals(user)
        .toArray();
  
      const workoutIds = workouts.map(w => w.id);
      const records = {};
      
      // Récupérer tous les exercices
      const exercises = await db.exercises
        .where('workoutId')
        .anyOf(workoutIds)
        .toArray();
  
      // Pour chaque exercice, trouver le record
      for (const exercise of exercises) {
        const sets = await db.sets
          .where('exerciseId')
          .equals(exercise.id)
          .toArray();
  
        if (sets.length > 0) {
          // Trouver la charge maximale
          const maxWeight = Math.max(...sets.map(s => s.weight));
          // Récupérer les répétitions associées à cette charge maximale
          const setsWithMaxWeight = sets.filter(s => s.weight === maxWeight);
          
          // Si c'est un nouveau record ou un record plus élevé
          if (!records[exercise.name] || maxWeight > records[exercise.name].weight) {
            records[exercise.name] = {
              weight: maxWeight,
              reps: setsWithMaxWeight.map(s => s.reps) // Garder toutes les répétitions avec ce poids
            };
          }
        }
      }
  
      return records;
    } catch (error) {
      console.error('Erreur lors de la récupération des records:', error);
      return {};
    }
  };
export default db;