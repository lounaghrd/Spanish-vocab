import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';
import type { LibraryWord } from '../db/queries';

type Props = {
  word: LibraryWord;
  onToggle: (wordId: string, currentlyInList: boolean) => void;
};

export function LibraryWordItem({ word, onToggle }: Props) {
  const isSelected = word.is_in_list === 1;

  return (
    <Pressable
      onPress={() => onToggle(word.id, isSelected)}
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    >
      <View style={styles.textContainer}>
        <Text style={styles.spanishWord}>{word.spanish_word}</Text>
        <Text style={styles.englishTranslation}>{word.english_translation}</Text>
      </View>
      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
        {!isSelected && <Text style={styles.plusSign}>+</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: Spacing.m,
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineLight,
    minHeight: 64,
  },
  rowPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  textContainer: {
    flex: 1,
    gap: 0,
    paddingBottom: Spacing.xs,
  },
  spanishWord: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: 30,
    letterSpacing: 0.2,
  },
  englishTranslation: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  checkbox: {
    width: 25,
    height: 25,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.textInverted,
    fontSize: 14,
    fontWeight: '700',
  },
  plusSign: {
    color: Colors.outline,
    fontSize: 16,
    fontWeight: '300',
    lineHeight: 20,
  },
});
