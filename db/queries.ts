import { getDb } from './database';

// ---------- TYPES ----------

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  last_activity: string;
  created_at: string;
};

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

export type UserWord = {
  id: string;
  word_id: string;
  user_id: string;
  level: number;
  last_reviewed_at: string | null;
  next_review_at: string;
  suspended: number;
  successful_guesses: number;
  failed_guesses: number;
  created_at: string;
};

export type UserWordWithWord = UserWord &
  Word & {
    category_name: string | null;
    sub_category_name: string | null;
  };

export type LibraryWord = Word & {
  category_name: string | null;
  sub_category_name: string | null;
  is_in_list: number; // 1 if already added by user
};

export type ReviewResult = {
  is_success: boolean;
  level: number;
  next_review_at: string;
};

// ---------- USER WORDS ----------

export function getMyWords(userId: string): UserWordWithWord[] {
  const db = getDb();
  return db.getAllSync<UserWordWithWord>(
    `SELECT
      uw.id, uw.word_id, uw.user_id, uw.level, uw.last_reviewed_at,
      uw.next_review_at, uw.suspended, uw.successful_guesses, uw.failed_guesses,
      uw.created_at,
      w.spanish_word, w.english_translation, w.type, w.category_id,
      w.sub_category_id, w.example_sentence,
      w.is_active,
      c.name as category_name,
      sc.name as sub_category_name
    FROM user_word uw
    JOIN word w ON uw.word_id = w.id
    LEFT JOIN category c ON w.category_id = c.id
    LEFT JOIN sub_category sc ON w.sub_category_id = sc.id
    WHERE uw.user_id = ? AND uw.suspended = 0
    ORDER BY uw.next_review_at ASC`,
    [userId]
  );
}

/**
 * Add a word to the user's learning list.
 * - Not yet added → creates a new user_word at level 0, due now.
 * - Previously removed (suspended = true) → re-activates it at level 0.
 * - Already active → no-op, returns existing id.
 * Returns the user_word.id.
 */
export function addWordToUserList(userId: string, wordId: string): string {
  const db = getDb();
  const existing = db.getFirstSync<{ id: string; suspended: number }>(
    `SELECT id, suspended FROM user_word WHERE user_id = ? AND word_id = ?`,
    [userId, wordId]
  );

  if (!existing) {
    const id = generateId();
    db.runSync(
      `INSERT INTO user_word
       (id, word_id, user_id, level, next_review_at, suspended, successful_guesses, failed_guesses)
       VALUES (?, ?, ?, 0, datetime('now'), 0, 0, 0)`,
      [id, wordId, userId]
    );
    return id;
  }

  if (existing.suspended === 1) {
    // Re-add: unsuspend only — preserve level and next_review_at
    db.runSync(
      `UPDATE user_word
       SET suspended = 0, updated_at = datetime('now')
       WHERE id = ?`,
      [existing.id]
    );
  }

  return existing.id;
}

/**
 * Remove a word from the user's learning list (soft-delete via suspension).
 * Returns true on success, false if not found or already removed.
 */
export function removeWordFromUserList(userId: string, wordId: string): boolean {
  const db = getDb();
  const existing = db.getFirstSync<{ id: string; suspended: number }>(
    `SELECT id, suspended FROM user_word WHERE user_id = ? AND word_id = ?`,
    [userId, wordId]
  );

  if (!existing || existing.suspended === 1) return false;

  db.runSync(
    `UPDATE user_word SET suspended = 1, updated_at = datetime('now') WHERE id = ?`,
    [existing.id]
  );
  return true;
}

/**
 * Get all user_word IDs that are due for review now.
 * Ordered oldest-first so the most overdue words appear first.
 */
export function getDueUserWords(userId: string): string[] {
  const db = getDb();
  const rows = db.getAllSync<{ id: string }>(
    `SELECT id FROM user_word
     WHERE user_id = ? AND suspended = 0 AND next_review_at <= datetime('now')
     ORDER BY next_review_at ASC`,
    [userId]
  );
  return rows.map((r) => r.id);
}

/**
 * Submit a review for a word.
 * Normalizes and compares the guess, stores the review record,
 * and updates the user_word's SRS state.
 * Returns { is_success, level, next_review_at }.
 */
