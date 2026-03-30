import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';

const SUPABASE_URL = 'https://ansrjcvtqalqlatbsdut.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_OYfCLe3VI4SA00RGBbfW9A_7VWYKIfO';

/**
 * Returns the redirect URL for magic link deep links.
 * Called lazily (not at import time) so Expo runtime is ready.
 * In Expo Go: generates an exp:// URL.
 * In standalone builds: generates a spanishvocab:// URL.
 */
export function getAuthRedirectUrl(): string {
  return Linking.createURL('auth/callback');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
