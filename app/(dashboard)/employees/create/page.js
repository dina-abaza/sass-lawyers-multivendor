'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'نقداً' },
  { value: 'bank', label: 'تحويل بنكي' },
  { value: 'wallet', label: 'محفظة إلكترونية' },
];

export default function CreateEmployeePage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    department_id: '',
    amount: '',
    payment_method: '',
    notes: '',
  });
  const [error, setError] = useState(null);

  const { data: departments } = useQuery({
    queryKey: ['departments'],
    queryFn: () => tenantApi.get('/departments').then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => tenantApi.post('/employees', data),
    onSuccess: () => router.push('/employees'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    mutation.mutate(form);
  };

  function deptOptions() {
    const list = Array.isArray(departments) ? departments : departments?.data ?? [];
    return list.map((d) => ({ value: d.id, label: d.name_ar || d.name_en || d.name }));
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/employees">
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">موظف جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <p className="text-sm text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
          سيتم إنشاء حساب مستخدم تلقائياً بكلمة المرور الافتراضية: <span className="font-mono font-bold text-blue-700">12345678</span>
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="الاسم الكامل" name="name" value={form.name} onChange={handleChange} required />
          <Input label="البريد الإلكتروني" name="email" type="email" value={form.email} onChange={handleChange} required dir="ltr" />
        </div>

        <Select label="القسم" name="department_id" value={form.department_id} onChange={handleChange} options={deptOptions()} required />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="الراتب الشهري (ر.س)" name="amount" type="number" value={form.amount} onChange={handleChange} required />
          <Select label="طريقة الصرف" name="payment_method" value={form.payment_method} onChange={handleChange} options={PAYMENT_OPTIONS} required />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملاحظات</label>
          <textarea
            name="notes"
            rows={2}
            value={form.notes}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>إضافة الموظف</Button>
          <Link href="/employees"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
