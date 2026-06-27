'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { customersApi } from '@/lib/api';
import { GENDER_OPTIONS, CUSTOMER_TYPE_OPTIONS, CUSTOMER_STATUS_OPTIONS } from '@/lib/constants';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CustomerDetailPage({ params }) {
  const { id } = use(params);
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(tenantApi, id).then((r) => r.data),
    enabled: !!tenantApi,
    onSuccess: (d) => setForm(d),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => customersApi.update(tenantApi, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customer', id] });
      qc.invalidateQueries({ queryKey: ['customers'] });
      setEditing(false);
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;
  if (!customer) return null;

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
              {customer.name?.charAt(0)}
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">العملاء</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>{customer.name}</h1>
              {customer.status && (
                <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300">
                  {customer.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/customers"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              رجوع
            </Link>
            {!editing && (
              <button onClick={() => { setForm({ ...customer }); setEditing(true); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                تعديل
              </button>
            )}
          </div>
        </div>
      </div>

      <ErrorMessage error={error} />

      {/* البيانات */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <h2 className="font-semibold text-[#0A1628] mb-5 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          {editing ? 'تعديل البيانات' : 'بيانات العميل'}
        </h2>

        {editing ? (
          <form className="space-y-4"
            onSubmit={(e) => { e.preventDefault(); setError(null); updateMutation.mutate(form); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الاسم" name="name" value={form?.name || ''} onChange={handleChange} />
              <Input label="رقم الهوية" name="national_id" value={form?.national_id || ''} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="الجوال" name="mobile" value={form?.mobile || ''} onChange={handleChange} dir="ltr" />
              <Input label="البريد" name="email" type="email" value={form?.email || ''} onChange={handleChange} dir="ltr" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="النوع" name="customer_type" value={form?.customer_type || ''} onChange={handleChange} options={CUSTOMER_TYPE_OPTIONS} />
              <Select label="الجنس" name="gender" value={form?.gender || ''} onChange={handleChange} options={GENDER_OPTIONS} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="الحالة" name="status" value={form?.status || ''} onChange={handleChange} options={CUSTOMER_STATUS_OPTIONS} />
              <Input label="العنوان" name="address" value={form?.address || ''} onChange={handleChange} />
            </div>
            <Textarea label="ملاحظات" name="notes" value={form?.notes || ''} onChange={handleChange} />
            <div className="flex gap-3 pt-1">
              <Button type="submit" loading={updateMutation.isPending}>حفظ التغييرات</Button>
              <Button variant="outline" type="button" onClick={() => setEditing(false)}>إلغاء</Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            {[
              { label: 'الاسم',              value: customer.name },
              { label: 'رقم الهوية',         value: customer.national_id },
              { label: 'الجوال',             value: customer.mobile },
              { label: 'البريد الإلكتروني', value: customer.email },
              { label: 'المهنة',             value: customer.job },
              { label: 'الجنس',              value: customer.gender === 'male' ? 'ذكر' : customer.gender === 'female' ? 'أنثى' : null },
              { label: 'النوع',              value: customer.customer_type === 'individual' ? 'فرد' : customer.customer_type === 'company' ? 'شركة' : null },
              { label: 'العنوان',            value: customer.address },
              { label: 'الحالة',             value: customer.status === 'active' ? 'نشط' : customer.status === 'not_active' ? 'غير نشط' : null },
              { label: 'ملاحظات',            value: customer.notes },
            ].filter(({ value }) => value).map(({ label, value }) => (
              <div key={label} className="border-b border-[#F0F2F7] pb-4 last:border-0 last:pb-0">
                <dt className="text-xs text-[#8896A7] mb-1.5 font-medium">{label}</dt>
                <dd className="text-sm font-semibold text-[#0A1628]">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      {/* القضايا المرتبطة */}
      {customer.cases?.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <h2 className="font-semibold text-[#0A1628] mb-4 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
            القضايا المرتبطة
            <span className="text-xs text-[#8896A7] font-normal">({customer.cases.length})</span>
          </h2>
          <div className="space-y-2">
            {customer.cases.map((c) => (
              <Link key={c.id} href={`/cases/${c.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[#F8F9FC] border border-transparent hover:border-[#E2E6F0] transition-all">
                <span className="text-sm font-semibold text-[#081A3A]">{c.case_number}</span>
                <span className="text-xs text-[#8896A7]">{c.status?.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
