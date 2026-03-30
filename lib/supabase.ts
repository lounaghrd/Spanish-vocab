import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://ansrjcvtqalqlatbsdut.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OYfCLe3VI4SA00RGBbfW9A_7VWYKIfO';

/**
 * Returns the redirect URL for magic link emails.
 * Points to the web fallback page, which forwards the session tokens
 * to the native app via the spanishvocab:// deep link scheme.
 * If the app is not installed (e.g. desktop browser), the fallback page
 * shows a "This link has expired" screen with a resend option.
 */
export function getAuthRedirectUrl(): string {
  return 'https://espanolo-admin.vercel.app/auth-redirect';
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
