import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../lib/supabase';
import { COLORS } from '../../lib/ui-specs';

/**
 * Handles the magic link deep link redirect.
 * When the user clicks the magic link in their email, they are redirected here.
 * Supabase extracts the session from the URL, and the auth guard in _layout.tsx
 * redirects to home once userId is set.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Get the URL that opened this screen (handles both cold + warm start)
        const url = await Linking.getInitialURL();

        if (url) {
          // Extract hash fragment tokens from the URL and set session
          const params = new URLSearchParams(url.split('#')[1] ?? '');
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            // onAuthStateChange in AuthContext will set userId → auth guard redirects to /
            return;
          }
        }

        // If we couldn't extract tokens, check if Supabase already picked up the session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Session exists — auth guard will handle redirect
          return;
        }

        // No session — link may be expired or invalid
        router.replace('/link-expired' as any);
      } catch {
        router.replace('/link-expired' as any);
      }
    }

    handleCallback();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
