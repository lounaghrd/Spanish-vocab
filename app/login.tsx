import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  COLORS,
  SPACING,
  TEXT_INPUT,
  LOGO,
  MESSAGES,
  VALIDATION,
  SCREEN,
} from '../lib/ui-specs';

import LogoEspanolo from '../assets/logo-espanolo.svg';
import ArrowButtonDefault from '../assets/icons/arrow-button-default.svg';
import ArrowButtonHover from '../assets/icons/arrow-button-hover.svg';
import ArrowButtonDisabled from '../assets/icons/arrow-button-disabled.svg';

export default function LoginScreen() {
  const { sendMagicLink } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasText = email.trim().length >= VALIDATION.emailInput.minCharacters;
  const isValidEmail = VALIDATION.emailInput.emailRegex.test(email.trim());
  const showArrow = hasText;
  const arrowEnabled = isValidEmail && !loading;

  async function handleSend() {
    setError(null);

    // Client-side validation before calling sendMagicLink
    if (!isValidEmail) {
      setError(MESSAGES.invalidEmailError);
      return;
    }

    setLoading(true);
    const result = await sendMagicLink(email);
    setLoading(false);

    if (result.success) {
      router.push('/check-email' as any);
    } else {
      setError(result.error ?? 'Something went wrong. Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <LogoEspanolo width={LOGO.app.width} height={LOGO.app.height} />

          {/* Email input with arrow button */}
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <View
                style={[
                  styles.inputRow,
                  error ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={styles.textInput}
                  placeholder={MESSAGES.emailPlaceholder}
                  placeholderTextColor={COLORS.textSecondary}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setError(null);
                  }}
                  onSubmitEditing={arrowEnabled ? handleSend : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="go"
                  editable={!loading}
                />

                {showArrow && (
                  <Pressable
                    onPress={handleSend}
                    disabled={!arrowEnabled}
                    hitSlop={4}
                    style={styles.arrowButton}
                  >
                    {({ pressed }) => (
                      loading ? (
                        <ActivityIndicator size="small" color={COLORS.textInverted} />
                      ) : !arrowEnabled ? (
                        <ArrowButtonDisabled width={32} height={32} />
                      ) : pressed ? (
                        <ArrowButtonHover width={32} height={32} />
                      ) : (
                        <ArrowButtonDefault width={32} height={32} />
                      )
                    )}
                  </Pressable>
                )}
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------- Styles ----------

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN.padding.horizontal,
    gap: SCREEN.gaps.contentToContent,
  },
  form: {
    width: '100%',
    gap: SCREEN.gaps.sectionGap,
  },
  inputWrapper: {
    width: '100%',
    gap: TEXT_INPUT.default.helperText.marginTop,
  },
  inputRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: TEXT_INPUT.default.input.borderWidth,
    borderColor: TEXT_INPUT.default.input.borderColor,
    borderRadius: TEXT_INPUT.default.input.borderRadius,
    backgroundColor: TEXT_INPUT.default.input.backgroundColor,
    paddingTop: TEXT_INPUT.default.input.padding.top,
    paddingBottom: TEXT_INPUT.default.input.padding.bottom,
    paddingLeft: TEXT_INPUT.default.input.padding.left,
    paddingRight: TEXT_INPUT.default.input.padding.right,
  },
  inputError: {
    borderColor: TEXT_INPUT.error.input.borderColor,
  },
  textInput: {
    flex: 1,
    fontFamily: 'Lora_400Regular',
    fontSize: TEXT_INPUT.default.placeholder.fontSize,
    color: COLORS.textPrimary,
    padding: 0, // Remove default TextInput padding
  },
  arrowButton: {
    width: 32,
    height: 32,
    marginLeft: SPACING.xs,
  },
  errorText: {
    fontFamily: 'Lora_400Regular',
    fontSize: TEXT_INPUT.error.helperText.fontSize,
    lineHeight: 18,
    color: TEXT_INPUT.error.helperText.color,
  },
});
