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
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  COLORS,
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
  const [devLink, setDevLink] = useState('');
  const [devError, setDevError] = useState<string | null>(null);

  async function handleDevPasteLink() {
    setDevError(null);
    const trimmed = devLink.trim();

    // Case 1: raw Supabase verify URL from the email inbox
    // e.g. https://xxx.supabase.co/auth/v1/verify?token=...&type=magiclink&...
    if (trimmed.includes('/auth/v1/verify')) {
      try {
        const urlObj = new URL(trimmed);
        const token = urlObj.searchParams.get('token');
        if (!token) { setDevError('No token found in URL.'); return; }
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'magiclink',
        });
        if (error) setDevError(error.message);
      } catch {
        setDevError('Invalid URL format.');
      }
      return;
    }

    // Case 2: redirect URL with hash fragment (access_token=...&refresh_token=...)
    const hashPart = trimmed.split('#')[1];
    if (!hashPart) {
      setDevError('Paste the magic link from your email inbox.');
      return;
    }
    const params = new URLSearchParams(hashPart);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) {
      setDevError('Could not extract tokens from URL.');
      return;
    }
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) setDevError(error.message);
  }

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
          {/* DEV ONLY — paste magic link to authenticate in Expo Go */}
          {__DEV__ && (
            <View style={styles.devSection}>
              <Text style={styles.devLabel}>Dev: paste magic link URL</Text>
              <View style={styles.devInputRow}>
                <TextInput
                  style={styles.devInput}
                  placeholder="Paste the magic link from your email..."
                  placeholderTextColor="#aaa"
                  value={devLink}
                  onChangeText={setDevLink}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable style={styles.devButton} onPress={handleDevPasteLink}>
                  <Text style={styles.devButtonText}>Go</Text>
                </Pressable>
              </View>
              {devError && <Text style={styles.devErrorText}>{devError}</Text>}
            </View>
          )}
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
    justifyContent: 'space-between',
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
    paddingVertical: 0,
    paddingHorizontal: 8, // Frame 96 inner padding (0px 8px)
  },
  arrowButton: {
    width: 32,
    height: 32,
  },
  errorText: {
    fontFamily: 'Lora_400Regular',
    fontSize: TEXT_INPUT.error.helperText.fontSize,
    lineHeight: 18,
    color: TEXT_INPUT.error.helperText.color,
  },
  devSection: {
    width: '100%',
    marginTop: 32,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 16,
  },
  devLabel: {
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: '#888',
  },
  devInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  devInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
    color: '#333',
  },
  devButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
  },
  devButtonText: {
    color: '#fff',
    fontFamily: 'Lora_400Regular',
    fontSize: 12,
  },
  devErrorText: {
    fontFamily: 'Lora_400Regular',
    fontSize: 11,
    color: '#D4183D',
  },
});
