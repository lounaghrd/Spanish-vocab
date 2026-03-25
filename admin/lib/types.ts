export type WordType =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'interjection';

export const WORD_TYPES: WordType[] = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'conjunction',
  'interjection',
];

export type Category = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type SubCategory = {
  id: string;
  name: string;
  category_id: string;
  created_at: string;
  updated_at: string;
};

export type Word = {
  id: string;
  spanish_word: string;
  english_translation: string;
  type: WordType;
  category_id: string | null;
  sub_category_id: string | null;
  example_sentence: string;
  source: 'manual' | 'csv';
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WordWithNames = Word & {
  category_name: string | null;
  sub_category_name: string | null;
};

export type CategoryWithCounts = Category & {
  sub_category_count: number;
  word_count: number;
};

export type SubCategoryWithCount = SubCategory & {
  word_count: number;
};
