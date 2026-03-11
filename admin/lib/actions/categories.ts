'use server';

import { revalidatePath } from 'next/cache';
import supabaseAdmin from '../supabase';
import type { ActionResult } from './words';

// ─── Categories ──────────────────────────────────────────────────────────────

export async function createCategory(name: string): Promise<ActionResult> {
  if (!name.trim()) return { error: 'Category name is required.' };

  const { error } = await supabaseAdmin
    .from('category')
    .insert({ id: crypto.randomUUID(), name: name.trim() });

  if (error) {
    if (error.code === '23505') {
      return { error: 'A category with this name already exists.' };
    }
    return { error: error.message };
  }

  revalidatePath('/categories');
  return { success: true };
}

export async function updateCategory(
  categoryId: string,
  name: string
): Promise<ActionResult> {
  if (!name.trim()) return { error: 'Category name is required.' };

  const { error } = await supabaseAdmin
    .from('category')
    .update({ name: name.trim() })
    .eq('id', categoryId);

  if (error) {
    if (error.code === '23505') {
      return { error: 'A category with this name already exists.' };
    }
    return { error: error.message };
  }

  revalidatePath('/categories');
  revalidatePath('/words');
  return { success: true };
}

export async function deleteCategory(categoryId: string): Promise<ActionResult> {
  // Unlink words from this category (and their sub-categories) — don't delete words
  await supabaseAdmin
    .from('word')
    .update({ category_id: null, sub_category_id: null })
    .eq('category_id', categoryId);

  // Delete all sub-categories in this category
  await supabaseAdmin
    .from('sub_category')
    .delete()
    .eq('category_id', categoryId);

  // Delete the category itself
  const { error } = await supabaseAdmin
    .from('category')
    .delete()
    .eq('id', categoryId);

  if (error) return { error: error.message };

  revalidatePath('/categories');
  revalidatePath('/words');
  return { success: true };
}

// ─── Sub-categories ───────────────────────────────────────────────────────────

export async function createSubCategory(
  categoryId: string,
  name: string
): Promise<ActionResult> {
  if (!name.trim()) return { error: 'Sub-category name is required.' };

  const { error } = await supabaseAdmin
    .from('sub_category')
    .insert({ id: crypto.randomUUID(), name: name.trim(), category_id: categoryId });

  if (error) {
    if (error.code === '23505') {
      return { error: 'A sub-category with this name already exists in this category.' };
    }
    return { error: error.message };
  }

  revalidatePath('/categories');
  return { success: true };
}

export async function updateSubCategory(
  subCategoryId: string,
  name: string
): Promise<ActionResult> {
  if (!name.trim()) return { error: 'Sub-category name is required.' };

  const { error } = await supabaseAdmin
    .from('sub_category')
    .update({ name: name.trim() })
    .eq('id', subCategoryId);

  if (error) {
    if (error.code === '23505') {
      return { error: 'A sub-category with this name already exists in this category.' };
    }
    return { error: error.message };
  }

  revalidatePath('/categories');
  revalidatePath('/words');
  return { success: true };
}

export async function deleteSubCategory(
  subCategoryId: string
): Promise<ActionResult> {
  // Unlink words from this sub-category — don't delete words
  await supabaseAdmin
    .from('word')
    .update({ sub_category_id: null })
    .eq('sub_category_id', subCategoryId);

  const { error } = await supabaseAdmin
    .from('sub_category')
    .delete()
    .eq('id', subCategoryId);

  if (error) return { error: error.message };

  revalidatePath('/categories');
  revalidatePath('/words');
  return { success: true };
}
