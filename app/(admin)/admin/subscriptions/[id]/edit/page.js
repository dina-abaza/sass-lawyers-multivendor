'use client';

import { use, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { subscriptionsApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Spinner from '@/components/common/Spinner';

const FEATURES = [
  { key: 'has_templates',            label: 'إتاحة النماذج' },
  { key: 'has_financial_management', label: 'الإدارة المالية' },
  { key: 'has_attendance',           label: 'الحضور والانصراف' },
  { key: 'has_lawyer_reports',       label: 'تقارير المحامين' },
];

const fieldCls = 'w-full border border-[#E2E6F0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#081A3A]/20 focus:border-[#081A3A] bg-white transition-colors text-[#0A1628] placeholder:text-[#8896A7]';
const labelCls = 'block text-sm font-medium text-[#4A5568] mb-1.5';

export default function EditSubscriptionPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsApi.getAll().then((r) => r.data),
  });

  useEffect(() => {
    if (!data) return;
    const allPlans = Array.isArray(data) ? data : (data?.data ?? []);
    const plan = allPlans.find((p) => String(p.id) === String(id));
    if (plan && !form) setForm({ ...plan });
  }, [data, id]);

  const mutation = useMutation({
    mutationFn: (payload) => subscriptionsApi.update(id, payload),
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
        <input type="number" name={key} value={form[key] ?? 0} onChange={handleChange} min="0"
          className={fieldCls} />
      </div>
    );
  }

  if (isLoading || !form) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
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
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-1">لوحة المدير</p>
            <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>تعديل الباقة</h1>
            <p className="text-white/50 text-sm mt-1">{form.name}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 max-w-2xl shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelCls}>اسم الباقة</label>
            <input type="text" name="name" value={form.name ?? ''} onChange={handleChange}
              required placeholder="مثال: الباقة الذهبية"
              className={fieldCls} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>السعر الشهري (ر.س)</label>
              <input type="number" name="price_monthly" value={form.price_monthly ?? ''}
                onChange={handleChange} required min="0" step="0.01" placeholder="0.00"
                className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>السعر السنوي (ر.س)</label>
              <input type="number" name="price_yearly" value={form.price_yearly ?? ''}
                onChange={handleChange} required min="0" step="0.01" placeholder="0.00"
                className={fieldCls} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {numInput('trial_days',   'أيام التجربة')}
            {numInput('max_users',    'المستخدمين')}
            {numInput('max_clients',  'العملاء')}
            {numInput('max_sessions', 'الجلسات')}
            {numInput('max_cases',    'القضايا')}
            {numInput('max_tasks',    'المهام')}
          </div>

          <div className="border-t border-[#F0F2F7] pt-5">
            <p className="text-sm font-semibold text-[#0A1628] mb-3">المزايا والصلاحيات</p>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" name={key} checked={!!form[key]} onChange={handleChange}
                      className="sr-only peer" />
                    <div className="w-4 h-4 rounded border border-[#E2E6F0] bg-white peer-checked:bg-[#081A3A] peer-checked:border-[#081A3A] transition-colors flex items-center justify-center">
                      {!!form[key] && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-[#4A5568] group-hover:text-[#0A1628] transition-colors">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={mutation.isPending}>حفظ التغييرات</Button>
            <Button type="button" variant="outline" onClick={() => router.push('/admin/subscriptions')}>إلغاء</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
