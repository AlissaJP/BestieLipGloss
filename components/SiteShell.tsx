'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import ChatBot from './ChatBot';
import AuthModal from './AuthModal';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return <>{children}</>;
  return (
    <>
      <Header />
      <main className="pt-16 lg:pt-20">{children}</main>
      <Footer />
      <ChatBot />
      <AuthModal />
    </>
  );
}
