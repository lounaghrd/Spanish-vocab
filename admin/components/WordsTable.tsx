'use client';

import { useState, useTransition } from 'react';
import { WordForm } from './WordForm';
import { ConfirmDialog } from './ConfirmDialog';
import { deleteWord } from '../lib/actions/words';
import type { Category, SubCategory, WordWithNames } from '../lib/types';

type Props = {
  words: WordWithNames[];
  categories: Category[];
  subCategories: SubCategory[];
};

export function WordsTable({ words, categories, subCategories }: Props) {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingWord, setEditingWord] = useState<WordWithNames | undefined>();
  const [deletingWord, setDeletingWord] = useState<WordWithNames | undefined>();
  const [isPending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState('');

  const filtered = words.filter((w) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      w.spanish_word.toLowerCase().includes(q) ||
      w.english_translation.toLowerCase().includes(q) ||
      (w.category_name ?? '').toLowerCase().includes(q) ||
      (w.sub_category_name ?? '').toLowerCase().includes(q)
    );
  });

  function handleDelete() {
    if (!deletingWord) return;
    setDeleteError('');
    startTransition(async () => {
      const result = await deleteWord(deletingWord.id);
      if ('error' in result) {
        setDeleteError(result.error);
      } else {
        setDeletingWord(undefined);
      }
    });
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Words</h1>
          <p className="text-sm text-gray-500 mt-0.5">{words.length} words in the library</p>
        </div>
        <button
          onClick={() => { setEditingWord(undefined); setShowForm(true); }}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600"
        >
          + New Word
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Spanish, English, or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Spanish', 'English', 'Type', 'Category', 'Sub-category', 'Created', ''].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                  {search ? 'No words match your search.' : 'No words yet.'}
                </td>
              </tr>
            )}
            {filtered.map((word) => (
              <tr key={word.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{word.spanish_word}</td>
                <td className="px-4 py-3 text-gray-600">{word.english_translation}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {word.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{word.category_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{word.sub_category_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(word.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditingWord(word); setShowForm(true); }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setDeleteError(''); setDeletingWord(word); }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Word form modal */}
      {showForm && (
        <WordForm
          word={editingWord}
          categories={categories}
          subCategories={subCategories}
          onClose={() => { setShowForm(false); setEditingWord(undefined); }}
        />
      )}

      {/* Delete confirm dialog */}
      {deletingWord && (
        <ConfirmDialog
          title="Delete word?"
          message={`"${deletingWord.spanish_word}" will be removed from the library and disappear from all users' apps on next sync. This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => { setDeletingWord(undefined); setDeleteError(''); }}
          loading={isPending}
        />
      )}
      {deleteError && (
        <p className="mt-2 text-sm text-red-600">{deleteError}</p>
      )}
    </>
  );
}
