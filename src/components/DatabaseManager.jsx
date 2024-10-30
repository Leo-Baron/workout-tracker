import React, { useState } from 'react';
import { exportDatabase, importDatabase, resetDatabase, checkDatabase } from '../db/workoutDB';

export function DatabaseManager() {
  const [status, setStatus] = useState('');

  const handleExport = async () => {
    try {
      const data = await exportDatabase();
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gainzhub-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setStatus('Export réussi !');
    } catch (error) {
      setStatus('Erreur lors de l\'export: ' + error.message);
    }
  };

  const handleImport = async (event) => {
    try {
      const file = event.target.files[0];
      const text = await file.text();
      const data = JSON.parse(text);
      await importDatabase(data);
      setStatus('Import réussi !');
      window.location.reload();
    } catch (error) {
      setStatus('Erreur lors de l\'import: ' + error.message);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser la base de données ?')) {
      try {
        await resetDatabase();
        setStatus('Base de données réinitialisée');
        window.location.reload();
      } catch (error) {
        setStatus('Erreur lors de la réinitialisation: ' + error.message);
      }
    }
  };

  
  const handleCheck = async () => {
    const stats = await checkDatabase();
    setStatus(`Base de données: ${stats.workouts} séances, ${stats.exercises} exercices, ${stats.sets} séries`);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button 
        onClick={() => document.getElementById('dbManagerPanel').classList.toggle('hidden')}
        className="bg-gray-800 p-2 rounded-full shadow-lg"
      >
        ⚙️
      </button>
      
      <div id="dbManagerPanel" className="hidden absolute bottom-12 right-0 bg-gray-800 p-4 rounded-lg shadow-xl w-72">
        <div className="space-y-2">
          <button
            onClick={handleExport}
            className="w-full p-2 bg-blue-600 rounded"
          >
            Exporter les données
          </button>
          
          <label className="block">
            <span className="w-full p-2 bg-green-600 rounded block text-center cursor-pointer">
              Importer les données
            </span>
            <input
              type="file"
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
          </label>
          
          <button
            onClick={handleCheck}
            className="w-full p-2 bg-yellow-600 rounded"
          >
            Vérifier la base
          </button>
          
          <button
            onClick={handleReset}
            className="w-full p-2 bg-red-600 rounded"
          >
            Réinitialiser la base
          </button>
          
          {status && (
            <div className="mt-2 p-2 bg-gray-700 rounded text-sm">
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}