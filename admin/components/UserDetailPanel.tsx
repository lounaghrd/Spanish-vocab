'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import type { UserDetail, UserWordWithDetails } from '../lib/types';
import { updateUserWordLevel, updateUserWordNextReview } from '../lib/actions/users';

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '—';
  if (dateStr.startsWith('9999')) return 'Learned';
  return new Date(dateStr).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDatetimeLocal(dateStr: string): string {
  const d = new Date(dateStr);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function LevelBadge({ level }: { level: number }) {
  let color = 'bg-orange-100 text-orange-700';
  if (level >= 3 && level <= 5) color = 'bg-yellow-100 text-yellow-700';
  if (level >= 6 && level <= 7) color = 'bg-green-100 text-green-700';
  if (level === 8) color = 'bg-blue-100 text-blue-700';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {level === 8 ? 'L8 ✓' : `L${level}`}
    </span>
  );
}

function BoolBadge({ value }: { value: boolean }) {
  return value ? (
    <span className="text-xs font-medium text-green-700">Yes</span>
  ) : (
    <span className="text-xs text-gray-400">No</span>
  );
}

export function UserDetailPanel({
  user,
  userWords,
  wordsError,
}: {
  user: UserDetail;
  userWords: UserWordWithDetails[];
  wordsError: string | null;
}) {
  const [search, setSearch] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editingReviewValue, setEditingReviewValue] = useState('');
  const [isPending, startTransition] = useTransition();

  const filtered = userWords.filter((w) => {
    const q = search.toLowerCase();
    return (
      w.spanish_word.toLowerCase().includes(q) ||
      w.english_translation.toLowerCase().includes(q)
    );
  });

  const now = new Date();
  const dueCount = userWords.filter(
    (w) => !w.suspended && !w.marked_as_learned && new Date(w.next_review_at) <= now
  ).length;

  const fullName =
    user.first_name || user.last_name
      ? `${user.first_name} ${user.last_name}`.trim()
      : null;

  function handleLevelChange(userWordId: string, newLevel: number) {
    setActionError(null);
    startTransition(async () => {
      const result = await updateUserWordLevel(userWordId, newLevel);
      if ('error' in result) setActionError(result.error);
    });
  }

  function handleStartEditReview(userWordId: string, currentValue: string) {
    setEditingReviewId(userWordId);
    setEditingReviewValue(
      currentValue.startsWith('9999') ? '' : toDatetimeLocal(currentValue)
    );
    setActionError(null);
  }

  function handleSaveReview() {
    if (!editingReviewId || !editingReviewValue) return;
    setActionError(null);
    startTransition(async () => {
      const result = await updateUserWordNextReview(
        editingReviewId!,
        new Date(editingReviewValue).toISOString()
      );
      if ('error' in result) {
        setActionError(result.error);
      } else {
        setEditingReviewId(null);
      }
    });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200 shrink-0">
        <Link
          href="/users"
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
        >
          ← Back to Users
        </Link>
        <h1 className="text-lg font-semibold text-gray-900">{user.email}</h1>
        {fullName && <p className="text-sm text-gray-600 mt-0.5">{fullName}</p>}
        <div className="flex gap-6 mt-3 text-sm text-gray-500">
          <span>Created: {formatDate(user.created_at)}</span>
          <span>Last active: {formatDate(user.last_activity)}</span>
          <span>{userWords.length} words</span>
          <span>{dueCount} due for review</span>
        </div>
      </div>

      {/* Error banner */}
      {actionError && (
        <div className="mx-6 mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {actionError}
        </div>
      )}

      {wordsError && (
        <div className="mx-6 mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          Failed to load words: {wordsError}
        </div>
      )}

      {/* Search */}
      <div className="px-6 py-3 border-b border-gray-200 shrink-0">
        <input
          type="text"
          placeholder="Search words…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Spanish</th>
              <th className="px-4 py-3 font-medium">English</th>
              <th className="px-4 py-3 font-medium">Level</th>
              <th className="px-4 py-3 font-medium">Last Reviewed</th>
              <th className="px-4 py-3 font-medium">Next Review</th>
              <th className="px-4 py-3 font-medium">Suspended</th>
              <th className="px-4 py-3 font-medium">Learned</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((uw) => (
              <tr key={uw.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{uw.spanish_word}</td>
                <td className="px-4 py-3 text-gray-700">{uw.english_translation}</td>
                <td className="px-4 py-3">
                  <LevelBadge level={uw.level} />
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDateTime(uw.last_reviewed_at)}</td>
                <td className="px-4 py-3 text-gray-500">
                  {editingReviewId === uw.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="datetime-local"
                        value={editingReviewValue}
                        onChange={(e) => setEditingReviewValue(e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                      <button
                        onClick={handleSaveReview}
                        disabled={isPending || !editingReviewValue}
                        className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 disabled:opacity-50"
                      >
                        {isPending ? '…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingReviewId(null)}
                        className="px-2 py-1 text-gray-500 hover:text-gray-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    formatDateTime(uw.next_review_at)
                  )}
                </td>
                <td className="px-4 py-3">
                  <BoolBadge value={uw.suspended} />
                </td>
                <td className="px-4 py-3">
                  <BoolBadge value={uw.marked_as_learned} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={uw.level}
                      onChange={(e) => handleLevelChange(uw.id, Number(e.target.value))}
                      disabled={isPending}
                      className="px-1.5 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50"
                    >
                      {Array.from({ length: 9 }, (_, i) => (
                        <option key={i} value={i}>
                          L{i}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleStartEditReview(uw.id, uw.next_review_at)}
                      disabled={isPending}
                      className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      Edit date
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !wordsError && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No words found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
