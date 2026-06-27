'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { subscriptionsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/common/Spinner';

const FEATURES = [
  { key: 'trial_days',               label: 'أيام تجريبية مجانية',   format: (v) => v > 0 ? `${v} يوم` : 'لا يوجد', isBoolean: false },
  { key: 'max_users',                label: 'عدد المستخدمين',         format: (v) => v === 0 ? 'غير محدود' : v,       isBoolean: false },
  { key: 'max_clients',              label: 'عدد العملاء',             format: (v) => v === 0 ? 'غير محدود' : v,       isBoolean: false },
  { key: 'max_cases',                label: 'عدد القضايا',             format: (v) => v === 0 ? 'غير محدود' : v,       isBoolean: false },
  { key: 'max_sessions',             label: 'جلسات المحكمة',           format: (v) => v === 0 ? 'غير محدودة' : v,      isBoolean: false },
  { key: 'max_tasks',                label: 'المهام',                  format: (v) => v === 0 ? 'غير محدودة' : v,      isBoolean: false },
  { key: 'has_templates',            label: 'القوالب',                 format: (v) => v ? 'متاح' : 'غير متاح',        isBoolean: true },
  { key: 'has_financial_management', label: 'الإدارة المالية',         format: (v) => v ? 'متاح' : 'غير متاح',        isBoolean: true },
  { key: 'has_attendance',           label: 'الحضور والانصراف',        format: (v) => v ? 'متاح' : 'غير متاح',        isBoolean: true },
  { key: 'has_lawyer_reports',       label: 'تقارير المحامين',         format: (v) => v ? 'متاح' : 'غير متاح',        isBoolean: true },
  { key: 'has_notifications',        label: 'الإشعارات',               format: (v) => v ? 'متاح' : 'غير متاح',        isBoolean: true },
];

