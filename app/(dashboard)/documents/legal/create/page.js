'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { legalDocsApi, customersApi } from '@/lib/api';
import { toOptions } from '@/lib/utils';
import { QUERY_KEYS, LEGAL_DOC_TYPE_OPTIONS } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/common/ErrorMessage';

const MAX_FILE_MB = 5;
const MAX_FILE_BYTES = MAX_FILE_MB * 1024 * 1024;

const labelCls = 'block text-xs font-semibold text-[#4A5568] mb-1.5';
const fieldCls = 'w-full rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] px-3.5 py-2.5 text-sm text-[#0A1628] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-colors resize-none';

export default function CreateLegalDocPage() {
  const { tenantApi } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    customer_id: '', document_type: '', agency_number: '',
    document_number: '', description: '', notes: '',
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const { data: customers } = useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS],
    queryFn: () => customersApi.getAll(tenantApi).then((r) => r.data),
    enabled: !!tenantApi,
  });

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
      files.forEach((f) => fd.append('files[]', f));
      return legalDocsApi.create(tenantApi, fd);
    },
    onSuccess: () => router.push('/documents/legal'),
    onError: setError,
  });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFilesChange = (e) => {
    const selected = Array.from(e.target.files);
    const oversized = selected.filter((f) => f.size > MAX_FILE_BYTES);
    if (oversized.length > 0) {
      oversized.forEach((f) =>
        toast.warning(
          `"${f.name}" حجمه ${(f.size / 1024 / 1024).toFixed(1)} MB — الحد الأقصى ${MAX_FILE_MB} MB، يرجى ضغط الملف أو اختيار ملف أصغر`
        )
      );
      e.target.value = '';
      return;
    }
    setFiles(selected);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-xl mx-auto">
      <ToastContainer position="top-right" rtl autoClose={5000} />

      {/* Header */}
      <div className="rounded-2xl p-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #081A3A 0%, #0D2452 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 60%)' }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
              <svg className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[#D4AF37] text-xs font-semibold tracking-widest uppercase mb-0.5">المستندات القانونية</p>
              <h1 className="text-xl font-bold" style={{ color: '#ffffff' }}>مستند قانوني جديد</h1>
            </div>
          </div>
          <Link href="/documents/legal"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            رجوع
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-[#E2E6F0] p-6 shadow-[0_2px_8px_rgba(8,26,58,0.05)]">
        <div className="w-full h-1 rounded-full mb-6" style={{ background: 'linear-gradient(90deg, #D4AF37, #B8961F)' }} />
        <form onSubmit={(e) => { e.preventDefault(); setError(null); mutation.mutate(); }} className="space-y-5">
          <ErrorMessage error={error} />

          <Select label="العميل" name="customer_id" value={form.customer_id} onChange={handleChange}
            options={toOptions(customers)} required />
          <Select label="نوع المستند" name="document_type" value={form.document_type} onChange={handleChange}
            options={LEGAL_DOC_TYPE_OPTIONS} required />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="رقم المستند" name="document_number" value={form.document_number}
              onChange={handleChange} required placeholder="مثال: DOC-2024-001" />
            <Input label="رقم الوكالة" name="agency_number" value={form.agency_number}
              onChange={handleChange} placeholder="اختياري" />
          </div>

          <Input label="الوصف" name="description" value={form.description} onChange={handleChange} />

          <div>
            <label className={labelCls}>ملاحظات</label>
            <textarea name="notes" rows={2} value={form.notes} onChange={handleChange} className={fieldCls} />
          </div>

          <div className="rounded-xl border border-[#E2E6F0] bg-[#F8F9FC] p-4">
            <label className={labelCls}>
              الملفات <span className="text-red-500">*</span>
              <span className="text-[#8896A7] font-normal text-xs me-1">(PDF, JPG, PNG — حد أقصى {MAX_FILE_MB} MB لكل ملف)</span>
            </label>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFilesChange}
              className="w-full text-sm text-[#4A5568] file:me-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#E2E6F0] file:text-sm file:font-medium file:bg-white file:text-[#081A3A] hover:file:bg-[#EBF0FA] transition-colors" />
            {files.length > 0 && (
              <p className="text-xs text-[#D4AF37] font-semibold mt-2">{files.length} ملف محدد</p>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={mutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #B8961F)', color: '#081A3A', boxShadow: '0 4px 12px rgba(212,175,55,0.35)' }}>
              {mutation.isPending
                ? <span className="w-4 h-4 border-2 border-[#081A3A]/30 border-t-[#081A3A] rounded-full animate-spin" />
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              حفظ المستند
            </button>
            <Link href="/documents/legal"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-[#E2E6F0] text-[#4A5568] hover:bg-[#F8F9FC] transition-colors">
              إلغاء
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
