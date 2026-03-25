/**
 * Seeds Supabase with all 31 categories and ~223 sub-categories.
 *
 * Uses deterministic UUIDs so running it multiple times is safe (upserts).
 *
 * Run with:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=sb_secret_... \
 *   npx ts-node --skip-project scripts/seed-categories.ts
 */

import { createHash } from 'crypto';
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

// ─── Data ────────────────────────────────────────────────────────────────────

const data: { category: string; subcategories: string[] }[] = [
  {
    category: 'People & Relationships',
    subcategories: ['Family', 'Friendship', 'Romantic relationships', 'Marriage', 'Children & parenting', 'Professions & occupations', 'Social roles', 'Nationality & ethnicity', 'Personal identity', 'Generations & age groups', 'Other'],
  },
  {
    category: 'Body & Health',
    subcategories: ['Body parts', 'Internal organs', 'Senses', 'Physical conditions', 'Diseases', 'Medical care', 'Fitness & exercise', 'Mental health', 'Nutrition', 'Injuries', 'Other'],
  },
  {
    category: 'Food & Drink',
    subcategories: ['Fruits', 'Vegetables', 'Meat', 'Fish & seafood', 'Dairy products', 'Grains & cereals', 'Baked goods', 'Desserts', 'Drinks', 'Cooking ingredients', 'Cooking methods', 'Kitchen tools', 'Restaurant vocabulary', 'Other'],
  },
  {
    category: 'Home & Household',
    subcategories: ['Rooms', 'Furniture', 'Household appliances', 'Decorations', 'Cleaning', 'Repairs & maintenance', 'Utilities', 'Storage', 'Garden & yard', 'Other'],
  },
  {
    category: 'Clothing & Fashion',
    subcategories: ['Clothing items', 'Footwear', 'Accessories', 'Jewelry', 'Materials & fabrics', 'Fashion styles', 'Shopping for clothes', 'Other'],
  },
  {
    category: 'Transportation',
    subcategories: ['Vehicles', 'Public transportation', 'Air travel', 'Rail transport', 'Boats & ships', 'Traffic', 'Driving', 'Road infrastructure', 'Other'],
  },
  {
    category: 'Places & Locations',
    subcategories: ['Cities', 'Countries', 'Buildings', 'Shops & businesses', 'Tourist places', 'Religious places', 'Natural places', 'Public places', 'Address & directions', 'Other'],
  },
  {
    category: 'Nature & Environment',
    subcategories: ['Animals', 'Birds', 'Insects', 'Plants', 'Flowers', 'Weather', 'Climate', 'Landscape', 'Environmental issues', 'Other'],
  },
  {
    category: 'Time & Calendar',
    subcategories: ['Days', 'Months', 'Seasons', 'Time units', 'Frequency', 'Duration', 'Past time', 'Future time', 'Other'],
  },
  {
    category: 'Numbers & Quantities',
    subcategories: ['Numbers', 'Ordinal numbers', 'Fractions', 'Measurements', 'Weight', 'Volume', 'Amounts & quantities'],
  },
  {
    category: 'Education & Learning',
    subcategories: ['School', 'Subjects', 'Classroom objects', 'Exams', 'Learning verbs', 'Academic degrees', 'Other'],
  },
  {
    category: 'Work & Business',
    subcategories: ['Office vocabulary', 'Management', 'Finance', 'Entrepreneurship', 'Employment', 'Meetings', 'Contracts', 'Marketing', 'Other'],
  },
  {
    category: 'Technology',
    subcategories: ['Computers', 'Internet', 'Software', 'Mobile devices', 'Social media', 'Artificial intelligence', 'Digital security', 'Other'],
  },
  {
    category: 'Communication & Language',
    subcategories: ['Speaking', 'Listening', 'Reading', 'Writing', 'Conversation phrases', 'Opinions', 'Arguments', 'Other'],
  },
  {
    category: 'Emotions & Feelings',
    subcategories: ['Positive emotions', 'Negative emotions', 'Love & affection', 'Anger', 'Fear', 'Surprise', 'Calmness', 'Other'],
  },
  {
    category: 'Personality & Character',
    subcategories: ['Positive traits', 'Negative traits', 'Intelligence', 'Bravery', 'Honesty', 'Behavior', 'Other'],
  },
  {
    category: 'Actions & Daily Activities',
    subcategories: ['Daily routines', 'Household actions', 'Personal care', 'Movement', 'Basic actions', 'Starting & stopping', 'Other'],
  },
  {
    category: 'Travel & Tourism',
    subcategories: ['Travel planning', 'Hotels', 'Airports', 'Sightseeing', 'Travel documents', 'Other'],
  },
  {
    category: 'Shopping & Money',
    subcategories: ['Buying', 'Selling', 'Prices', 'Payment methods', 'Bargaining', 'Other'],
  },
  {
    category: 'Law & Government',
    subcategories: ['Government', 'Politics', 'Law', 'Police', 'Court', 'Rights', 'Other'],
  },
  {
    category: 'Religion & Spirituality',
    subcategories: ['Beliefs', 'Rituals', 'Religious texts', 'Clergy', 'Spiritual concepts', 'Other'],
  },
  {
    category: 'Culture & Society',
    subcategories: ['Traditions', 'Festivals', 'Customs', 'Social norms', 'Cultural identity', 'Other'],
  },
  {
    category: 'Arts & Entertainment',
    subcategories: ['Music', 'Movies', 'Theater', 'Painting', 'Photography', 'Literature', 'Dance', 'Other'],
  },
  {
    category: 'Sports & Games',
    subcategories: ['Sports', 'Exercise', 'Competition', 'Team sports', 'Equipment', 'Other'],
  },
  {
    category: 'Science',
    subcategories: ['Biology', 'Physics', 'Chemistry', 'Astronomy', 'Geology', 'Other'],
  },
  {
    category: 'Abstract Concepts',
    subcategories: ['Existence', 'Possibility', 'Necessity', 'Change', 'Cause & effect', 'Truth', 'Other'],
  },
  {
    category: 'Descriptions & Qualities',
    subcategories: ['Size', 'Shape', 'Color', 'Texture', 'Temperature', 'Taste', 'Smell', 'Other'],
  },
  {
    category: 'Direction & Position',
    subcategories: ['Directions', 'Location', 'Movement direction', 'Position', 'Distance', 'Other'],
  },
  {
    category: 'Connectors & Grammar Words',
    subcategories: ['Prepositions', 'Conjunctions', 'Articles', 'Pronouns', 'Interjections', 'Other'],
  },
  {
    category: 'Slang & Informal Language',
    subcategories: ['Colloquial expressions', 'Internet slang', 'Insults', 'Compliments', 'Other'],
  },
  {
    category: 'Other',
    subcategories: ['Other'],
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Seeding categories and sub-categories…\n');

  // Build category rows
  const categories = data.map(({ category }) => ({
    id: deterministicUUID('category', category),
    name: category,
  }));

  // 1. Upsert categories
  const { error: catError } = await supabase
    .from('category')
    .upsert(categories, { onConflict: 'id' });
  if (catError) { console.error('Category error:', catError.message); process.exit(1); }
  console.log(`✓ ${categories.length} categories upserted`);

  // Build sub-category rows
  const subCategories = data.flatMap(({ category, subcategories }) => {
    const categoryId = deterministicUUID('category', category);
    return subcategories.map((name) => ({
      id: deterministicUUID('subcategory', `${category}:${name}`),
      name,
      category_id: categoryId,
    }));
  });

  // 2. Upsert sub-categories (in batches of 50)
  const BATCH = 50;
  for (let i = 0; i < subCategories.length; i += BATCH) {
    const batch = subCategories.slice(i, i + BATCH);
    const { error } = await supabase.from('sub_category').upsert(batch, { onConflict: 'id' });
    if (error) { console.error('Sub-category error:', error.message); process.exit(1); }
  }
  console.log(`✓ ${subCategories.length} sub-categories upserted`);

  console.log('\nDone!');
}

seed().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
