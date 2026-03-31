import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize } from '../constants/theme';

import WordTitleCorrectIcon from '../assets/icons/word-title-correct.svg';
import WordTitleIncorrectIcon from '../assets/icons/word-title-incorrect.svg';

type Props = {
  word: string;
  state: 'default' | 'correct' | 'incorrect';
  masked: boolean;
};

export function WordCardTitle({ word, state, masked }: Props) {
  const wordColor =
    state === 'correct' ? Colors.successMain :
    state === 'incorrect' ? Colors.errorMain :
    Colors.textPrimary;

  return (
    <View style={styles.container}>
      {state === 'correct' && (
        <View style={styles.iconWrapper}>
          <WordTitleCorrectIcon width={25} height={25} />
        </View>
      )}
      {state === 'incorrect' && (
        <View style={styles.iconWrapper}>
          <WordTitleIncorrectIcon width={25} height={25} />
        </View>
      )}
      <View style={styles.wordContainer}>
        <Text style={[styles.word, { color: wordColor }]}>{word}</Text>
        {masked && <View style={styles.mask} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  iconWrapper: {
    width: 25,
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  word: {
    fontFamily: FontFamily.playfairBold,
    fontSize: FontSize.heading2,
    lineHeight: 37.5,
    textAlign: 'center',
  },
  mask: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.textSecondary,
  },
});
