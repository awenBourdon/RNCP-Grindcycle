'use client';
import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export const ToTop = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    showButton && (
      <button
        onClick={scrollToTop}
        className="fixed z-40 bottom-12 right-12 p-3 rounded-full bg-[#0a3d3f] text-[#f8f7f4] cursor-pointer hover:bg-[#f8f7f4] hover:text-[#0a3d3f] transition-all"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    )
  );
};
