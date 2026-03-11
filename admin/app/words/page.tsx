import supabaseAdmin from '../../lib/supabase';
import { WordsTable } from '../../components/WordsTable';
import type { Category, SubCategory, WordWithNames } from '../../lib/types';

export const dynamic = 'force-dynamic';

async function fetchAllWords() {
  const PAGE = 1000;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const all: any[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('word')
      .select('*, category:category_id(name), sub_category:sub_category_id(name)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (data) all.push(...data);
    if (!data || data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

export default async function WordsPage() {
  const [rawWords, categoriesResult, subCategoriesResult] = await Promise.all([
    fetchAllWords(),
    supabaseAdmin.from('category').select('*').order('name'),
    supabaseAdmin.from('sub_category').select('*').order('name'),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const words: WordWithNames[] = rawWords.map((w: any) => ({
    ...w,
    category_name: w.category?.name ?? null,
    sub_category_name: w.sub_category?.name ?? null,
    category: undefined,
    sub_category: undefined,
  }));

  return (
    <WordsTable
      words={words}
      categories={(categoriesResult.data ?? []) as Category[]}
      subCategories={(subCategoriesResult.data ?? []) as SubCategory[]}
    />
  );
}
