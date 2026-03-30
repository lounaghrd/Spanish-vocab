import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  COLORS,
  SPACING,
  MESSAGES,
  SECONDARY_BUTTON,
  SCREEN,
  LOGO,
} from '../lib/ui-specs';

import LogoEspanolo from '../assets/logo-espanolo.svg';

/**
 * Fallback screen shown when the magic link opens in a browser
 * instead of directly in the app. The user taps "Open your app"
 * to deep link into the app.
 */
export default function OpenAppScreen() {
  function handleOpenApp() {
    // Deep link into the app using the custom scheme
    Linking.openURL('spanishvocab://');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {/* Center content */}
        <View style={styles.centerContent}>
          <Text style={styles.heading}>{MESSAGES.linkNotOpenedHeading}</Text>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleOpenApp}
          >
            <Text style={styles.buttonText}>{MESSAGES.openAppButton}</Text>
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
  button: {
    paddingVertical: SECONDARY_BUTTON.padding.top,
    paddingHorizontal: SECONDARY_BUTTON.padding.right,
    borderRadius: SECONDARY_BUTTON.borderRadius,
    borderWidth: SECONDARY_BUTTON.borderWidth,
    borderColor: SECONDARY_BUTTON.borderColor,
    backgroundColor: SECONDARY_BUTTON.backgroundColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: COLORS.backgroundHover,
  },
  buttonText: {
    fontFamily: 'Lora_500Medium',
    fontSize: SECONDARY_BUTTON.fontSize,
    color: SECONDARY_BUTTON.color,
    lineHeight: 28,
  },
});
