'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

const FEATURES = [
  { key: 'max_users',               label: v => `حد أقصى ${v} مستخدم` },
  { key: 'max_clients',             label: v => `حد أقصى ${v} عميل` },
  { key: 'max_cases',               label: v => `حد أقصى ${v} قضية` },
  { key: 'max_sessions',            label: v => `حد أقصى ${v} جلسة` },
  { key: 'max_tasks',               label: v => `حد أقصى ${v} مهمة` },
  { key: 'has_templates',           label: () => 'قوالب جاهزة',               isBoolean: true },
  { key: 'has_financial_management',label: () => 'إدارة مالية متكاملة',       isBoolean: true },
  { key: 'has_attendance',          label: () => 'إدارة الحضور والانصراف',   isBoolean: true },
  { key: 'has_lawyer_reports',      label: () => 'تقارير قانونية متقدمة',    isBoolean: true },
  { key: 'has_notifications',       label: () => 'إشعارات فورية',            isBoolean: true },
];

export default function Pricing() {
  const [billing, setBilling] = useState('monthly');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['landing-plans'],
    queryFn: () => subscriptionsApi.getAll().then(r => r.data?.data ?? r.data ?? []),
  });

  const plans = Array.isArray(data) ? data : [];
  const featuredId = plans.length > 1
    ? plans.reduce((max, p) => (Number(p.price_monthly) > Number(max.price_monthly) ? p : max), plans[0]).id
    : null;

  return (
    <section id="pricing" className="py-20 bg-[#f4f6fb]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-block bg-navy-700 text-white text-xs font-medium px-4 py-1.5 rounded-full mb-4">الأسعار</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900">ابدأ رحلتك مع الخطة المناسبة</h2>
          <p className="mt-3 text-slate-500">اختر الباقة التي تناسب حجم مكتبك، ويمكنك الترقية أو التخفيض في أي وقت.</p>
        </div>

        {/* billing toggle */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center bg-white border border-[#e4e9f2] rounded-full p-1 gap-1 shadow-sm">
            {['monthly', 'yearly'].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                  billing === b ? 'bg-navy-700 text-white shadow-sm' : 'text-slate-500 hover:text-navy-700'
                }`}>
                {b === 'monthly' ? 'شهري' : 'سنوي'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : isError ? (
          <p className="text-center text-slate-400 py-12">تعذّر تحميل الباقات حالياً.</p>
        ) : plans.length === 0 ? (
          <p className="text-center text-slate-400 py-12">لا توجد باقات متاحة حالياً.</p>
        ) : (
          <div className={`grid gap-5 ${
            plans.length === 1 ? 'max-w-sm mx-auto'
            : plans.length === 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto'
            : 'sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {plans.map(plan => {
              const price    = billing === 'monthly' ? plan.price_monthly : plan.price_yearly;
              const featured = plan.id === featuredId;
              return (
                <div key={plan.id}
                  className={`relative rounded-2xl p-6 flex flex-col transition-all duration-200 ${
                    featured
                      ? 'bg-navy-700 text-white shadow-xl shadow-navy-900/20 scale-[1.02]'
                      : 'bg-white border border-[#e4e9f2] shadow-sm hover:shadow-md hover:border-navy-200'
                  }`}>
                  {featured && (
                    <span className="absolute -top-3 right-1/2 translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      الأكثر طلباً
                    </span>
                  )}
                  <h3 className={`text-lg font-bold ${featured ? 'text-white' : 'text-navy-900'}`}>{plan.name}</h3>
                  <p className={`text-sm mt-1 ${featured ? 'text-navy-100' : 'text-slate-400'}`}>الباقة المثالية لمكتبك</p>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className={`text-3xl font-extrabold ${featured ? 'text-white' : 'text-navy-900'}`}>
                      {Number(price ?? 0).toLocaleString('ar-SA')}
                    </span>
                    <span className={`text-sm ${featured ? 'text-navy-100' : 'text-slate-400'}`}>
                      ر.س / {billing === 'monthly' ? 'شهر' : 'سنة'}
                    </span>
                  </div>

                  <Link href={`/register?plan=${plan.id}&billing=${billing}`}
                    className={`mt-5 block text-center py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      featured ? 'bg-white text-navy-700 hover:bg-navy-50' : 'bg-navy-700 text-white hover:bg-navy-800'
                    }`}>
                    ابدأ الآن
                  </Link>

                  <ul className="mt-6 space-y-2.5">
                    {FEATURES.map(f => {
                      const val = plan[f.key];
                      if (f.isBoolean && !val) return null;
                      return (
                        <li key={f.key} className="flex items-center gap-2.5 text-sm">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                            featured ? 'bg-white/20' : 'bg-navy-50'
                          }`}>
                            <svg className={`w-2.5 h-2.5 ${featured ? 'text-white' : 'text-navy-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className={featured ? 'text-navy-50' : 'text-slate-600'}>{f.label(val)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
