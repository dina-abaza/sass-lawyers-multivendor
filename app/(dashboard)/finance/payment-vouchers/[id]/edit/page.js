'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { paymentVouchersApi, customersApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';
import Spinner from '@/components/common/Spinner';

export default function EditPaymentVoucherPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState(null);

  const { data: allVouchers, isLoading } = useQuery({
    queryKey: ['payment-vouchers'],
    queryFn: () => paymentVouchersApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  useEffect(() => {
    const list = Array.isArray(allVouchers) ? allVouchers : allVouchers?.data ?? [];
    const voucher = list.find((v) => String(v.id) === String(id));
    if (voucher) {
      setForm({
        customer_id: voucher.customer_id ?? '',
        voucher_date: voucher.voucher_date ?? '',
        voucher_date_hijri: voucher.voucher_date_hijri ?? '',
        amount: voucher.amount ?? '',
        amount_text: voucher.amount_text ?? '',
        for_reason: voucher.for_reason ?? '',
        notes: voucher.notes ?? '',
        is_check: voucher.is_check ?? false,
        bank: voucher.bank ?? '',
      });
    }
  }, [allVouchers, id]);

  const mutation = useMutation({
    mutationFn: (data) => paymentVouchersApi.update(tenantApi, id, data),
    onSuccess: () => router.push('/finance/payment-vouchers'),
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

  if (isLoading || !form) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/finance/payment-vouchers"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">تعديل سند الصرف</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <Select label="العميل" name="customer_id" value={form.customer_id} onChange={handleChange} options={toOptions(customers)} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="المبلغ (رقماً)" name="amount" type="number" value={form.amount} onChange={handleChange} required />
          <Input label="تاريخ السند" name="voucher_date" type="date" value={form.voucher_date} onChange={handleChange} required />
        </div>
        <Input label="التاريخ الهجري" name="voucher_date_hijri" placeholder="1447/07/07" value={form.voucher_date_hijri} onChange={handleChange} />
        <Input label="المبلغ (كتابةً)" name="amount_text" value={form.amount_text} onChange={handleChange} />
        <Input label="سبب الصرف" name="for_reason" placeholder="مثال: مصاريف إدارية، تسوية" value={form.for_reason} onChange={handleChange} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="is_check" name="is_check" checked={form.is_check} onChange={handleChange} />
          <label htmlFor="is_check" className="text-sm text-gray-700">بشيك</label>
        </div>
        {form.is_check && <Input label="البنك" name="bank" value={form.bank} onChange={handleChange} />}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">ملاحظات</label>
          <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ التعديلات</Button>
          <Link href="/finance/payment-vouchers"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
