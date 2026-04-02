import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './store';
import Login from './pages/Login';
import Home from './pages/Home';
import MathApp from './pages/MathApp';
import SpellingApp from './pages/SpellingApp';
import { LogOut } from 'lucide-react';

const Header = () => {
  const { currentUser, logout } = useAppContext();
  
  if (!currentUser) return null;
  
  return (
    <header className="nav-header" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '2.5rem' }}>{currentUser.avatar}</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="title-font" style={{ fontSize: '1.2rem', margin: 0, lineHeight: 1.2 }}>{currentUser.name}</h2>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
            <span>Math (+{currentUser.mathLevels['+']} -{currentUser.mathLevels['-']} ×{currentUser.mathLevels['*']} ÷{currentUser.mathLevels['/']})</span>
            <span>•</span>
            <span>Spelling {currentUser.spellingLevel}</span>
          </div>
        </div>
      </div>
      <button onClick={logout} className="glass-panel" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <LogOut size={14} /> Quit
      </button>
    </header>
  );
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAppContext();
  if (!currentUser) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <Router>
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/math" element={<ProtectedRoute><MathApp /></ProtectedRoute>} />
          <Route path="/spelling" element={<ProtectedRoute><SpellingApp /></ProtectedRoute>} />
        </Routes>
      </main>
    </Router>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
