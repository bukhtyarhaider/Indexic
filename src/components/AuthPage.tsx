import React, { useState } from 'react';
import logo from '../assets/logo.png';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full glass rounded-3xl  overflow-hidden relative z-10 border border-white/5">
        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 relative flex items-center justify-center group">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full group-hover:bg-primary/30 transition-all duration-500"></div>
              <div className="relative w-20 h-20 bg-surface-highlight border border-white/10 rounded-2xl flex items-center justify-center shadow-inner transform group-hover:scale-105 transition-transform duration-300 overflow-hidden p-3">
                <img src={logo} alt="PRONTX Logo" className="w-full h-full object-contain" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white tracking-tight mb-2">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-text-secondary text-sm">
              {isLogin ? 'Enter your credentials to access your workspace' : 'Join our community and start building today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 bg-surface/40 border border-white/10 text-text-main rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/30"
                  placeholder="John Doe"
                />
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-text-secondary ml-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 bg-surface/40 border border-white/10 text-text-main rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/30"
                placeholder="name@company.com"
              />
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary">Password</label>
              </div>
              <input 
                type="password" 
                required
                className="w-full px-4 py-3 bg-surface/40 border border-white/10 text-text-main rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all placeholder:text-text-secondary/30"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 mt-2 bg-primary text-white rounded-xl font-bold hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/25"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>{isLogin ? 'Sign In' : 'Get Started'}</span>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-text-secondary">
              {isLogin ? "New here? " : "Already a member? "}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold text-primary hover:text-white underline-offset-4 hover:underline transition-all"
              >
                {isLogin ? 'Create an account' : 'Sign in to your account'}
              </button>
            </p>
          </div>
        </div>
        
        <div className="bg-white/[0.02] p-5 border-t border-white/5 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-text-secondary/60 font-medium">
            &copy; {new Date().getFullYear()} PRONTX Indexic &bull; Secure Infrastructure
          </p>
        </div>
      </div>
    </div>
  );
};