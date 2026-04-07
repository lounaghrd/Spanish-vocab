# PRD: Surprise me — propose a random new word in the Library

## Problem Statement

When a user wants to discover and add a new word to their learning list, they currently have to browse by category or search for a specific word. There is no way to get a quick, effortless word suggestion — the user must already have something in mind. This creates friction for users who want to expand their vocabulary without knowing where to start.

## Solution

Add a "Surprise me" card to the Library screen's main browse view. When tapped, it randomly picks a word the user hasn't added yet and opens the existing word modal, letting them add it to their list or mark it as already learned. A separator line ("or browse by category") visually separates this action from the category grid below.

## User Stories

1. As a learner, I want to be surprised with a random new word, so that I can discover vocabulary without having to browse manually.
2. As a learner, I want the "Surprise me" card to be visually prominent on the Library screen, so that I notice it as a quick entry point.
3. As a learner, I want the proposed word to be one I haven't added yet, so that I'm always shown something genuinely new.
4. As a learner, I want to see the word's Spanish text, English translation, and example sentence when a word is proposed, so that I can decide whether to add it.
5. As a learner, I want to add a proposed word to my learning list directly from the proposal modal, so that I don't have to navigate elsewhere.
6. As a learner, I want to mark a proposed word as already learned directly from the proposal modal, so that I can quickly log vocabulary I already know.
7. As a learner, I want to dismiss a proposed word without any action, so that I can choose not to add it.
8. As a learner, I want to see a clear visual separator between the "Surprise me" card and the category grid, so that I understand these are two distinct ways to discover words.
9. As a learner, I want the "Surprise me" option to only appear on the main category browse view, so that the UI stays uncluttered when I'm browsing inside a specific category.
10. As a learner, I want the "Surprise me" card to disappear gracefully if I've already added every available word, so that the app doesn't break or confuse me.
11. As a learner, I want the "Surprise me" card to disappear when I'm actively searching, so that the search results aren't cluttered with unrelated UI.

## Implementation Decisions

### Modules to build or modify

**New query — random eligible word picker**
- Add a `getRandomEligibleWord(userId)` function to the database query layer.
- "Eligible" means: the word is active in the library AND the user has never added it (not present in their user_word table, or present but suspended).
- The word is selected with true randomness — no weighting by category, difficulty, or any other factor.
- Returns a single word object (same shape as existing library word queries) or `null` if none are available.

**New icon — shuffle/random**
- Add an `IconShuffle` SVG icon to the icon component library, matching the app's existing thin-stroke Figma icon style.
- This icon represents a random/shuffle action (two crossing arrows).

**WordModal — new library variant**
- Add a `context` prop to WordModal (values: `"review"` | `"library"`).
- When `context="library"`, the modal shows the word details (Spanish, English, type, example sentence) and renders two action buttons: "Add to my words" and "Mark as already learned", instead of the guess/review UI.
- When `context="review"` (default, existing behaviour), the modal behaves exactly as today — no changes to the review flow.
- The `onStartLearning` and `onMarkAsLearned` callbacks are passed into the modal only when `context="library"`.

**Library screen UI changes**
- In the main browse view (category grid), prepend:
  1. A full-width "Surprise me" card, visually matching the existing CategoryCard style (same border, height, font, pressed state).
  2. A small separator text ("or browse by category") below the card.
- The "Surprise me" card and separator are hidden when:
  - The user is inside a category or subcategory page.
  - The search bar is active (has text).
  - No eligible words remain (replaced by a short inline message, e.g. "You've added all available words!").
- On tap, call `getRandomEligibleWord()` and open the WordModal with `context="library"` and the returned word.
- After the user acts (adds or marks as learned), close the modal and update the local `userWordMap` optimistically, same pattern as existing Library actions.

### Architectural decisions
- The random word selection happens at query time (SQLite), not in the UI layer. The UI simply passes the result to the WordModal.
- The eligible word check reuses the same `userWordMap` already loaded on the Library screen — no extra Supabase round-trip needed.
- The "Surprise me" card is rendered inline via the FlatList's `ListHeaderComponent`, not as a floating overlay.
- The WordModal `context` prop is additive — existing call sites pass no `context` and get the current review behaviour unchanged.

## Testing Decisions

Good tests for this feature test external behavior (what the user sees and what data is returned), not implementation details (how the query is written internally).

**What to test:**

- `getRandomEligibleWord()` query:
  - Returns `null` when the user has added all active words.
  - Returns a word when eligible words exist.
  - Never returns a word the user has already added (non-suspended).
  - Never returns an inactive (`is_active = 0`) word.

- Library screen UI:
  - "Surprise me" card is visible on the main browse view when eligible words exist.
  - "Surprise me" card is hidden when inside a category page.
  - "Surprise me" card is hidden when the search bar has text.
  - Inline message is shown when no eligible words remain.
  - Tapping the card opens the WordModal.

## Out of Scope

- Weighted or smart randomness (e.g. bias towards basic words, unexplored categories, or user level). This is a noted future enhancement.
- "Surprise me" inside a specific category page (may be considered in a future iteration).
- Any changes to the My Words screen — the feature lives entirely in the Library.
- Changes to the SRS algorithm or review flow.

## Further Notes

- In a future iteration, words could be indexed by difficulty (basic → advanced) and the random pick could be weighted to prefer words appropriate for the user's current level.
- The "Surprise me" card should match the CategoryCard visual style exactly so it feels native to the screen, not like an add-on.
