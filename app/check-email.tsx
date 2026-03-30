import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  COLORS,
  SPACING,
  ILLUSTRATIONS,
  MESSAGES,
  SCREEN,
  SECONDARY_BUTTON,
} from '../lib/ui-specs';

import Envelope from '../assets/illustrations/envelope.svg';
import LogoEspanolo from '../assets/logo-espanolo.svg';
import { LOGO } from '../lib/ui-specs';

export default function CheckEmailScreen() {
  const { magicLinkEmail, clearMagicLinkState } = useAuth();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);

  function handleChangeEmail() {
    clearMagicLinkState();
    router.replace('/login' as any);
  }

  /**
   * DEV ONLY — Paste the magic link from clipboard and verify the token.
   * This is needed because Expo Go can't receive deep links from browsers.
   * Remove this before production.
   */
  async function handlePasteLink() {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (!clipboardText) {
        Alert.alert('Clipboard empty', 'Copy the magic link from your email first.');
        return;
      }

      // Extract the token from the Supabase verification URL
      const url = new URL(clipboardText);
      const token = url.searchParams.get('token');
      const type = url.searchParams.get('type');

      if (!token || type !== 'magiclink') {
        Alert.alert('Invalid link', 'The copied text is not a valid magic link.');
        return;
      }

      setVerifying(true);
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'magiclink',
      });
      setVerifying(false);

      if (error) {
        Alert.alert('Verification failed', error.message + '\n\nMake sure you copied the link WITHOUT clicking it first.');
      }
      // On success, onAuthStateChange in AuthContext sets userId → auth guard redirects to /
    } catch {
      setVerifying(false);
      Alert.alert('Invalid link', 'The copied text is not a valid URL.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {/* Logo */}
        <LogoEspanolo width={LOGO.app.width} height={LOGO.app.height} />

        {/* Main content */}
        <View style={styles.main}>
          <Envelope
            width={ILLUSTRATIONS.envelope.width}
            height={ILLUSTRATIONS.envelope.height}
          />

          <View style={styles.textGroup}>
            <Text style={styles.heading}>{MESSAGES.checkEmailHeading}</Text>

            {magicLinkEmail && (
              <Text style={styles.body}>
                We sent a sign-in link to{' '}
                <Text style={styles.bodyBold}>{magicLinkEmail}</Text>
              </Text>
            )}
          </View>

          <Pressable onPress={handleChangeEmail} hitSlop={8}>
            <Text style={styles.changeEmailLink}>
              {MESSAGES.changeEmailLink}
            </Text>
          </Pressable>

          {/* DEV ONLY — Paste magic link to verify token without deep linking */}
          {__DEV__ && (
            <Pressable
              style={({ pressed }) => [
                styles.pasteButton,
                pressed && styles.pasteButtonPressed,
                verifying && styles.pasteButtonDisabled,
              ]}
              onPress={handlePasteLink}
              disabled={verifying}
            >
              <Text style={styles.pasteButtonText}>
                {verifying ? 'Verifying...' : 'Paste magic link'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN.padding.horizontal,
    gap: SCREEN.gaps.contentToContent,
  },
  main: {
    alignItems: 'center',
    gap: SCREEN.gaps.sectionGap,
  },
  textGroup: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  heading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'Lora_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bodyBold: {
    fontFamily: 'Lora_500Medium',
    color: COLORS.textPrimary,
  },
  changeEmailLink: {
    fontFamily: 'Lora_500Medium',
    fontSize: 14,
    color: COLORS.accent,
    textDecorationLine: 'underline',
  },
  pasteButton: {
    paddingVertical: SECONDARY_BUTTON.padding.top,
    paddingHorizontal: SECONDARY_BUTTON.padding.right,
    borderRadius: SECONDARY_BUTTON.borderRadius,
    borderWidth: SECONDARY_BUTTON.borderWidth,
    borderColor: SECONDARY_BUTTON.borderColor,
    backgroundColor: SECONDARY_BUTTON.backgroundColor,
    marginTop: SPACING.md,
  },
  pasteButtonPressed: {
    backgroundColor: COLORS.backgroundHover,
  },
  pasteButtonDisabled: {
    opacity: 0.7,
  },
  pasteButtonText: {
    fontFamily: 'Lora_500Medium',
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
