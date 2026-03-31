import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import {
  Colors,
  Spacing,
  FontFamily,
  FontSize,
  LineHeight,
} from '../constants/theme';
import { ProgressBar } from './ProgressBar';
import { WordSelectMenu } from './WordSelectMenu';
import { IconPlus, IconCycle, IconCheck } from './icons';
import type { LibraryWord } from '../db/queries';

type Props = {
  word: LibraryWord;
  onStartLearning: (wordId: string) => void;
  onMarkAsLearned: (wordId: string) => void;
  onRemoveWord: (wordId: string) => void;
  onPress?: () => void;
};

export function LibraryWordItem({
  word,
  onStartLearning,
  onMarkAsLearned,
  onRemoveWord,
  onPress,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const buttonRef = useRef<View>(null);

  function handlePlusPress() {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchorPosition({ x, y, width, height });
      setMenuVisible(true);
    });
  }

  return (
    <Pressable style={styles.row} onPress={onPress}>
      {/* Text content */}
      <View style={styles.textContainer}>
        <Text style={styles.spanishWord} numberOfLines={1}>
          {word.spanish_word}
        </Text>
        <Text style={styles.englishTranslation} numberOfLines={1}>
          {word.english_translation}
        </Text>
      </View>

      {/* Right side: variant-specific actions */}
      {word.variant === 'to_add' && (
        <>
          <Pressable
            ref={buttonRef}
            onPress={handlePlusPress}
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonOutlined,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <IconPlus size={12} color={Colors.outline} />
          </Pressable>
          <WordSelectMenu
            visible={menuVisible}
            anchorPosition={anchorPosition}
            onStartLearning={() => onStartLearning(word.id)}
            onMarkAsLearned={() => onMarkAsLearned(word.id)}
            onClose={() => setMenuVisible(false)}
          />
        </>
      )}

      {word.variant === 'in_progress' && (
        <View style={styles.inProgressRight}>
          <ProgressBar level={word.level} size="small" />
          <Pressable
            onPress={() => onRemoveWord(word.id)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonAccent,
              pressed && styles.actionButtonAccentPressed,
            ]}
          >
            <IconCycle size={22} color={Colors.textInverted} />
          </Pressable>
        </View>
      )}

      {word.variant === 'learned' && (
        <Pressable
          onPress={() => onRemoveWord(word.id)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonLearned,
            pressed && styles.actionButtonLearnedPressed,
          ]}
        >
          <IconCheck size={13} color={Colors.textInverted} />
        </Pressable>
      )}
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
    paddingRight: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineLight,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.s,
    gap: Spacing.xxs,
  },
  spanishWord: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: LineHeight.body,
    letterSpacing: 0.2,
  },
  englishTranslation: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    lineHeight: LineHeight.small,
  },
  // Action buttons (25x25 rounded square)
  actionButton: {
    width: 25,
    height: 25,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionButtonOutlined: {
    borderWidth: 2,
    borderColor: Colors.outline,
  },
  actionButtonPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  actionButtonAccent: {
    backgroundColor: Colors.accent,
  },
  actionButtonAccentPressed: {
    backgroundColor: Colors.accentHover,
  },
  actionButtonLearned: {
    backgroundColor: Colors.successMain,
  },
  actionButtonLearnedPressed: {
    backgroundColor: Colors.successText,
  },
  // In progress: progress bar + cycle button
  inProgressRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.m,
    flexShrink: 0,
  },
});
