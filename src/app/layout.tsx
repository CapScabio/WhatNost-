import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'WhatNost? | El Onboarding Definitivo para Nostr',
  description: 'Crea, gestiona y comparte tu Identidad Nostr en segundos. Sin emails, sin contraseñas.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-lc-black text-lc-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
