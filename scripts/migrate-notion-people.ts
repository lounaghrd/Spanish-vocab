/**
 * Migrates all words from a Notion CSV export into Supabase.
 *
 * Run with:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=sb_secret_... \
 *   npx ts-node --skip-project scripts/migrate-notion-people.ts <path-to-csv>
 */

import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables.');
  process.exit(1);
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const csvPathArg = args.find(a => a !== '--dry-run');
if (!csvPathArg) {
  console.error(
    'Usage: npx ts-node --skip-project scripts/migrate-notion-people.ts <path-to-csv> [--dry-run]'
  );
  process.exit(1);
}
const csvPath: string = csvPathArg;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
});

// ─── CSV Parser ──────────────────────────────────────────────────────────────

function parseCSV(content: string): Record<string, string>[] {
  // Split into logical lines (handles newlines inside quoted fields)
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      if (inQuotes && content[i + 1] === '"') {
        current += '""'; // escaped quote — keep both so splitLine sees them
        i++;
      } else {
        inQuotes = !inQuotes;
        current += '"'; // keep the delimiter so splitLine can parse quoted fields
      }
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
    } else if (ch === '\r') {
      // skip \r
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current);

  const splitLine = (line: string): string[] => {
    const fields: string[] = [];
    let field = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { field += '"'; i++; }
        else { inQ = !inQ; }
      } else if (ch === ',' && !inQ) {
        fields.push(field);
        field = '';
      } else {
        field += ch;
      }
    }
    fields.push(field);
    return fields;
  };

  if (lines.length === 0) return [];
  const headers = splitLine(lines[0]);

  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h.trim()] = (values[i] ?? '').trim(); });
    return row;
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────

const VALID_TYPES = new Set([
  'noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection',
]);

