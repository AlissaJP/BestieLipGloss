import type { Metadata } from 'next';
import {
  Playfair_Display,
  Cormorant_Garamond,
  Lato,
} from 'next/font/google';
import './globals.css';
import SiteShell from '@/components/SiteShell';

const playfair = Playfair_Display({
  variable: '--font-playfair-family',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant-family',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const lato = Lato({
  variable: '--font-lato-family',
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Bestie LipGloss — Beauté Naturelle Haïtienne',
  description:
    'Glosses à lèvres artisanaux 100% naturels, fabriqués en Haïti. Découvrez nos teintes exclusives inspirées des couleurs des Caraïbes.',
  keywords: ['lip gloss', 'Haïti', 'beauté naturelle', 'karité', 'artisanal'],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${cormorant.variable} ${lato.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F2E9E1] text-[#2D2D2D] min-h-screen antialiased">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
