'use server';

import { revalidatePath } from 'next/cache';
import supabaseAdmin from '../supabase';

export type ActionResult = { error: string } | { success: true };

export async function createWord(formData: {
  spanish_word: string;
  english_translation: string;
  type: string;
  example_sentence: string;
  category_id: string | null;
  new_category_name: string;
  sub_category_id: string | null;
  new_sub_category_name: string;
}): Promise<ActionResult> {
  const {
    spanish_word,
    english_translation,
    type,
    example_sentence,
    new_category_name,
    new_sub_category_name,
  } = formData;
  let { category_id, sub_category_id } = formData;

  if (!spanish_word.trim() || !english_translation.trim() || !type) {
    return { error: 'Spanish word, English translation, and type are required.' };
  }

  // Duplicate check
  const { data: existing } = await supabaseAdmin
    .from('word')
    .select('id')
    .eq('spanish_word', spanish_word.trim())
    .eq('english_translation', english_translation.trim())
    .maybeSingle();

  if (existing) {
    return {
      error: 'A word with this exact Spanish + English combination already exists.',
    };
  }

  // Create new category if requested
  if (new_category_name.trim()) {
    const { data: newCat, error } = await supabaseAdmin
      .from('category')
      .insert({ id: crypto.randomUUID(), name: new_category_name.trim() })
      .select('id')
      .single();
    if (error) return { error: `Could not create category: ${error.message}` };
    category_id = newCat.id;
    sub_category_id = null; // reset if a new category was just created
  }

  // Validate sub-category requires category
  if ((sub_category_id || new_sub_category_name.trim()) && !category_id) {
    return { error: 'A sub-category requires a category to be selected first.' };
  }

  // Create new sub-category if requested
  if (new_sub_category_name.trim() && category_id) {
    const { data: newSubCat, error } = await supabaseAdmin
      .from('sub_category')
      .insert({
        id: crypto.randomUUID(),
        name: new_sub_category_name.trim(),
        category_id,
      })
      .select('id')
      .single();
    if (error) return { error: `Could not create sub-category: ${error.message}` };
    sub_category_id = newSubCat.id;
  }

  const { error } = await supabaseAdmin.from('word').insert({
    id: crypto.randomUUID(),
    spanish_word: spanish_word.trim(),
    english_translation: english_translation.trim(),
    type,
    example_sentence: example_sentence.trim(),
    category_id: category_id || null,
    sub_category_id: sub_category_id || null,
    source: 'manual',
    is_active: true,
  });

  if (error) return { error: error.message };

  revalidatePath('/words');
  revalidatePath('/categories');
  return { success: true };
}

export async function updateWord(
  wordId: string,
  formData: {
    spanish_word: string;
    english_translation: string;
    type: string;
    example_sentence: string;
    category_id: string | null;
    new_category_name: string;
    sub_category_id: string | null;
    new_sub_category_name: string;
  }
): Promise<ActionResult> {
  const {
    spanish_word,
    english_translation,
    type,
    example_sentence,
    new_category_name,
    new_sub_category_name,
  } = formData;
  let { category_id, sub_category_id } = formData;

  if (!spanish_word.trim() || !english_translation.trim() || !type) {
    return { error: 'Spanish word, English translation, and type are required.' };
  }

  // Duplicate check (exclude current word)
  const { data: existing } = await supabaseAdmin
    .from('word')
    .select('id')
    .eq('spanish_word', spanish_word.trim())
    .eq('english_translation', english_translation.trim())
    .neq('id', wordId)
    .maybeSingle();

  if (existing) {
    return {
      error: 'Another word with this exact Spanish + English combination already exists.',
    };
  }

  if (new_category_name.trim()) {
    const { data: newCat, error } = await supabaseAdmin
      .from('category')
      .insert({ id: crypto.randomUUID(), name: new_category_name.trim() })
      .select('id')
      .single();
    if (error) return { error: `Could not create category: ${error.message}` };
    category_id = newCat.id;
    sub_category_id = null;
  }

  if ((sub_category_id || new_sub_category_name.trim()) && !category_id) {
    return { error: 'A sub-category requires a category to be selected first.' };
  }

  if (new_sub_category_name.trim() && category_id) {
    const { data: newSubCat, error } = await supabaseAdmin
      .from('sub_category')
      .insert({
        id: crypto.randomUUID(),
        name: new_sub_category_name.trim(),
        category_id,
      })
      .select('id')
      .single();
    if (error) return { error: `Could not create sub-category: ${error.message}` };
    sub_category_id = newSubCat.id;
  }

  const { error } = await supabaseAdmin
    .from('word')
    .update({
      spanish_word: spanish_word.trim(),
      english_translation: english_translation.trim(),
      type,
      example_sentence: example_sentence.trim(),
      category_id: category_id || null,
      sub_category_id: sub_category_id || null,
    })
    .eq('id', wordId);

  if (error) return { error: error.message };

  revalidatePath('/words');
  return { success: true };
}

export async function deleteWord(wordId: string): Promise<ActionResult> {
  // The ON DELETE CASCADE in Supabase handles user_words automatically
  // if FK + cascade is set up. We do a soft delete (is_active = false)
  // so mobile apps handle it gracefully on next sync.
  const { error } = await supabaseAdmin
    .from('word')
    .update({ is_active: false })
    .eq('id', wordId);

  if (error) return { error: error.message };

  revalidatePath('/words');
  revalidatePath('/categories');
  return { success: true };
}
