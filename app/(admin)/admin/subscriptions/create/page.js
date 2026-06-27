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
  name: '', price_monthly: '', price_yearly: '', trial_days: 0,
  max_users: 0, max_clients: 0, max_sessions: 0, max_cases: 0, max_tasks: 0,
  has_templates: false, has_financial_management: false,
  has_attendance: false, has_lawyer_reports: false,
};

const fieldCls = 'w-full border border-[#E2E6F0] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#081A3A]/20 focus:border-[#081A3A] bg-white transition-colors text-[#0A1628] placeholder:text-[#8896A7]';
const labelCls = 'block text-xs font-medium text-[#4A5568] mb-1';

export default function CreateSubscriptionPage() {
  const router = useRouter();
  const qc     = useQueryClient();
  const [form, setForm] = useState(INIT);
  const [error, setError] = useState('');

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
        <label className={labelCls}>{label}</label>
        <input type="number" name={key} value={form[key]} onChange={handleChange} min="0"
          className={fieldCls} />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden mb-4"
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
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-1">لوحة المدير</p>
            <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>إضافة باقة جديدة</h1>
            <p className="text-white/50 text-sm mt-1">أدخل تفاصيل الباقة الجديدة</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-4 max-w-2xl mx-auto shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className={labelCls}>اسم الباقة</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              required placeholder="مثال: الباقة الذهبية"
              className={fieldCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>السعر الشهري (ر.س)</label>
              <input type="number" name="price_monthly" value={form.price_monthly}
                onChange={handleChange} required min="0" step="0.01" placeholder="0.00"
                className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>السعر السنوي (ر.س)</label>
              <input type="number" name="price_yearly" value={form.price_yearly}
                onChange={handleChange} required min="0" step="0.01" placeholder="0.00"
                className={fieldCls} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {numInput('trial_days',   'أيام التجربة')}
            {numInput('max_users',    'المستخدمين')}
            {numInput('max_clients',  'العملاء')}
            {numInput('max_sessions', 'الجلسات')}
            {numInput('max_cases',    'القضايا')}
            {numInput('max_tasks',    'المهام')}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" loading={mutation.isPending}>حفظ الباقة</Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/subscriptions')}>إلغاء</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
