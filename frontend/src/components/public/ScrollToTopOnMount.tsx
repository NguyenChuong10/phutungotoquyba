'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopOnMount() {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Disable native browser scroll restoration so Back/Forward navigation forces top scroll
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const forceScrollToTop = () => {
      window.scrollTo(0, 0);
      // Double-check with a slight delay to override Next.js App Router scroll restoration tick
      const timer1 = setTimeout(() => window.scrollTo(0, 0), 10);
      const timer2 = setTimeout(() => window.scrollTo(0, 0), 100);
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    };

    const cleanup = forceScrollToTop();

    // Force scroll to top when user presses browser Back/Forward (popstate) buttons
    const handlePopState = () => {
      forceScrollToTop();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      cleanup();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Về đầu trang"
          aria-hidden={!showScrollTop}
          className="fixed bottom-24 right-5 sm:bottom-28 sm:right-6 z-40 p-2.5 rounded-full bg-slate-900/90 hover:bg-red-600 text-white shadow-lg transition-all duration-300 hover:scale-110 cursor-pointer border border-slate-700/80"
          title="Về đầu trang"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
