import type { Metadata } from 'next';
import {
  Playfair_Display,
  Cormorant_Garamond,
  Lato,
  Great_Vibes,
} from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import AuthModal from '@/components/AuthModal';

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

const greatVibes = Great_Vibes({
  variable: '--font-greatvibes-family',
  subsets: ['latin'],
  weight: ['400'],
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
      className={`${playfair.variable} ${cormorant.variable} ${lato.variable} ${greatVibes.variable}`}
    >
      <body className="bg-[#FAF9F7] text-[#2D2D2D] min-h-screen antialiased">
        <Header />
        <main className="pt-16 lg:pt-20">{children}</main>
        <Footer />
        <WhatsAppButton />
        <AuthModal />
      </body>
    </html>
  );
}
