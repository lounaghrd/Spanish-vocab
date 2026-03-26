import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { IconClose } from './icons';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';
import { normalizeAnswer } from '../db/queries';
import type { UserWordWithWord } from '../db/queries';

type ModalMode = 'view' | 'guess' | 'result';

type Props = {
  userWord: UserWordWithWord | null;
  isDueForReview: boolean;
  visible: boolean;
  onClose: () => void;
  onSubmitGuess: (userWordId: string, guess: string) => void;
};

export function WordModal({ userWord, isDueForReview, visible, onClose, onSubmitGuess }: Props) {
  const [mode, setMode] = useState<ModalMode>(() =>
    isDueForReview ? 'guess' : 'view'
  );
  const [guess, setGuess] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const resetState = useCallback(() => {
    setGuess('');
    setIsCorrect(null);
    setMode(isDueForReview ? 'guess' : 'view');
  }, [isDueForReview]);

  React.useEffect(() => {
    if (visible) resetState();
  }, [visible, userWord?.id]);

  if (!userWord) return null;

  function handleSubmitGuess() {
    if (!userWord) return;
    const success = normalizeAnswer(guess) === normalizeAnswer(userWord.spanish_word);
    setIsCorrect(success);
    setMode('result');
    onSubmitGuess(userWord.id, guess);
  }

  const wordTypeLabel = userWord.type.charAt(0).toUpperCase() + userWord.type.slice(1);
  const isGuessMode = mode === 'guess';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Full-screen backdrop — always covers entire screen, even behind keyboard */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* KeyboardAvoidingView fills the screen so the card shifts up when keyboard appears */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
        pointerEvents="box-none"
      >
        {/* Overlay: centers the card */}
        <View style={styles.overlay} pointerEvents="box-none">

          {/* Card — absorbs its own touches so the backdrop doesn't fire */}
          <View
            style={styles.card}
            onStartShouldSetResponder={() => true}
          >
            {/* ── Header ── */}
            <View style={styles.header}>
              <View style={styles.headerSpacer} />
              <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {userWord.spanish_word}
                </Text>
                {isGuessMode && BlurView && (
                  <BlurView
                    intensity={80}
                    tint="dark"
                    style={StyleSheet.absoluteFillObject}
                  />
                )}
              </View>
              <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
                <IconClose size={20} color={Colors.textPrimary} />
              </Pressable>
            </View>

            {/* ── Body ── */}
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.bodyContent}
            >
              {/* VIEW mode */}
              {mode === 'view' && (
                <View style={styles.section}>
                  <View style={styles.translationBlock}>
                    <Text style={styles.bodyText}>[EN] {userWord.english_translation}</Text>
                    <Text style={styles.bodyText}>{wordTypeLabel}.</Text>
                  </View>
                  <View style={styles.divider} />
                  <Text style={styles.bodyText}>E.g. {userWord.example_sentence}</Text>
                </View>
              )}

              {/* GUESS mode */}
              {mode === 'guess' && (
                <View style={styles.section}>
                  <View style={styles.translationBlock}>
                    <Text style={styles.bodyText}>[EN] {userWord.english_translation}</Text>
                    <Text style={styles.bodyText}>{wordTypeLabel}.</Text>
                  </View>
                  <View style={styles.guessBlock}>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Guess the word here..."
                      placeholderTextColor={Colors.textDisabled}
                      value={guess}
                      onChangeText={setGuess}
                      autoFocus
                      autoCapitalize="none"
                      autoCorrect={false}
                      onSubmitEditing={handleSubmitGuess}
                      returnKeyType="done"
                    />
                    <Pressable
                      style={({ pressed }) => [
                        styles.outlinedButton,
                        pressed && styles.outlinedButtonPressed,
                        guess.trim().length === 0 && styles.outlinedButtonDisabled,
                      ]}
                      onPress={handleSubmitGuess}
                      disabled={guess.trim().length === 0}
                    >
                      <Text style={[
                        styles.outlinedButtonText,
                        guess.trim().length === 0 && styles.outlinedButtonTextDisabled,
                      ]}>
                        Submit
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* RESULT mode */}
              {mode === 'result' && (
                <View style={styles.section}>
                  <View style={styles.translationBlock}>
                    <Text style={styles.bodyText}>[EN] {userWord.english_translation}</Text>
                    <Text style={styles.bodyText}>{wordTypeLabel}.</Text>
                  </View>
                  <View style={[
                    styles.resultBox,
                    isCorrect ? styles.resultBoxCorrect : styles.resultBoxIncorrect,
                  ]}>
                    <Text style={[
                      styles.resultLabel,
                      isCorrect ? styles.resultLabelCorrect : styles.resultLabelIncorrect,
                    ]}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Text>
                    <View style={styles.resultDetails}>
                      <Text style={styles.bodyText}>
                        <Text style={styles.correctAnswerPrefix}>Correct answer: </Text>
                        <Text style={styles.correctAnswerWord}>{userWord.spanish_word}</Text>
                      </Text>
                      <View style={styles.resultDivider} />
                      <Text style={styles.bodyText}>E.g. {userWord.example_sentence}</Text>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
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
    // Hard drop-shadow matching Figma: 6px right, 8px down, 0 blur
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.m,
    borderBottomWidth: 2,
    borderBottomColor: Colors.outline,
  },
  headerSpacer: {
    width: 30,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerTitle: {
    fontFamily: FontFamily.playfairBold,
    fontSize: FontSize.heading2,
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 38,
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  section: {
    gap: Spacing.m,
  },
  translationBlock: {
    gap: Spacing.xxs,
  },
  bodyText: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.outlineLight,
    opacity: 0.4,
    marginVertical: Spacing.xs,
  },
  guessBlock: {
    gap: Spacing.s,
    paddingTop: Spacing.s,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.outline,
    paddingHorizontal: Spacing.m,
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    height: 48,
  },
  outlinedButton: {
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.s,
  },
  outlinedButtonPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  outlinedButtonDisabled: {
    opacity: 0.4,
  },
  outlinedButtonText: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.bodyLarge,
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  outlinedButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  resultBox: {
    borderWidth: 2,
    padding: Spacing.m,
    gap: Spacing.m,
  },
  resultBoxCorrect: {
    backgroundColor: Colors.successBackground,
    borderColor: Colors.successMain,
  },
  resultBoxIncorrect: {
    backgroundColor: Colors.errorBackground,
    borderColor: Colors.errorMain,
  },
  resultLabel: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.bodyLarge,
    lineHeight: 28,
    textAlign: 'center',
  },
  resultLabelCorrect: {
    color: Colors.successText,
  },
  resultLabelIncorrect: {
    color: Colors.errorText,
  },
  resultDetails: {
    gap: Spacing.m,
  },
  correctAnswerPrefix: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  correctAnswerWord: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  resultDivider: {
    height: 1,
    backgroundColor: Colors.outlineLight,
    opacity: 0.5,
  },
});
