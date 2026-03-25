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
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontFamily, FontSize } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

import LogoEspanolo from '../assets/logo-espanolo.svg';

export default function LoginScreen() {
  const { login, signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const EMAIL_ERROR_MESSAGES = new Set([
    'Please enter your email address.',
    'Please enter a valid email address.',
    'Incorrect email or password.',
    'An account already exists with this email. Please log in.',
  ]);

  function routeError(msg: string) {
    if (EMAIL_ERROR_MESSAGES.has(msg)) {
      setEmailError(msg);
      setPasswordError(null);
    } else {
      setPasswordError(msg);
      setEmailError(null);
    }
  }

  async function handleLogin() {
    setEmailError(null);
    setPasswordError(null);
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) routeError(result.error ?? 'Login failed.');
    // On success, AuthenticatedLayout in _layout.tsx redirects to '/'
  }

  async function handleSignup() {
    setEmailError(null);
    setPasswordError(null);
    setLoading(true);
    const result = await signup(email, password);
    setLoading(false);
    if (!result.success) routeError(result.error ?? 'Sign up failed.');
    // On success, AuthenticatedLayout in _layout.tsx redirects to '/'
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
          <LogoEspanolo width={232} height={51} />

          {/* Form */}
          <View style={styles.form}>
            {/* Inputs */}
            <View style={styles.inputs}>
              {/* Email */}
              <View style={styles.emailWrapper}>
                <TextInput
                  style={[styles.input, emailError ? styles.inputError : null]}
                  placeholder="Email"
                  placeholderTextColor={Colors.textSecondary}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setEmailError(null); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                {emailError ? <Text style={styles.helperTextError}>{emailError}</Text> : null}
              </View>

              {/* Password */}
              <View style={styles.passwordWrapper}>
                <View style={[styles.passwordInput, passwordError ? styles.passwordInputError : null]}>
                  <TextInput
                    style={styles.passwordTextInput}
                    placeholder="Password"
                    placeholderTextColor={Colors.textSecondary}
                    value={password}
                    onChangeText={(t) => { setPassword(t); setPasswordError(null); }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                  />
                  <Pressable
                    onPress={() => setShowPassword((v) => !v)}
                    style={styles.eyeButton}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={24}
                      color={Colors.textSecondary}
                    />
                  </Pressable>
                </View>
                <Text style={[styles.helperText, passwordError ? styles.helperTextError : null]}>
                  {passwordError ?? 'Enter a strong password.'}
                </Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.textInverted} size="small" />
                ) : (
                  <Text style={styles.buttonText}>Log in</Text>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleSignup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.textInverted} size="small" />
                ) : (
                  <Text style={styles.buttonText}>Create account</Text>
                )}
              </Pressable>
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
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.xl,
    gap: Spacing.xxxl, // 64px between logo and form — matches Figma
  },
  // Form: inputs + buttons
  form: {
    width: '100%',
    gap: Spacing.xl, // 32px between inputs group and buttons group
  },
  // Inputs group: 16px gap
  inputs: {
    width: '100%',
    gap: Spacing.m,
  },
  // Email wrapper (input + optional error text)
  emailWrapper: {
    width: '100%',
    gap: Spacing.s,
  },
  // Email input
  input: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.outline,
    paddingHorizontal: Spacing.m,
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.errorMain,
  },
  // Password wrapper (input + helper text)
  passwordWrapper: {
    width: '100%',
    gap: Spacing.s,
  },
  // Password input row (TextInput + eye icon)
  passwordInput: {
    width: '100%',
    height: 48,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.outline,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.m,
    paddingRight: Spacing.s,
  },
  passwordTextInput: {
    flex: 1,
    height: '100%',
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.body,
    color: Colors.textPrimary,
  },
  eyeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    fontFamily: FontFamily.loraRegular,
    fontSize: FontSize.small,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  passwordInputError: {
    borderColor: Colors.errorMain,
  },
  helperTextError: {
    color: Colors.errorMain,
  },
  // Buttons group: 16px gap
  buttons: {
    width: '100%',
    gap: Spacing.m,
  },
  button: {
    backgroundColor: Colors.accent,
    borderWidth: 2,
    borderColor: Colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.l,
    paddingVertical: Spacing.s,
  },
  buttonPressed: {
    backgroundColor: Colors.accentHover,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: FontFamily.loraMedium,
    fontSize: FontSize.bodyLarge,
    color: Colors.textInverted,
    lineHeight: 28,
  },
});
