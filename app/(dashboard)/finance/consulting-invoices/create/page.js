'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { invoicesApi, consultationsApi } from '@/lib/api';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateConsultingInvoicePage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ consultation_id: '', amount: '' });
  const [error, setError] = useState(null);
  const [invoiceResult, setInvoiceResult] = useState(null);

  const { data: consultations } = useQuery({
    queryKey: ['consultations-list'],
    queryFn: () => consultationsApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => invoicesApi.createConsultingInvoice(tenantApi, data),
    onSuccess: (res) => {
      const response = res.data;
      if (response?.invoiceDetails) {
        setInvoiceResult(response);
      } else {
        router.push('/finance/consulting-invoices');
      }
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  function toOptions(raw) {
    const list = Array.isArray(raw) ? raw : raw?.data ?? [];
    return list.map((x) => ({ value: x.id, label: x.subject || x.id }));
  }

  if (invoiceResult) {
    const inv = invoiceResult.invoiceDetails;
    const settings = invoiceResult.InvoiceSetting;
    return (
      <div className="p-6 max-w-md">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
          <h2 className="text-lg font-bold text-green-800 mb-1">تم إصدار الفاتورة بنجاح</h2>
          {settings?.office_name && <p className="text-sm text-green-700">{settings.office_name}</p>}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-4">
          <div className="px-6 py-3 flex justify-between">
            <span className="text-sm text-gray-500">رقم الفاتورة</span>
            <span className="text-sm font-medium">#{inv.id}</span>
          </div>
          <div className="px-6 py-3 flex justify-between">
            <span className="text-sm text-gray-500">الاستشارة</span>
            <span className="text-sm font-medium">{inv.consultation?.subject || inv.consultation_id}</span>
          </div>
          <div className="px-6 py-3 flex justify-between">
            <span className="text-sm text-gray-500">المبلغ</span>
            <span className="text-sm font-medium">{Number(inv.amount).toLocaleString()} ر.س</span>
          </div>
          {Number(inv.tax_value) > 0 && (
            <div className="px-6 py-3 flex justify-between">
              <span className="text-sm text-gray-500">الضريبة ({inv.tax_rate}%)</span>
              <span className="text-sm font-medium">{Number(inv.tax_value).toLocaleString()} ر.س</span>
            </div>
          )}
          <div className="px-6 py-3 flex justify-between">
            <span className="text-sm text-gray-500">الإجمالي</span>
            <span className="text-sm font-bold text-blue-700">{Number(inv.total_amount).toLocaleString()} ر.س</span>
          </div>
          <div className="px-6 py-3 flex justify-between">
            <span className="text-sm text-gray-500">تاريخ الإصدار</span>
            <span className="text-sm text-gray-600">{invoiceResult.printDate}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push('/finance/consulting-invoices')}>قائمة الفواتير</Button>
          <Button variant="outline" onClick={() => { setInvoiceResult(null); setForm({ consultation_id: '', amount: '' }); }}>فاتورة جديدة</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/finance/consulting-invoices"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">فاتورة استشارة جديدة</h1>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />
        <Select label="الاستشارة" name="consultation_id" value={form.consultation_id} onChange={handleChange} options={toOptions(consultations)} required />
        <Input label="المبلغ" name="amount" type="number" value={form.amount} onChange={handleChange} required />
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
          سيتم احتساب الضريبة تلقائياً وفق إعدادات المكتب.
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>إصدار الفاتورة</Button>
          <Link href="/finance/consulting-invoices"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
