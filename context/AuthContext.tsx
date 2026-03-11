import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { createUser, getUserByEmail, getUserById } from '../db/queries';

// ---------- CONSTANTS ----------

const SESSION_KEY = 'auth_user_id';

// ---------- TYPES ----------

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  userId: string | null;
  /** True while the app is restoring a persisted session from AsyncStorage on startup. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

// ---------- HELPERS ----------

async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

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

  // Restore persisted session on app start
  useEffect(() => {
    AsyncStorage.getItem(SESSION_KEY)
      .then((savedId) => {
        if (savedId) {
          // Verify the user still exists in the local DB before trusting the session
          const user = getUserById(savedId);
          setUserId(user ? savedId : null);
        }
      })
      .catch(() => {
        // AsyncStorage read failed — start unauthenticated
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string): Promise<AuthResult> {
    if (!email.trim()) return { success: false, error: 'Please enter your email address.' };
    if (!validateEmail(email)) return { success: false, error: 'Please enter a valid email address.' };
    if (!password) return { success: false, error: 'Please enter your password.' };

    const user = getUserByEmail(email);
    if (!user) return { success: false, error: 'No account found with this email address.' };

    const hash = await hashPassword(password);
    if (hash !== user.password_hash) return { success: false, error: 'Incorrect password.' };

    await AsyncStorage.setItem(SESSION_KEY, user.id);
    setUserId(user.id);
    return { success: true };
  }

  async function signup(email: string, password: string): Promise<AuthResult> {
    if (!email.trim()) return { success: false, error: 'Please enter your email address.' };
    if (!validateEmail(email)) return { success: false, error: 'Please enter a valid email address.' };

    const passwordError = validatePassword(password);
    if (passwordError) return { success: false, error: passwordError };

    const existing = getUserByEmail(email);
    if (existing) return { success: false, error: 'An account already exists with this email. Please log in.' };

    try {
      const hash = await hashPassword(password);
      const user = createUser(email, hash);
      await AsyncStorage.setItem(SESSION_KEY, user.id);
      setUserId(user.id);
      return { success: true };
    } catch {
      return { success: false, error: 'Failed to create account. Please try again.' };
    }
  }

  async function logout(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
    setUserId(null);
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
