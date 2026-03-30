# Email Passwordless Authentication — Product Specifications

## Overview

Replace email + password authentication with a passwordless system using magic links sent via email. This removes password complexity, reduces account recovery friction, and improves security.

---

## User Flows

### New User Signup & Returning User Login (same flow)

1. User opens app / taps "Log In"
2. Enters email address in text input
3. As user types (1+ characters), a send arrow button appears on the right
4. User clicks arrow button to submit email
5. If valid email format → magic link is sent immediately
6. User receives email: "Sign in to Españolo" with [Sign in to Españolo] button
7. User clicks button in email → redirected to app
8. App auto-logs user in, lands on "My Words" screen
9. If link was opened in browser instead → user sees "Open on Españolo app" button to redirect

### Existing Users (Currently Logged In)

- **No action required.** Users remain logged in with their current session.
- When they naturally log out and log back in, they use the magic link flow.
- This is a soft migration — users transition at their own pace.

---

## Technical Architecture

### Email Service

- **Provider:** Supabase Auth (built-in passwordless OTP)
- **Sender email:** `no-reply@email.espanolo.com` (verified in Supabase Auth > Email Templates)
- **OTP expiry:** 24 hours
- **Email template:** Customizable in Supabase dashboard
- **Delivery:** Supabase SMTP (no external provider needed for MVP)

### Deep Linking

- **Deep link URL format:** `https://app.espanolo.com/auth/callback?token=<otp_code>`
- **iOS:** Configure Universal Links in Supabase dashboard
  - Apple App Site Association file auto-managed by Supabase
- **Android:** Configure App Links in Supabase dashboard
  - assetlinks.json auto-managed by Supabase
- **Implementation:** expo-router handles routing in `app/(auth)/callback.tsx`

### Session Management

- **Session TTL:** 24 hours (configured in Supabase Auth settings)
- **AsyncStorage:** Persists `access_token` + `refresh_token` for offline availability
- **Auto-refresh:** Triggered when app resumes (AppState event listener)
  - Refresh if remaining session time < 12 hours
  - Prevents mid-session logout for active users
- **Logout:** Calls `supabase.auth.signOut()` + clears AsyncStorage

### Rate Limiting (Server-Side)

- **Enforcement:** Supabase Edge Function (`/request-login-link`)
- **Rules:**
  - 30-second cooldown: Reject if last request to same email < 30s ago
  - Hourly cap: Reject if ≥3 requests to same email in past hour (sliding window)
  - Status code: `429 Too Many Requests` with `Retry-After` header
- **Storage:** `rate_limit_attempts` table (email, attempt_timestamp)
- **Client-side:** Disable button for 30 seconds after submit (UX only, not security)

---

## Core Requirements

### Signup/Login Flow

- Single screen: email input field only (no password, no signup/login separation)
- Send button (arrow icon) appears after user types 1+ characters
- Only enable send button if email format is valid (basic validation: `[something]@[domain].[extension]`)
- On send: submit email → magic link sent immediately
- Magic link delivery to inbox within 30 seconds (typical email)
- Link expires after 24 hours if not used
- One-time use token (each link can only be used once)
- Clicking link auto-logs user in, lands on "My Words"
- User stays logged in across app closes/reopens (session persistence)

### Email Content

- Subject: "Españolo - Sign in link"
- Sender email: `no-reply@email.espanolo.com` (must be created and verified with email provider)
- Body includes:
  - Primary CTA button: "Sign in to Españolo"
  - Text: "This link expires in 24h."
  - Secondary help text: "If you didn’t request this email, you can safely ignore it."
  - Tertiary link: "If you are experiencing issues, please contact support."
  - Branding: Españolo logo at bottom

### Session Management

- Session persists in device storage (AsyncStorage) even after app close
- Session auto-refreshes before expiry (no interruption to user)
- User can manually log out (clears Supabase session from device)
- **On logout:** Supabase session is cleared; word library cache remains (for offline access on next login)
  - Rationale: Word library is not personal data, allows offline browsing while waiting for next user

---

## Error Handling & Edge Cases

### Invalid email format

- **Scenario:** User types "username" or "user@domain" (missing extension)
- **Behavior:** Text field in error state. 
- **User sees:** Error text below input: "Enter a valid email address."
- **Recovery:** User corrects email.

### Email rate limit reached

