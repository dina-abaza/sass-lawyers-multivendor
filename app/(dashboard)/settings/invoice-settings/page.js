'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { invoiceSettingsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ErrorMessage from '@/components/common/ErrorMessage';

export default function InvoiceSettingsPage() {
  const { tenantApi } = useAuth();
  const [form, setForm] = useState({
    office_name: '', tax_number: '', tax_percentage: '', phone: '', address: '',
  });
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['invoice-settings'],
    queryFn: () => invoiceSettingsApi.get(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  useEffect(() => {
    const settings = data?.data ?? data;
    if (settings) {
      setForm({
        office_name: settings.office_name || '',
        tax_number: settings.tax_number || '',
        tax_percentage: settings.tax_percentage || '',
        phone: settings.phone || '',
        address: settings.address || '',
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logo) fd.append('logo', logo);
      return invoiceSettingsApi.update(tenantApi, fd);
    },
    onSuccess: () => { setSuccess(true); setTimeout(() => setSuccess(false), 3000); },
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">إعدادات الفاتورة</h1>

      <form onSubmit={(e) => { e.preventDefault(); setError(null); setSuccess(false); mutation.mutate(); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <ErrorMessage error={error} />
        {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">تم الحفظ بنجاح</div>}

        <Input label="اسم المكتب" name="office_name" value={form.office_name} onChange={handleChange} />
        <Input label="الرقم الضريبي" name="tax_number" value={form.tax_number} onChange={handleChange} dir="ltr" />
        <Input label="نسبة الضريبة (%)" name="tax_percentage" type="number" value={form.tax_percentage} onChange={handleChange} />
        <Input label="رقم الهاتف" name="phone" value={form.phone} onChange={handleChange} />
        <Input label="العنوان" name="address" value={form.address} onChange={handleChange} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">الشعار</label>
          <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0])}
            className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-white hover:file:bg-gray-50" />
        </div>

        <div className="pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ الإعدادات</Button>
        </div>
      </form>
    </div>
  );
}
