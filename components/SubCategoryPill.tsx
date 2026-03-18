import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function SubCategoryPill({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, selected && styles.pillSelected]}
    >
      <Text style={[styles.text, selected && styles.textSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 2,
    borderColor: Colors.outline,
    paddingHorizontal: Spacing.m,
    paddingVertical: Spacing.xs,
    flexShrink: 0,
  },
  pillSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  text: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  textSelected: {
    color: Colors.textInverted,
  },
});
