'use server';

import { revalidatePath } from 'next/cache';
import supabaseAdmin from '../supabase';

export type ActionResult = { error: string } | { success: true };

// SRS intervals in minutes: level -> minutes until next review
const SRS_INTERVALS_MINUTES = [0, 60, 1440, 2880, 5760, 10080, 20160, 43200];
const LEARNED_DATE = '9999-12-31T23:59:59.000Z';

function computeNextReviewAt(level: number): string {
  if (level === 8) return LEARNED_DATE;
  const minutes = SRS_INTERVALS_MINUTES[level];
  const next = new Date(Date.now() + minutes * 60 * 1000);
  return next.toISOString();
}

export async function updateUserWordLevel(
  userWordId: string,
  newLevel: number
): Promise<ActionResult> {
  if (!Number.isInteger(newLevel) || newLevel < 0 || newLevel > 8) {
    return { error: 'Level must be an integer between 0 and 8.' };
  }

  const nextReviewAt = computeNextReviewAt(newLevel);

  const { error } = await supabaseAdmin
    .from('user_word')
    .update({
      level: newLevel,
      next_review_at: nextReviewAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userWordId);

  if (error) return { error: error.message };

  revalidatePath('/users');
  return { success: true };
}

export async function updateUserWordNextReview(
  userWordId: string,
  nextReviewAt: string
): Promise<ActionResult> {
  const parsed = new Date(nextReviewAt);
  if (isNaN(parsed.getTime())) {
    return { error: 'Invalid date format.' };
  }

  // Allow 1-minute tolerance for "now"
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  if (parsed < oneMinuteAgo) {
    return { error: 'Next review date cannot be in the past.' };
  }

  const { error } = await supabaseAdmin
    .from('user_word')
    .update({
      next_review_at: parsed.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userWordId);

  if (error) return { error: error.message };

  revalidatePath('/users');
  return { success: true };
}
