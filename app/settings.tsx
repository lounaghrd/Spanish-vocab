import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconArrowLeft, IconSettings, IconLogOut } from '../components/icons';
import {
  Colors,
  Spacing,
  FontFamily,
  FontSize,
  LineHeight,
} from '../constants/theme';
import { useAuth } from '../context/AuthContext';

const ARTICLE_URL =
  'https://fresh-belief-00a.notion.site/The-Spaced-Repetition-Method-32543af5ebf180b19268f5d5c3035a0c';

export default function SettingsScreen() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header: back arrow absolutely positioned, icon+title centered */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <IconArrowLeft size={22} color={Colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <IconSettings size={32} color={Colors.textPrimary} />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Content area: about section at top, logout at bottom */}
      <View style={styles.content}>
        {/* About the method */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About the method</Text>
          <View style={styles.aboutBody}>
            <Text style={styles.bodyText}>
              <Text style={styles.bodyTextBold}>Spaced Repetition</Text>
              {' is the optimal method to memorize vocabulary for good.'}
            </Text>
            <Text style={styles.bodyText}>
              This technique involves reviewing vocabulary at increasing intervals
              over time, and it has been proven to be the most efficient way to
              memorize vocabulary.
            </Text>
            <Text style={styles.bodyText}>
              {'To learn more, '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL(ARTICLE_URL)}
              >
                consult this article
              </Text>
              .
            </Text>
          </View>
        </View>

        {/* Spacer pushes logout to bottom */}
        <View style={styles.spacer} />

        {/* Log out button */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={logout}
        >
          <IconLogOut size={20} color={Colors.textPrimary} />
          <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.m,
    paddingBottom: Spacing.m,
    paddingHorizontal: Spacing.l,
    minHeight: 48,
  },
  backButton: {
    position: 'absolute',
    left: Spacing.l,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.m,
  },
  headerTitle: {
    fontFamily: FontFamily.playfairBold,
    fontSize: FontSize.heading4,
    color: Colors.textPrimary,
    letterSpacing: 1,
    lineHeight: LineHeight.heading4,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.textSecondary,
    marginHorizontal: Spacing.l,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.l,
    paddingBottom: Spacing.xl,
  },
  aboutSection: {
    gap: Spacing.m,
  },
  aboutTitle: {
    fontFamily: FontFamily.playfairBold,
    fontSize: FontSize.heading4,
    color: Colors.textPrimary,
    letterSpacing: 1,
    lineHeight: LineHeight.heading4,
  },
  aboutBody: {
    gap: Spacing.s,
  },
  bodyText: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.small,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  bodyTextBold: {
    fontFamily: FontFamily.loraMedium,
    fontWeight: '700',
    fontSize: FontSize.small,
    lineHeight: 18,
  },
  link: {
    textDecorationLine: 'underline',
  },
  spacer: {
    flex: 1,
  },
  logoutButton: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.outline,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.m,
  },
  logoutButtonPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  logoutButtonText: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.bodyLarge,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
});
