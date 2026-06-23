import Link from 'next/link';

const FOOTER_LINKS = [
  { id: 'home',     label: 'الرئيسية' },
  { id: 'features', label: 'المميزات' },
  { id: 'pricing',  label: 'الأسعار' },
  { id: 'faq',      label: 'الأسئلة الشائعة' },
];

const SOCIALS = [
  { href: 'https://instagram.com', label: 'Instagram', d: 'M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 6a3 3 0 100 6 3 3 0 000-6zm4.5-1.5h.01' },
  { href: 'https://twitter.com',   label: 'Twitter',   d: 'M22 5.92a8.2 8.2 0 01-2.36.65 4.1 4.1 0 001.8-2.27 8.2 8.2 0 01-2.6 1 4.1 4.1 0 00-7 3.74A11.65 11.65 0 013 4.6a4.1 4.1 0 001.27 5.47 4.07 4.07 0 01-1.86-.51 4.1 4.1 0 003.29 4.07 4.1 4.1 0 01-1.85.07 4.1 4.1 0 003.83 2.85A8.23 8.23 0 012 18.4a11.6 11.6 0 006.29 1.84c7.55 0 11.68-6.26 11.68-11.68l-.01-.53A8.18 8.18 0 0022 5.92z', fill: true },
  { href: 'https://linkedin.com',  label: 'LinkedIn',  d: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z' },
];

export default function CTAFooter() {
  return (
    <>
      {/* CTA banner */}
      <section className="relative overflow-hidden bg-navy-950 py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-navy-700/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-navy-700/40" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-navy-700/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-navy-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-snug">
            مستقبل الخدمات القانونية يبدأ من هنا
          </h2>
          <div className="mt-4 w-40 h-1 mx-auto rounded-full bg-gradient-to-l from-navy-400 to-navy-200" />
          <p className="mt-6 text-navy-200 leading-relaxed max-w-xl mx-auto text-sm sm:text-base">
            نظام سحابي شامل يجمع بين إدارة القضايا، العملاء، والفواتير في منصة واحدة. مصمم خصيصاً للمحامين.
          </p>
          <Link href="/register"
            className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-navy-900 bg-white hover:bg-navy-50 shadow-lg transition-all">
            جرب مجاناً 14 يوم
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e4e9f2] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3 order-2 sm:order-1">
            {SOCIALS.map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="w-9 h-9 rounded-full border border-[#e4e9f2] text-navy-700 flex items-center justify-center hover:bg-navy-50 hover:border-navy-200 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill={s.fill ? 'currentColor' : 'none'} stroke={s.fill ? 'none' : 'currentColor'}
                  strokeWidth={s.fill ? undefined : 1.8} strokeLinecap="round" strokeLinejoin="round">
                  <path d={s.d} />
                </svg>
              </a>
            ))}
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-5 order-1 sm:order-2">
            {FOOTER_LINKS.map(l => (
              <a key={l.id} href={`#${l.id}`} className="text-sm text-slate-500 hover:text-navy-700 transition-colors">{l.label}</a>
            ))}
          </nav>
          <p className="text-sm text-slate-400 order-3">جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        </div>
      </footer>
    </>
  );
}
