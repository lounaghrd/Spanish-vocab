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

  database.execSync(`
    CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT,
      last_activity TEXT NOT NULL DEFAULT (datetime('now')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS user_word (
      id TEXT PRIMARY KEY NOT NULL,
      word_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      level INTEGER NOT NULL DEFAULT 0 CHECK(level >= 0 AND level <= 8),
      last_reviewed_at TEXT,
      next_review_at TEXT NOT NULL DEFAULT (datetime('now')),
      suspended INTEGER NOT NULL DEFAULT 0,
      successful_guesses INTEGER NOT NULL DEFAULT 0,
      failed_guesses INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (word_id) REFERENCES word(id),
      FOREIGN KEY (user_id) REFERENCES user(id)
    );
  `);

  database.execSync(`
    CREATE TABLE IF NOT EXISTS review (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      word_id TEXT NOT NULL,
      user_word_id TEXT NOT NULL,
      reviewed_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_success INTEGER NOT NULL,
      guess TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (user_id) REFERENCES user(id),
      FOREIGN KEY (word_id) REFERENCES word(id),
      FOREIGN KEY (user_word_id) REFERENCES user_word(id)
    );
  `);

  // Idempotent column migrations — run on every startup, fail silently if column already exists.
  // NOTE: SQLite does not support UNIQUE in ALTER TABLE ADD COLUMN; uniqueness is enforced
  // at the application layer (signup checks for existing email before inserting).
  try {
    database.execSync(`ALTER TABLE review ADD COLUMN guess TEXT NOT NULL DEFAULT ''`);
  } catch (_) { /* already exists */ }
  try {
    database.execSync(`ALTER TABLE user ADD COLUMN email TEXT`);
  } catch (_) { /* already exists */ }
  try {
    database.execSync(`ALTER TABLE user ADD COLUMN password_hash TEXT`);
  } catch (_) { /* already exists */ }

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
      // Old seed IDs conflict with Supabase IDs on the UNIQUE(name) constraint
      database.execSync(`DELETE FROM review`);
      database.execSync(`DELETE FROM user_word`);
      database.execSync(`DELETE FROM word`);
      database.execSync(`DELETE FROM sub_category`);
      database.execSync(`DELETE FROM category`);
      database.execSync(`PRAGMA user_version = 3`);
    }
  } catch (_) {
    // Version check failed — continue normally
  }
}
