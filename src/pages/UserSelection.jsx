// src/pages/UserSelection.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { PlusIcon } from '@heroicons/react/24/outline';
import gainzHubLogo from '../assets/GainzHub.png';

export function UserSelection() {
  const navigate = useNavigate();
  const { setCurrentUser } = useUser();
  const [isAdding, setIsAdding] = useState(false);
  const [newUser, setNewUser] = useState('');

  const handleSelectUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('lastUser', user);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="max-w-md mx-auto pt-20">
        {/* Remplacer le titre par le logo */}
        <div className="flex justify-center mb-10">
          <img 
            src={gainzHubLogo} 
            alt="GainzHub" 
            className="h-16 w-auto" // Ajustez la taille selon vos besoins
          />
        </div>

        {isAdding ? (
          <div className="space-y-4">
            <input
              type="text"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              placeholder="Ton nom"
              className="w-full p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-100"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsAdding(false)}
                className="p-4 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (newUser.trim()) handleSelectUser(newUser.trim());
                }}
                className="p-4 bg-primary rounded-xl text-white"
              >
                Confirmer
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-4 mb-6">
              {['Léo', 'Nathan'].map((user) => (
                <button
                  key={user}
                  onClick={() => handleSelectUser(user)}
                  className="p-6 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-xl font-medium text-gray-100"
                >
                  {user}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setIsAdding(true)}
              className="w-full p-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 text-gray-300 flex items-center justify-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Ajouter un utilisateur
            </button>
          </>
        )}
      </div>
    </div>
  );
}