export function reviewUserWord(
  userId: string,
  userWordId: string,
  guess: string
): ReviewResult {
  const db = getDb();

  const row = db.getFirstSync<{
    word_id: string;
    level: number;
    suspended: number;
    user_id: string;
    spanish_word: string;
  }>(
    `SELECT uw.word_id, uw.level, uw.suspended, uw.user_id, w.spanish_word
     FROM user_word uw
     JOIN word w ON w.id = uw.word_id
     WHERE uw.id = ?`,
    [userWordId]
  );

  if (!row) throw new Error(`user_word not found: ${userWordId}`);
  if (row.user_id !== userId) throw new Error('Permission denied');
  if (row.suspended === 1) throw new Error('Word is suspended');

  // Normalize and compare
  const is_success = normalizeAnswer(guess) === normalizeAnswer(row.spanish_word);

  // Compute new SRS state
  const newLevel = computeNewLevel(row.level, is_success);
  const nextReviewAt = computeNextReviewAt(newLevel);

  // Insert review record
  const reviewId = generateId();
  db.runSync(
    `INSERT INTO review (id, user_id, word_id, user_word_id, is_success, guess, reviewed_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [reviewId, userId, row.word_id, userWordId, is_success ? 1 : 0, guess]
  );

  // Update user_word
  db.runSync(
    `UPDATE user_word SET
      level = ?,
      last_reviewed_at = datetime('now'),
      next_review_at = ?,
      successful_guesses = successful_guesses + ?,
      failed_guesses = failed_guesses + ?,
      updated_at = datetime('now')
    WHERE id = ?`,
    [newLevel, nextReviewAt, is_success ? 1 : 0, is_success ? 0 : 1, userWordId]
  );

  return { is_success, level: newLevel, next_review_at: nextReviewAt };
}

/**
 * Check whether a word is in the user's list and its current suspension status.
 * Used by the library screen to decide whether to show Add or Remove.
 */
export function getUserWordByWordId(
  userId: string,
  wordId: string
): { exists: boolean; suspended: boolean } {
  const db = getDb();
  const row = db.getFirstSync<{ suspended: number }>(
    `SELECT suspended FROM user_word WHERE user_id = ? AND word_id = ?`,
    [userId, wordId]
  );
  if (!row) return { exists: false, suspended: false };
  return { exists: true, suspended: row.suspended === 1 };
}

// ---------- LIBRARY ----------

export function getLibraryWords(
  userId: string,
  searchQuery?: string,
  categoryId?: string
): LibraryWord[] {
  const db = getDb();
  const params: (string | null)[] = [userId];
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

  return db.getAllSync<LibraryWord>(
    `SELECT
      w.*,
      c.name as category_name,
      sc.name as sub_category_name,
      CASE WHEN uw.id IS NOT NULL AND uw.suspended = 0 THEN 1 ELSE 0 END as is_in_list
    FROM word w
    LEFT JOIN category c ON w.category_id = c.id
    LEFT JOIN sub_category sc ON w.sub_category_id = sc.id
    LEFT JOIN user_word uw ON uw.word_id = w.id AND uw.user_id = ?
    ${whereClause}
    ORDER BY sc.name ASC, w.spanish_word ASC`,
    params
  );
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
       WHERE category_id = ? ORDER BY name ASC`,
      [categoryId]
    );
  }
  return db.getAllSync<SubCategory>(
    `SELECT id, name, category_id FROM sub_category ORDER BY name ASC`
  );
}

// ---------- AUTH ----------

/**
 * Create a new user with an email and hashed password.
 * Throws if the email is already taken (UNIQUE constraint).
 */
export function createUser(email: string, passwordHash: string): User {
  const db = getDb();
  const id = generateId();
  db.runSync(
    `INSERT INTO user (id, first_name, last_name, email, password_hash)
     VALUES (?, ?, ?, ?, ?)`,
    [id, '', '', email.toLowerCase().trim(), passwordHash]
  );
  return getUserById(id)!;
}

/**
 * Find a user by email (case-insensitive).
 * Returns the row including password_hash for comparison during login.
 */
export function getUserByEmail(email: string): (User & { password_hash: string }) | null {
  const db = getDb();
  return (
    db.getFirstSync<User & { password_hash: string }>(
      `SELECT id, first_name, last_name, email, password_hash, last_activity, created_at
       FROM user WHERE LOWER(email) = LOWER(?)`,
      [email.trim()]
    ) ?? null
  );
}

/**
 * Fetch a user by ID. Used to restore a persisted session on app start.
 */
export function getUserById(id: string): User | null {
  const db = getDb();
  return (
    db.getFirstSync<User>(
      `SELECT id, first_name, last_name, email, last_activity, created_at
       FROM user WHERE id = ?`,
      [id]
    ) ?? null
  );
}

// ---------- HELPERS ----------

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

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
 * Correct: level + 1 (capped at 8). Wrong: reset to 1.
 */
export function computeNewLevel(currentLevel: number, isSuccess: boolean): number {
  return isSuccess ? Math.min(currentLevel + 1, 8) : 0;
}

/**
 * Compute next review timestamp from a level.
 * Level 8 = learned — no more repetition.
 */
function computeNextReviewAt(level: number): string {
  if (level === 8) return '9999-12-31 23:59:59';
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
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

export function isWordDueForReview(nextReviewAt: string): boolean {
  if (nextReviewAt === '9999-12-31 23:59:59') return false;
  const now = new Date();
  // Stored timestamps are UTC (from toISOString / SQLite datetime('now')).
  // Appending 'T' + 'Z' forces JS to parse as UTC rather than local time,
  // avoiding an offset equal to the device timezone (e.g. UTC+1 in France).
  const reviewDate = new Date(nextReviewAt.replace(' ', 'T') + 'Z');
  return now >= reviewDate;
}
