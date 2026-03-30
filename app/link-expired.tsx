import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  COLORS,
  SPACING,
  MESSAGES,
  SECONDARY_BUTTON,
  SCREEN,
  LOGO,
} from '../lib/ui-specs';

import LogoEspanolo from '../assets/logo-espanolo.svg';

export default function LinkExpiredScreen() {
  const { magicLinkEmail, sendMagicLink } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleResend() {
    if (magicLinkEmail) {
      setLoading(true);
      const result = await sendMagicLink(magicLinkEmail);
      setLoading(false);
      if (result.success) {
        router.replace('/check-email' as any);
      } else {
        router.replace('/login' as any);
      }
    } else {
      router.replace('/login' as any);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={styles.heading}>{MESSAGES.linkExpiredHeading}</Text>

          <Text style={styles.body}>
            If the problem persists, please{' '}
            <Text style={styles.link} onPress={() => {}}>
              contact support
            </Text>
            .
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.resendButton,
              pressed && styles.resendButtonPressed,
              loading && styles.resendButtonDisabled,
            ]}
            onPress={handleResend}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.textPrimary} />
            ) : (
              <Text style={styles.resendButtonText}>{MESSAGES.resendButton}</Text>
            )}
          </Pressable>
        </View>

        {/* Footer logo */}
        <LogoEspanolo width={LOGO.footer.width} height={LOGO.footer.height} />
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
    justifyContent: 'space-between',
    paddingHorizontal: SCREEN.padding.horizontal,
    paddingBottom: SPACING['2xl'],
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SCREEN.gaps.sectionGap,
  },
  heading: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  body: {
    fontFamily: 'Lora_400Regular',
    fontSize: 14,
    lineHeight: 18,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  link: {
    textDecorationLine: 'underline',
  },
  resendButton: {
    paddingVertical: SECONDARY_BUTTON.padding.top,
    paddingHorizontal: SECONDARY_BUTTON.padding.right,
    borderRadius: SECONDARY_BUTTON.borderRadius,
    borderWidth: SECONDARY_BUTTON.borderWidth,
    borderColor: SECONDARY_BUTTON.borderColor,
    backgroundColor: SECONDARY_BUTTON.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendButtonPressed: {
    backgroundColor: COLORS.backgroundHover,
  },
  resendButtonDisabled: {
    opacity: 0.7,
  },
  resendButtonText: {
    fontFamily: 'Lora_500Medium',
    fontSize: SECONDARY_BUTTON.fontSize,
    color: SECONDARY_BUTTON.color,
    lineHeight: 28,
  },
});
