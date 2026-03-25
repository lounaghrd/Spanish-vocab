'use client';

import { useState, useTransition } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from '../lib/actions/categories';
import type { CategoryWithCounts, SubCategoryWithCount } from '../lib/types';

type Props = {
  categories: CategoryWithCounts[];
  subCategories: SubCategoryWithCount[];
};

export function CategoriesPanel({ categories, subCategories }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Category form state
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<CategoryWithCounts | undefined>();

  // Sub-category form state
  const [newSubCategoryForCategory, setNewSubCategoryForCategory] = useState<string | null>(null);
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
  const [editingSubCategoryName, setEditingSubCategoryName] = useState('');
  const [deletingSubCategory, setDeletingSubCategory] = useState<SubCategoryWithCount | undefined>();

  const [error, setError] = useState('');

  function run(fn: () => Promise<{ error?: string; success?: true }>) {
    setError('');
    startTransition(async () => {
      const result = await fn();
      if (result && 'error' in result) setError(result.error ?? '');
    });
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">{categories.length} categories</p>
        </div>
        <button
          onClick={() => { setShowNewCategoryForm(true); setNewCategoryName(''); }}
          className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600"
        >
          + New Category
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* New category inline form */}
      {showNewCategoryForm && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
          <input
            autoFocus
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                run(() => createCategory(newCategoryName));
                setShowNewCategoryForm(false);
              }
              if (e.key === 'Escape') setShowNewCategoryForm(false);
            }}
          />
          <button
            onClick={() => { run(() => createCategory(newCategoryName)); setShowNewCategoryForm(false); }}
            disabled={isPending}
            className="px-3 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            Save
          </button>
          <button onClick={() => setShowNewCategoryForm(false)} className="text-sm text-gray-500">
            Cancel
          </button>
        </div>
      )}

      {/* Categories list */}
      <div className="space-y-2">
        {categories.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
            No categories yet. Create one above.
          </div>
        )}

        {categories.map((cat) => {
          const catSubCategories = subCategories.filter((sc) => sc.category_id === cat.id);
          const isExpanded = expandedId === cat.id;

          return (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Category row */}
              <div className="flex items-center px-4 py-3 gap-3">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : cat.id)}
                  className="text-gray-400 hover:text-gray-600 transition-transform"
                  style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                >
                  ▶
                </button>

                {editingCategoryId === cat.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-orange-400 rounded focus:outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        run(() => updateCategory(cat.id, editingCategoryName));
                        setEditingCategoryId(null);
                      }
                      if (e.key === 'Escape') setEditingCategoryId(null);
                    }}
                  />
                ) : (
                  <span className="flex-1 font-semibold text-gray-900">{cat.name}</span>
                )}

                <span className="text-xs text-gray-400">
                  {cat.sub_category_count} sub-categories · {cat.word_count} words
                </span>

                {editingCategoryId === cat.id ? (
                  <>
                    <button
                      onClick={() => { run(() => updateCategory(cat.id, editingCategoryName)); setEditingCategoryId(null); }}
                      className="text-xs text-green-600 font-medium"
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingCategoryId(null)} className="text-xs text-gray-400">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditingCategoryId(cat.id); setEditingCategoryName(cat.name); }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => setDeletingCategory(cat)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>

              {/* Sub-categories (expanded) */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
                  {catSubCategories.length === 0 && !newSubCategoryForCategory && (
                    <p className="text-xs text-gray-400 py-1">No sub-categories yet.</p>
                  )}

                  {catSubCategories.map((sc) => (
                    <div key={sc.id} className="flex items-center gap-3 pl-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />

                      {editingSubCategoryId === sc.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingSubCategoryName}
                          onChange={(e) => setEditingSubCategoryName(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-orange-400 rounded focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              run(() => updateSubCategory(sc.id, editingSubCategoryName));
                              setEditingSubCategoryId(null);
                            }
                            if (e.key === 'Escape') setEditingSubCategoryId(null);
                          }}
                        />
                      ) : (
                        <span className="flex-1 text-sm text-gray-700">{sc.name}</span>
                      )}

                      <span className="text-xs text-gray-400">{sc.word_count} words</span>

                      {editingSubCategoryId === sc.id ? (
                        <>
                          <button
                            onClick={() => { run(() => updateSubCategory(sc.id, editingSubCategoryName)); setEditingSubCategoryId(null); }}
                            className="text-xs text-green-600 font-medium"
                          >
                            Save
                          </button>
                          <button onClick={() => setEditingSubCategoryId(null)} className="text-xs text-gray-400">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { setEditingSubCategoryId(sc.id); setEditingSubCategoryName(sc.name); }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Rename
                          </button>
                          <button
                            onClick={() => setDeletingSubCategory(sc)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  ))}

                  {/* New sub-category inline form */}
                  {newSubCategoryForCategory === cat.id ? (
                    <div className="flex items-center gap-2 pl-4">
                      <input
                        autoFocus
                        type="text"
                        value={newSubCategoryName}
                        onChange={(e) => setNewSubCategoryName(e.target.value)}
                        placeholder="Sub-category name"
                        className="flex-1 px-2 py-1.5 text-sm border border-orange-400 rounded-lg focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            run(() => createSubCategory(cat.id, newSubCategoryName));
                            setNewSubCategoryForCategory(null);
                          }
                          if (e.key === 'Escape') setNewSubCategoryForCategory(null);
                        }}
                      />
                      <button
                        onClick={() => { run(() => createSubCategory(cat.id, newSubCategoryName)); setNewSubCategoryForCategory(null); }}
                        className="px-2 py-1.5 bg-orange-500 text-white text-xs rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setNewSubCategoryForCategory(null)}
                        className="text-xs text-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setNewSubCategoryForCategory(cat.id); setNewSubCategoryName(''); }}
                      className="text-xs text-orange-500 hover:text-orange-700 font-medium pl-4 mt-1"
                    >
                      + Add sub-category
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete category confirm */}
      {deletingCategory && (
        <ConfirmDialog
          title="Delete category?"
          message={`"${deletingCategory.name}" and its ${deletingCategory.sub_category_count} sub-categories will be deleted. Words in this category won't be deleted but will lose their category assignment.`}
          onConfirm={() => { run(() => deleteCategory(deletingCategory.id)); setDeletingCategory(undefined); }}
          onCancel={() => setDeletingCategory(undefined)}
          loading={isPending}
        />
      )}

      {/* Delete sub-category confirm */}
      {deletingSubCategory && (
        <ConfirmDialog
          title="Delete sub-category?"
          message={`"${deletingSubCategory.name}" will be deleted. Words in this sub-category won't be deleted but will lose their sub-category assignment.`}
          onConfirm={() => { run(() => deleteSubCategory(deletingSubCategory.id)); setDeletingSubCategory(undefined); }}
          onCancel={() => setDeletingSubCategory(undefined)}
          loading={isPending}
        />
      )}
    </>
  );
}
