import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Linking from 'expo-linking';
import { useFonts } from 'expo-font';
import {
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';
import {
  Lora_400Regular,
  Lora_500Medium,
} from '@expo-google-fonts/lora';
import { initDatabase } from '../db/database';
import { Colors } from '../constants/theme';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { syncLibraryFromSupabase } from '../db/sync';
import { supabase } from '../lib/supabase';

// Keep the native splash screen visible while the app loads
SplashScreen.preventAutoHideAsync();

// Initialize the database synchronously before any screen renders.
// This is safe in React Native — native modules are ready before JS runs.
try {
  initDatabase();
  // seedDatabase() replaced by Supabase sync — word library now lives in Supabase.
} catch (e) {
  console.error('[DB] Setup error:', e);
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_700Bold,
    Lora_400Regular,
    Lora_500Medium,
  });

  // Sync word library from Supabase on every startup.
  // Max wait: 5 seconds — after that the app opens with cached local data.
  const [syncDone, setSyncDone] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSyncDone(true), 5000);
    syncLibraryFromSupabase()
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer);
        setSyncDone(true);
      });
    return () => clearTimeout(timer);
  }, []);

  // Handle deep links — extract Supabase auth tokens from magic link URLs
  useEffect(() => {
    function handleDeepLink(event: { url: string }) {
      const url = event.url;
      if (!url) return;

      // Extract tokens from hash fragment (e.g. #access_token=...&refresh_token=...)
      const hashPart = url.split('#')[1];
      if (!hashPart) return;

      const params = new URLSearchParams(hashPart);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        console.log('[Auth] Deep link received, setting session...');
        supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
    }

    // Listen for incoming deep links (app is already running)
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Also check if the app was opened via a deep link (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => subscription.remove();
  }, []);

  // Re-sync whenever the app comes back to the foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        supabase.auth.getSession(); // Force session refresh on foreground
        syncLibraryFromSupabase().catch(() => {});
      }
    });
    return () => subscription.remove();
  }, []);

  // Hide native splash only when fonts AND sync are both ready
  useEffect(() => {
    if ((fontsLoaded || fontError) && syncDone) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, syncDone]);

  // Still loading — keep native splash visible
  if ((!fontsLoaded && !fontError) || !syncDone) return null;

  return (
    <AuthProvider>
      <AuthenticatedLayout />
    </AuthProvider>
  );
}

/**
 * Separate component so it can call useAuth() inside the navigation context.
 * Watches auth state and redirects to /login or / accordingly.
 */
function AuthenticatedLayout() {
  const { userId, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    // Cast to string for comparison — expo-router generates route types dynamically
    // and may not include 'login' until after the first type generation run.
    const firstSegment = segments[0] as string;
    // Routes accessible without authentication
    const unauthenticatedRoutes = ['login', 'check-email', 'link-expired', 'open-app', 'auth'];
    const onUnauthenticatedRoute = unauthenticatedRoutes.includes(firstSegment);
    if (!userId && !onUnauthenticatedRoute) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace('/login' as any);
    } else if (userId && onUnauthenticatedRoute) {
      router.replace('/');
    }
  }, [userId, isLoading, segments]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="library" />
        <Stack.Screen name="category/[id]" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="login" options={{ animation: 'none' }} />
        <Stack.Screen name="check-email" options={{ animation: 'none' }} />
        <Stack.Screen name="link-expired" options={{ animation: 'none' }} />
        <Stack.Screen name="open-app" options={{ animation: 'none' }} />
        <Stack.Screen name="auth/callback" options={{ animation: 'none' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
