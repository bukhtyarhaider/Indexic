import React from "react";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";

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
  const { isAuthenticated, isLoading, signOut, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      showSuccess("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      showError("Failed to log out. Please try again.");
    }
  };

  // Show loading screen while checking auth
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show auth page if not authenticated
  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  // Show dashboard for authenticated users
  return <Dashboard onLogout={handleLogout} />;
};

export default App;
