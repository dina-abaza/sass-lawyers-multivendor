'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { subscriptionsApi } from '@/lib/api';
import Button from '@/components/ui/Button';

const FEATURES = [
  { key: 'has_templates',            label: 'إتاحة النماذج' },
  { key: 'has_financial_management', label: 'الإدارة المالية' },
  { key: 'has_attendance',           label: 'الحضور والانصراف' },
  { key: 'has_lawyer_reports',       label: 'تقارير المحامين' },
];

const INIT = {
  name:                     '',
  price_monthly:            '',
  price_yearly:             '',
  trial_days:               0,
  max_users:                0,
  max_clients:              0,
  max_sessions:             0,
  max_cases:                0,
  max_tasks:                0,
  has_templates:            false,
  has_financial_management: false,
  has_attendance:           false,
  has_lawyer_reports:       false,
};

export default function CreateSubscriptionPage() {
  const router = useRouter();
  const qc     = useQueryClient();
  const [form, setForm] = useState(INIT);
  const [error, setError] = useState('');

  // POST /api/subscriptions
  const mutation = useMutation({
    mutationFn: (payload) => subscriptionsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['subscription-plans'] });
      router.push('/admin/subscriptions');
    },
    onError: (e) => {
      const msg = e.response?.data?.message || e.response?.data?.errors;
      setError(
        typeof msg === 'object'
          ? Object.values(msg).flat().join(' | ')
          : msg || 'حدث خطأ، حاول مجدداً'
      );
    },
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    mutation.mutate({
      name:                     form.name,
      price_monthly:            parseFloat(form.price_monthly)  || 0,
      price_yearly:             parseFloat(form.price_yearly)   || 0,
      trial_days:               parseInt(form.trial_days)       || 0,
      max_users:                parseInt(form.max_users)        || 0,
      max_clients:              parseInt(form.max_clients)      || 0,
      max_sessions:             parseInt(form.max_sessions)     || 0,
      max_cases:                parseInt(form.max_cases)        || 0,
      max_tasks:                parseInt(form.max_tasks)        || 0,
      has_templates:            form.has_templates,
      has_financial_management: form.has_financial_management,
      has_attendance:           form.has_attendance,
      has_lawyer_reports:       form.has_lawyer_reports,
    });
  }

  function numInput(key, label) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type="number" name={key} value={form[key]} onChange={handleChange}
          min="0"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push('/admin/subscriptions')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-gray-900">إضافة باقة جديدة</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-2xl">
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name (full width) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الباقة</label>
            <input
              type="text" name="name" value={form.name} onChange={handleChange}
              required placeholder="مثال: الباقة الذهبية"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السعر الشهري</label>
              <input
                type="number" name="price_monthly" value={form.price_monthly}
                onChange={handleChange} required min="0" step="0.01" placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السعر السنوي</label>
              <input
                type="number" name="price_yearly" value={form.price_yearly}
                onChange={handleChange} required min="0" step="0.01" placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Numeric limits */}
          <div className="grid grid-cols-2 gap-4">
            {numInput('trial_days',   'أيام التجربة')}
            {numInput('max_users',    'المستخدمين')}
            {numInput('max_clients',  'العملاء')}
            {numInput('max_sessions', 'الجلسات')}
            {numInput('max_cases',    'القضايا')}
            {numInput('max_tasks',    'المهام')}
          </div>

          {/* Features */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">المعيرات والصلاحيات</p>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox" name={key} checked={form[key]} onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending}>حفظ الباقة</Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/subscriptions')}>
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
