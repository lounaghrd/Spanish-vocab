import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getAuthRedirectUrl } from '../lib/supabase';

// ---------- TYPES ----------

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  userId: string | null;
  /** True while the app is restoring a persisted session on startup. */
  isLoading: boolean;
  /** Send a magic link to the given email address. */
  sendMagicLink: (email: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  /** The email address the magic link was sent to (for check-email screen). */
  magicLinkEmail: string | null;
  /** Timestamp of last magic link send (for 30s cooldown). */
  lastEmailSentAt: number | null;
  /** Reset magic link state (for "Change email address" flow). */
  clearMagicLinkState: () => void;
}

// ---------- HELPERS ----------

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const COOLDOWN_MS = 30_000;

// ---------- CONTEXT ----------

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [magicLinkEmail, setMagicLinkEmail] = useState<string | null>(null);
  const [lastEmailSentAt, setLastEmailSentAt] = useState<number | null>(null);

  // Listen for auth state changes (handles session restore + login/logout)
  useEffect(() => {
    // Get the initial session — handle stale/invalid refresh tokens gracefully
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        // Token is expired or not found — clear it so the user gets sent to login
        supabase.auth.signOut();
        setUserId(null);
      } else {
        setUserId(session?.user?.id ?? null);
      }
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

  async function sendMagicLink(email: string): Promise<AuthResult> {
    const trimmed = email.trim().toLowerCase();

    if (!trimmed) return { success: false, error: 'Please enter your email address.' };
    if (!validateEmail(trimmed)) return { success: false, error: 'Enter a valid email address.' };

    // 30-second cooldown between sends
    if (lastEmailSentAt && Date.now() - lastEmailSentAt < COOLDOWN_MS) {
      return {
        success: false,
        error: 'We have already sent an email to this address. Try again in 30 seconds.',
      };
    }

    const redirectUrl = getAuthRedirectUrl();

    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: redirectUrl },
    });

    if (error) {
      // Replace Supabase's raw rate-limit message with our own copy
      const secondsMatch = error.message.match(/after (\d+) seconds/);
      if (secondsMatch) {
        const seconds = secondsMatch[1];
        return {
          success: false,
          error: `We have already sent an email to this address. Try again in ${seconds} seconds.`,
        };
      }
      return { success: false, error: error.message };
    }

    setMagicLinkEmail(trimmed);
    setLastEmailSentAt(Date.now());
    return { success: true };
  }

  function clearMagicLinkState() {
    setMagicLinkEmail(null);
    setLastEmailSentAt(null);
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        userId,
        isLoading,
        sendMagicLink,
        logout,
        magicLinkEmail,
        lastEmailSentAt,
        clearMagicLinkState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
