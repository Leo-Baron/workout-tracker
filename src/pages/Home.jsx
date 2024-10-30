// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { PlusIcon, ChartBarIcon, ClockIcon, UserIcon, TrophyIcon } from '@heroicons/react/24/outline';
import gainzHubLogo from '../assets/GainzHub.png';

export function Home() {
  const navigate = useNavigate();
  const { currentUser } = useUser();
  
  return (
    <div className="p-4 min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="flex justify-between items-center mb-8">
        {/* Remplacer le titre par le logo */}
        <img 
          src={gainzHubLogo} 
          alt="GainzHub" 
          className="h-12 w-auto" // Ajustez la taille selon vos besoins
        />
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-300 hover:text-primary transition-colors"
        >
          <UserIcon className="h-6 w-6" />
          {currentUser}
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Nouvelle Séance */}
        <button 
        onClick={() => navigate('/workout/new')}
        className="w-full p-4 bg-primary rounded-xl text-white hover:bg-primary-dark 
                  transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
      >
        <PlusIcon className="h-5 w-5" />
        Séance du jour
      </button>
        
        {/* Dashboard */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-full p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 
                     hover:bg-gray-700/50 transition-all flex items-center justify-center gap-2"
        >
          <ChartBarIcon className="h-5 w-5" />
          Dashboard
        </button>

        {/* Historique */}
        <button 
          onClick={() => navigate('/history')}
          className="w-full p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 
                     hover:bg-gray-700/50 transition-all flex items-center justify-center gap-2"
        >
          <ClockIcon className="h-5 w-5" />
          Historique
        </button>

        {/* Biggest Boy */}
        <button 
          onClick={() => navigate('/biggest-boy')}
          className="w-full p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 
                     hover:bg-gray-700/50 transition-all flex items-center justify-center gap-2"
        >
          <TrophyIcon className="h-5 w-5" />
          Qui est le Biggest Boy ?
        </button>
      </div>
    </div>
  );
}

export default Home;