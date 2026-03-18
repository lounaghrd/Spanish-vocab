import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  Colors,
  Spacing,
  FontFamily,
  FontSize,
  LineHeight,
} from '../constants/theme';
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
        <View style={styles.topRow}>
          <Text style={styles.spanishWord} numberOfLines={1}>
            {word.spanish_word}
          </Text>
          <Text style={styles.englishTranslation} numberOfLines={1}>
            {word.english_translation}
          </Text>
        </View>
        {(word.category_name || word.sub_category_name) && (
          <View style={styles.metaRow}>
            {word.category_name && (
              <Text style={styles.metaText} numberOfLines={1}>
                {word.category_name}
              </Text>
            )}
            {word.category_name && word.sub_category_name && (
              <View style={styles.dot} />
            )}
            {word.sub_category_name && (
              <Text style={styles.metaText} numberOfLines={1}>
                {word.sub_category_name}
              </Text>
            )}
          </View>
        )}
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
    paddingVertical: 10,
    paddingLeft: Spacing.xxs,
    paddingRight: Spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineLight,
  },
  rowPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.s,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
  },
  spanishWord: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: LineHeight.body,
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  englishTranslation: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    lineHeight: LineHeight.small,
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    lineHeight: LineHeight.caption,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textSecondary,
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
