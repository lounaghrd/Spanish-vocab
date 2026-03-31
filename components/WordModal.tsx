import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { WordCardTitle } from './WordCardTitle';
import { ProgressBar } from './ProgressBar';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';
import { normalizeAnswer } from '../db/queries';
import type { UserWordWithWord } from '../db/queries';

import ArrowButtonDefault from '../assets/icons/arrow-button-default.svg';
import ArrowButtonHover from '../assets/icons/arrow-button-hover.svg';

type ModalMode = 'view' | 'guess' | 'result';

type Props = {
  userWord: UserWordWithWord | null;
  isDueForReview: boolean;
  visible: boolean;
  onClose: () => void;
  onSubmitGuess: (userWordId: string, guess: string) => void;
};

function nextReviewLabel(level: number): string {
  if (level === 0) return 'You should review this word again right now.';
  const map: Record<number, string> = {
    1: 'Next review in 1 hour.',
    2: 'Next review in 1 day.',
    3: 'Next review in 2 days.',
    4: 'Next review in 4 days.',
    5: 'Next review in 7 days.',
    6: 'Next review in 14 days.',
    7: 'Next review in 30 days.',
    8: 'Congratulations! This word is now in your long term memory.',
  };
  return map[level];
}

export function WordModal({ userWord, isDueForReview, visible, onClose, onSubmitGuess }: Props) {
  const [mode, setMode] = useState<ModalMode>(() =>
    isDueForReview ? 'guess' : 'view'
  );
  const [guess, setGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [newLevel, setNewLevel] = useState<number | null>(null);

  const resetState = useCallback(() => {
    setGuess('');
    setIsCorrect(null);
    setNewLevel(null);
    setMode(isDueForReview ? 'guess' : 'view');
  }, [isDueForReview]);

  React.useEffect(() => {
    if (visible) resetState();
  }, [visible, userWord?.id]);

  if (!userWord) return null;

  function handleSubmitGuess() {
    if (!userWord) return;
    const success = normalizeAnswer(guess) === normalizeAnswer(userWord.spanish_word);
    const computed = success ? Math.min(userWord.level + 1, 8) : 0;
    setIsCorrect(success);
    setNewLevel(computed);
    setMode('result');
    onSubmitGuess(userWord.id, guess);
  }

  const wordTypeLabel = userWord.type.charAt(0).toUpperCase() + userWord.type.slice(1);

  const titleState =
    mode === 'result' && isCorrect === true ? 'correct' :
    mode === 'result' && isCorrect === false ? 'incorrect' :
    'default';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Full-screen backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        pointerEvents="box-none"
      >
        <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.card} onStartShouldSetResponder={() => true}>

            {/* Title */}
            <WordCardTitle
              word={userWord.spanish_word}
              state={titleState}
              masked={mode === 'guess'}
            />

            {/* Body — VIEW mode */}
            {mode === 'view' && (
              <View style={styles.bodyView}>
                <View style={styles.wordClueRow}>
                  <Text style={styles.bodyText}>{userWord.english_translation}</Text>
                  <Text style={styles.bodyText}>·</Text>
                  <Text style={styles.bodyText}>{wordTypeLabel}</Text>
                </View>
                <View style={styles.separator} />
                <Text style={styles.bodyText}>E.g. {userWord.example_sentence}</Text>
              </View>
            )}

            {/* Body — GUESS mode */}
            {mode === 'guess' && (
              <View style={styles.bodyGuess}>
                <View style={styles.wordClueRow}>
                  <Text style={styles.bodyText}>{userWord.english_translation}</Text>
                  <Text style={styles.bodyText}>·</Text>
                  <Text style={styles.bodyText}>{wordTypeLabel}</Text>
                </View>
                <View style={styles.textFieldContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Guess the word here..."
                    placeholderTextColor={Colors.textSecondary}
                    value={guess}
                    onChangeText={setGuess}
                    autoFocus
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleSubmitGuess}
                    returnKeyType="done"
                  />
                  {guess.trim().length > 0 && (
                    <Pressable
                      onPress={handleSubmitGuess}
                      hitSlop={4}
                      style={styles.arrowButton}
                    >
                      {({ pressed }) =>
                        pressed ? (
                          <ArrowButtonHover width={32} height={32} />
                        ) : (
                          <ArrowButtonDefault width={32} height={32} />
                        )
                      }
                    </Pressable>
                  )}
                </View>
              </View>
            )}

            {/* Body — RESULT mode */}
            {mode === 'result' && newLevel !== null && (
              <View style={styles.bodyResult}>
                <ProgressBar level={newLevel} />
                <Text style={styles.nextReviewText}>{nextReviewLabel(newLevel)}</Text>
              </View>
            )}

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.l,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.outline,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
    paddingTop: 32,
    paddingHorizontal: 48,
    paddingBottom: 48,
    gap: 32,
    alignItems: 'center',
  },
  bodyView: {
    alignSelf: 'stretch',
    gap: 16,
  },
  bodyGuess: {
    alignSelf: 'stretch',
    gap: 24,
  },
  bodyResult: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 8,
  },
  wordClueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bodyText: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.outline,
    opacity: 0.15,
    alignSelf: 'stretch',
  },
  textFieldContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    height: 48,
    borderWidth: 2,
    borderColor: Colors.outline,
    backgroundColor: Colors.background,
    paddingVertical: 0,
    paddingHorizontal: 8,
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    paddingVertical: 0,
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  arrowButton: {
    width: 32,
    height: 32,
  },
  nextReviewText: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
  },
});
