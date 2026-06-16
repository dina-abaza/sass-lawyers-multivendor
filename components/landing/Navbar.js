'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const LINKS = [
  { id: 'home', label: 'الرئيسية' },
  { id: 'features', label: 'المميزات' },
  { id: 'pricing', label: 'الأسعار' },
  { id: 'faq', label: 'الأسئلة الشائعة' },
];

export default function Navbar() {
  const [active, setActive] = useState('home');
  const [open, setOpen] = useState(false);

  // Scrollspy: highlight the nav pill of whichever section is currently in view.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        {/* الشعار */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, 'home')}
          className="flex items-center gap-2 shrink-0"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </span>
        </a>

        {/* روابط التنقل */}
        <nav className="hidden md:flex items-center gap-1 bg-white border border-purple-100 rounded-full p-1.5 shadow-sm">
          {LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={(e) => handleNavClick(e, link.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active === link.id
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:text-purple-700'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* أزرار الدخول والتسجيل */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link
            href="/login"
            className="px-4 py-2.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            تسجيل الدخول
          </Link>
          <Link
            href="/register"
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-l from-violet-600 to-purple-600 shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/30 transition-shadow"
          >
            ابدأ مجاناً
          </Link>
        </div>

        {/* زر القائمة للموبايل */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200 text-gray-600"
          aria-label="فتح القائمة"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* قائمة الموبايل */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                  active === link.id ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Link
              href="/login"
              className="flex-1 text-center px-4 py-2.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              className="flex-1 text-center px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-l from-violet-600 to-purple-600"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
