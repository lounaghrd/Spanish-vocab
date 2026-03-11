import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';

type Props = {
  level: number; // 0-8
};

export function ProgressBar({ level }: Props) {
  const progress = level / 8;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{level}/8</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.s,
    flexShrink: 0,
  },
  label: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    width: 35,
  },
  track: {
    width: 60,
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
});
