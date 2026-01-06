import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import type { User } from "@supabase/supabase-js";
import * as authService from "../services/authService";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        const user = session?.user ?? null;

        // Only set authenticated if email is confirmed
        if (user && !user.email_confirmed_at) {
          console.log("User email not verified, signing out");
          await authService.signOut();
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const subscription = authService.onAuthStateChange(async (user) => {
      // Only set authenticated if email is confirmed
      if (user && !user.email_confirmed_at) {
        console.log("Auth state changed but email not verified");
        await authService.signOut();
        setUser(null);
      } else {
        setUser(user);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string
    ): Promise<string | null> => {
      setIsLoading(true);
      try {
        const { error } = await authService.signUp(email, password, fullName);
        if (error) {
          console.error("Sign up error:", error);
          return error.message || "Failed to create account. Please try again.";
        }
        // Don't set user - they need to verify email first
        // Return null indicates success, AuthPage will show verification message
        return null;
      } catch (error) {
        console.error("Unexpected sign up error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        return errorMessage;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      setIsLoading(true);
      try {
        const { user, error } = await authService.signIn(email, password);
        if (error) {
          console.error("Sign in error:", error);
          return (
            error.message || "Failed to sign in. Please check your credentials."
          );
        }

        // Check if email is confirmed
        if (user && !user.email_confirmed_at) {
          // Sign out the unverified user
          await authService.signOut();
          return "Please verify your email before signing in. Check your inbox for the confirmation link.";
        }

        setUser(user);
        return null;
      } catch (error) {
        console.error("Unexpected sign in error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        return errorMessage;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signOutFn = useCallback(async (): Promise<void> => {
    await authService.signOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(
    async (email: string): Promise<string | null> => {
      try {
        const { error } = await authService.resetPassword(email);
        if (error) {
          console.error("Reset password error:", error);
          return (
            error.message || "Failed to send reset email. Please try again."
          );
        }
        return null;
      } catch (error) {
        console.error("Unexpected reset password error:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "An unexpected error occurred";
        return errorMessage;
      }
    },
    []
  );

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut: signOutFn,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
