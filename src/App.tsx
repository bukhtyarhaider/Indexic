import React from 'react';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './pages/Dashboard';
import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';

// Loading spinner component
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      <p className="text-text-secondary text-sm">Loading...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const { isAuthenticated, isLoading, signOut } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    await signOut();
    showToast('Logged out successfully');
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <>
      <Dashboard onLogout={handleLogout} />
    </>
  );
};

export default App;
