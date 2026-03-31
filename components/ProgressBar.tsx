import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';

type Props = {
  level: number; // 0-8
  size?: 'big' | 'small';
};

export function ProgressBar({ level, size = 'big' }: Props) {
  const progress = level / 8;
  const isBig = size === 'big';

  return (
    <View style={[styles.container, isBig ? styles.containerBig : styles.containerSmall]}>
      <Text style={[styles.label, isBig ? styles.labelBig : styles.labelSmall]}>
        {level}/8
      </Text>
      <View style={[styles.track, isBig ? styles.trackBig : styles.trackSmall]}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  containerBig: {
    gap: Spacing.s,
  },
  containerSmall: {
    gap: 0,
  },
  label: {
    fontFamily: FontFamily.loraRegular,
    color: Colors.textPrimary,
  },
  labelBig: {
    fontSize: FontSize.body,
    width: 32,
  },
  labelSmall: {
    fontSize: FontSize.small,
    width: 34,
  },
  track: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.outlineLight,
    overflow: 'hidden',
  },
  trackBig: {
    width: 60,
    height: 8,
  },
  trackSmall: {
    width: 44,
    height: 7,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.accent,
  },
});
