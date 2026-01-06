import React, { useState } from 'react';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { useToast } from './context/ToastContext';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showToast } = useToast();

  const handleLogout = () => {
    setIsAuthenticated(false);
    showToast('Logged out successfully');
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      <Dashboard onLogout={handleLogout} />
    </>
  );
};

export default App;
