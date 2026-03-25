import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
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

  // Re-sync whenever the app comes back to the foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
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
    const onLoginScreen = firstSegment === 'login';
    if (!userId && !onLoginScreen) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace('/login' as any);
    } else if (userId && onLoginScreen) {
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
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
