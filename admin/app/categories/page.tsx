import supabaseAdmin from '../../lib/supabase';
import { CategoriesPanel } from '../../components/CategoriesPanel';
import type { CategoryWithCounts, SubCategoryWithCount } from '../../lib/types';

export const dynamic = 'force-dynamic';

async function fetchAllWordCounts() {
  const PAGE = 1000;
  const all: { category_id: string | null; sub_category_id: string | null }[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('word')
      .select('category_id, sub_category_id')
      .eq('is_active', true)
      .range(from, from + PAGE - 1);
    if (error) throw error;
    if (data) all.push(...data);
    if (!data || data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

export default async function CategoriesPage() {
  const [categoriesResult, subCategoriesResult, words] = await Promise.all([
    supabaseAdmin.from('category').select('*').order('name'),
    supabaseAdmin.from('sub_category').select('*').order('name'),
    fetchAllWordCounts(),
  ]);

  if (categoriesResult.error) {
    return (
      <div className="p-6 bg-red-50 rounded-xl text-red-700 text-sm">
        Error loading categories: {categoriesResult.error.message}
      </div>
    );
  }

  const subCategories = subCategoriesResult.data ?? [];

  // Compute counts in JS to avoid complex SQL
  const wordsByCategoryId = new Map<string, number>();
  const wordsBySubCategoryId = new Map<string, number>();
  const subCategoriesByCategoryId = new Map<string, number>();

  for (const w of words) {
    if (w.category_id) {
      wordsByCategoryId.set(w.category_id, (wordsByCategoryId.get(w.category_id) ?? 0) + 1);
    }
    if (w.sub_category_id) {
      wordsBySubCategoryId.set(
        w.sub_category_id,
        (wordsBySubCategoryId.get(w.sub_category_id) ?? 0) + 1
      );
    }
  }

  for (const sc of subCategories) {
    subCategoriesByCategoryId.set(
      sc.category_id,
      (subCategoriesByCategoryId.get(sc.category_id) ?? 0) + 1
    );
  }

  const categoriesWithCounts: CategoryWithCounts[] = (categoriesResult.data ?? []).map((cat) => ({
    ...cat,
    sub_category_count: subCategoriesByCategoryId.get(cat.id) ?? 0,
    word_count: wordsByCategoryId.get(cat.id) ?? 0,
  }));

  const subCategoriesWithCount: SubCategoryWithCount[] = subCategories.map((sc) => ({
    ...sc,
    word_count: wordsBySubCategoryId.get(sc.id) ?? 0,
  }));

  return (
    <CategoriesPanel
      categories={categoriesWithCounts}
      subCategories={subCategoriesWithCount}
    />
  );
}