const STATUS_MAP = {
  active:    { label: 'نشط',           color: 'bg-emerald-100 text-emerald-700' },
  trial:     { label: 'تجريبي',        color: 'bg-[#EBF0FA] text-[#081A3A]' },
  pending:   { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700' },
  expired:   { label: 'منتهي',         color: 'bg-red-100 text-red-700' },
  cancelled: { label: 'ملغي',          color: 'bg-[#F0F2F7] text-[#8896A7]' },
};

function formatDate(iso) {
  if (!iso) return '—';
  return iso.split('T')[0];
}

function CurrentSubscriptionCard({ tenantApi }) {
  const { data: raw, isLoading } = useQuery({
    queryKey: ['my-subscription-status'],
    queryFn: () => subscriptionsApi.getMyStatus(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 flex justify-center shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <Spinner />
      </div>
    );
  }

  const statusData = raw?.data ?? raw ?? null;

  if (!statusData || raw?.status === false) {
    return (
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 flex items-center gap-3 text-[#8896A7] text-sm shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        لا يوجد اشتراك نشط حالياً — اختر باقة من القائمة أدناه
      </div>
    );
  }

  const status = statusData.status ?? statusData.subscription_status ?? '';
  const statusInfo = STATUS_MAP[status] ?? { label: status, color: 'bg-[#F0F2F7] text-[#8896A7]' };
  const planName = statusData.plan?.name ?? statusData.subscription?.name ?? statusData.name ?? '—';
  const startDate = statusData.start_date ?? statusData.created_at ?? null;
  const endDate = statusData.end_date ?? statusData.expires_at ?? statusData.next_billing_date ?? null;
  const billingType = statusData.type ?? statusData.billing_type ?? null;
  const remainingDays = statusData.remaining_days ?? statusData.days_remaining ?? null;

  return (
    <div className="bg-white rounded-2xl border border-[#E2E6F0] p-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <p className="text-xs text-[#8896A7] font-semibold uppercase tracking-wider mb-1">اشتراكي الحالي</p>
          <h2 className="text-lg font-bold text-[#0A1628]">{planName}</h2>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {startDate && (
          <div className="rounded-xl p-3" style={{ background: '#F8F9FC', border: '1px solid #E2E6F0' }}>
            <p className="text-xs text-[#8896A7] mb-1 font-medium">تاريخ البدء</p>
            <p className="text-sm font-bold text-[#0A1628]">{formatDate(startDate)}</p>
          </div>
        )}
        {endDate && (
          <div className="rounded-xl p-3" style={{ background: '#F8F9FC', border: '1px solid #E2E6F0' }}>
            <p className="text-xs text-[#8896A7] mb-1 font-medium">تاريخ الانتهاء</p>
            <p className="text-sm font-bold text-[#0A1628]">{formatDate(endDate)}</p>
          </div>
        )}
        {billingType && (
          <div className="rounded-xl p-3" style={{ background: '#F8F9FC', border: '1px solid #E2E6F0' }}>
            <p className="text-xs text-[#8896A7] mb-1 font-medium">نوع الاشتراك</p>
            <p className="text-sm font-bold text-[#0A1628]">
              {billingType === 'monthly' ? 'شهري' : billingType === 'yearly' ? 'سنوي' : billingType}
            </p>
          </div>
        )}
        {remainingDays !== null && remainingDays !== undefined && (
          <div className="rounded-xl p-3"
            style={remainingDays <= 7
              ? { background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }
              : { background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
            <p className="text-xs mb-1 font-medium" style={{ color: remainingDays <= 7 ? '#DC2626' : '#8896A7' }}>
              الأيام المتبقية
            </p>
            <p className="text-sm font-bold" style={{ color: remainingDays <= 7 ? '#DC2626' : '#D4AF37' }}>
              {remainingDays} يوم
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SubscriptionsPage() {
  const { tenantApi } = useAuth();
  const [billingType, setBillingType] = useState('monthly');
  const [pendingPlanId, setPendingPlanId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['public-plans'],
    queryFn: () => subscriptionsApi.getAll().then((r) => r.data?.data ?? r.data ?? []),
  });

  const plans = Array.isArray(data) ? data : [];

  const requestMutation = useMutation({
    mutationFn: ({ subscription_id, type }) =>
      subscriptionsApi.requestSubscription(tenantApi, { subscription_id, type }),
    onSuccess: (res) => {
      setSuccessMsg(res.data?.message || 'تم تقديم طلب الاشتراك بنجاح.');
      setErrorMsg('');
      setPendingPlanId(null);
    },
    onError: (err) => {
      setErrorMsg(err?.response?.data?.message || 'حدث خطأ أثناء تقديم الطلب، يرجى المحاولة مجدداً.');
      setSuccessMsg('');
      setPendingPlanId(null);
    },
  });

  function handleRequest(planId) {
    setPendingPlanId(planId);
    setSuccessMsg('');
    setErrorMsg('');
    requestMutation.mutate({ subscription_id: planId, type: billingType });
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">النظام</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>الاشتراكات</h1>
            <p className="text-white/50 text-sm mt-0.5">إدارة اشتراكك ومعرفة الباقات المتاحة</p>
          </div>
        </div>
      </div>

      {/* الاشتراك الحالي */}
      <CurrentSubscriptionCard tenantApi={tenantApi} />

      {/* Billing toggle + title */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-semibold text-[#0A1628] flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          الباقات المتاحة
        </h2>
        <div className="inline-flex items-center rounded-xl p-1 gap-1"
          style={{ background: '#F0F4FA', border: '1px solid #E2E6F0' }}>
          <button
            onClick={() => setBillingType('monthly')}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={billingType === 'monthly'
              ? { background: 'linear-gradient(135deg, #081A3A, #0D2452)', color: '#ffffff', boxShadow: '0 2px 6px rgba(8,26,58,0.2)' }
              : { color: '#4A5568' }}>
            شهري
          </button>
          <button
            onClick={() => setBillingType('yearly')}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={billingType === 'yearly'
              ? { background: 'linear-gradient(135deg, #081A3A, #0D2452)', color: '#ffffff', boxShadow: '0 2px 6px rgba(8,26,58,0.2)' }
              : { color: '#4A5568' }}>
            سنوي
          </button>
        </div>
      </div>

      {/* Feedback messages */}
      {successMsg && (
        <div className="rounded-2xl px-5 py-3.5 text-sm font-semibold flex items-center gap-3"
          style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)', color: '#065F46' }}>
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-2xl px-5 py-3.5 text-sm font-semibold"
          style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', color: '#991B1B' }}>
          {errorMsg}
        </div>
      )}

      {/* Plans */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <Spinner size="lg" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#E2E6F0] shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <p className="text-[#8896A7] text-sm">لا توجد باقات متاحة حالياً، يرجى التواصل مع الإدارة.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const price = billingType === 'monthly' ? plan.price_monthly : plan.price_yearly;
            const isRequesting = requestMutation.isPending && pendingPlanId === plan.id;

            return (
              <div key={plan.id}
                className="bg-white rounded-2xl border border-[#E2E6F0] p-6 flex flex-col gap-5 shadow-[0_2px_8px_rgba(8,26,58,0.05)] hover:shadow-[0_4px_16px_rgba(8,26,58,0.1)] transition-shadow">

                {/* Plan header */}
                <div>
                  <div className="w-full h-1 rounded-full mb-4" style={{ background: 'linear-gradient(90deg, #D4AF37, #B8961F)' }} />
                  <h2 className="text-lg font-bold text-[#0A1628]">{plan.name}</h2>
                  <p className="mt-2">
                    <span className="text-3xl font-bold" style={{ color: '#081A3A' }}>
                      {Number(price).toLocaleString('ar-SA')}
                    </span>
                    <span className="text-sm text-[#8896A7] font-medium">
                      {' '}ر.س / {billingType === 'monthly' ? 'شهر' : 'سنة'}
                    </span>
                  </p>
                  {plan.trial_days > 0 && (
                    <p className="text-sm font-semibold mt-1.5" style={{ color: '#D4AF37' }}>
                      {plan.trial_days} يوم تجريبي مجاني
                    </p>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {FEATURES.map((f) => {
                    const val = plan[f.key];
                    const label = f.format(val);
                    const positive = f.isBoolean ? Boolean(val) : true;
                    return (
                      <li key={f.key} className="flex items-center justify-between text-sm border-b border-[#F0F2F7] pb-2 last:border-0 last:pb-0">
                        <span className="text-[#4A5568]">{f.label}</span>
                        <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                          f.isBoolean
                            ? (positive ? 'bg-emerald-100 text-emerald-700' : 'bg-[#F0F2F7] text-[#8896A7]')
                            : 'text-[#0A1628]'
                        }`}>
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA button */}
                <button
                  onClick={() => handleRequest(plan.id)}
                  disabled={isRequesting}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
                  {isRequesting
                    ? <><span className="w-4 h-4 border-2 border-[#081A3A]/30 border-t-[#081A3A] rounded-full animate-spin" /> جارٍ إرسال الطلب...</>
                    : 'اختر هذه الباقة'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-[#8896A7] text-center pb-2">
        بعد اختيار الباقة، سيتم مراجعة طلبك من قِبل الإدارة وتفعيل اشتراكك في أقرب وقت.
      </p>
    </div>
  );
}
