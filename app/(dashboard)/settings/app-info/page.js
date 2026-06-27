'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { appInfoApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

const fieldCls = 'w-full border border-[#E2E6F0] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#081A3A]/20 focus:border-[#081A3A] bg-white transition-colors text-[#0A1628] placeholder:text-[#8896A7]';
const labelCls = 'text-sm font-medium text-[#4A5568]';

export default function AppInfoPage() {
  const { tenantApi, isOwner } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef(null);

  const [form, setForm] = useState({ app_name: '', working_hours: '', vat_percentage: '' });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { data: raw, isLoading } = useQuery({
    queryKey: ['app-info'],
    queryFn: () => appInfoApi.get(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const info = raw?.data ?? raw ?? null;

  useEffect(() => {
    if (info) {
      setForm({
        app_name: info.app_name ?? '',
        working_hours: info.working_hours ?? '',
        vat_percentage: info.vat_percentage ?? '',
      });
      if (info.logo) setLogoPreview(info.logo);
    }
  }, [info]);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('app_name', form.app_name);
      fd.append('working_hours', form.working_hours);
      fd.append('vat_percentage', form.vat_percentage);
      if (logoFile) fd.append('logo', logoFile);
      return appInfoApi.update(tenantApi, fd);
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      setLogoFile(null);
      queryClient.invalidateQueries({ queryKey: ['app-info'] });
      setTimeout(() => setSuccess(false), 4000);
    },
    onError: (err) => {
      setError(err?.response?.data?.message || 'حدث خطأ أثناء الحفظ');
      setSuccess(false);
    },
  });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto space-y-5">

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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">الإعدادات</p>
            <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>إعدادات المكتب</h1>
            <p className="text-white/50 text-sm mt-0.5">معلومات وهوية المكتب في النظام</p>
          </div>
        </div>
      </div>

      {/* عرض فقط لغير الـ owner */}
      {!isOwner && (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <div className="flex items-center gap-5">
            {info?.logo ? (
              <img src={info.logo} alt="شعار المكتب" className="w-16 h-16 object-contain rounded-xl border border-[#E2E6F0]" />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-[#EBF0FA] flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-[#081A3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <div className="space-y-1.5">
              <p className="text-lg font-bold text-[#0A1628]">{info?.app_name ?? '—'}</p>
              <p className="text-sm text-[#8896A7]">
                ساعات العمل اليومية: <span className="font-semibold text-[#4A5568]">{info?.working_hours ?? '—'} ساعة</span>
              </p>
              {info?.vat_percentage !== undefined && (
                <p className="text-sm text-[#8896A7]">
                  نسبة الضريبة (VAT): <span className="font-semibold text-[#4A5568]">{info.vat_percentage}%</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* فورم التعديل للـ owner فقط */}
      {isOwner && (
        <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
          <h2 className="font-semibold text-[#0A1628] mb-5 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#D4AF37] inline-block" />
            تعديل بيانات المكتب
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(); }} className="space-y-5">

            {/* الشعار */}
            <div className="flex items-center gap-5">
              <div
                className="w-20 h-20 rounded-xl border-2 border-dashed border-[#E2E6F0] flex items-center justify-center cursor-pointer hover:border-[#081A3A]/40 transition overflow-hidden bg-[#F8F9FC]"
                onClick={() => fileRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="شعار المكتب" className="w-full h-full object-contain" />
                ) : (
                  <svg className="w-7 h-7 text-[#8896A7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div>
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-sm text-[#D4AF37] hover:text-[#B8961F] font-semibold transition-colors">
                  {logoPreview ? 'تغيير الشعار' : 'رفع شعار المكتب'}
                </button>
                <p className="text-xs text-[#8896A7] mt-1">PNG أو JPG أو SVG — حجم أقصى 2MB</p>
                <input ref={fileRef} type="file" accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                  className="hidden" onChange={handleLogoChange} />
              </div>
            </div>

            {/* اسم المكتب */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>اسم المكتب <span className="text-red-500">*</span></label>
              <input value={form.app_name}
                onChange={(e) => setForm((p) => ({ ...p, app_name: e.target.value }))}
                required placeholder="مثال: مكتب المستشار عبدالله للمحاماة"
                className={fieldCls} />
            </div>

            {/* ساعات العمل */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>ساعات العمل اليومية <span className="text-red-500">*</span></label>
              <input type="number" min={1} max={24} value={form.working_hours}
                onChange={(e) => setForm((p) => ({ ...p, working_hours: e.target.value }))}
                required placeholder="8"
                className={`${fieldCls} w-36`} />
              <p className="text-xs text-[#8896A7]">تُستخدم لحساب الحضور والانصراف</p>
            </div>

            {/* نسبة الضريبة */}
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>نسبة الضريبة (VAT %)</label>
              <input type="number" min={0} max={100} step="0.01" value={form.vat_percentage}
                onChange={(e) => setForm((p) => ({ ...p, vat_percentage: e.target.value }))}
                placeholder="15"
                className={`${fieldCls} w-36`} />
              <p className="text-xs text-[#8896A7]">تُضاف تلقائياً على الفواتير</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                تم حفظ إعدادات المكتب بنجاح
              </div>
            )}

            <Button type="submit" loading={mutation.isPending}>حفظ الإعدادات</Button>
          </form>
        </div>
      )}
    </div>
  );
}
