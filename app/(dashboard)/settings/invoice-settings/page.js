'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '@/context/AuthContext';
import { invoiceSettingsApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const EMPTY_FORM = { office_name: '', tax_number: '', tax_percentage: '', phone: '', address: '' };
const MAX_LOGO_SIZE_MB = 2;
const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;

export default function InvoiceSettingsPage() {
  const { tenantApi } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [logo, setLogo] = useState(null);
  const fileInputRef = useRef(null);

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
    onSuccess: () => {
      toast.success('تم حفظ الإعدادات بنجاح');
      setLogo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      qc.invalidateQueries({ queryKey: ['invoice-settings'] });
    },
    onError: () => toast.error('حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى'),
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_SIZE_BYTES) {
      toast.warning(`حجم الصورة كبير جداً (${(file.size / 1024 / 1024).toFixed(1)} MB) — الحد الأقصى ${MAX_LOGO_SIZE_MB} MB، يرجى تقليل حجمها`);
      e.target.value = '';
      return;
    }
    setLogo(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  return (
    <div className="p-6 max-w-xl">
      <ToastContainer position="top-right" rtl autoClose={4000} />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">إعدادات الفاتورة</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <Input label="اسم المكتب" name="office_name" value={form.office_name} onChange={handleChange} />
        <Input label="الرقم الضريبي" name="tax_number" value={form.tax_number} onChange={handleChange} dir="ltr" />
        <Input label="نسبة الضريبة (%)" name="tax_percentage" type="number" value={form.tax_percentage} onChange={handleChange} />
        <Input label="رقم الهاتف" name="phone" value={form.phone} onChange={handleChange} />
        <Input label="العنوان" name="address" value={form.address} onChange={handleChange} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            الشعار <span className="text-xs text-gray-400">(الحد الأقصى {MAX_LOGO_SIZE_MB} MB)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-sm file:bg-white hover:file:bg-gray-50"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ الإعدادات</Button>
        </div>
      </form>
    </div>
  );
}
