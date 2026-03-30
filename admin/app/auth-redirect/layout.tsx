import { Playfair_Display, Lora } from 'next/font/google';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-playfair',
});

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-lora',
});

export default function AuthRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    // Fixed overlay covers the admin sidebar from the root layout
    <div
      className={`${playfair.variable} ${lora.variable}`}
      style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: '#F1E1D6' }}
    >
      {children}
    </div>
  );
}
