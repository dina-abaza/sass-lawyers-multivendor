'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { receiptsApi, customersApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateReceiptPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    customer_id: '', receipt_date: '', amount: '', amount_text: '',
    for_reason: '', notes: '', is_check: false,
  });
  const [error, setError] = useState(null);

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => receiptsApi.create(tenantApi, data),
    onSuccess: () => router.push('/finance/receipts'),
    onError: setError,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  function toOptions(raw) {
    const list = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list.map((x) => ({ value: x.id, label: x.name }));
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/finance/receipts"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">سند قبض جديد</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <Select label="العميل" name="customer_id" value={form.customer_id} onChange={handleChange} options={toOptions(customers)} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="المبلغ (رقماً)" name="amount" type="number" value={form.amount} onChange={handleChange} required />
          <Input label="تاريخ السند" name="receipt_date" type="date" value={form.receipt_date} onChange={handleChange} required />
        </div>
        <Input label="المبلغ (كتابةً)" name="amount_text" value={form.amount_text} onChange={handleChange} />
        <Input label="الغرض من الصرف" name="for_reason" value={form.for_reason} onChange={handleChange} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_check" name="is_check" checked={form.is_check} onChange={handleChange} />
          <label htmlFor="is_check" className="text-sm text-gray-700">بشيك</label>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملاحظات</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ السند</Button>
          <Link href="/finance/receipts"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
