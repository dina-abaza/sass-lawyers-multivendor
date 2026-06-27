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
        office_name:    settings.office_name    || '',
        tax_number:     settings.tax_number     || '',
        tax_percentage: settings.tax_percentage || '',
        phone:          settings.phone          || '',
        address:        settings.address        || '',
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
      toast.warning(`حجم الصورة كبير جداً (${(file.size / 1024 / 1024).toFixed(1)} MB) — الحد الأقصى ${MAX_LOGO_SIZE_MB} MB`);
      e.target.value = '';
      return;
    }
    setLogo(file);
  };

  const handleSubmit = (e) => { e.preventDefault(); mutation.mutate(); };

  if (isLoading) return <div className="flex items-center justify-center min-h-[60vh]"><Spinner size="lg" /></div>;

  return (
    <div className="p-4 sm:p-6 space-y-5">
      <ToastContainer position="top-right" rtl autoClose={4000} />

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الإعدادات</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>إعدادات الفاتورة</h1>
            <p className="text-white/50 text-sm mt-0.5">بيانات المكتب التي تظهر على الفواتير</p>
          </div>
        </div>
      </div>

      {/* الفورم */}
      <form onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#E2E6F0] p-6 space-y-4 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <h2 className="font-semibold text-[#0A1628] mb-1 flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
          بيانات الفاتورة
        </h2>

        <Input label="اسم المكتب"         name="office_name"    value={form.office_name}    onChange={handleChange} />
        <Input label="الرقم الضريبي"      name="tax_number"     value={form.tax_number}     onChange={handleChange} dir="ltr" />
        <Input label="نسبة الضريبة (%)"   name="tax_percentage" type="number" value={form.tax_percentage} onChange={handleChange} />
        <Input label="رقم الهاتف"         name="phone"          value={form.phone}          onChange={handleChange} />
        <Input label="العنوان"            name="address"        value={form.address}        onChange={handleChange} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#4A5568]">
            الشعار <span className="text-xs text-[#8896A7]">(الحد الأقصى {MAX_LOGO_SIZE_MB} MB)</span>
          </label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoChange}
            className="text-sm text-[#4A5568] file:ms-0 file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#E2E6F0] file:text-sm file:bg-[#F8F9FC] file:text-[#4A5568] hover:file:bg-[#EBF0FA] file:transition-colors file:cursor-pointer" />
        </div>

        <div className="pt-2">
          <Button type="submit" loading={mutation.isPending}>حفظ الإعدادات</Button>
        </div>
      </form>
    </div>
  );
}
