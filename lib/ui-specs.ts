/**
 * UI Specifications for Passwordless Email Login Flow
 * Auto-extracted from Figma Dev Mode (file key: 3dHMRP2tvCfK6TvthRhAIa)
 *
 * USAGE: Import these constants when implementing UI components.
 * These are pixel-perfect specs from the design system.
 */

// ============================================================================
// COLORS
// ============================================================================

export const COLORS = {
  // Background
  background: '#F1E1D6',
  backgroundSecondary: '#F6EDE5',
  backgroundHover: '#E0CFC1',

  // Accent (primary action)
  accent: '#F26641',
  accentHover: '#F37452',

  // Text
  textPrimary: '#191919',
  textSecondary: '#655F58',
  textInverted: '#FFFFFF',
  textDisabled: '#837A72',

  // Error
  error: '#D4183D',

  // Outline
  outline: '#262626',
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  heading2: {
    fontFamily: 'Playfair Display',
    fontSize: 30,
    fontWeight: 700,
    lineHeight: '1.25em',
  },
  heading3: {
    fontFamily: 'Playfair Display',
    fontSize: 24,
    fontWeight: 700,
    lineHeight: '1.25em',
    letterSpacing: '4.17%',
  },
  bodyLargeMedium: {
    fontFamily: 'Lora',
    fontSize: 18,
    fontWeight: 550,
    lineHeight: '1.556em',
  },
  bodyMedium: {
    fontFamily: 'Lora',
    fontSize: 16,
    fontWeight: 550,
    lineHeight: '1.5em',
    letterSpacing: '1.25%',
  },
  bodyDefault: {
    fontFamily: 'Lora',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: '1.5em',
  },
  smallMedium: {
    fontFamily: 'Lora',
    fontSize: 14,
    fontWeight: 550,
    lineHeight: '1.14em',
    letterSpacing: '1.43%',
  },
  small: {
    fontFamily: 'Lora',
    fontSize: 14,
    fontWeight: 400,
    lineHeight: '1.286em',
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const SPACING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BORDER_RADIUS = {
  small: 5,
  medium: 16,
} as const;

// ============================================================================
// TEXT INPUT COMPONENT
// ============================================================================

export const TEXT_INPUT = {
  // Container dimensions
  containerWidth: 393,

  // Gap between label and input field
  containerGap: 8,

  // Default state
  default: {
    input: {
      padding: {
        top: 12,
        right: 8,
        bottom: 12,
        left: 8,
      },
      borderRadius: 0,
      borderWidth: 2,
      borderColor: COLORS.outline,
      backgroundColor: COLORS.background,
    },
    label: {
      fontSize: 14,
      fontWeight: 550,
      lineHeight: '1.14em',
      letterSpacing: '1.43%',
      color: COLORS.textPrimary,
    },
    placeholder: {
      fontSize: 16,
      fontWeight: 400,
      lineHeight: '1.5em',
      color: COLORS.textSecondary,
    },
    helperText: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '1.286em',
      color: COLORS.textSecondary,
      marginTop: 4,
    },
  },

  // Focused state
  focused: {
    input: {
      padding: {
        top: 12,
        right: 8,
        bottom: 12,
        left: 8,
      },
      borderRadius: 0,
      borderWidth: 3,
      borderColor: COLORS.accent,
      borderDashArray: '6 6',
      backgroundColor: COLORS.backgroundSecondary,
    },
  },

  // Error state
  error: {
    input: {
      padding: {
        top: 12,
        right: 8,
        bottom: 12,
        left: 8,
      },
      borderRadius: 0,
      borderWidth: 2,
      borderColor: COLORS.error,
      backgroundColor: COLORS.background,
    },
    helperText: {
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '1.286em',
      color: COLORS.error,
    },
  },

  // Disabled state
  disabled: {
    input: {
      padding: {
        top: 12,
        right: 8,
        bottom: 12,
        left: 8,
      },
      borderRadius: 0,
      borderWidth: 2,
      borderColor: COLORS.textDisabled,
      backgroundColor: COLORS.background,
    },
    label: {
      color: COLORS.textDisabled,
    },
    text: {
      color: COLORS.textDisabled,
    },
  },

  // Optional arrow button slot
  arrowButton: {
    width: 32,
    height: 32,
  },

  // Optional icon slot
  icon: {
    width: 26,
    height: 26,
  },
} as const;

// ============================================================================
// ARROW BUTTON COMPONENT
// ============================================================================

export const ARROW_BUTTON = {
  width: 32,
  height: 32,
  borderRadius: 5,
  padding: 0,

  // Default state
  default: {
    backgroundColor: COLORS.accent,
  },

  // Hover state
  hover: {
    backgroundColor: COLORS.accentHover,
  },

  // Disabled state
  disabled: {
    backgroundColor: COLORS.textDisabled,
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  // Icon inside button
  icon: {
    width: 22,
    height: 22,
    color: COLORS.textInverted,
  },

  // Visibility rule
  visibilityRule: 'Show when input has 1+ characters and email format is valid',
} as const;

// ============================================================================
// SECONDARY BUTTON (Resend, Open App, etc.)
// ============================================================================

export const SECONDARY_BUTTON = {
  padding: {
    top: 8,
    right: 24,
    bottom: 8,
    left: 24,
  },
  borderRadius: 5,
  borderWidth: 2,
  borderColor: COLORS.outline,
  backgroundColor: COLORS.background,
  fontSize: 18,
  fontWeight: 550,
  lineHeight: '1.556em',
  color: COLORS.textPrimary,
  gap: 16,
} as const;

// ============================================================================
// PRIMARY BUTTON (CTA, Sign in, Add words, etc.)
// ============================================================================

export const PRIMARY_BUTTON = {
  padding: {
    top: 8,
    right: 24,
    bottom: 8,
    left: 24,
  },
  borderRadius: 5,
  backgroundColor: COLORS.accent,
  fontSize: 18,
  fontWeight: 550,
  lineHeight: '1.556em',
  color: COLORS.textInverted,
  gap: 16,
} as const;

// ============================================================================
// SCREEN DIMENSIONS & LAYOUTS
// ============================================================================

export const SCREEN = {
  width: 402,
  height: 821,
  padding: {
    horizontal: 24,
    vertical: 0,
  },
  borderRadius: BORDER_RADIUS.medium,
  backgroundColor: COLORS.background,
  borderWidth: 2,
  borderColor: COLORS.textPrimary,

  // Common gaps in screens
  gaps: {
    contentToContent: 64,
    sectionGap: 32,
    bottomPadding: 48,
  },
} as const;

// ============================================================================
// LOGO DIMENSIONS
// ============================================================================

export const LOGO = {
  // App logo (large, on login/success screens)
  app: {
    width: 232,
    height: 51,
  },
  // Footer logo (smaller)
  footer: {
    width: 130,
    height: 28,
  },
} as const;

// ============================================================================
// ILLUSTRATIONS
// ============================================================================

export const ILLUSTRATIONS = {
  envelope: {
    width: 138,
    height: 81,
  },
} as const;

// ============================================================================
// EMAIL TEMPLATE
// ============================================================================

export const EMAIL_TEMPLATE = {
  width: 398,
  padding: 64,
  backgroundColor: COLORS.background,
  gap: 64, // Gap between logo, heading, button, etc.

  logo: {
    width: 137,
    height: 30,
  },

  heading: {
    ...TYPOGRAPHY.heading2,
    color: COLORS.textPrimary,
  },

  description: {
    ...TYPOGRAPHY.bodyDefault,
    color: COLORS.textPrimary,
  },

  button: {
    ...PRIMARY_BUTTON,
  },

  expiry: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },

  disclaimer: {
    ...TYPOGRAPHY.small,
    color: COLORS.textSecondary,
  },
} as const;

// ============================================================================
// FORM LAYOUTS
// ============================================================================

export const FORM = {
  emailInput: {
    layout: 'column',
    alignItems: 'stretch',
    gap: 32,
    paddingBottom: 48,
  },
  arrowPosition: 'rightOfInput',
  arrowVerticalAlign: 'center',
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  emailInput: {
    minCharacters: 1, // Arrow appears after 1+ characters
    enabledWhenValid: true, // Arrow enabled only if email format is valid
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email validation
  },
  rateLimitSeconds: 30, // Lockout between requests to same email
} as const;

// ============================================================================
// EDGE CASE MESSAGES
// ============================================================================

export const MESSAGES = {
  emailPlaceholder: 'Your email',
  invalidEmailError: 'Enter a valid email address.',
  rateLimitError: 'We have already sent an email to this address. Try again in 30 seconds.',
  linkExpiredHeading: 'This link has expired',
  linkExpiredMessage: 'If the problem persists, please contact support.',
  linkNotOpenedHeading: 'Open the Españolo app',
  checkEmailHeading: 'Check your email',
  changeEmailLink: 'Change email address',
  successHeading: 'Build your Spanish vocabulary.',
  emailSubject: 'Españolo - Sign in link',
  emailCTA: 'Sign in to Españolo',
  emailExpiry: 'This link expires in 24h.',
  emailDisclaimer: 'If you didn\'t request this email, you can safely ignore it.',
  emailSupport: 'If you are experiencing issues, please contact support.',
  resendButton: 'Resend link',
  openAppButton: 'Open your app',
  addWordsButton: 'Add new words',
} as const;

// ============================================================================
// TYPE DEFINITIONS (for IDE support)
// ============================================================================

export type ColorKey = keyof typeof COLORS;
export type TypographyKey = keyof typeof TYPOGRAPHY;
export type SpacingKey = keyof typeof SPACING;
