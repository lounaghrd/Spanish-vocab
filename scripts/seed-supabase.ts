/**
 * Migration script: seeds Supabase from the Notion CSV export.
 *
 * Reads 3,897 words from the CSV and upserts categories, sub-categories,
 * and words into Supabase. Uses deterministic UUIDs so running it multiple
 * times is safe (idempotent upserts).
 *
 * Run with:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=sb_secret_... \
 *   npx ts-node --skip-project scripts/seed-supabase.ts
 *
 * Add --dry-run to preview without writing to Supabase:
 *   npx ts-node --skip-project scripts/seed-supabase.ts --dry-run
 */

import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─── Config ──────────────────────────────────────────────────────────────────

const DRY_RUN = process.argv.includes('--dry-run');

// CSV is in the parent directory of the project
const CSV_PATH = resolve(
  process.cwd(),
  '../ExportBlock-5a5c935f-7d91-4f53-9fec-a1787e454d09-Part-1',
  'Spanish vocabulary database 31f43af5ebf180b29d51d209b1d63cbf.csv'
);

if (!DRY_RUN) {
  const SUPABASE_URL = process.env.SUPABASE_URL!;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables.');
    console.error('Tip: add --dry-run to preview without Supabase credentials.');
    process.exit(1);
  }
}

const supabase = DRY_RUN
  ? null
  : createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });

// ─── Deterministic UUID from content ─────────────────────────────────────────

function deterministicUUID(namespace: string, content: string): string {
  const hash = createHash('sha256')
    .update(`${namespace}:${content}`)
    .digest('hex');
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    '4' + hash.slice(13, 16),
    (((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) +
      hash.slice(18, 20)),
    hash.slice(20, 32),
  ].join('-');
}

// ─── CSV Parser (no external dependencies) ───────────────────────────────────

