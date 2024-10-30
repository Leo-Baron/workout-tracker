import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { SessionDay } from './pages/SessionDay';
import { History } from './pages/History';
import { UserSelection } from './pages/UserSelection';
import { Dashboard } from './pages/Dashboard';
import { BiggestBoy } from './pages/BiggestBoy';
import { UserProvider } from './context/UserContext';
import { DatabaseManager } from './components/DatabaseManager';

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserSelection />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/workout/new" element={<SessionDay />} />
          <Route path="/history" element={<History />} />
          <Route path="/biggest-boy" element={<BiggestBoy />} />
          <Route path="/DatabaseManager />" element={<DatabaseManager/>} />

          <Route path="*" element={<Navigate to="/" replace />} />
          
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;