async function migrate() {
  if (dryRun) console.log('🔍 DRY RUN — no data will be inserted\n');
  console.log(`Reading CSV: ${path.resolve(csvPath)}\n`);
  const content = fs.readFileSync(path.resolve(csvPath), 'utf-8');
  const rows = parseCSV(content);
  console.log(`Total rows in CSV: ${rows.length}`);

  // ── Load lookup data from Supabase ──────────────────────────────────────
  const { data: categories, error: catErr } = await supabase
    .from('category')
    .select('id, name');
  if (catErr) { console.error('Failed to load categories:', catErr.message); process.exit(1); }

  const catMap = new Map<string, string>(); // lowercased name → id
  for (const c of categories!) catMap.set(c.name.trim().toLowerCase(), c.id);
  console.log(`Categories loaded: ${catMap.size}`);

  const { data: subCats, error: subErr } = await supabase
    .from('sub_category')
    .select('id, name, category_id');
  if (subErr) { console.error('Failed to load sub-categories:', subErr.message); process.exit(1); }

  const subcatMap = new Map<string, string>(); // `catId::lowercased-subcatName` → id
  for (const s of subCats!) {
    subcatMap.set(`${s.category_id}::${s.name.trim().toLowerCase()}`, s.id);
  }
  console.log(`Sub-categories loaded: ${subcatMap.size}`);

  // Load all existing spanish_words for O(1) duplicate check
  const { data: existing, error: existErr } = await supabase
    .from('word')
    .select('spanish_word');
  if (existErr) { console.error('Failed to load existing words:', existErr.message); process.exit(1); }

  const existingWords = new Set<string>((existing ?? []).map(w => w.spanish_word.trim().toLowerCase()));
  console.log(`Existing words in Supabase: ${existingWords.size}\n`);

  // ── Build insert batch ───────────────────────────────────────────────────
  type WordRow = {
    id: string;
    spanish_word: string;
    english_translation: string;
    type: string;
    example_sentence: string;
    category_id: string | null;
    sub_category_id: string | null;
    source: string;
    is_active: boolean;
  };

  const toInsert: WordRow[] = [];
  let skipped = 0;
  let failed = 0;
  const failures: string[] = [];
  const subcatMismatches = new Map<string, string[]>(); // "category::subcategory" → [words]

  for (const row of rows) {
    const spanishWord = (row['Spanish word'] ?? '').trim();
    const englishTranslation = (row['English translation'] ?? '').trim();
    const exampleSentence = (row['Example sentence'] ?? '').trim();
    const wordType = (row['Word type'] ?? '').trim().toLowerCase();
    const categoryName = (row['Category'] ?? '').trim();
    const subcategoryName = (row['Sub-category'] ?? '').trim();

    if (!spanishWord) { skipped++; continue; }

    // Duplicate check
    if (existingWords.has(spanishWord.toLowerCase())) {
      skipped++;
      continue;
    }

    // Validate word type
    if (!VALID_TYPES.has(wordType)) {
      failures.push(`[${spanishWord}] invalid type: "${wordType}"`);
      failed++;
      continue;
    }

    // Resolve category
    const categoryId = catMap.get(categoryName.toLowerCase()) ?? null;
    if (!categoryId) {
      failures.push(`[${spanishWord}] category not found: "${categoryName}"`);
      failed++;
      continue;
    }

    // Resolve subcategory (optional — insert with null if missing)
    const subcategoryId = subcategoryName
      ? (subcatMap.get(`${categoryId}::${subcategoryName.toLowerCase()}`) ?? null)
      : null;

    if (subcategoryName && !subcategoryId) {
      const key = `${categoryName} → ${subcategoryName}`;
      const list = subcatMismatches.get(key) ?? [];
      list.push(spanishWord);
      subcatMismatches.set(key, list);
    }

    toInsert.push({
      id: randomUUID(),
      spanish_word: spanishWord,
      english_translation: englishTranslation,
      type: wordType,
      example_sentence: exampleSentence,
      category_id: categoryId,
      sub_category_id: subcategoryId,
      source: 'manual',
      is_active: true,
    });

    // Prevent within-CSV duplicates
    existingWords.add(spanishWord.toLowerCase());
  }

  console.log(`Ready to insert: ${toInsert.length}`);
  console.log(`Skipped (duplicate or empty): ${skipped}`);
  if (failures.length > 0) {
    console.log(`\nPre-validation failures: ${failed}`);
    failures.forEach(f => console.warn('  ✗', f));
  }

  // Subcategory mismatch report
  if (subcatMismatches.size > 0) {
    const totalAffected = [...subcatMismatches.values()].reduce((s, l) => s + l.length, 0);
    console.log(`\n⚠ Subcategory mismatches: ${subcatMismatches.size} unique, ${totalAffected} words affected`);
    for (const [key, words] of [...subcatMismatches.entries()].sort()) {
      console.log(`  "${key}" (${words.length} words): ${words.slice(0, 3).join(', ')}${words.length > 3 ? '…' : ''}`);
    }
    console.log('  → These words will be inserted with sub_category_id = null');
  }
  console.log('');

  if (dryRun) {
    console.log('─── Dry Run Summary ───────────────────────');
    console.log(`  Would insert:            ${toInsert.length}`);
    console.log(`  Skipped (duplicate):     ${skipped}`);
    console.log(`  Failed (validation):     ${failed}`);
    console.log(`  Null subcategory:        ${[...subcatMismatches.values()].reduce((s, l) => s + l.length, 0)}`);
    console.log('───────────────────────────────────────────');
    console.log('\nNo data was inserted. Run without --dry-run to insert.');
    return;
  }

  // ── Batch insert ─────────────────────────────────────────────────────────
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('word').insert(batch);
    if (error) {
      console.error(`\nBatch ${Math.floor(i / BATCH_SIZE) + 1} failed: ${error.message}`);
      failed += batch.length;
    } else {
      inserted += batch.length;
      process.stdout.write(`\rInserting… ${inserted}/${toInsert.length}`);
    }
  }

  console.log('\n');
  console.log('─── Summary ───────────────────────────────');
  console.log(`✓ Inserted:              ${inserted}`);
  console.log(`→ Skipped (duplicate):   ${skipped}`);
  console.log(`✗ Failed:                ${failed}`);
  console.log('───────────────────────────────────────────');
}

migrate().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
