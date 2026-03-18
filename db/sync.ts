import { supabase } from '../lib/supabase';
import { getDb } from './database';

export type SyncResult = {
  success: boolean;
  categoriesCount?: number;
  wordsCount?: number;
  error?: string;
};

// Prevent concurrent syncs (e.g. cold-start + AppState 'active' firing simultaneously)
let syncInProgress = false;

/**
 * Fetch all rows from a Supabase table, paginating in batches of 1000
 * to work around PostgREST's default row limit.
 */
async function fetchAll<T>(table: string, select = '*'): Promise<T[]> {
  const PAGE = 1000;
  const all: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(from, from + PAGE - 1);
    if (error) throw new Error(error.message);
    if (data) all.push(...(data as T[]));
    if (!data || data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

/**
 * Fetches the word library from Supabase and upserts it into local SQLite.
 *
 * Runs on every app startup and every time the app returns to the foreground.
 * If the network is unavailable, returns { success: false } and the app
 * continues with cached local data.
 *
 * Uses a guard flag to skip if a sync is already in progress, preventing
 * the race condition where two concurrent syncs both try to insert the same
 * categories and hit the UNIQUE(name) constraint.
 */
export async function syncLibraryFromSupabase(): Promise<SyncResult> {
  if (syncInProgress) return { success: false, error: 'Sync already in progress' };
  syncInProgress = true;

  try {
    const [categories, subCategories, words] = await Promise.all([
      fetchAll<any>('category'),
      fetchAll<any>('sub_category'),
      fetchAll<any>('word'),
    ]);

    const db = getDb();
    const supabaseWordIds = new Set(words.map((w: any) => w.id));

    db.withTransactionSync(() => {
      // 1. Upsert categories
      // DELETE any stale row with the same name but a different id (old seed data)
      // before upserting, to avoid hitting the UNIQUE(name) constraint.
      for (const cat of categories) {
        db.runSync(
          `DELETE FROM category WHERE name = ? AND id != ?`,
          [cat.name, cat.id]
        );
        db.runSync(
          `INSERT INTO category (id, name, created_at, updated_at)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             updated_at = excluded.updated_at`,
          [cat.id, cat.name, cat.created_at, cat.updated_at]
        );
      }

      // 2. Upsert sub-categories
      // Same DELETE-before-upsert pattern for UNIQUE(name, category_id).
      for (const sc of subCategories) {
        db.runSync(
          `DELETE FROM sub_category WHERE name = ? AND category_id = ? AND id != ?`,
          [sc.name, sc.category_id, sc.id]
        );
        db.runSync(
          `INSERT INTO sub_category (id, name, category_id, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             category_id = excluded.category_id,
             updated_at = excluded.updated_at`,
          [sc.id, sc.name, sc.category_id, sc.created_at, sc.updated_at]
        );
      }

      // 1b. Remove local categories that no longer exist in Supabase
      const supabaseCategoryIds = new Set(categories.map((c: any) => c.id));
      if (supabaseCategoryIds.size > 0) {
        db.runSync(
          `DELETE FROM category WHERE id NOT IN (${[...supabaseCategoryIds].map(() => '?').join(',')})`,
          [...supabaseCategoryIds]
        );
      }

      // 2b. Remove local sub-categories that no longer exist in Supabase
      const supabaseSubCategoryIds = new Set(subCategories.map((sc: any) => sc.id));
      if (supabaseSubCategoryIds.size > 0) {
        db.runSync(
          `DELETE FROM sub_category WHERE id NOT IN (${[...supabaseSubCategoryIds].map(() => '?').join(',')})`,
          [...supabaseSubCategoryIds]
        );
      }

      // 3. Upsert words
      for (const word of words) {
        db.runSync(
          `INSERT INTO word
             (id, spanish_word, english_translation, type, category_id,
              sub_category_id, example_sentence, source, is_active, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
             spanish_word        = excluded.spanish_word,
             english_translation = excluded.english_translation,
             type                = excluded.type,
             category_id         = excluded.category_id,
             sub_category_id     = excluded.sub_category_id,
             example_sentence    = excluded.example_sentence,
             is_active           = excluded.is_active,
             updated_at          = excluded.updated_at`,
          [
            word.id,
            word.spanish_word,
            word.english_translation,
            word.type,
            word.category_id ?? null,
            word.sub_category_id ?? null,
            word.example_sentence,
            word.source,
            word.is_active ? 1 : 0,
            word.created_at,
            word.updated_at,
          ]
        );
      }

      // 4. Deactivate local words that are no longer in Supabase
      //    (e.g. old random-UUID seed words from before Supabase was set up)
      const allLocalActiveWords = db.getAllSync<{ id: string }>(
        'SELECT id FROM word WHERE is_active = 1'
      );
      for (const localWord of allLocalActiveWords) {
        if (!supabaseWordIds.has(localWord.id)) {
          db.runSync('UPDATE word SET is_active = 0 WHERE id = ?', [localWord.id]);
        }
      }

      // Note: user_word suspension for inactive words is now handled
      // server-side in Supabase (user data no longer in local SQLite).
    });

    return {
      success: true,
      categoriesCount: categories.length,
      wordsCount: words.filter((w: any) => w.is_active).length,
    };
  } catch (error) {
    console.warn('[Sync] Failed to sync library from Supabase:', error);
    return { success: false, error: String(error) };
  } finally {
    syncInProgress = false;
  }
}
