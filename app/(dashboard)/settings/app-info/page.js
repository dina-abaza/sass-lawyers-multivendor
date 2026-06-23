'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { appInfoApi } from '@/lib/api';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/ui/Button';

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
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">إعدادات المكتب</h1>
        <p className="text-gray-500 mt-1 text-sm">معلومات وهوية المكتب في النظام</p>
      </div>

      {/* عرض فقط للجميع */}
      {!isOwner && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-4">
            {info?.logo ? (
              <img src={info.logo} alt="شعار المكتب" className="w-16 h-16 object-contain rounded-lg border border-gray-100" />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            )}
            <div>
              <p className="text-lg font-bold text-gray-900">{info?.app_name ?? '—'}</p>
              <p className="text-sm text-gray-500 mt-0.5">
                ساعات العمل اليومية: <span className="font-medium text-gray-700">{info?.working_hours ?? '—'} ساعة</span>
              </p>
              {info?.vat_percentage !== undefined && (
                <p className="text-sm text-gray-500 mt-0.5">
                  نسبة الضريبة (VAT): <span className="font-medium text-gray-700">{info.vat_percentage}%</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* فورم التعديل للـ owner فقط */}
      {isOwner && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">تعديل بيانات المكتب</h2>

          <form
            onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(); }}
            className="space-y-5"
          >
            {/* الشعار */}
            <div className="flex items-center gap-5">
              <div
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 transition overflow-hidden bg-gray-50"
                onClick={() => fileRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="شعار المكتب" className="w-full h-full object-contain" />
                ) : (
                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {logoPreview ? 'تغيير الشعار' : 'رفع شعار المكتب'}
                </button>
                <p className="text-xs text-gray-400 mt-0.5">PNG أو JPG أو SVG — حجم أقصى 2MB</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpg,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>

            {/* اسم المكتب */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">اسم المكتب <span className="text-red-500">*</span></label>
              <input
                value={form.app_name}
                onChange={(e) => setForm((p) => ({ ...p, app_name: e.target.value }))}
                required
                placeholder="مثال: مكتب المستشار عبدالله للمحاماة"
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* ساعات العمل */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">ساعات العمل اليومية <span className="text-red-500">*</span></label>
              <input
                type="number"
                min={1}
                max={24}
                value={form.working_hours}
                onChange={(e) => setForm((p) => ({ ...p, working_hours: e.target.value }))}
                required
                placeholder="8"
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-32"
              />
              <p className="text-xs text-gray-400">تُستخدم لحساب الحضور والانصراف</p>
            </div>

            {/* نسبة الضريبة */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">نسبة الضريبة (VAT %)</label>
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={form.vat_percentage}
                onChange={(e) => setForm((p) => ({ ...p, vat_percentage: e.target.value }))}
                placeholder="15"
                className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-32"
              />
              <p className="text-xs text-gray-400">تُضاف تلقائياً على الفواتير</p>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
            {success && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">✓ تم حفظ إعدادات المكتب بنجاح</p>}

            <Button type="submit" loading={mutation.isPending}>حفظ الإعدادات</Button>
          </form>
        </div>
      )}
    </div>
  );
}
