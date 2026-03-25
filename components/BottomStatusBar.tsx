import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize, Spacing } from '../constants/theme';

type Props = {
  learned: number;
  learning: number;
};

export function BottomStatusBar({ learned, learning }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {learned} in memory, {learning} learning
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderTopWidth: 2,
    borderTopColor: Colors.outline,
    paddingHorizontal: Spacing.m,
    paddingTop: 10,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.small,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
