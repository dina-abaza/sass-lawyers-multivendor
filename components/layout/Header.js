'use client';

export default function Header({ title }) {
  return (
    <header className="h-16 bg-white/90 backdrop-blur border-b border-[#e2e6f0] flex items-center px-6 sticky top-0 z-20">
      <span className="w-1 h-5 rounded-full bg-gold-500 me-3" />
      <h1 className="text-lg font-bold text-navy-900 tracking-tight">{title}</h1>
    </header>
  );
}
