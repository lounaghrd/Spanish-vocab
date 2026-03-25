'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/words', label: 'Words' },
  { href: '/categories', label: 'Categories' },
  { href: '/users', label: 'Users' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-5 py-5 border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Españolo
        </span>
        <p className="text-xs text-gray-400 mt-0.5">Admin</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
