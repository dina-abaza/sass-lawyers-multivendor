'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { consultationsApi, customersApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const CONSULT_TYPES = [
  { value: 'oral', label: 'شفهية' },
  { value: 'written', label: 'مكتوبة' },
];
const CLASSIFICATIONS = [
  { value: 'commercial', label: 'تجارية' },
  { value: 'civil', label: 'مدنية' },
  { value: 'criminal', label: 'جنائية' },
  { value: 'family', label: 'أسرة' },
  { value: 'administrative', label: 'إدارية' },
];

export default function CreateConsultationPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    customer_id: '', consultation_type: '', general_classification: '',
    subject: '', amount: '', notes: '', description: '',
  });
  const [error, setError] = useState(null);

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => consultationsApi.create(tenantApi, data),
    onSuccess: () => router.push('/consultations'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function toOptions(raw) {
    const list = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list.map((x) => ({ value: x.id, label: x.name }));
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/consultations"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">استشارة جديدة</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <Select label="العميل" name="customer_id" value={form.customer_id} onChange={handleChange} options={toOptions(customers)} required />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="نوع الاستشارة" name="consultation_type" value={form.consultation_type} onChange={handleChange} options={CONSULT_TYPES} required />
          <Select label="التصنيف العام" name="general_classification" value={form.general_classification} onChange={handleChange} options={CLASSIFICATIONS} />
        </div>

        <Input label="الموضوع" name="subject" value={form.subject} onChange={handleChange} required />
        <Input label="المبلغ" name="amount" type="number" value={form.amount} onChange={handleChange} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">الوصف</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملاحظات</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ الاستشارة</Button>
          <Link href="/consultations"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
