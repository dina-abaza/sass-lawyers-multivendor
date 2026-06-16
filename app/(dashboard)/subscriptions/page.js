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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">الباقات المتاحة</h1>
        <p className="text-gray-500 mt-1">اختر الباقة المناسبة لمكتبك للوصول إلى جميع مميزات النظام</p>
      </div>

      {/* Billing toggle */}
      <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 gap-1">
        <button
          onClick={() => setBillingType('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            billingType === 'monthly'
              ? 'bg-white shadow text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          اشتراك شهري
        </button>
        <button
          onClick={() => setBillingType('yearly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            billingType === 'yearly'
              ? 'bg-white shadow text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          اشتراك سنوي
        </button>
      </div>

      {/* Feedback messages */}
      {successMsg && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* Plans */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          لا توجد باقات متاحة حالياً، يرجى التواصل مع الإدارة.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const price = billingType === 'monthly' ? plan.price_monthly : plan.price_yearly;
            const isRequesting = requestMutation.isPending && pendingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5 hover:shadow-md transition-shadow"
              >
                {/* Plan name & price */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {Number(price).toLocaleString('ar-SA')}
                    <span className="text-base font-normal text-gray-500">
                      {' '}ر.س / {billingType === 'monthly' ? 'شهر' : 'سنة'}
                    </span>
                  </p>
                  {plan.trial_days > 0 && (
                    <p className="text-sm text-green-600 mt-1 font-medium">
                      {plan.trial_days} يوم تجريبي مجاني
                    </p>
                  )}
                </div>

                {/* Features list */}
                <ul className="space-y-2 flex-1">
                  {FEATURES.map((f) => {
                    const val = plan[f.key];
                    const label = f.format(val);
                    const positive = f.isBoolean ? Boolean(val) : true;
                    return (
                      <li key={f.key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{f.label}</span>
                        <span className={`font-medium ${f.isBoolean ? (positive ? 'text-green-600' : 'text-gray-400') : 'text-gray-900'}`}>
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handleRequest(plan.id)}
                  disabled={isRequesting}
                  className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isRequesting ? 'جارٍ إرسال الطلب...' : 'اختر هذه الباقة'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Help note */}
      <p className="text-xs text-gray-400 text-center">
        بعد اختيار الباقة، سيتم مراجعة طلبك من قِبل الإدارة وتفعيل اشتراكك في أقرب وقت.
      </p>
    </div>
  );
}