function parseCSV(filePath: string): Record<string, string>[] {
  const raw = readFileSync(filePath, 'utf-8');
  // Remove BOM if present
  const content = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
  const lines = content.split('\n');
  if (lines.length < 2) throw new Error('CSV file is empty or has no data rows');

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h.trim()] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no data will be written\n' : '🚀 Seeding Supabase from CSV…\n');

  // 1. Read CSV
  console.log(`Reading CSV: ${CSV_PATH}`);
  const csvRows = parseCSV(CSV_PATH);
  console.log(`  → ${csvRows.length} rows loaded\n`);

  // 2. Extract unique categories
  const categoryNames = [...new Set(
    csvRows.map(r => r['Category']).filter(Boolean)
  )].sort();

  const categories = categoryNames.map(name => ({
    id: deterministicUUID('category', name),
    name,
  }));
  const catIdByName = new Map(categories.map(c => [c.name, c.id]));

  console.log(`Categories: ${categories.length}`);

  // 3. Extract unique sub-categories (scoped to their category)
  const subCatKeys = new Set<string>();
  const subCategoryDefs: { name: string; catName: string }[] = [];

  for (const row of csvRows) {
    const cat = row['Category'];
    const sub = row['Sub-category'];
    if (!cat || !sub) continue;
    const key = `${cat}::${sub}`;
    if (!subCatKeys.has(key)) {
      subCatKeys.add(key);
      subCategoryDefs.push({ name: sub, catName: cat });
    }
  }

  const subCategories = subCategoryDefs.map(sc => ({
    id: deterministicUUID('subcategory', `${sc.catName}:${sc.name}`),
    name: sc.name,
    category_id: catIdByName.get(sc.catName)!,
  }));

  // Build lookup: "categoryId:subName" → subId
  const subcatIdByKey = new Map(
    subCategories.map(sc => [`${sc.category_id}:${sc.name}`, sc.id])
  );

  console.log(`Sub-categories: ${subCategories.length}`);

  // 4. Build words
  const validTypes = new Set(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection']);
  const skipped: string[] = [];

  const words = csvRows
    .filter(row => {
      const sp = row['Spanish word'];
      const en = row['English translation'];
      if (!sp || !en) {
        skipped.push(`Empty spanish/english: "${sp}" / "${en}"`);
        return false;
      }
      return true;
    })
    .map(row => {
      const spanish = row['Spanish word'];
      const english = row['English translation'];
      const rawType = (row['Word type'] || 'noun').toLowerCase();
      const type = validTypes.has(rawType) ? rawType : 'noun';
      const catName = row['Category'];
      const subName = row['Sub-category'];
      const categoryId = catName ? (catIdByName.get(catName) ?? null) : null;
      const subcatKey = categoryId && subName ? `${categoryId}:${subName}` : null;
      const subCategoryId = subcatKey ? (subcatIdByKey.get(subcatKey) ?? null) : null;

      if (rawType && !validTypes.has(rawType)) {
        skipped.push(`Unknown word type "${rawType}" for "${spanish}" — defaulting to "noun"`);
      }

      return {
        id: deterministicUUID('word', `${spanish}|${english}`),
        spanish_word: spanish,
        english_translation: english,
        type,
        category_id: categoryId,
        sub_category_id: subCategoryId,
        example_sentence: row['Example sentence'] || '',
        source: 'csv' as const,
        is_active: true,
      };
    });

  console.log(`Words: ${words.length}`);

  if (skipped.length > 0) {
    console.log(`\n⚠️  Warnings (${skipped.length}):`);
    skipped.forEach(s => console.log(`  - ${s}`));
  }

  // 5. Check for duplicate IDs (should not happen with deterministic UUIDs)
  const wordIds = new Set<string>();
  const dupeIds: string[] = [];
  for (const w of words) {
    if (wordIds.has(w.id)) dupeIds.push(`${w.spanish_word} | ${w.english_translation}`);
    wordIds.add(w.id);
  }
  if (dupeIds.length > 0) {
    console.error(`\n❌ Duplicate UUIDs detected (${dupeIds.length}):`);
    dupeIds.forEach(d => console.error(`  - ${d}`));
    process.exit(1);
  }

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log('\n── Summary ──────────────────────────────────────────────');
  console.log(`  Categories:     ${categories.length}`);
  console.log(`  Sub-categories: ${subCategories.length}`);
  console.log(`  Words:          ${words.length}`);
  console.log('────────────────────────────────────────────────────────\n');

  if (DRY_RUN) {
    // Print a sample of 5 words for verification
    console.log('Sample words (first 5):');
    words.slice(0, 5).forEach(w => {
      const catName = categories.find(c => c.id === w.category_id)?.name ?? '—';
      const subName = subCategories.find(s => s.id === w.sub_category_id)?.name ?? '—';
      console.log(`  "${w.spanish_word}" → "${w.english_translation}" [${w.type}] (${catName} > ${subName})`);
    });
    console.log('\n✅ Dry run complete. Remove --dry-run to write to Supabase.');
    return;
  }

  // ─── Upsert to Supabase ────────────────────────────────────────────────────

  // 6. Upsert categories
  const { error: catError } = await supabase!
    .from('category')
    .upsert(categories, { onConflict: 'id' });
  if (catError) {
    console.error('❌ Category error:', catError.message);
    process.exit(1);
  }
  console.log(`✓ ${categories.length} categories upserted`);

  // 7. Upsert sub-categories (batches of 100)
  const SUB_BATCH = 100;
  for (let i = 0; i < subCategories.length; i += SUB_BATCH) {
    const batch = subCategories.slice(i, i + SUB_BATCH);
    const { error } = await supabase!
      .from('sub_category')
      .upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error('❌ Sub-category error:', error.message);
      process.exit(1);
    }
  }
  console.log(`✓ ${subCategories.length} sub-categories upserted`);

  // 8. Upsert words (batches of 200)
  const WORD_BATCH = 200;
  for (let i = 0; i < words.length; i += WORD_BATCH) {
    const batch = words.slice(i, i + WORD_BATCH);
    const { error } = await supabase!
      .from('word')
      .upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`❌ Word error (batch ${Math.floor(i / WORD_BATCH) + 1}):`, error.message);
      process.exit(1);
    }
    console.log(`  ✓ batch ${Math.floor(i / WORD_BATCH) + 1}/${Math.ceil(words.length / WORD_BATCH)} (${batch.length} words)`);
  }
  console.log(`✓ ${words.length} words upserted`);

  console.log('\n🎉 Done! Open your Supabase dashboard to verify the data.');
}

seed().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
