'use client';

import Link from 'next/link';

const FEATURES = [
  { icon: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3', label: 'إدارة القضايا' },
  { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', label: 'إدارة العملاء' },
  { icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', label: 'الجلسات والمواعيد' },
  { icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z', label: 'الفواتير والمالية' },
  { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', label: 'المهام والمتابعة' },
  { icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', label: 'إدارة الموظفين' },
];

export default function Hero() {
  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-b from-navy-50/50 via-white to-white">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-navy-700/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-72 h-72 bg-navy-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 lg:py-28 text-center">
        <div className="inline-flex items-center gap-2 bg-navy-50 border border-navy-100 rounded-full px-3 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-navy-700 animate-pulse" />
          <span className="text-xs font-medium text-navy-700">منصة سحابية مخصصة للمحامين</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-navy-900 leading-tight tracking-tight">
          إدارة <span className="text-navy-700">ذكية ومتكاملة</span> لمكتب المحاماة
        </h1>
        <p className="mt-5 text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          نظام سحابي شامل يجمع بين إدارة القضايا، العملاء، والفواتير في منصة واحدة. مصمم خصيصاً للمحامين لزيادة الإنتاجية وتنظيم العمل.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-white bg-navy-700 hover:bg-navy-800 shadow-md shadow-navy-700/25 transition-all w-full sm:w-auto justify-center">
            ابدأ الآن مجاناً
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <Link href="/login"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold text-slate-700 border border-[#e4e9f2] bg-white hover:bg-[#f4f6fb] transition-all w-full sm:w-auto justify-center">
            تسجيل الدخول
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-400">لا يلزم وجود بطاقة ائتمان • إلغاء في أي وقت</p>

        {/* Feature pills */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {FEATURES.map(f => (
            <div key={f.label}
              className="flex items-center gap-3 bg-white border border-[#e4e9f2] rounded-xl px-4 py-3 text-right shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={f.icon} />
                </svg>
              </div>
              <span className="text-sm font-medium text-slate-700">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
