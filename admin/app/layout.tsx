import type { Metadata } from 'next';
import { Sidebar } from '../components/Sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'Españolo Admin',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </body>
    </html>
  );
}
