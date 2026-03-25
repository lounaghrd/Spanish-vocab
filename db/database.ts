import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('spanish_vocab.db');
  }
  return db;
}

export function initDatabase(): void {
  const database = getDb();

  database.execSync(`PRAGMA journal_mode = WAL;`);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS category (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS sub_category (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(name, category_id),
      FOREIGN KEY (category_id) REFERENCES category(id)
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS word (
      id TEXT PRIMARY KEY NOT NULL,
      spanish_word TEXT NOT NULL,
      english_translation TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('noun','verb','adjective','adverb','preposition','conjunction','interjection')),
      category_id TEXT,
      sub_category_id TEXT,
      example_sentence TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL DEFAULT 'manual' CHECK(source IN ('manual','csv')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES category(id),
      FOREIGN KEY (sub_category_id) REFERENCES sub_category(id)
    );
  `);

  // Version check: run one-time data migrations
  try {
    const versionRow = database.getFirstSync<{ user_version: number }>('PRAGMA user_version');
    const currentVersion = versionRow?.user_version ?? 0;

    if (currentVersion < 1) {
      // v0→v1: wipe duplicate-word data from old app versions
      database.execSync(`DELETE FROM review`);
      database.execSync(`DELETE FROM user_word`);
      database.execSync(`DELETE FROM word`);
      database.execSync(`DELETE FROM sub_category`);
      database.execSync(`DELETE FROM category`);
      database.execSync(`PRAGMA user_version = 1`);
    }

    if (currentVersion < 2) {
      // v1→v2: wipe hardcoded "Me User" — email/password_hash columns added above
      database.execSync(`DELETE FROM review`);
      database.execSync(`DELETE FROM user_word`);
      database.execSync(`DELETE FROM user`);
      database.execSync(`PRAGMA user_version = 2`);
    }

    if (currentVersion < 3) {
      // v2→v3: clear local library so Supabase sync can take over
      database.execSync(`DELETE FROM review`);
      database.execSync(`DELETE FROM user_word`);
      database.execSync(`DELETE FROM word`);
      database.execSync(`DELETE FROM sub_category`);
      database.execSync(`DELETE FROM category`);
      database.execSync(`PRAGMA user_version = 3`);
    }

    if (currentVersion < 4) {
      // v3→v4: user data moved to Supabase — drop local user tables
      database.execSync(`DROP TABLE IF EXISTS review`);
      database.execSync(`DROP TABLE IF EXISTS user_word`);
      database.execSync(`DROP TABLE IF EXISTS user`);
      database.execSync(`PRAGMA user_version = 4`);
    }
  } catch (_) {
    // Version check failed — continue normally
  }
}
