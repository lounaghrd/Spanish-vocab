'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ansrjcvtqalqlatbsdut.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OYfCLe3VI4SA00RGBbfW9A_7VWYKIfO';
const REDIRECT_URL = 'https://espanolo-admin.vercel.app/auth-redirect';
const APP_SCHEME = 'spanishvocab://auth/callback';

type State = 'redirecting' | 'expired' | 'resend-form' | 'sent';

// ─── Shared style tokens ───────────────────────────────────────────────────

const COLORS = {
  background: '#F1E1D6',
  textPrimary: '#191919',
  textSecondary: '#655F58',
  outline: '#262626',
  error: '#D4183D',
};

const heading: React.CSSProperties = {
  fontFamily: 'var(--font-playfair), "Playfair Display", serif',
  fontWeight: 700,
  fontSize: '24px',
  lineHeight: '30px',
  letterSpacing: '1px',
  color: COLORS.textPrimary,
  textAlign: 'center',
  margin: 0,
};

const bodySmall: React.CSSProperties = {
  fontFamily: 'var(--font-lora), Lora, serif',
  fontWeight: 400,
  fontSize: '14px',
  lineHeight: '18px',
  color: COLORS.textPrimary,
  textAlign: 'center',
  maxWidth: '330px',
  margin: 0,
};

const secondaryButton: React.CSSProperties = {
  fontFamily: 'var(--font-lora), Lora, serif',
  fontWeight: 600,
  fontSize: '18px',
  lineHeight: '28px',
  color: COLORS.textPrimary,
  backgroundColor: COLORS.background,
  border: `2px solid ${COLORS.outline}`,
  borderRadius: '5px',
  padding: '8px 24px',
  cursor: 'pointer',
  display: 'inline-block',
};

const textInput: React.CSSProperties = {
  fontFamily: 'var(--font-lora), Lora, serif',
  fontWeight: 400,
  fontSize: '16px',
  lineHeight: '24px',
  color: COLORS.textPrimary,
  backgroundColor: COLORS.background,
  border: `2px solid ${COLORS.outline}`,
  borderRadius: '5px',
  padding: '12px 16px',
  width: '100%',
  maxWidth: '330px',
  outline: 'none',
  boxSizing: 'border-box' as const,
};

// ─── Page component ────────────────────────────────────────────────────────

export default function AuthRedirectPage() {
  const [state, setState] = useState<State>('redirecting');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    const hash = window.location.hash;

    if (hash && hash.includes('access_token')) {
      // Forward the session tokens to the native app
      window.location.href = `${APP_SCHEME}${hash}`;
      // After 2.5s, if the user is still here the app didn't open — show fallback
      const timer = setTimeout(() => setState('expired'), 2500);
      return () => clearTimeout(timer);
    }

    // No valid token in URL — show expired screen immediately
    setState('expired');
  }, []);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setSending(true);
    setSendError('');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { error } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: REDIRECT_URL },
    });
    setSending(false);
    if (error) {
      setSendError(
        error.message.match(/after (\d+) seconds/)
          ? `We have already sent an email to this address. Try again in ${error.message.match(/after (\d+) seconds/)![1]} seconds.`
          : error.message
      );
    } else {
      setState('sent');
    }
  }

  // ─── Redirecting (blank beige screen while app tries to open) ─────────────
  if (state === 'redirecting') {
    return <div style={{ width: '100%', height: '100%', backgroundColor: COLORS.background }} />;
  }

  // ─── Sent confirmation ────────────────────────────────────────────────────
  if (state === 'sent') {
    return (
      <div style={pageContainer}>
        <div style={centerContent}>
          <div style={textGroup}>
            <h1 style={heading}>Check your email</h1>
            <p style={bodySmall}>We sent a new sign-in link. Open it on your phone to sign in.</p>
          </div>
        </div>
        <Logo />
      </div>
    );
  }

  // ─── Expired + optional resend form ───────────────────────────────────────
  return (
    <div style={pageContainer}>
      <div style={centerContent}>
        {/* Text group: heading + body */}
        <div style={textGroup}>
          <h1 style={heading}>This link has expired</h1>
          <p style={bodySmall}>If the problem persists, please contact support.</p>
        </div>

        {/* Resend link button */}
        {state === 'expired' && (
          <button style={secondaryButton} onClick={() => setState('resend-form')}>
            Resend link
          </button>
        )}

        {/* Email form */}
        {state === 'resend-form' && (
          <form
            onSubmit={handleResend}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}
          >
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSendError(''); }}
              style={textInput}
              autoFocus
              required
            />
            {sendError && (
              <p style={{ ...bodySmall, color: COLORS.error, maxWidth: '330px' }}>{sendError}</p>
            )}
            <button type="submit" style={secondaryButton} disabled={sending}>
              {sending ? 'Sending…' : 'Send new link'}
            </button>
          </form>
        )}
      </div>

      <Logo />
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ position: 'absolute', bottom: '64px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
      <img src="/logo-espanolo.svg" alt="Españolo" width={130} height={28} />
    </div>
  );
}

// ─── Layout helpers ────────────────────────────────────────────────────────

const pageContainer: React.CSSProperties = {
  width: '100%',
  height: '100%',
  backgroundColor: COLORS.background,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 24px',
  position: 'relative',
  boxSizing: 'border-box',
};

const centerContent: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '48px',
  paddingBottom: '48px',
};

const textGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '16px',
  width: '100%',
};
