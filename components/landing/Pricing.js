'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

// نفس مفاتيح المميزات المستخدمة في صفحة الباقات الداخلية (app/(dashboard)/subscriptions)
// حتى تتطابق التسمية في كل مكان بالموقع.
const FEATURES = [
  { key: 'max_users', label: (v) => `حد أقصى ${v} مستخدم` },
  { key: 'max_clients', label: (v) => `حد أقصى ${v} عميل` },
  { key: 'max_cases', label: (v) => `حد أقصى ${v} قضية` },
  { key: 'max_sessions', label: (v) => `حد أقصى ${v} جلسة` },
  { key: 'max_tasks', label: (v) => `حد أقصى ${v} مهمة` },
  { key: 'has_templates', label: () => 'قوالب جاهزة', isBoolean: true },
  { key: 'has_financial_management', label: () => 'إدارة مالية متكاملة', isBoolean: true },
  { key: 'has_attendance', label: () => 'إدارة الحضور والانصراف', isBoolean: true },
  { key: 'has_lawyer_reports', label: () => 'تقارير قانونية متقدمة', isBoolean: true },
  { key: 'has_notifications', label: () => 'إشعارات فورية', isBoolean: true },
];

export default function Pricing() {
  const [billing, setBilling] = useState('monthly');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['landing-plans'],
    queryFn: () => subscriptionsApi.getAll().then((r) => r.data?.data ?? r.data ?? []),
  });

  const plans = Array.isArray(data) ? data : [];
  // نميّز الباقة الأعلى سعراً كـ "الأكثر طلباً" (فقط إذا كان هناك أكثر من باقة)
  const featuredId =
    plans.length > 1
      ? plans.reduce((max, p) => (Number(p.price_monthly) > Number(max.price_monthly) ? p : max), plans[0]).id
      : null;

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">ابدأ رحلتك مع الخطة المناسبة</h2>
          <p className="mt-3 text-gray-500">اختر الباقة التي تناسب حجم مكتبك، ويمكنك الترقية أو التخفيض في أي وقت.</p>
        </div>

        {/* مبدّل شهري / سنوي */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1.5 gap-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                billing === 'monthly' ? 'bg-white shadow text-purple-700' : 'text-gray-500'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                billing === 'yearly' ? 'bg-white shadow text-purple-700' : 'text-gray-500'
              }`}
            >
              سنوي
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : isError ? (
          <p className="text-center text-gray-400 py-12">تعذّر تحميل الباقات حالياً، يرجى المحاولة لاحقاً.</p>
        ) : plans.length === 0 ? (
          <p className="text-center text-gray-400 py-12">لا توجد باقات متاحة حالياً.</p>
        ) : (
          <div
            className={`grid gap-6 ${
              plans.length === 1
                ? 'max-w-sm mx-auto'
                : plans.length === 2
                ? 'sm:grid-cols-2 max-w-3xl mx-auto'
                : 'sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {plans.map((plan) => {
              const price = billing === 'monthly' ? plan.price_monthly : plan.price_yearly;
              const featured = plan.id === featuredId;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-7 flex flex-col transition-shadow ${
                    featured
                      ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-xl shadow-purple-900/20 scale-[1.02]'
                      : 'bg-white border border-gray-100 shadow-sm hover:shadow-md'
                  }`}
                >
                  {featured && (
                    <span className="absolute -top-3 right-1/2 translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                      الأكثر طلباً
                    </span>
                  )}

                  <h3 className={`text-lg font-bold ${featured ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h3>
                  <p className={`text-sm mt-1 ${featured ? 'text-purple-100' : 'text-gray-400'}`}>
                    ابدأ رحلتك مع الخطة المناسبة
                  </p>

                  <p className="mt-5 flex items-baseline gap-1">
                    <span className={`text-3xl font-extrabold ${featured ? 'text-white' : 'text-gray-900'}`}>
                      {Number(price ?? 0).toLocaleString('ar-SA')}
                    </span>
                    <span className={`text-sm ${featured ? 'text-purple-100' : 'text-gray-400'}`}>
                      ر.س / {billing === 'monthly' ? 'شهر' : 'سنة'}
                    </span>
                  </p>

                  <Link
                    href={`/register?plan=${plan.id}&billing=${billing}`}
                    className={`mt-6 block text-center py-2.5 rounded-full text-sm font-semibold transition-colors ${
                      featured
                        ? 'bg-white text-purple-700 hover:bg-purple-50'
                        : 'border border-purple-300 text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    ابدأ الآن
                  </Link>

                  <ul className="mt-7 space-y-3">
                    {FEATURES.map((f) => {
                      const val = plan[f.key];
                      if (f.isBoolean && !val) return null;
                      return (
                        <li key={f.key} className="flex items-center gap-2 text-sm">
                          <span
                            className={`inline-flex items-center justify-center w-5 h-5 rounded-full shrink-0 ${
                              featured ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600'
                            }`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className={featured ? 'text-purple-50' : 'text-gray-600'}>
                            {f.label(val)}
                          </span>
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
