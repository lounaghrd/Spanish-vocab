/**
 * Destructive script: clears ALL data from Supabase.
 * Deletes in foreign-key order: review → user_word → word → sub_category → category
 *
 * ⚠️  THIS IS IRREVERSIBLE. All vocabulary and user progress will be lost.
 *
 * Run with:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=sb_secret_... \
 *   npx ts-node --skip-project scripts/clear-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

async function clearTable(table: string) {
  const { error, count } = await supabase
    .from(table)
    .delete({ count: 'exact' })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // matches all rows

  if (error) {
    console.error(`❌ Failed to clear "${table}":`, error.message);
    process.exit(1);
  }
  console.log(`✅ Cleared "${table}" — ${count ?? '?'} rows deleted`);
}

async function main() {
  console.log('⚠️  Clearing all Supabase data...\n');

  // user_word, review, user are local SQLite only — not in Supabase
  await clearTable('word');
  await clearTable('sub_category');
  await clearTable('category');

  console.log('\n✅ Done. Supabase is now empty.');
}

main();
