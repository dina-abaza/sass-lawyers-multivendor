'use client';

import { use, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { subscriptionsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';

const FEATURES = [
  { key: 'has_templates',            label: 'إتاحة النماذج' },
  { key: 'has_financial_management', label: 'الإدارة المالية' },
  { key: 'has_attendance',           label: 'الحضور والانصراف' },
  { key: 'has_lawyer_reports',       label: 'تقارير المحامين' },
];

export default function ViewSubscriptionPage({ params }) {
  const { id } = use(params);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsApi.getAll().then((r) => r.data),
  });

  const allPlans = Array.isArray(data) ? data : (data?.data ?? []);
  const plan = allPlans.find((p) => String(p.id) === String(id));

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-6">
        <p className="text-gray-500">الباقة غير موجودة.</p>
        <button
          onClick={() => router.push('/admin/subscriptions')}
          className="mt-3 text-purple-600 hover:underline text-sm"
        >
          العودة إلى القائمة
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.push('/admin/subscriptions')}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">تفاصيل الباقة</h1>
        <Link
          href={`/admin/subscriptions/${id}/edit`}
          className="mr-auto flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          تعديل
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">{plan.name}</h2>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-5">
          {[
            { label: 'السعر الشهري',  value: `${plan.price_monthly} ر.س` },
            { label: 'السعر السنوي',  value: `${plan.price_yearly} ر.س`  },
            { label: 'أيام التجربة', value: `${plan.trial_days} يوم`     },
            { label: 'المستخدمين',   value: plan.max_users                },
            { label: 'العملاء',      value: plan.max_clients              },
            { label: 'الجلسات',      value: plan.max_sessions             },
            { label: 'القضايا',      value: plan.max_cases                },
            { label: 'المهام',       value: plan.max_tasks                },
          ].map(({ label, value }) => (
            <div key={label}>
              <dt className="text-xs text-gray-500 mb-1">{label}</dt>
              <dd className="text-sm font-semibold text-gray-900">{value ?? '—'}</dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-gray-100 pt-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">المزايا والصلاحيات</p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                {plan[key] ? (
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                <span className={`text-sm ${plan[key] ? 'text-gray-700' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
