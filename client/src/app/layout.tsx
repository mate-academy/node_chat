import type { Metadata } from 'next';
import { Lora } from 'next/font/google';

import { Providers } from '@/app/providers';

import './globals.css';

const lora = Lora({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Realtime chat application',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${lora.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
