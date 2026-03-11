import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { IconPlus, IconLogOut } from '../components/icons';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';
import { WordCard } from '../components/WordCard';
import { WordModal } from '../components/WordModal';
import {
  getMyWords,
  reviewUserWord,
  isWordDueForReview,
  type UserWordWithWord,
} from '../db/queries';
import { useAuth } from '../context/AuthContext';

import LogoEspanolo from '../assets/logo-espanolo.svg';

export default function MyWordsScreen() {
  const router = useRouter();
  const { userId, logout } = useAuth();
  const [words, setWords] = useState<UserWordWithWord[]>([]);
  const [selectedWord, setSelectedWord] = useState<UserWordWithWord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadWords = useCallback(() => {
    if (!userId) return;
    const data = getMyWords(userId);
    setWords(data);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadWords();
    }, [loadWords])
  );

  function onRefresh() {
    setRefreshing(true);
    loadWords();
    setRefreshing(false);
  }

  function handleWordPress(word: UserWordWithWord) {
    setSelectedWord(word);
    setModalVisible(true);
  }

  function handleCloseModal() {
    setModalVisible(false);
    setSelectedWord(null);
    loadWords(); // Refresh after review
  }

  function handleSubmitGuess(userWordId: string, guess: string) {
    if (!userId) return;
    reviewUserWord(userId, userWordId, guess);
  }

  const dueNow = words.filter((w) => isWordDueForReview(w.next_review_at));
  const dueLater = words.filter((w) => !isWordDueForReview(w.next_review_at));

  const selectedIsDue = selectedWord
    ? isWordDueForReview(selectedWord.next_review_at)
    : false;

  const isEmpty = words.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header — only shown when there are words */}
      {!isEmpty && (
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            onPress={() => router.push('/library')}
          >
            <IconPlus size={20} color={Colors.textPrimary} />
            <Text style={styles.addButtonText}>Add new word</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]}
            onPress={logout}
          >
            <IconLogOut size={20} color={Colors.textPrimary} />
          </Pressable>
        </View>
      )}

      {/* Full-screen empty state — no words at all */}
      {isEmpty ? (
        <View style={styles.emptyFullScreen}>
          <View style={styles.emptyCenterContent}>
            <Text style={styles.emptyTitle}>Build your Spanish vocabulary.</Text>
            <Pressable
              style={({ pressed }) => [
                styles.emptyAddButton,
                pressed && styles.emptyAddButtonPressed,
              ]}
              onPress={() => router.push('/library')}
            >
              <IconPlus size={20} color={Colors.textInverted} />
              <Text style={styles.emptyAddButtonText}>Add new words</Text>
            </Pressable>
          </View>
          <LogoEspanolo width={130} height={28} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.accent}
            />
          }
        >
          {/* To review now */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>To review now</Text>
            {dueNow.length > 0 ? (
              <View style={styles.cardList}>
                {dueNow.map((word) => (
                  <WordCard
                    key={word.id}
                    userWord={word}
                    isDueForReview
                    onPress={() => handleWordPress(word)}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptySection}>No word to review now.</Text>
            )}
          </View>

          {/* To review later */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>To review later</Text>
            {dueLater.length > 0 ? (
              <View style={styles.cardList}>
                {dueLater.map((word) => (
                  <WordCard
                    key={word.id}
                    userWord={word}
                    isDueForReview={false}
                    onPress={() => handleWordPress(word)}
                  />
                ))}
              </View>
            ) : (
              <Text style={styles.emptySection}>No word to review later.</Text>
            )}
          </View>
        </ScrollView>
      )}

      {/* Word modal */}
      <WordModal
        userWord={selectedWord}
        isDueForReview={selectedIsDue}
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmitGuess={handleSubmitGuess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.m,
  },
  addButton: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.outline,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  addButtonPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  addButtonText: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.bodyLarge,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  logoutButtonPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.l,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  section: {
    gap: Spacing.m,
  },
  sectionTitle: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.bodyLarge,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  cardList: {
    gap: Spacing.s,
  },
  emptySection: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  // Full-screen empty state (no words in list)
  emptyFullScreen: {
    flex: 1,
    paddingHorizontal: Spacing.l,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyCenterContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xxl,
  },
  emptyTitle: {
    fontFamily: FontFamily.playfairBold,
    fontSize: FontSize.heading3,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 30,
    width: 247,
  },
  emptyAddButton: {
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.outline,
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.m,
  },
  emptyAddButtonPressed: {
    backgroundColor: Colors.accentHover,
  },
  emptyAddButtonText: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.bodyLarge,
    color: Colors.textInverted,
    lineHeight: 28,
  },
});
