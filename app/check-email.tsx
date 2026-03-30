import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  COLORS,
  ILLUSTRATIONS,
  MESSAGES,
  SCREEN,
  LOGO,
} from '../lib/ui-specs';

import Envelope from '../assets/illustrations/envelope.svg';
import LogoEspanolo from '../assets/logo-espanolo.svg';

export default function CheckEmailScreen() {
  const { magicLinkEmail, clearMagicLinkState } = useAuth();
  const router = useRouter();

  function handleChangeEmail() {
    clearMagicLinkState();
    router.replace('/login' as any);
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
});
