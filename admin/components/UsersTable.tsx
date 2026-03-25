'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { UserListItem } from '../lib/types';

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'Never';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function UsersTable({ users }: { users: UserListItem[] }) {
  const [search, setSearch] = useState('');

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-gray-200 shrink-0">
        <h1 className="text-lg font-semibold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">{users.length} users</p>
      </div>

      <div className="px-6 py-3 border-b border-gray-200 shrink-0">
        <input
          type="text"
          placeholder="Search by email or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Created</th>
              <th className="px-6 py-3 font-medium">Last Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">
                  <Link
                    href={`/users/${user.id}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {user.email}
                  </Link>
                </td>
                <td className="px-6 py-3 text-gray-700">
                  {user.first_name || user.last_name
                    ? `${user.first_name} ${user.last_name}`.trim()
                    : '—'}
                </td>
                <td className="px-6 py-3 text-gray-500">{formatDate(user.created_at)}</td>
                <td className="px-6 py-3 text-gray-500">{formatDate(user.last_activity)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
