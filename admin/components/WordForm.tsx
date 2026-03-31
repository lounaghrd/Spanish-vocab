'use client';

import { useState, useTransition } from 'react';
import { createWord, updateWord } from '../lib/actions/words';
import type { Category, SubCategory, Word, WordType, WORD_TYPES } from '../lib/types';

const WORD_TYPE_OPTIONS: WordType[] = [
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'conjunction',
  'interjection',
];

type Props = {
  word?: Word & { category_name?: string | null; sub_category_name?: string | null };
  categories: Category[];
  subCategories: SubCategory[];
  onClose: () => void;
};

export function WordForm({ word, categories, subCategories, onClose }: Props) {
  const isEditing = !!word;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const [spanish, setSpanish] = useState(word?.spanish_word ?? '');
  const [english, setEnglish] = useState(word?.english_translation ?? '');
  const [type, setType] = useState<WordType>((word?.type as WordType) ?? 'noun');
  const [example, setExample] = useState(word?.example_sentence ?? '');

  const [categoryId, setCategoryId] = useState(word?.category_id ?? '');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [subCategoryId, setSubCategoryId] = useState(word?.sub_category_id ?? '');
  const [newSubCategoryName, setNewSubCategoryName] = useState('');

  const isCreatingCategory = categoryId === '__new__';
  const isCreatingSubCategory = subCategoryId === '__new__';

  const filteredSubCategories = subCategories.filter(
    (sc) =>
      sc.category_id === (isCreatingCategory ? '__never__' : categoryId)
  );


  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const formData = {
      spanish_word: spanish,
      english_translation: english,
      type,
      example_sentence: example,
      category_id: isCreatingCategory ? null : categoryId || null,
      new_category_name: isCreatingCategory ? newCategoryName : '',
      sub_category_id: isCreatingSubCategory ? null : subCategoryId || null,
      new_sub_category_name: isCreatingSubCategory ? newSubCategoryName : '',
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateWord(word!.id, formData)
        : await createWord(formData);

      if ('error' in result) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-y-auto max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditing ? 'Edit Word' : 'New Word'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Spanish word *">
              <input
                type="text"
                value={spanish}
                onChange={(e) => setSpanish(e.target.value)}
                required
                placeholder="e.g. la mesa"
                className={inputCls}
              />
            </Field>
            <Field label="English translation *">
              <input
                type="text"
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                required
                placeholder="e.g. the table"
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Word type *">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as WordType)}
              className={inputCls}
            >
              {WORD_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Example sentence">
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              rows={2}
              placeholder="e.g. La mesa es de madera."
              className={inputCls + ' resize-none'}
            />
          </Field>

          {/* Category */}
          <Field label="Category">
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(''); setNewSubCategoryName(''); }}
              className={inputCls}
            >
              <option value="">— No category —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="__new__">✚ Create new category…</option>
            </select>
          </Field>

          {isCreatingCategory && (
            <Field label="New category name *">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Sports"
                required
                className={inputCls}
              />
            </Field>
          )}

          {/* Sub-category */}
          <Field label="Sub-category">
            <select
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              disabled={isCreatingCategory ? !newCategoryName.trim() : !categoryId}
              className={inputCls + ' disabled:opacity-50 disabled:cursor-not-allowed'}
            >
              <option value="">— No sub-category —</option>
              {filteredSubCategories.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
              {(categoryId || (isCreatingCategory && newCategoryName.trim())) && (
                <option value="__new__">✚ Create new sub-category…</option>
              )}
            </select>
          </Field>

          {isCreatingSubCategory && (
            <Field label="New sub-category name *">
              <input
                type="text"
                value={newSubCategoryName}
                onChange={(e) => setNewSubCategoryName(e.target.value)}
                placeholder="e.g. Team Sports"
                required
                className={inputCls}
              />
            </Field>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {isPending ? 'Saving…' : isEditing ? 'Save changes' : 'Create word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent';
