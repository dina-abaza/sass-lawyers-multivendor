import Link from 'next/link';

const FOOTER_LINKS = [
  { id: 'home', label: 'الرئيسية' },
  { id: 'features', label: 'المميزات' },
  { id: 'pricing', label: 'الأسعار' },
  { id: 'faq', label: 'الأسئلة الشائعة' },
];

const SOCIALS = [
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 6a3 3 0 100 6 3 3 0 000-6zm4.5-1.5h.01" />
    ),
  },
  {
    href: 'https://twitter.com',
    label: 'Twitter',
    icon: (
      <path d="M22 5.92a8.2 8.2 0 01-2.36.65 4.1 4.1 0 001.8-2.27 8.2 8.2 0 01-2.6 1 4.1 4.1 0 00-7 3.74A11.65 11.65 0 013 4.6a4.1 4.1 0 001.27 5.47 4.07 4.07 0 01-1.86-.51 4.1 4.1 0 003.29 4.07 4.1 4.1 0 01-1.85.07 4.1 4.1 0 003.83 2.85A8.23 8.23 0 012 18.4a11.6 11.6 0 006.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.36-.01-.53A8.18 8.18 0 0022 5.92z" />
    ),
  },
  {
    href: 'https://linkedin.com',
    label: 'LinkedIn',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z" />
    ),
  },
];

export default function CTAFooter() {
  return (
    <>
      {/* بانر الدعوة لاتخاذ إجراء */}
      <section className="relative overflow-hidden bg-gradient-to-b from-purple-50/60 to-white py-20">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="w-[420px] h-[420px] rounded-full border border-purple-200/60" />
          <div className="absolute w-[300px] h-[300px] rounded-full border border-purple-200/70" />
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-snug">
            مستقبل الخدمات القانونية يبدأ من هنا
          </h2>
          <div className="mt-4 w-40 h-1 mx-auto rounded-full bg-gradient-to-l from-violet-600 to-purple-600" />
          <p className="mt-6 text-gray-500 leading-relaxed max-w-2xl mx-auto">
            نظام سحابي شامل يجمع بين إدارة القضايا، العملاء، والفواتير في منصة واحدة. مصمم خصيصاً
            للمحامين في المملكة العربية السعودية لزيادة الإنتاجية وتنظيم العمل.
          </p>
          <Link
            href="/register"
            className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-l from-violet-600 to-purple-600 shadow-lg shadow-purple-600/25 hover:shadow-xl transition-shadow"
          >
            جرب مجاناً
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
        </div>
      </section>

      {/* الفوتر */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 order-2 sm:order-1">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full border border-purple-200 text-purple-600 flex items-center justify-center hover:bg-purple-50 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  {s.icon}
                </svg>
              </a>
            ))}
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-5 order-1 sm:order-2 text-sm text-gray-500">
            {FOOTER_LINKS.map((l) => (
              <a key={l.id} href={`#${l.id}`} className="hover:text-purple-700 transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          <p className="text-sm text-gray-400 order-3">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}
