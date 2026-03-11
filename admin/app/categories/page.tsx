import supabaseAdmin from '../../lib/supabase';
import { CategoriesPanel } from '../../components/CategoriesPanel';
import type { CategoryWithCounts, SubCategoryWithCount } from '../../lib/types';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const [categoriesResult, subCategoriesResult, wordsResult] = await Promise.all([
    supabaseAdmin.from('category').select('*').order('name'),
    supabaseAdmin.from('sub_category').select('*').order('name'),
    supabaseAdmin
      .from('word')
      .select('category_id, sub_category_id')
      .eq('is_active', true),
  ]);

  if (categoriesResult.error) {
    return (
      <div className="p-6 bg-red-50 rounded-xl text-red-700 text-sm">
        Error loading categories: {categoriesResult.error.message}
      </div>
    );
  }

  const words = wordsResult.data ?? [];
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
