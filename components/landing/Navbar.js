'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const LINKS = [
  { id: 'home',     label: 'الرئيسية' },
  { id: 'features', label: 'المميزات' },
  { id: 'pricing',  label: 'الأسعار' },
  { id: 'faq',      label: 'الأسئلة الشائعة' },
];

export default function Navbar() {
  const [active, setActive] = useState('home');
  const [open, setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = LINKS.map(l => document.getElementById(l.id)).filter(Boolean);
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }),
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
    );
    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (e, id) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm shadow-navy-900/5' : 'bg-white'} border-b border-[#e4e9f2]`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <a href="#home" onClick={e => scrollTo(e, 'home')} className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-navy-700 flex items-center justify-center shadow-sm shadow-navy-700/25">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <span className="font-bold text-navy-900 text-sm hidden sm:block">نظام المحاماة</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 bg-[#f4f6fb] border border-[#e4e9f2] rounded-full p-1.5">
          {LINKS.map(link => (
            <a key={link.id} href={`#${link.id}`} onClick={e => scrollTo(e, link.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                active === link.id
                  ? 'bg-white text-navy-800 shadow-sm border border-[#e4e9f2]'
                  : 'text-slate-600 hover:text-navy-800'
              }`}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <Link href="/login" className="px-4 py-2 rounded-full text-sm font-medium text-slate-700 border border-[#e4e9f2] hover:bg-[#f4f6fb] transition-colors">
            تسجيل الدخول
          </Link>
          <Link href="/register" className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-navy-700 hover:bg-navy-800 shadow-sm shadow-navy-700/25 transition-all">
            ابدأ مجاناً
          </Link>
        </div>

        {/* Hamburger */}
        <button onClick={() => setOpen(v => !v)}
          className="md:hidden w-9 h-9 rounded-lg border border-[#e4e9f2] flex items-center justify-center text-slate-600 hover:bg-[#f4f6fb] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#e4e9f2] bg-white px-4 py-4 space-y-1">
          {LINKS.map(link => (
            <a key={link.id} href={`#${link.id}`} onClick={e => scrollTo(e, link.id)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active === link.id ? 'bg-navy-50 text-navy-800' : 'text-slate-700 hover:bg-[#f4f6fb]'
              }`}>
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-2 pt-3 border-t border-[#e4e9f2]">
            <Link href="/login" className="flex-1 text-center px-4 py-2.5 rounded-full text-sm font-medium text-slate-700 border border-[#e4e9f2]">
              تسجيل الدخول
            </Link>
            <Link href="/register" className="flex-1 text-center px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-navy-700 hover:bg-navy-800">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
