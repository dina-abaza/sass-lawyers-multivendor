'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { contractsApi, customersApi } from '@/lib/api';
import { toOptions } from '@/lib/utils';
import { QUERY_KEYS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function CreateContractPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', contract_number: '', customer_id: '',
    start_date: '', end_date: '', value: '', notes: '',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [invoiceInfo, setInvoiceInfo] = useState(null);

  const { data: customers } = useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS],
    queryFn: () => customersApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      if (files.length > 0) {
        const formData = new FormData();
        Object.entries(data).forEach(([k, v]) => { if (v !== '') formData.append(k, v); });
        files.forEach((f) => formData.append('files[]', f));
        return contractsApi.create(tenantApi, formData);
      }
      const payload = {};
      Object.entries(data).forEach(([k, v]) => { if (v !== '') payload[k] = v; });
      if (payload.value) payload.value = Number(payload.value);
      if (payload.customer_id) payload.customer_id = Number(payload.customer_id);
      return contractsApi.create(tenantApi, payload);
    },
    onSuccess: (res) => {
      const response = res.data;
      if (response?.data) {
        setInvoiceInfo(response);
      } else {
        router.push('/contracts');
      }
    },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (invoiceInfo) {
    const contract = invoiceInfo.data;
    const invoice = contract?.invoices?.[0];
    return (
      <div className="p-6 max-w-2xl">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-4">
          <h2 className="text-lg font-bold text-green-800 mb-1">تم إنشاء العقد بنجاح</h2>
          <p className="text-sm text-green-700">{invoiceInfo.message}</p>
        </div>
        {invoice && (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100 mb-4">
            <div className="px-6 py-3 flex justify-between">
              <span className="text-sm text-gray-500">رقم الفاتورة التلقائية</span>
              <span className="text-sm font-medium">#{invoice.id}</span>
            </div>
            <div className="px-6 py-3 flex justify-between">
              <span className="text-sm text-gray-500">المبلغ</span>
              <span className="text-sm font-medium">{Number(invoice.amount).toLocaleString()} ر.س</span>
            </div>
            {invoice.tax_value > 0 && (
              <div className="px-6 py-3 flex justify-between">
                <span className="text-sm text-gray-500">الضريبة ({invoice.tax_rate}%)</span>
                <span className="text-sm font-medium">{Number(invoice.tax_value).toLocaleString()} ر.س</span>
              </div>
            )}
            <div className="px-6 py-3 flex justify-between">
              <span className="text-sm text-gray-500">الإجمالي</span>
              <span className="text-sm font-bold text-blue-700">{Number(invoice.total_amount).toLocaleString()} ر.س</span>
            </div>
          </div>
        )}
        <div className="flex gap-3">
          <Button onClick={() => router.push('/contracts')}>قائمة العقود</Button>
          <Button variant="outline" onClick={() => router.push('/finance/contract-invoices')}>فواتير العقود</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/contracts"><Button variant="ghost" size="sm">→</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">عقد جديد</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(form); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="اسم العقد" name="name" value={form.name} onChange={handleChange} required />
          <Input label="رقم العقد" name="contract_number" value={form.contract_number} onChange={handleChange} required />
        </div>
        <Select label="العميل" name="customer_id" value={form.customer_id} onChange={handleChange} options={toOptions(customers)} required />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="تاريخ البداية" name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
          <Input label="تاريخ النهاية" name="end_date" type="date" value={form.end_date} onChange={handleChange} />
        </div>
        <Input label="قيمة العقد" name="value" type="number" value={form.value} onChange={handleChange} required />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">مرفقات (PDF, صور)</label>
          <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          {files.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{files.length} ملف محدد</p>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
          سيتم إنشاء فاتورة عقد تلقائياً بقيمة العقد عند الحفظ.
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ العقد</Button>
          <Link href="/contracts"><Button variant="outline">إلغاء</Button></Link>
        </div>
      </form>
    </div>
  );
}
