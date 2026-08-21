'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import FloatingContact from '@/components/public/FloatingContact';
import NoticeBar from '@/components/public/NoticeBar';
import { QuotationProvider } from '@/context/QuotationContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <SiteSettingsProvider>
      <QuotationProvider>
        <div className="min-h-full flex flex-col" suppressHydrationWarning>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <FloatingContact />
        </div>
      </QuotationProvider>
    </SiteSettingsProvider>
  );
}