- **Scenario:** User already sent a link to this email, tries to send again immediately
- **Behavior:** Link is NOT sent, text input in error state shows helper: "We have already sent an email to this address. Try again in 30 seconds."
- **Rationale:** Prevents accidental email spam, manages abuse
- **Recovery:** User waits 30 seconds and tries to submit again.

### Magic link expires

- **Scenario:** User doesn't click link within 24 hours
- **Behavior:** Link expired. When user clicks link, redirected to dedicated page
- **User sees:** Page with message: "This link has expired." and button: [Resend link]
  - Help text: "If the problem persists, please contact support."
- **Recovery:** One tap [Resend link] to request new link

### Deep link fails (link opens in browser instead of app)

- **Scenario:** User clicks link in email
- **Preferred behavior:** Deep link to app (iOS universal links + Android App Links)
  - User is auto-logged in via deep link, lands on "My Words"
  - Works if app is installed
  - Seamless, no extra taps
- **Fallback behavior:** Link opens in browser/web fallback (if app not installed or deep link fails)
  - Web page shows: "Open the Españolo app" with button: [Open on Españolo app]
  - Tapping button deep-links to app with authenticated session
  - One extra tap, but still works

### Link shared/forwarded to another person

- **Scenario:** User forwards email with magic link to a friend (intentionally or not)
- **Behavior:** Friend clicks link, becomes logged in as original user
- **Mitigation:**
  - One-time use token (link can't be reused)
  - Email includes: "If you didn't request this, you can safely ignore it."
  - No device fingerprinting or login notifications (keep simple)

### User forgets which email they registered with

- **Scenario:** Tries to login with wrong email address, creates new account accidentally
- **Behavior:** Two separate accounts created (one per email)
- **Mitigation:** none
- **Current stance:** Accept as UX tradeoff of passwordless auth

### Bot/spam: Attacker requests many links

- **Scenario:** Malicious actor requests links for thousands of email addresses
- **Behavior:** Innocent people receive unsolicited login emails
- **Mitigation (MVP):**
  - Rate limit: Max 3 link requests per email address per hour (enforced server-side)
  - 30-second lockout between requests to same email
  - Monitor link request volume, flag anomalies in server logs
- **Mitigation (Future):** Add CAPTCHA or email spike detection if abuse patterns emerge

### Session expires (long app inactivity)

- **Scenario:** User is logged in, closes app for a week, opens again
- **Behavior:**
  - If session still valid: Auto-login, land on My Words
  - If session expired: Logged out, see login screen
- **Recovery:** Easy — just request new link with same email

---

## Migration Strategy (for existing users with passwords)

### Phase 1: Launch Passwordless

- Remove password input from login screen
- Add magic link flow as only auth method
- All new signups use passwordless only

### Phase 2: Soft Migration (ongoing)

- Existing logged-in users stay logged in (no action)
- When they log out, they must use magic link to log back in
- Track migration progress (% of users who've logged in via magic link)

### Phase 3: Complete Migration (optional, months later)

- Once [X%] of users have migrated, celebrate success
- [TBD] Eventually remove password column from database (after 6-12 months)

---

## Success Metrics

### Primary Metrics (Track in Admin Dashboard)

- **Signup completion rate:** % of users who request email link and complete login (track: `auth_events` with status=completed)
- **Email delivery rate:** % of magic links that arrive in inbox (Supabase tracks sent vs. bounced; complement with manual testing)
- **Link click-through rate:** % of delivered links that are actually clicked (track via deep link success logs)

### Implementation

- Create `auth_events` table in Supabase to log:
  - `event_type`: 'email_requested' | 'email_delivered' | 'link_clicked' | 'login_completed'
  - `email` (hashed for privacy)
  - `timestamp`
  - `status`: 'success' | 'failed'
  - `error_reason` (if failed)
- Add `/admin/analytics` page to admin back office showing:
  - 24h, 7d, 30d view of metrics
  - Funnel chart: email_requested → link_clicked → login_completed
  - Failed login reasons (expired link, invalid email, rate limit, etc.)
- **Timeline:** Add after MVP launch (not blocking initial release)

### Optional Secondary Metrics (Track Later)

- Failed login attempts (broken links, expired tokens, user error)
- Time to login (from email open to app auto-login)
- User satisfaction with passwordless (survey/feedback)

---

## Decisions Made

- ✅ Email domain: `noreply@espanolo.com` (must be created + verified with email provider)
- ✅ Deep linking: Universal links (iOS) + App links (Android) with web fallback
- ✅ Logout scope: Clear Supabase session; keep word library cache (same as current behavior)
- ✅ Suspicious login: One-time tokens only, no device fingerprinting or notifications (keep simple)
- ✅ CAPTCHA: Not in MVP; rate limits + server monitoring sufficient
- ✅ Email rate limit: Strict 30-second lockout between requests (no early resend allowed)
- ✅ Signup data: Email address only (no name/preferences on signup)
- ✅ Link sharing security: One-time tokens + "safely ignore" message in email
- ✅ Multiple accounts: No special handling; manual recovery if needed
- ✅ Metrics dashboard: Start Supabase `auth_events` table + `/admin/analytics` page

---

## UI Specifications

### Design Tokens & Measurements

**All exact measurements, colors, typography, spacing, and component specs are documented in:**

```
lib/ui-specs.ts
```

**Import and use these constants during implementation:**

```typescript
import { COLORS, TYPOGRAPHY, SPACING, TEXT_INPUT, ARROW_BUTTON, SCREEN, MESSAGES } from '../lib/ui-specs'
```

This ensures pixel-perfect implementation matching Figma exactly.

---

### Screen Flows

#### Login / Signup Flow

**Figma:** [https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=639-2048](https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=639-2048)

1. **Screen 1:** Empty email input with placeholder "Your email"
2. **Screen 2:** Arrow button appears when user types 1+ characters
3. **Screen 3:** "Check your email" confirmation screen with envelope illustration
4. **Screen 4:** Success screen "Build your Spanish vocabulary" with CTA button

---

#### Edge Cases Flow

**Figma:** [https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=639-2077](https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=639-2077)


| Error Case           | User Action                      | Next Step                                    |
| -------------------- | -------------------------------- | -------------------------------------------- |
| Invalid email format | User types incomplete email      | Show error: "Enter a valid email address."   |
| Rate limit (30s)     | User tries to resend too quickly | Show error: "Try again in 30 seconds."       |
| Link expired (24h)   | User clicks expired link         | Show page with [Resend link] button          |
| Deep link failed     | User clicks link in browser      | Show page with [Open on Españolo app] button |


---

### Component References

- **Text Input:** See `lib/ui-specs.ts` → `TEXT_INPUT`
- **Arrow Button:** See `lib/ui-specs.ts` → `ARROW_BUTTON`
- **Primary Button:** See `lib/ui-specs.ts` → `PRIMARY_BUTTON`
- **Secondary Button:** See `lib/ui-specs.ts` → `SECONDARY_BUTTON`
- **Email Template:** See `lib/ui-specs.ts` → `EMAIL_TEMPLATE`
- **All Messages:** See `lib/ui-specs.ts` → `MESSAGES`

---

### Figma Components

- Text Input Component: [https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=203-634](https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=203-634)
- Arrow Button Component: [https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=639-1251](https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=639-1251)

Use Figma Dev Mode to inspect exact properties when implementing.

---

### Implementation Checklist

- Import constants from `lib/ui-specs.ts`
- Implement Text Input field (all 4 states: default, focused, error, disabled)
- Implement Arrow button (all 3 states: default, hover, disabled)
- Show/hide arrow button based on input length (≥1 char) and validity
- Display error messages from `MESSAGES` constants
- Build email template with exact layout and styling
- Set up deep linking (universal links + web fallback)
- Test visual comparison with Figma on real device

---

## Implementation Notes

### Pre-Launch Checklist

- Set up `noreply@espanolo.com` email sender (domain verification, SPF/DKIM/DMARC records)
- Configure Supabase Auth for passwordless OTP (magic links)
- Set up universal/app links for deep linking (iOS + Android)
- Create web fallback page for deep link failures
- Remove password input from login screen
- Implement 30-second rate limiting on email requests
- Add `auth_events` table to Supabase for event tracking
- Test with real email addresses across providers (Gmail, Outlook, Yahoo)
- Test deep linking on real iOS/Android devices

### Post-Launch (Non-blocking)

- Build `/admin/analytics` dashboard showing 3 key metrics
- Monitor error logs and user feedback
- Add CAPTCHA if abuse patterns emerge

