import { getDb } from './database';
import { supabase } from '../lib/supabase';

// ---------- TYPES ----------

export type Word = {
  id: string;
  spanish_word: string;
  english_translation: string;
  type: string;
  category_id: string | null;
  sub_category_id: string | null;
  example_sentence: string;
  is_active: number;
};

export type Category = {
  id: string;
  name: string;
};

export type SubCategory = {
  id: string;
  name: string;
  category_id: string;
};

export type UserWordWithWord = {
  id: string;
  word_id: string;
  user_id: string;
  level: number;
  last_reviewed_at: string | null;
  next_review_at: string;
  suspended: boolean;
  marked_as_learned: boolean;
  successful_guesses: number;
  failed_guesses: number;
  created_at: string;
  spanish_word: string;
  english_translation: string;
  type: string;
  category_id: string | null;
  sub_category_id: string | null;
  example_sentence: string;
  is_active: number;
  category_name: string | null;
  sub_category_name: string | null;
};

export type WordVariant = 'to_add' | 'in_progress' | 'learned';

export type UserWordInfo = {
  level: number;
  suspended: boolean;
  marked_as_learned: boolean;
};

export type LibraryWord = Word & {
  category_name: string | null;
  sub_category_name: string | null;
  is_in_list: number; // 1 if not 'to_add'
  variant: WordVariant;
  level: number; // SRS level for progress bar
};

export type ReviewResult = {
  is_success: boolean;
  level: number;
  next_review_at: string;
};

// ---------- USER WORDS (Supabase) ----------

export async function getMyWords(userId: string): Promise<UserWordWithWord[]> {
  const { data, error } = await supabase
    .from('user_word')
    .select(`
      id, word_id, user_id, level, last_reviewed_at, next_review_at,
      suspended, marked_as_learned, successful_guesses, failed_guesses, created_at,
      word:word_id (
        spanish_word, english_translation, type, category_id,
        sub_category_id, example_sentence, is_active,
        category:category_id ( name ),
        sub_category:sub_category_id ( name )
      )
    `)
    .eq('user_id', userId)
    .eq('suspended', false)
    .eq('marked_as_learned', false)
    .order('next_review_at', { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    id: row.id,
    word_id: row.word_id,
    user_id: row.user_id,
    level: row.level,
    last_reviewed_at: row.last_reviewed_at,
    next_review_at: row.next_review_at,
    suspended: row.suspended,
    marked_as_learned: row.marked_as_learned,
    successful_guesses: row.successful_guesses,
    failed_guesses: row.failed_guesses,
    created_at: row.created_at,
    spanish_word: row.word?.spanish_word ?? '',
    english_translation: row.word?.english_translation ?? '',
    type: row.word?.type ?? '',
    category_id: row.word?.category_id ?? null,
    sub_category_id: row.word?.sub_category_id ?? null,
    example_sentence: row.word?.example_sentence ?? '',
    is_active: row.word?.is_active ?? 1,
    category_name: row.word?.category?.name ?? null,
    sub_category_name: row.word?.sub_category?.name ?? null,
  }));
}

/**
 * Add a word to the user's learning list.
 * Uses Supabase upsert with the UNIQUE(user_id, word_id) constraint.
 * - Not yet added → creates a new user_word at level 0, due now.
 * - Previously removed (suspended = true) → re-activates it, preserving progress.
 * - Already active → no-op.
 */
export async function addWordToUserList(userId: string, wordId: string): Promise<void> {
  // Check if a row already exists
  const { data: existing } = await supabase
    .from('user_word')
    .select('id, suspended')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .maybeSingle();

  if (!existing) {
    // New: insert
    const { error } = await supabase.from('user_word').insert({
      word_id: wordId,
      user_id: userId,
      level: 0,
      next_review_at: new Date().toISOString(),
      suspended: false,
      successful_guesses: 0,
      failed_guesses: 0,
    });
    if (error) throw new Error(error.message);
  } else if (existing.suspended) {
    // Re-add: unsuspend and clear marked_as_learned — preserve level and next_review_at
    const { error } = await supabase
      .from('user_word')
      .update({ suspended: false, marked_as_learned: false, updated_at: new Date().toISOString() })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  }
  // Already active → no-op
}

