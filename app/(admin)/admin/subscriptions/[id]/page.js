'use client';

import { use } from 'react';
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
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  if (!plan) {
    return (
      <div className="p-6">
        <p className="text-[#8896A7]">الباقة غير موجودة.</p>
        <button onClick={() => router.push('/admin/subscriptions')}
          className="mt-3 text-[#D4AF37] hover:text-[#B8961F] text-sm font-medium transition-colors">
          العودة إلى القائمة
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="rounded-2xl p-6 text-white relative overflow-hidden mb-6"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-3">
          <button onClick={() => router.push('/admin/subscriptions')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 transition-colors shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-1">لوحة المدير</p>
            <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>تفاصيل الباقة</h1>
            <p className="text-white/50 text-sm mt-1">{plan.name}</p>
          </div>
          <Link
            href={`/admin/subscriptions/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] shrink-0"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            تعديل
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 max-w-2xl shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        {/* Plan name banner */}
        <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#F0F2F7]">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)' }}>
            {plan.name?.charAt(0) ?? 'ب'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#0A1628]">{plan.name}</h2>
            <p className="text-sm text-[#8896A7]">باقة اشتراك</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 mb-6">
          {[
            { label: 'السعر الشهري',  value: `${plan.price_monthly} ر.س`, highlight: true },
            { label: 'السعر السنوي',  value: `${plan.price_yearly} ر.س`,  highlight: true },
            { label: 'أيام التجربة', value: `${plan.trial_days} يوم`     },
            { label: 'المستخدمين',   value: plan.max_users                },
            { label: 'العملاء',      value: plan.max_clients              },
            { label: 'الجلسات',      value: plan.max_sessions             },
            { label: 'القضايا',      value: plan.max_cases                },
            { label: 'المهام',       value: plan.max_tasks                },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="bg-[#F8F9FC] rounded-xl p-3">
              <dt className="text-xs text-[#8896A7] mb-1">{label}</dt>
              <dd className={`text-sm font-bold ${highlight ? 'text-[#D4AF37]' : 'text-[#0A1628]'}`}>{value ?? '—'}</dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-[#F0F2F7] pt-5">
          <p className="text-sm font-semibold text-[#0A1628] mb-3">المزايا والصلاحيات</p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-[#F8F9FC]">
                {plan[key] ? (
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                ) : (
                  <span className="w-5 h-5 rounded-full bg-[#F0F2F7] text-[#8896A7] flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
                <span className={`text-sm ${plan[key] ? 'text-[#0A1628] font-medium' : 'text-[#8896A7]'}`}>
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
