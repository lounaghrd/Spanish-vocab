import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  COLORS,
  ILLUSTRATIONS,
  MESSAGES,
  SCREEN,
  SECONDARY_BUTTON,
  LOGO,
} from '../lib/ui-specs';

import Envelope from '../assets/illustrations/envelope.svg';
import LogoEspanolo from '../assets/logo-espanolo.svg';

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
      {/* Body: fills remaining space, centers content vertically, gap 48px */}
      <View style={styles.body}>
        {/* Center content: heading + inner frame, gap 32px, padding-bottom 48px */}
        <View style={styles.centerContent}>
          <Text style={styles.heading}>{MESSAGES.checkEmailHeading}</Text>

          {/* Inner frame: text block + envelope + change email, gap 24px */}
          <View style={styles.frame}>
            {/* Text block: two lines stacked, centered */}
            <View style={styles.textBlock}>
              <Text style={styles.smallText}>Click the link we sent to</Text>
              {magicLinkEmail && (
                <Text style={styles.emailText}>{magicLinkEmail}</Text>
              )}
            </View>

            <Envelope
              width={ILLUSTRATIONS.envelope.width}
              height={ILLUSTRATIONS.envelope.height}
            />

            <Pressable onPress={handleChangeEmail} hitSlop={8}>
              <Text style={styles.changeEmailLink}>
                {MESSAGES.changeEmailLink}
              </Text>
            </Pressable>
          </View>
        </View>

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

      {/* Logo — absolute, bottom-centered, footer size (130×28) */}
      <View style={styles.logoContainer} pointerEvents="none">
        <LogoEspanolo width={LOGO.footer.width} height={LOGO.footer.height} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SCREEN.padding.horizontal,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 48,
  },
  centerContent: {
    alignItems: 'center',
    gap: 32,
    paddingBottom: 48,
  },
  heading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 1,
    color: COLORS.textPrimary,
    textAlign: 'center',
    width: 330,
  },
  frame: {
    alignItems: 'center',
    gap: 24,
  },
  textBlock: {
    alignItems: 'center',
    width: 330,
  },
  smallText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  emailText: {
    fontFamily: 'Lora_500Medium',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.2,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  changeEmailLink: {
    fontFamily: 'Lora_500Medium',
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0.2,
    color: COLORS.textPrimary,
    textDecorationLine: 'underline',
    textAlign: 'center',
    width: 330,
  },
  logoContainer: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pasteButton: {
    paddingVertical: SECONDARY_BUTTON.padding.top,
    paddingHorizontal: SECONDARY_BUTTON.padding.right,
    borderRadius: SECONDARY_BUTTON.borderRadius,
    borderWidth: SECONDARY_BUTTON.borderWidth,
    borderColor: SECONDARY_BUTTON.borderColor,
    backgroundColor: SECONDARY_BUTTON.backgroundColor,
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
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});
