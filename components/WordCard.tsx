import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';
import { ProgressBar } from './ProgressBar';
import type { UserWordWithWord } from '../db/queries';

type Props = {
  userWord: UserWordWithWord;
  isDueForReview: boolean;
  onPress: () => void;
};

export function WordCard({ userWord, isDueForReview, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.textContainer}>
        {isDueForReview ? (
          // Spanish word is hidden — must guess
          <View>
            <View style={styles.blurredContainer}>
              <Text style={styles.spanishWord}>
                {userWord.spanish_word}
              </Text>
              <BlurView
                intensity={80}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            </View>
            <Text style={styles.englishTranslation}>
              {userWord.english_translation}
            </Text>
          </View>
        ) : (
          // Spanish word visible — already reviewed, waiting
          <View>
            <Text style={styles.spanishWord}>{userWord.spanish_word}</Text>
            <Text style={styles.englishTranslation}>
              {userWord.english_translation}
            </Text>
          </View>
        )}
      </View>
      <ProgressBar level={userWord.level} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.outline,
    padding: Spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  cardPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  textContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  spanishWord: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.bodyLarge,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  blurredContainer: {
    position: 'relative',
    borderRadius: 0,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  englishTranslation: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
});
