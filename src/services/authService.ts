import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, AuthError } from '@supabase/supabase-js';

export interface AuthResult {
  user: User | null;
  error: AuthError | null;
}

// Create a custom error for missing configuration
const createConfigError = (): AuthError => ({
  message: 'Supabase is not configured. Please add your credentials to .env.local file.',
  status: 500,
  name: 'ConfigurationError',
} as AuthError);

/**
 * Sign up a new user with email and password
 */
export const signUp = async (
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> => {
  if (!isSupabaseConfigured) {
    return { user: null, error: createConfigError() };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return {
      user: data.user,
      error,
    };
  } catch (err) {
    console.error('SignUp error:', err);
    return {
      user: null,
      error: {
        message: 'Failed to connect to authentication service. Please try again.',
        status: 500,
        name: 'ConnectionError',
      } as AuthError,
    };
  }
};

/**
 * Sign in with email and password
 */
export const signIn = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  if (!isSupabaseConfigured) {
    return { user: null, error: createConfigError() };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      error,
    };
  } catch (err) {
    console.error('SignIn error:', err);
    return {
      user: null,
      error: {
        message: 'Failed to connect to authentication service. Please try again.',
        status: 500,
        name: 'ConnectionError',
      } as AuthError,
    };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    console.error('SignOut error:', err);
    return { error: null };
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  if (!isSupabaseConfigured) {
    return { error: createConfigError() };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  } catch (err) {
    console.error('ResetPassword error:', err);
    return {
      error: {
        message: 'Failed to send password reset email. Please try again.',
        status: 500,
        name: 'ConnectionError',
      } as AuthError,
    };
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error('GetCurrentUser error:', err);
    return null;
  }
};

/**
 * Get the current session
 */
export const getSession = async () => {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (err) {
    console.error('GetSession error:', err);
    return null;
  }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (
  callback: (user: User | null) => void
) => {
  if (!isSupabaseConfigured) {
    // Return a dummy subscription that does nothing
    return {
      unsubscribe: () => {},
    };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user ?? null);
    }
  );

  return subscription;
};

/**
 * Update user profile
 */
export const updateProfile = async (
  attributes: { data?: { full_name?: string } }
): Promise<{ user: User | null; error: AuthError | null }> => {
  if (!isSupabaseConfigured) {
    return { user: null, error: createConfigError() };
  }

  try {
    const { data, error } = await supabase.auth.updateUser(attributes);
    return { user: data.user, error };
  } catch (err) {
    console.error('UpdateProfile error:', err);
    return {
      user: null,
      error: {
        message: 'Failed to update profile. Please try again.',
        status: 500,
        name: 'ConnectionError',
      } as AuthError,
    };
  }
};

/**
 * Update user password
 */
export const updatePassword = async (
  password: string
): Promise<{ error: AuthError | null }> => {
  if (!isSupabaseConfigured) {
    return { error: createConfigError() };
  }

  try {
    const { error } = await supabase.auth.updateUser({ password });
    return { error };
  } catch (err) {
    console.error('UpdatePassword error:', err);
    return {
      error: {
        message: 'Failed to update password. Please try again.',
        status: 500,
        name: 'ConnectionError',
      } as AuthError,
    };
  }
};
