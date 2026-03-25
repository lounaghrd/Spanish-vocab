# Españolo — Spanish Vocabulary App

A mobile app to learn Spanish vocabulary using spaced repetition. iOS-first, built with Expo. The user (Louna) is a Product Manager — keep technical explanations simple.

## Stack
- **Expo SDK 54** + React Native + TypeScript
- **expo-router v6** — file-based routing (`app/` directory)
- **expo-sqlite v16** — local SQLite cache for word library (category, sub_category, word)
- **Supabase** — auth (email+password), user data (user_word, review), and word library source
- **Fonts:** Playfair Display Bold (headings) + Lora Medium/Regular (body) via `@expo-google-fonts`
- **SVGs:** Imported as React components via `react-native-svg-transformer`

## Key Files
| File | Purpose |
|------|---------|
| `app/_layout.tsx` | Root layout: DB init, font load, Supabase sync, auth guard |
| `app/index.tsx` | My Words screen (home, SRS review) |
| `app/library.tsx` | Library screen (browse & add words) |
| `app/login.tsx` | Login/signup screen |
| `context/AuthContext.tsx` | Auth provider (Supabase Auth, session via AsyncStorage) |
| `db/database.ts` | SQLite schema for library cache + migrations |
| `db/queries.ts` | Supabase queries (user data, async) + SQLite queries (library, sync) + SRS logic |
| `db/sync.ts` | Supabase → SQLite sync for word library (upsert pattern) |
| `lib/supabase.ts` | Supabase client config (with session persistence) |
| `supabase-migration.sql` | SQL to create user_word, review, user_profile tables + RLS |
| `constants/theme.ts` | Colors, fonts, spacing from Figma |
| `components/WordModal.tsx` | Review modal (view / guess / result modes) |
| `components/WordCard.tsx` | Word row in My Words list |
| `components/LibraryWordItem.tsx` | Library row with add/remove checkbox |
| `components/ProgressBar.tsx` | SRS level progress bar (0–8) |
| `components/icons.tsx` | Custom SVG icon components |

## Design System
- Background: `#F1E1D6` (warm beige) — Secondary: `#F6EDE5`
- Accent: `#F26641` (orange) — Hover: `#D4522E` — Disabled: `#F7B8A0`
- Text Primary: `#191919` — Secondary: `#655F58` — Inverted: `#FFFFFF`
- Success: `#36B911` — Error: `#D4183D` — Outline: `#262626`
- Fonts: Playfair Display 700 (h1–h3), Lora 500 (body large/buttons), Lora 400 (body/small)

## Database Schema

**Local SQLite (library cache, synced from Supabase on startup):**
- `category` / `sub_category` — word categories
- `word` — vocabulary library (spanish_word, english_translation, type, example_sentence)

**Supabase (user data, with Row Level Security):**
- `auth.users` — Supabase Auth (email + password)
- `user_profile` — first_name, last_name (auto-created on signup via trigger)
- `user_word` — SRS tracking per user/word (level 0–8, suspended flag)
- `review` — audit log of every review attempt

## SRS Logic
Levels 0–8. Correct → level+1 (max 8). Wrong → reset to 0.
Intervals: L0=now, L1=1hr, L2=1d, L3=2d, L4=4d, L5=7d, L6=14d, L7=30d, L8=learned (9999-12-31).
Answer normalization: lowercase → strip diacriticals → strip punctuation → collapse spaces.

## Auth
Supabase Auth (email + password). Session persisted in AsyncStorage via Supabase client.
Password rules (enforced client-side): ≥8 chars, ≥1 digit, ≥1 special char.
RLS policies ensure users can only access their own user_word and review rows.

## SVG Import Pattern
```tsx
import LogoEspanolo from '../assets/logo-espanolo.svg'
<LogoEspanolo width={130} height={28} />
// Requires metro.config.js SVG transformer + declarations.d.ts at root
```

## Admin Back Office
The `admin/` folder is a separate Next.js app deployed on Vercel.
- **Live URL:** https://espanolo-admin.vercel.app/categories
- **Deploy:** Push changes to the `admin/` folder and deploy via Vercel (connected to this repo). No separate build step needed — Vercel handles it automatically.

## How to Run (Mobile App)
```bash
cd "/Users/lounaguichard/Documents/spanish_project/spanish claude"
npx expo start --tunnel --clear   # ⚠️ must use --tunnel --clear, then scan QR with Expo Go
```

## Links
- Figma screens: https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=76-761
- Figma design system: https://www.figma.com/design/3dHMRP2tvCfK6TvthRhAIa/Spanish-vocabulary-app?node-id=108-300
- Data model: https://www.notion.so/30f43af5ebf18059b329f72ed42f2264
- Spaced repetition: https://www.notion.so/30f43af5ebf1801d90acfb6b136a8013
