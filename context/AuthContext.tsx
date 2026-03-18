import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

// ---------- TYPES ----------

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  userId: string | null;
  /** True while the app is restoring a persisted session on startup. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

// ---------- HELPERS ----------

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Returns an error message if the password doesn't meet the requirements, or null if it's valid.
 * Requirements: ≥8 chars, ≥1 digit, ≥1 special character.
 */
function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/\d/.test(password)) return 'Password must contain at least 1 digit.';
  if (!/[!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(password))
    return 'Password must contain at least 1 special character.';
  return null;
}

// ---------- CONTEXT ----------

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for auth state changes (handles session restore + login/logout)
  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setIsLoading(false);
    });

    // Subscribe to future changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string): Promise<AuthResult> {
    if (!email.trim()) return { success: false, error: 'Please enter your email address.' };
    if (!validateEmail(email)) return { success: false, error: 'Please enter a valid email address.' };
    if (!password) return { success: false, error: 'Please enter your password.' };

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      // Map Supabase error messages to user-friendly ones
      if (error.message === 'Invalid login credentials') {
        return { success: false, error: 'Incorrect email or password.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async function signup(email: string, password: string): Promise<AuthResult> {
    if (!email.trim()) return { success: false, error: 'Please enter your email address.' };
    if (!validateEmail(email)) return { success: false, error: 'Please enter a valid email address.' };

    const passwordError = validatePassword(password);
    if (passwordError) return { success: false, error: passwordError };

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      if (error.message === 'User already registered') {
        return { success: false, error: 'An account already exists with this email. Please log in.' };
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ userId, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