/**
 * Remove a word from the user's learning list (soft-delete via suspension).
 * Also clears marked_as_learned (covers "Learned → To add" transition).
 */
export async function removeWordFromUserList(userId: string, wordId: string): Promise<void> {
  const { error } = await supabase
    .from('user_word')
    .update({
      suspended: true,
      marked_as_learned: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('word_id', wordId);
  if (error) throw new Error(error.message);
}

/**
 * Mark a word as learned (user already knows it, skip SRS).
 * Uses upsert pattern: insert if new, update if existing.
 */
export async function markWordAsLearned(userId: string, wordId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('user_word')
    .select('id')
    .eq('user_id', userId)
    .eq('word_id', wordId)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from('user_word').insert({
      word_id: wordId,
      user_id: userId,
      level: 0,
      next_review_at: '9999-12-31T23:59:59.000Z',
      suspended: false,
      marked_as_learned: true,
      successful_guesses: 0,
      failed_guesses: 0,
    });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from('user_word')
      .update({
        suspended: false,
        marked_as_learned: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
  }
}

/**
 * Submit a review for a word.
 * Normalizes and compares the guess, stores the review record,
 * and updates the user_word's SRS state.
 */
export async function reviewUserWord(
  userId: string,
  userWordId: string,
  guess: string
): Promise<ReviewResult> {
  // Fetch user_word + word data
  const { data: row, error: fetchError } = await supabase
    .from('user_word')
    .select(`
      id, word_id, level, suspended, user_id,
      successful_guesses, failed_guesses,
      word:word_id ( spanish_word )
    `)
    .eq('id', userWordId)
    .single();

  if (fetchError || !row) throw new Error(`user_word not found: ${userWordId}`);
  if (row.user_id !== userId) throw new Error('Permission denied');
  if (row.suspended) throw new Error('Word is suspended');

  const spanishWord = (row as any).word?.spanish_word ?? '';

  // Normalize and compare
  const is_success = normalizeAnswer(guess) === normalizeAnswer(spanishWord);

  // Compute new SRS state
  const newLevel = computeNewLevel(row.level, is_success);
  const nextReviewAt = computeNextReviewAtISO(newLevel);
  const now = new Date().toISOString();

  // Insert review record
  const { error: reviewError } = await supabase.from('review').insert({
    user_id: userId,
    word_id: row.word_id,
    user_word_id: userWordId,
    is_success,
    guess,
    reviewed_at: now,
  });
  if (reviewError) throw new Error(reviewError.message);

  // Update user_word
  const { error: updateError } = await supabase
    .from('user_word')
    .update({
      level: newLevel,
      last_reviewed_at: now,
      next_review_at: nextReviewAt,
      successful_guesses: (row as any).successful_guesses + (is_success ? 1 : 0),
      failed_guesses: (row as any).failed_guesses + (is_success ? 0 : 1),
      updated_at: now,
    })
    .eq('id', userWordId);
  if (updateError) throw new Error(updateError.message);

  return { is_success, level: newLevel, next_review_at: nextReviewAt };
}

/**
 * Fetch per-word metadata for all of the user's words (including suspended).
 * Used by the library screen to compute the card variant.
 */
export async function getUserWordMap(userId: string): Promise<Map<string, UserWordInfo>> {
  const { data, error } = await supabase
    .from('user_word')
    .select('word_id, level, suspended, marked_as_learned')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  const map = new Map<string, UserWordInfo>();
  for (const row of data ?? []) {
    map.set(row.word_id, {
      level: row.level,
      suspended: row.suspended,
      marked_as_learned: row.marked_as_learned,
    });
  }
  return map;
}

// ---------- LIBRARY (Local SQLite) ----------

/**
 * Get library words from local SQLite.
 * Variant and level are computed using the userWordMap fetched from Supabase.
 */
export function getLibraryWords(
  userWordMap: Map<string, UserWordInfo>,
  searchQuery?: string,
  categoryId?: string
): LibraryWord[] {
  const db = getDb();
  const params: (string | null)[] = [];
  let whereClause = 'WHERE w.is_active = 1';

  if (searchQuery && searchQuery.trim().length > 0) {
    whereClause += ` AND (
      LOWER(w.spanish_word) LIKE LOWER(?) OR
      LOWER(w.english_translation) LIKE LOWER(?)
    )`;
    const q = `%${searchQuery.trim()}%`;
    params.push(q, q);
  }

  if (categoryId) {
    whereClause += ` AND w.category_id = ?`;
    params.push(categoryId);
  }

  const rows = db.getAllSync<Omit<LibraryWord, 'is_in_list'>>(
    `SELECT
      w.*,
      c.name as category_name,
      sc.name as sub_category_name
    FROM word w
    LEFT JOIN category c ON w.category_id = c.id
    LEFT JOIN sub_category sc ON w.sub_category_id = sc.id
    ${whereClause}
    ORDER BY sc.name ASC, w.spanish_word ASC`,
    params
  );

  return rows.map((row) => {
    const info = userWordMap.get(row.id);
    let variant: WordVariant = 'to_add';
    let level = 0;

    if (info) {
      if (info.suspended) {
        variant = 'to_add';
      } else if (info.marked_as_learned) {
        variant = 'learned';
      } else if (info.level === 8) {
        variant = 'learned';
      } else {
        variant = 'in_progress';
      }
      level = info.level;
    }

    return {
      ...row,
      is_in_list: variant !== 'to_add' ? 1 : 0,
      variant,
      level,
    };
  });
}

export function getCategories(): Category[] {
  const db = getDb();
  return db.getAllSync<Category>(
    `SELECT DISTINCT c.id, c.name FROM category c
     JOIN word w ON w.category_id = c.id
     WHERE w.is_active = 1
     ORDER BY c.name ASC`
  );
}

export function getSubCategories(categoryId?: string): SubCategory[] {
  const db = getDb();
  if (categoryId) {
    return db.getAllSync<SubCategory>(
      `SELECT id, name, category_id FROM sub_category
       WHERE category_id = ? ORDER BY CASE WHEN name = 'Other' THEN 1 ELSE 0 END, name ASC`,
      [categoryId]
    );
  }
  return db.getAllSync<SubCategory>(
    `SELECT id, name, category_id FROM sub_category ORDER BY CASE WHEN name = 'Other' THEN 1 ELSE 0 END, name ASC`
  );
}

// ---------- HELPERS ----------

/**
 * Normalize a string for answer comparison:
 * lowercase → strip accents (á→a, ñ→n, etc.) → strip punctuation → collapse spaces → trim
 */
export function normalizeAnswer(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritical marks
    .replace(/[.,;:"""''!?¿¡\-]/g, '') // remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compute new SRS level after a review.
 * Correct: level + 1 (capped at 8). Wrong: reset to 0.
 */
export function computeNewLevel(currentLevel: number, isSuccess: boolean): number {
  return isSuccess ? Math.min(currentLevel + 1, 8) : 0;
}

/**
 * Compute next review timestamp as ISO string.
 * Level 8 = learned — no more repetition.
 */
function computeNextReviewAtISO(level: number): string {
  if (level === 8) return '9999-12-31T23:59:59.000Z';
  const now = new Date();
  const intervals: Record<number, number> = {
    0: 0,       // Now
    1: 60,      // 1 hour
    2: 1440,    // 1 day
    3: 2880,    // 2 days
    4: 5760,    // 4 days
    5: 10080,   // 7 days
    6: 20160,   // 14 days
    7: 43200,   // 30 days
  };
  const minutes = intervals[level] ?? 0;
  now.setMinutes(now.getMinutes() + minutes);
  return now.toISOString();
}

export function isWordDueForReview(nextReviewAt: string): boolean {
  if (nextReviewAt.startsWith('9999')) return false;
  const now = new Date();
  const reviewDate = new Date(nextReviewAt);
  return now >= reviewDate;
}
